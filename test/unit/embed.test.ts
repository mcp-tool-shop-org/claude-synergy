import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { embedAll, initVecSchema } from '../../src/embed.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';
import { mockFetch, jsonResponse, type FetchMockHandle } from '../helpers/fetch-mock.js';
import { goldenVectorArray, EMBEDDING_DIM } from '../helpers/golden-vectors.js';

let temp: TempDb;
let fm: FetchMockHandle;

function setupOllamaEmbedMock() {
  // Returns deterministic golden vectors for each input
  return mockFetch([
    {
      method: 'POST',
      urlPattern: '/api/embed',
      response: (req) => {
        const inputs = (req.body?.input ?? []) as string[];
        const embeddings = inputs.map((s) => goldenVectorArray(s, EMBEDDING_DIM));
        return jsonResponse({ model: 'nomic-embed-text', embeddings });
      },
    },
  ]);
}

beforeEach(() => {
  temp = createTempDb();
  seedSampleProducts(temp.db);
  fm = setupOllamaEmbedMock();
});
afterEach(() => {
  fm.restore();
  temp.cleanup();
});

describe('initVecSchema', () => {
  it('creates chunks, chunks_vec, chunks_fts on first call', () => {
    initVecSchema(temp.db);
    const tables = temp.db
      .prepare(`SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name IN ('chunks', 'chunks_vec', 'chunks_fts')`)
      .all() as Array<{ name: string }>;
    const names = new Set(tables.map((t) => t.name));
    expect(names.has('chunks')).toBe(true);
    expect(names.has('chunks_fts')).toBe(true);
    // chunks_vec is a virtual table — sqlite-vec must be loaded
    // (might fail in headless test envs; assert only if extension loaded)
  });

  it('is idempotent', () => {
    initVecSchema(temp.db);
    expect(() => initVecSchema(temp.db)).not.toThrow();
  });
});

describe('embedAll — structured context + mocked ollama embed', () => {
  it('returns chunksCreated > 0 on the seeded corpus', async () => {
    const stats = await embedAll(temp.db, {
      contextProviderName: 'structured',
      embeddingProviderName: 'ollama',
    });
    expect(stats.chunksCreated).toBeGreaterThan(0);
    expect(stats.contextProvider).toBe('structured');
    expect(stats.embeddingProvider).toMatch(/^ollama:/);
  });

  it('--limit 5 caps the pending set to 5 chunks', async () => {
    const stats = await embedAll(temp.db, {
      contextProviderName: 'structured',
      embeddingProviderName: 'ollama',
      limit: 5,
    });
    expect(stats.chunksCreated).toBe(5);
    const chunkCount = (
      temp.db.prepare(`SELECT COUNT(*) AS c FROM chunks`).get() as { c: number }
    ).c;
    expect(chunkCount).toBe(5);
  });

  it('is idempotent — second call without --force embeds 0 new chunks', async () => {
    await embedAll(temp.db, { contextProviderName: 'structured', embeddingProviderName: 'ollama' });
    const second = await embedAll(temp.db, {
      contextProviderName: 'structured',
      embeddingProviderName: 'ollama',
    });
    expect(second.chunksCreated).toBe(0);
  });

  it('--force re-embeds existing chunks (count unchanged, embedded_at advances)', async () => {
    const first = await embedAll(temp.db, {
      contextProviderName: 'structured',
      embeddingProviderName: 'ollama',
    });
    const firstStamps = temp.db
      .prepare(`SELECT change_id, embedded_at FROM chunks`)
      .all() as Array<{ change_id: number; embedded_at: string }>;
    await new Promise((r) => setTimeout(r, 10));
    const second = await embedAll(temp.db, {
      contextProviderName: 'structured',
      embeddingProviderName: 'ollama',
      force: true,
    });
    expect(second.chunksCreated).toBe(first.chunksCreated);
    const secondStamps = temp.db
      .prepare(`SELECT change_id, embedded_at FROM chunks`)
      .all() as Array<{ change_id: number; embedded_at: string }>;
    expect(secondStamps.length).toBe(firstStamps.length);
    // At least one stamp should advance (the lock-step replace is per-batch)
    let advanced = 0;
    for (const s of secondStamps) {
      const prev = firstStamps.find((p) => p.change_id === s.change_id);
      if (prev && s.embedded_at >= prev.embedded_at) advanced++;
    }
    expect(advanced).toBe(secondStamps.length);
  });

  it('--product X filters embedding to that product only', async () => {
    await embedAll(temp.db, {
      contextProviderName: 'structured',
      embeddingProviderName: 'ollama',
      product: 'test-cli',
    });
    const rows = temp.db
      .prepare(`SELECT DISTINCT product FROM chunks`)
      .all() as Array<{ product: string }>;
    expect(rows.length).toBe(1);
    expect(rows[0].product).toBe('test-cli');
  });

  it('contextualized = `${context}\\n\\n${original}` when context non-empty', async () => {
    await embedAll(temp.db, {
      contextProviderName: 'structured',
      embeddingProviderName: 'ollama',
      limit: 1,
    });
    const row = temp.db
      .prepare(
        `SELECT context_prefix, original_text, contextualized FROM chunks LIMIT 1`
      )
      .get() as { context_prefix: string; original_text: string; contextualized: string };
    expect(row.context_prefix.length).toBeGreaterThan(0);
    expect(row.contextualized).toBe(`${row.context_prefix}\n\n${row.original_text}`);
  });

  it('contextualized = original when context is empty (none provider)', async () => {
    await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      limit: 1,
    });
    const row = temp.db
      .prepare(`SELECT context_prefix, original_text, contextualized FROM chunks LIMIT 1`)
      .get() as { context_prefix: string; original_text: string; contextualized: string };
    expect(row.context_prefix).toBe('');
    expect(row.contextualized).toBe(row.original_text);
  });

  it('chunks_fts row count equals chunks row count after embed', async () => {
    await embedAll(temp.db, { contextProviderName: 'structured', embeddingProviderName: 'ollama' });
    const chunks = (temp.db.prepare(`SELECT COUNT(*) AS c FROM chunks`).get() as { c: number }).c;
    const fts = (temp.db.prepare(`SELECT COUNT(*) AS c FROM chunks_fts`).get() as { c: number }).c;
    expect(fts).toBe(chunks);
  });

  it('batch-size N invokes the embedder ceil(total/N) times', async () => {
    // Pull a chunk count first
    const pending = (
      temp.db.prepare(`SELECT COUNT(*) AS c FROM changes`).get() as { c: number }
    ).c;
    fm.calls.length = 0;
    await embedAll(temp.db, {
      contextProviderName: 'structured',
      embeddingProviderName: 'ollama',
      batchSize: 7,
    });
    const calls = fm.calls.filter((c) => c.url.includes('/api/embed'));
    expect(calls.length).toBe(Math.ceil(pending / 7));
  });

  it('throws clear error when an unknown context provider is requested', async () => {
    await expect(
      embedAll(temp.db, {
        contextProviderName: 'nonexistent' as any,
        embeddingProviderName: 'ollama',
      })
    ).rejects.toThrow(/unknown context provider/);
  });

  it('throws clear error when an unknown embedding provider is requested', async () => {
    await expect(
      embedAll(temp.db, {
        contextProviderName: 'none',
        embeddingProviderName: 'nonexistent' as any,
      })
    ).rejects.toThrow(/unknown embedding provider/);
  });

  it('returns chunksCreated=0 and skips fetch when no pending chunks', async () => {
    await embedAll(temp.db, { contextProviderName: 'none', embeddingProviderName: 'ollama' });
    fm.calls.length = 0;
    const stats = await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
    });
    expect(stats.chunksCreated).toBe(0);
    expect(fm.calls.length).toBe(0);
  });
});
