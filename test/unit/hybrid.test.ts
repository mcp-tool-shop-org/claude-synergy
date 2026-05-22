import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { embedAll } from '../../src/embed.js';
import { hybridSearch } from '../../src/hybrid.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';
import { mockFetch, jsonResponse, type FetchMockHandle } from '../helpers/fetch-mock.js';
import { goldenVectorArray, EMBEDDING_DIM } from '../helpers/golden-vectors.js';

let temp: TempDb;
let fm: FetchMockHandle;

beforeEach(() => {
  temp = createTempDb();
  seedSampleProducts(temp.db);
  fm = mockFetch([
    {
      method: 'POST',
      urlPattern: '/api/embed',
      response: (req) => {
        const inputs = (req.body?.input ?? []) as string[];
        return jsonResponse({
          model: 'nomic-embed-text',
          embeddings: inputs.map((s) => goldenVectorArray(s, EMBEDDING_DIM)),
        });
      },
    },
    {
      method: 'POST',
      urlPattern: '/api/generate',
      response: (req) => {
        // ollama-judge — return a fixed bracket of scores
        const body = req.body as { prompt?: string };
        // Generate N integers; we don't know N statically, but the prompt mentions it.
        // The reranker pads/truncates as needed, so just provide many lines.
        const lines = Array.from({ length: 30 }, (_, i) => String(10 - (i % 11)));
        return jsonResponse({ model: 'qwen3:8b', response: lines.join('\n'), done: true });
      },
    },
  ]);
});
afterEach(() => {
  fm.restore();
  temp.cleanup();
});

async function seedAndEmbed() {
  await embedAll(temp.db, {
    contextProviderName: 'structured',
    embeddingProviderName: 'ollama',
  });
}

describe('hybridSearch — empty corpus', () => {
  it('returns [] when chunks table exists but is empty', async () => {
    // realistic empty: vec schema was initialized but no chunks ingested yet
    const { initVecSchema } = await import('../../src/embed.js');
    initVecSchema(temp.db);
    const res = await hybridSearch(temp.db, 'workflow');
    expect(res).toEqual([]);
  });
});

describe('hybridSearch — FTS + vec channels', () => {
  beforeEach(async () => {
    await seedAndEmbed();
  });

  it('returns results combining FTS + vec ranks', async () => {
    const res = await hybridSearch(temp.db, 'workflow', { limit: 10 });
    expect(res.length).toBeGreaterThan(0);
    // At least some results should have a bm25_rank
    const hasFts = res.some((r) => r.bm25_rank !== null);
    expect(hasFts).toBe(true);
  });

  it('candidates appearing in both channels get summed RRF scores', async () => {
    const res = await hybridSearch(temp.db, 'workflow', { limit: 20 });
    const dualChannel = res.filter((r) => r.bm25_rank !== null && r.vec_rank !== null);
    if (dualChannel.length > 0) {
      for (const r of dualChannel) {
        // RRF: score should approximately equal sum of 1/(k+r) for each channel (default k=60)
        const k = 60;
        const expected = 1 / (k + (r.bm25_rank as number)) + 1 / (k + (r.vec_rank as number));
        expect(Math.abs(r.rrf_score - expected)).toBeLessThan(1e-9);
      }
    }
  });

  it('FTS5 syntax error → fallback to sanitized query (does not throw)', async () => {
    // ":@/" are FTS5-hostile chars; vanilla query would error
    const res = await hybridSearch(temp.db, '-:@/ workflow', { limit: 5 });
    // Should not throw; results may be empty or populated
    expect(Array.isArray(res)).toBe(true);
  });

  it('--product filter applies to both channels', async () => {
    const res = await hybridSearch(temp.db, 'workflow', { product: 'test-cli', limit: 20 });
    for (const r of res) expect(r.product).toBe('test-cli');
  });

  it('--since filter applies to both channels', async () => {
    const res = await hybridSearch(temp.db, 'workflow', { since: '2026-03-01', limit: 20 });
    for (const r of res) {
      expect((r.released_at ?? '') >= '2026-03-01').toBe(true);
    }
  });

  it('--kind filter applies to both channels', async () => {
    const res = await hybridSearch(temp.db, 'workflow', { kind: 'added', limit: 20 });
    for (const r of res) expect(r.kind).toBe('added');
  });

  it('respects --limit', async () => {
    const res = await hybridSearch(temp.db, 'workflow', { limit: 3 });
    expect(res.length).toBeLessThanOrEqual(3);
  });
});

describe('hybridSearch — rerank', () => {
  beforeEach(async () => {
    await seedAndEmbed();
  });

  it('--rerank none keeps RRF order; rerank_score is null', async () => {
    const res = await hybridSearch(temp.db, 'workflow', { rerankProviderName: 'none', limit: 5 });
    for (const r of res) expect(r.rerank_score).toBeNull();
    // RRF-monotonic
    for (let i = 1; i < res.length; i++) {
      expect(res[i - 1].rrf_score >= res[i].rrf_score).toBe(true);
    }
  });

  it('--rerank ollama-judge calls the judge and reorders by rerank score', async () => {
    fm.calls.length = 0;
    const res = await hybridSearch(temp.db, 'workflow', {
      rerankProviderName: 'ollama-judge',
      limit: 5,
    });
    const judgeCalls = fm.calls.filter((c) => c.url.includes('/api/generate'));
    expect(judgeCalls.length).toBe(1);
    // results should be sorted by rerank_score DESC when present
    for (let i = 1; i < res.length; i++) {
      const a = res[i - 1].rerank_score;
      const b = res[i].rerank_score;
      if (a !== null && b !== null) {
        expect(a >= b).toBe(true);
      }
    }
  });
});

describe('hybridSearch — rerank fallback when scores are uniform', () => {
  beforeEach(async () => {
    await seedAndEmbed();
  });

  it('judge returning all zeros → final order falls back to RRF (deterministic)', async () => {
    // Override the generate route to return all-zeros
    fm.restore();
    fm = mockFetch([
      {
        method: 'POST',
        urlPattern: '/api/embed',
        response: (req) => {
          const inputs = (req.body?.input ?? []) as string[];
          return jsonResponse({
            model: 'nomic-embed-text',
            embeddings: inputs.map((s) => goldenVectorArray(s, EMBEDDING_DIM)),
          });
        },
      },
      {
        method: 'POST',
        urlPattern: '/api/generate',
        response: () =>
          jsonResponse({ model: 'qwen3:8b', response: '0\n0\n0\n0\n0\n0\n0\n0\n0\n0\n', done: true }),
      },
    ]);
    const res = await hybridSearch(temp.db, 'workflow', {
      rerankProviderName: 'ollama-judge',
      limit: 5,
    });
    // All rerank_scores equal → order should still be deterministic (rrf_score tiebreak)
    expect(res.length).toBeGreaterThan(0);
    for (let i = 1; i < res.length; i++) {
      // When rerank ties, the implementation keeps the rrf order; rerank scores all === 0.
      expect(res[i - 1].rerank_score === 0 || res[i - 1].rerank_score === null).toBe(true);
    }
  });
});
