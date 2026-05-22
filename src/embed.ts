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

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface EmbedOptions {
  contextProviderName: 'none' | 'structured' | 'ollama' | 'claude-haiku';
  embeddingProviderName: 'ollama' | 'voyage';
  product?: string;
  limit?: number;
  batchSize?: number;
  force?: boolean;
}

export interface EmbedStats {
  contextProvider: string;
  embeddingProvider: string;
  chunksCreated: number;
  chunksSkipped: number;
  contextMs: number;
  embedMs: number;
  totalMs: number;
}

export function initVecSchema(db: Database.Database): void {
  // Idempotent — only creates if missing
  const existing = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='chunks'`)
    .get();
  if (existing) return;
  const schemaPath = resolveSchemaVecPath();
  const sql = readFileSync(schemaPath, 'utf-8');
  db.exec(sql);
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
  initVecSchema(db);

  const ctx = makeContextProvider(opts.contextProviderName);
  const emb = makeEmbeddingProvider(opts.embeddingProviderName);

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
      const t0 = Date.now();
      const ctxPrefix = await ctx.contextFor(chunk, release);
      contextMs += Date.now() - t0;
      contextsByChange.set(chunk.changeId, ctxPrefix);
      allChunks.push(chunk);
    }
  }

  // Batch-embed
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
  for (let i = 0; i < allChunks.length; i += batchSize) {
    const batch = allChunks.slice(i, i + batchSize);
    const texts = batch.map((c) => {
      const prefix = contextsByChange.get(c.changeId) ?? '';
      return prefix ? `${prefix}\n\n${c.text}` : c.text;
    });
    const t0 = Date.now();
    const vectors = await emb.embed(texts);
    embedMs += Date.now() - t0;

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
  }

  return {
    contextProvider: ctx.name,
    embeddingProvider: `${emb.name}:${emb.model}`,
    chunksCreated: created,
    chunksSkipped: 0,
    contextMs,
    embedMs,
    totalMs: Date.now() - startTotal,
  };
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

function makeEmbeddingProvider(name: string): EmbeddingProvider {
  switch (name) {
    case 'ollama':
      return new OllamaEmbeddingProvider();
    case 'voyage':
      return new VoyageEmbeddingProvider();
    default:
      throw new Error(`unknown embedding provider: ${name}`);
  }
}
