import type Database from 'better-sqlite3';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { ContextProvider, EmbeddingProvider, ChangeChunk, ReleaseContext } from './providers/types.js';
import { NoneContextProvider } from './providers/context/none.js';
import { StructuredContextProvider } from './providers/context/structured.js';
import { OllamaContextProvider } from './providers/context/ollama.js';
import { ClaudeHaikuContextProvider } from './providers/context/claude-haiku.js';
import { OllamaEmbeddingProvider } from './providers/embedding/ollama.js';
import { VoyageEmbeddingProvider } from './providers/embedding/voyage.js';
import { OpenAIEmbeddingProvider } from './providers/embedding/openai.js';
import { DEFAULT_EMBEDDING_DIM, getEmbeddingDim, setEmbeddingDim } from './db.js';
import { AppError } from './errors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Canonical set of embedding provider names accepted by makeEmbeddingProvider. */
export type EmbedProviderName = 'ollama' | 'voyage' | 'openai';

export interface EmbedOptions {
  contextProviderName: 'none' | 'structured' | 'ollama' | 'claude-haiku';
  embeddingProviderName: EmbedProviderName;
  product?: string;
  limit?: number;
  batchSize?: number;
  force?: boolean;
  /** AbortSignal for cancellation. When aborted, the current batch completes but no further batches are processed. */
  signal?: AbortSignal;
  /** Maximum number of API requests before stopping. Budget guard for paid providers. */
  maxRequests?: number;
  /** Maximum tokens before stopping. Budget guard for paid providers. */
  maxTokens?: number;
  /** Progress callback invoked after each batch completes. */
  onProgress?: (progress: EmbedProgress) => void;
}

export interface EmbedProgress {
  /** Batches completed so far. */
  batchesCompleted: number;
  /** Total batches planned. */
  batchesTotal: number;
  /** Chunks embedded so far. */
  chunksCompleted: number;
  /** Total chunks pending. */
  chunksTotal: number;
  /** Active embedding provider identifier (e.g. "voyage-3", "ollama:nomic-embed-text"). */
  provider?: string;
  /** Cumulative tokens consumed by the embedding provider so far. */
  tokensUsed?: number;
  /** Cumulative API requests made to the embedding provider so far. */
  requestsMade?: number;
}

/** Usage tracking for paid embedding providers. */
export interface EmbedUsage {
  /** Total API requests made to the embedding provider. */
  requests: number;
  /** Total tokens consumed (as reported by the provider). */
  tokens: number;
}

export interface EmbedStats {
  contextProvider: string;
  embeddingProvider: string;
  chunksCreated: number;
  chunksSkipped: number;
  contextMs: number;
  embedMs: number;
  totalMs: number;
  /** Usage stats from the embedding provider (tokens, requests). Populated for paid providers. */
  usage?: EmbedUsage;
  /** Whether the run was stopped early due to cancellation or budget. */
  stoppedEarly?: boolean;
  /** Reason for early stop: 'cancelled' | 'budget_requests' | 'budget_tokens'. */
  stopReason?: 'cancelled' | 'budget_requests' | 'budget_tokens';
}

/**
 * Initialize the Tier 2b vector-layer schema for a DB.
 *
 * Reads the static `schema-vec.sql` (creates `chunks`, `chunks_fts`,
 * triggers) and then creates `chunks_vec` dynamically using the configured
 * embedding dim recorded in `schema_meta`. When `opts.dim` is supplied it
 * is recorded first (used during `hk init` to lock the dim before first
 * embed).
 *
 * Idempotent: skips if `chunks` already exists. A pre-existing `chunks_vec`
 * is left untouched (dim mismatch is caught at `setEmbeddingDim` time).
 */
export function initVecSchema(db: Database.Database, opts: { dim?: number } = {}): void {
  // Lock in the dim if the caller supplied one (e.g. CLI init with explicit provider)
  if (opts.dim !== undefined) {
    setEmbeddingDim(db, opts.dim);
  }

  const existing = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='chunks'`)
    .get();
  if (!existing) {
    const schemaPath = resolveSchemaVecPath();
    const sql = readFileSync(schemaPath, 'utf-8');
    db.exec(sql);
  }

  // Create chunks_vec at the configured dim if it doesn't yet exist.
  const hasVec = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='chunks_vec'`)
    .get();
  if (!hasVec) {
    const dim = getEmbeddingDim(db) ?? DEFAULT_EMBEDDING_DIM;
    db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(embedding FLOAT[${dim}])`);
  }
}

function resolveSchemaVecPath(): string {
  const candidates = [
    join(__dirname, '..', 'schema-vec.sql'),
    join(process.cwd(), 'schema-vec.sql'),
  ];
  for (const p of candidates) {
    try {
      readFileSync(p);
      return p;
    } catch {}
  }
  throw new Error(`schema-vec.sql not found in: ${candidates.join(', ')}`);
}

export async function embedAll(db: Database.Database, opts: EmbedOptions): Promise<EmbedStats> {
  // Resolve provider first so we can lock the dim before creating chunks_vec.
  const ctx = makeContextProvider(opts.contextProviderName);
  // If the DB already has a configured dim, pass it through so providers that
  // support truncation (OpenAI) align with the existing vector index.
  const existingDim = getEmbeddingDim(db);
  const emb = makeEmbeddingProvider(opts.embeddingProviderName, {
    dim: existingDim ?? undefined,
  });

  // Negotiate dimension: setEmbeddingDim throws EMBEDDING_DIM_MISMATCH when
  // a different dim is already in use AND chunks exist. On fresh DBs or when
  // chunks are empty, it just records the dim.
  setEmbeddingDim(db, emb.dimension);
  initVecSchema(db);

  // Pull changes that don't yet have a chunk (unless --force)
  const productFilter = opts.product ? 'AND c.product = @product' : '';
  const forceFilter = opts.force ? '' : 'AND ch.id IS NULL';
  const limitClause = opts.limit ? 'LIMIT @limit' : '';

  const pendingSql = `
    SELECT c.id AS change_id, c.product, c.version, r.released_at, c.kind, c.text, c.ordinal
    FROM changes c
    JOIN releases r ON c.product = r.product AND c.version = r.version
    LEFT JOIN chunks ch ON ch.change_id = c.id
    WHERE 1=1
      ${productFilter}
      ${forceFilter}
    ORDER BY c.product, c.version, c.ordinal
    ${limitClause}
  `;
  const params: Record<string, any> = {};
  if (opts.product) params.product = opts.product;
  if (opts.limit) params.limit = opts.limit;

  const pending = db.prepare(pendingSql).all(params) as Array<{
    change_id: number;
    product: string;
    version: string;
    released_at: string | null;
    kind: string;
    text: string;
    ordinal: number;
  }>;

  if (pending.length === 0) {
    return {
      contextProvider: ctx.name,
      embeddingProvider: emb.name,
      chunksCreated: 0,
      chunksSkipped: 0,
      contextMs: 0,
      embedMs: 0,
      totalMs: 0,
    };
  }

  // Group by release for sibling context
  const byRelease = new Map<string, ChangeChunk[]>();
  for (const row of pending) {
    const key = `${row.product}@${row.version}`;
    if (!byRelease.has(key)) byRelease.set(key, []);
    byRelease.get(key)!.push({
      changeId: row.change_id,
      product: row.product,
      releaseVersion: row.version,
      releasedAt: row.released_at,
      kind: row.kind,
      text: row.text,
      ordinalInRelease: row.ordinal,
      totalInRelease: 0, // backfilled below
    });
  }
  for (const [, list] of byRelease) {
    for (const c of list) c.totalInRelease = list.length;
  }

  // Generate contexts (sequential per chunk for ollama/claude-haiku;
  // synchronous for none/structured)
  const startTotal = Date.now();
  let contextMs = 0;
  let embedMs = 0;

  const contextsByChange = new Map<number, string>();
  const allChunks: ChangeChunk[] = [];
  for (const [, siblings] of byRelease) {
    const release: ReleaseContext = {
      product: siblings[0].product,
      version: siblings[0].releaseVersion,
      releasedAt: siblings[0].releasedAt,
      siblings,
    };
    for (const chunk of siblings) {
      // Check abort before context generation
      if (opts.signal?.aborted) break;
      const t0 = Date.now();
      const ctxPrefix = await ctx.contextFor(chunk, release);
      contextMs += Date.now() - t0;
      contextsByChange.set(chunk.changeId, ctxPrefix);
      allChunks.push(chunk);
    }
    if (opts.signal?.aborted) break;
  }

  // Batch-embed with checkpoint support
  const batchSize = opts.batchSize ?? 64;
  const insertChunk = db.prepare(`
    INSERT OR REPLACE INTO chunks
      (change_id, product, release_version, released_at, context_prefix, original_text, contextualized, context_provider, embedding_model, embedded_at)
    VALUES
      (@change_id, @product, @release_version, @released_at, @context_prefix, @original_text, @contextualized, @context_provider, @embedding_model, @embedded_at)
  `);

  const deleteVec = db.prepare(`DELETE FROM chunks_vec WHERE rowid = ?`);
  const insertVec = db.prepare(`INSERT INTO chunks_vec(rowid, embedding) VALUES (?, ?)`);

  let created = 0;
  let stoppedEarly = false;
  let stopReason: 'cancelled' | 'budget_requests' | 'budget_tokens' | undefined;

  // Usage tracking
  const usage: EmbedUsage = { requests: 0, tokens: 0 };

  const totalBatches = Math.ceil(allChunks.length / batchSize);

  for (let i = 0; i < allChunks.length; i += batchSize) {
    // Check cancellation before each batch
    if (opts.signal?.aborted) {
      stoppedEarly = true;
      stopReason = 'cancelled';
      break;
    }

    // Budget guard: check request limit
    if (opts.maxRequests !== undefined && usage.requests >= opts.maxRequests) {
      stoppedEarly = true;
      stopReason = 'budget_requests';
      break;
    }

    // Budget guard: check token limit
    if (opts.maxTokens !== undefined && usage.tokens >= opts.maxTokens) {
      stoppedEarly = true;
      stopReason = 'budget_tokens';
      break;
    }

    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map((c) => {
      const prefix = contextsByChange.get(c.changeId) ?? '';
      return prefix ? `${prefix}\n\n${c.text}` : c.text;
    });
    const t0 = Date.now();
    const vectors = await emb.embed(texts);
    embedMs += Date.now() - t0;

    // Track usage from provider instance
    usage.requests++;
    if ('usage' in emb) {
      const provUsage = (emb as any).usage;
      if (provUsage && typeof provUsage.tokens === 'number') {
        usage.tokens = provUsage.tokens;
      }
    }

    const tx = db.transaction(() => {
      for (let j = 0; j < batch.length; j++) {
        const c = batch[j];
        const prefix = contextsByChange.get(c.changeId) ?? '';
        const contextualized = prefix ? `${prefix}\n\n${c.text}` : c.text;
        const result = insertChunk.run({
          change_id: c.changeId,
          product: c.product,
          release_version: c.releaseVersion,
          released_at: c.releasedAt,
          context_prefix: prefix,
          original_text: c.text,
          contextualized,
          context_provider: ctx.name,
          embedding_model: `${emb.name}:${emb.model}`,
          embedded_at: new Date().toISOString(),
        });
        const chunkId = Number(result.lastInsertRowid);
        deleteVec.run(chunkId);
        // sqlite-vec requires BigInt rowid + Float32Array (not Buffer) per its npm contract
        insertVec.run(BigInt(chunkId), vectors[j]);
        created++;
      }
    });
    tx();

    // Progress callback
    if (opts.onProgress) {
      opts.onProgress({
        batchesCompleted: Math.floor(i / batchSize) + 1,
        batchesTotal: totalBatches,
        chunksCompleted: created,
        chunksTotal: allChunks.length,
        provider: `${emb.name}:${emb.model}`,
        tokensUsed: usage.tokens,
        requestsMade: usage.requests,
      });
    }
  }

  const stats: EmbedStats = {
    contextProvider: ctx.name,
    embeddingProvider: `${emb.name}:${emb.model}`,
    chunksCreated: created,
    chunksSkipped: 0,
    contextMs,
    embedMs,
    totalMs: Date.now() - startTotal,
  };

  // Attach usage if any API calls were made
  if (usage.requests > 0) {
    stats.usage = usage;
  }

  // Attach early-stop info
  if (stoppedEarly) {
    stats.stoppedEarly = true;
    stats.stopReason = stopReason;
  }

  return stats;
}

function makeContextProvider(name: string): ContextProvider {
  switch (name) {
    case 'none':
      return new NoneContextProvider();
    case 'structured':
      return new StructuredContextProvider();
    case 'ollama':
      return new OllamaContextProvider();
    case 'claude-haiku':
      return new ClaudeHaikuContextProvider();
    default:
      throw new Error(`unknown context provider: ${name}`);
  }
}

/**
 * Construct an embedding provider by name.
 *
 * `opts.dim` is a target dimension for providers that support truncation
 * (currently OpenAI's text-embedding-3 family). Passing dim to Ollama or
 * Voyage is a no-op — those providers are pinned to 768.
 *
 * `opts.model` overrides the model for the provider (e.g. text-embedding-3-large).
 */
export function makeEmbeddingProvider(
  name: EmbedProviderName,
  opts: { dim?: number; model?: string } = {}
): EmbeddingProvider {
  switch (name) {
    case 'ollama':
      return new OllamaEmbeddingProvider({ model: opts.model });
    case 'voyage':
      return new VoyageEmbeddingProvider({ model: opts.model });
    case 'openai':
      return new OpenAIEmbeddingProvider({ model: opts.model, dim: opts.dim });
    default: {
      const _exhaustive: never = name;
      throw new AppError({
        code: 'EMBED_PROVIDER_UNKNOWN',
        message: `unknown embedding provider: ${String(_exhaustive)}`,
        hint: 'use one of: ollama | voyage | openai',
      });
    }
  }
}
