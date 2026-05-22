import type Database from 'better-sqlite3';
import { OllamaEmbeddingProvider } from './providers/embedding/ollama.js';
import { VoyageEmbeddingProvider } from './providers/embedding/voyage.js';
import { NoneRerankProvider } from './providers/rerank/none.js';
import { OllamaJudgeRerankProvider } from './providers/rerank/ollama-judge.js';
import { VoyageRerankProvider } from './providers/rerank/voyage.js';
import { CohereRerankProvider } from './providers/rerank/cohere.js';
import type { EmbeddingProvider, RerankProvider, RerankCandidate } from './providers/types.js';

/** Hard upper bound on any user-supplied row-pull parameter. */
const MAX_LIMIT = 500;

/**
 * Clamp a user-supplied row count into [min, MAX_LIMIT] using integer coercion.
 * Rejects non-finite / NaN values with a clear error so callers can't slip
 * through `parseInt('abc')` or `Infinity` and end up with unbounded SQL.
 */
function clampLimit(value: number, fallback: number, name: string): number {
  const v = value ?? fallback;
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error(`hybridSearch: ${name} must be a finite number (got ${String(v)})`);
  }
  const n = v | 0;
  return Math.max(1, Math.min(n, MAX_LIMIT));
}

/**
 * Module-level cache of whether the chunks_vec virtual table exists on a
 * given Database handle. Avoids re-probing on every call and avoids relying
 * on regex matching against driver-specific error messages.
 */
function hasVecTable(db: Database.Database): boolean {
  const tagged = db as Database.Database & { __synergyHasVec?: boolean };
  if (typeof tagged.__synergyHasVec === 'boolean') return tagged.__synergyHasVec;
  try {
    db.prepare('SELECT count(*) FROM chunks_vec LIMIT 0').get();
    tagged.__synergyHasVec = true;
  } catch {
    tagged.__synergyHasVec = false;
  }
  return tagged.__synergyHasVec!;
}

let warnedNoVec = false;

export interface HybridResult {
  chunk_id: number;
  change_id: number;
  product: string;
  version: string;
  released_at: string | null;
  kind: string;
  text: string;
  contextualized: string;
  bm25_rank: number | null;
  vec_rank: number | null;
  rrf_score: number;
  rerank_score: number | null;
}

export interface HybridOptions {
  product?: string;
  since?: string;
  kind?: string;
  limit?: number;
  embedProviderName?: 'ollama' | 'voyage';
  rerankProviderName?: 'none' | 'ollama-judge' | 'voyage' | 'cohere';
  /** Per-channel pull before fusion. Default 60. */
  topK?: number;
  rrfK?: number;
  /** How many candidates to pass to the reranker (after RRF). Default 20. */
  rerankCandidates?: number;
}

/**
 * Reciprocal Rank Fusion over FTS5(BM25) + sqlite-vec(cosine).
 * Standard RRF formula: score = sum(1 / (k + rank_i)) across channels.
 */
export async function hybridSearch(
  db: Database.Database,
  query: string,
  opts: HybridOptions = {}
): Promise<HybridResult[]> {
  // Clamp all user-supplied row-pull params to [1, MAX_LIMIT] integers up-front.
  // Prevents unbounded SQL placeholders + NaN/Infinity from sneaking through.
  const safeLimit = clampLimit(opts.limit as number, 20, 'limit');
  const safeTopK = clampLimit(opts.topK as number, 60, 'topK');
  // rerankCandidates must be at least safeLimit so we always have enough rows
  // to fill the final result set after reranking.
  const rerankRequested = clampLimit(opts.rerankCandidates as number, 20, 'rerankCandidates');
  const safeRerankN = Math.max(safeLimit, rerankRequested);
  const rrfK = opts.rrfK ?? 60;
  if (typeof rrfK !== 'number' || !Number.isFinite(rrfK)) {
    throw new Error(`hybridSearch: rrfK must be a finite number (got ${String(rrfK)})`);
  }
  const emb = makeEmbeddingProvider(opts.embedProviderName ?? 'ollama');

  // Pre-filter SQL fragment shared by both channels
  const filters: string[] = [];
  const params: Record<string, any> = {};
  if (opts.product) {
    filters.push('ch.product = @product');
    params.product = opts.product;
  }
  if (opts.since) {
    filters.push('ch.released_at >= @since');
    params.since = opts.since;
  }
  if (opts.kind) {
    filters.push("EXISTS (SELECT 1 FROM changes c WHERE c.id = ch.change_id AND c.kind = @kind)");
    params.kind = opts.kind;
  }
  const whereClause = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';

  // FTS5 channel — fault-tolerant (FTS5 syntax can reject queries with - etc.)
  let fts: Array<{ id: number; rank_pos: number }> = [];
  try {
    const ftsSql = `
      SELECT ch.id AS id, row_number() OVER (ORDER BY bm25(chunks_fts)) AS rank_pos
      FROM chunks_fts
      JOIN chunks ch ON chunks_fts.rowid = ch.id
      WHERE chunks_fts MATCH @query
        ${whereClause}
      ORDER BY bm25(chunks_fts)
      LIMIT @topK
    `;
    fts = db.prepare(ftsSql).all({ ...params, query, topK: safeTopK }) as any;
  } catch (e) {
    // Sanitize query for FTS5 (strip dashes/special chars to bare tokens)
    const sanitized = query.replace(/[^A-Za-z0-9 ]/g, ' ').trim();
    if (sanitized) {
      const ftsSql = `
        SELECT ch.id AS id, row_number() OVER (ORDER BY bm25(chunks_fts)) AS rank_pos
        FROM chunks_fts
        JOIN chunks ch ON chunks_fts.rowid = ch.id
        WHERE chunks_fts MATCH @query
          ${whereClause}
        ORDER BY bm25(chunks_fts)
        LIMIT @topK
      `;
      fts = db.prepare(ftsSql).all({ ...params, query: sanitized, topK: safeTopK }) as any;
    }
  }

  // Vec channel — probe sqlite-vec existence up-front instead of relying on
  // regex-matched error messages from the driver.
  const vecAvailable = hasVecTable(db);
  let vec: Array<{ id: number; rank_pos: number }> = [];
  if (vecAvailable) {
    const [qvec] = await emb.embed([query]);
    const vecSql = `
      SELECT ch.id AS id, row_number() OVER (ORDER BY distance) AS rank_pos
      FROM chunks_vec
      JOIN chunks ch ON ch.id = chunks_vec.rowid
      WHERE chunks_vec.embedding MATCH @qvec AND k = @topK
        ${whereClause}
      ORDER BY distance
    `;
    // sqlite-vec accepts Float32Array directly for MATCH; align with insert path
    // at src/embed.ts which passes vectors[j] (Float32Array) into chunks_vec.
    vec = db
      .prepare(vecSql)
      .all({ ...params, qvec, topK: safeTopK }) as any;
  } else if (!warnedNoVec && !process.env.MCP_QUIET && !process.env.CLAUDE_SYNERGY_QUIET) {
    // One-time stderr warning so MCP-stdio callers (which set MCP_QUIET) stay clean.
    console.warn('[hybrid] sqlite-vec table not found; using BM25-only');
    warnedNoVec = true;
  }

  // RRF fusion
  const scores = new Map<number, { bm25: number | null; vec: number | null; score: number }>();
  for (const r of fts) {
    const cur = scores.get(r.id) ?? { bm25: null, vec: null, score: 0 };
    cur.bm25 = r.rank_pos;
    cur.score += 1 / (rrfK + r.rank_pos);
    scores.set(r.id, cur);
  }
  for (const r of vec) {
    const cur = scores.get(r.id) ?? { bm25: null, vec: null, score: 0 };
    cur.vec = r.rank_pos;
    cur.score += 1 / (rrfK + r.rank_pos);
    scores.set(r.id, cur);
  }

  if (scores.size === 0) return [];

  // RRF top candidates
  const rrfRanked = Array.from(scores.entries())
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, safeRerankN);

  // Pull rows for candidates
  const candidateIds = rrfRanked.map(([id]) => id);
  const placeholders = candidateIds.map(() => '?').join(',');
  const rowsSql = `
    SELECT ch.id AS chunk_id, ch.change_id, ch.product, ch.release_version AS version,
           ch.released_at, c.kind, c.text, ch.contextualized
    FROM chunks ch
    JOIN changes c ON c.id = ch.change_id
    WHERE ch.id IN (${placeholders})
  `;
  const rows = db.prepare(rowsSql).all(...candidateIds) as any[];
  const byId = new Map<number, any>();
  for (const r of rows) byId.set(r.chunk_id, r);

  // Optional rerank step
  const rerankProviderName = opts.rerankProviderName ?? 'none';
  let rerankScores = new Map<number, number>();
  if (rerankProviderName !== 'none') {
    const reranker = makeRerankProvider(rerankProviderName);
    const candidates: RerankCandidate[] = rrfRanked
      .slice(0, rerankRequested)
      .map(([id]) => ({ id, text: byId.get(id)?.contextualized ?? byId.get(id)?.text ?? '' }))
      .filter((c) => c.text);
    const results = await reranker.rerank(query, candidates);
    for (const r of results) rerankScores.set(r.id, r.score);
  }

  // Final ranking: by rerank score if reranked, else by RRF score
  const final = rrfRanked
    .map(([id, score]) => ({
      id,
      rrf: score.score,
      bm25: score.bm25,
      vec: score.vec,
      rerank: rerankScores.get(id) ?? null,
    }))
    .sort((a, b) => {
      if (rerankProviderName !== 'none' && a.rerank !== null && b.rerank !== null) {
        return b.rerank - a.rerank;
      }
      return b.rrf - a.rrf;
    })
    .slice(0, safeLimit);

  return final
    .map((entry) => {
      const r = byId.get(entry.id);
      if (!r) return null;
      return {
        ...r,
        bm25_rank: entry.bm25,
        vec_rank: entry.vec,
        rrf_score: entry.rrf,
        rerank_score: entry.rerank,
      };
    })
    .filter(Boolean) as HybridResult[];
}

function makeEmbeddingProvider(name: 'ollama' | 'voyage'): EmbeddingProvider {
  switch (name) {
    case 'ollama':
      return new OllamaEmbeddingProvider();
    case 'voyage':
      return new VoyageEmbeddingProvider();
  }
}

function makeRerankProvider(name: 'ollama-judge' | 'voyage' | 'cohere'): RerankProvider {
  switch (name) {
    case 'ollama-judge':
      return new OllamaJudgeRerankProvider();
    case 'voyage':
      return new VoyageRerankProvider();
    case 'cohere':
      return new CohereRerankProvider();
  }
}
