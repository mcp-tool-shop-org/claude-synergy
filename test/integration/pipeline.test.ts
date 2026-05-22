import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { searchChanges, lookupEntity } from '../../src/query.js';
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
        jsonResponse({
          model: 'qwen3:8b',
          response: Array.from({ length: 30 }, (_, i) => String(10 - (i % 11))).join('\n'),
          done: true,
        }),
    },
  ]);
});
afterEach(() => {
  fm.restore();
  temp.cleanup();
});

describe('end-to-end pipeline: ingest → query → embed → hybrid', () => {
  it('runs through the full pipeline without error', async () => {
    const stats = seedSampleProducts(temp.db);
    expect(stats.releasesAdded).toBe(9);
    expect(stats.changesAdded).toBeGreaterThan(0);

    // Tier 2a — FTS-only query
    const ftsResults = searchChanges(temp.db, 'workflow');
    expect(ftsResults.length).toBeGreaterThan(0);

    // Entity lookup
    const env = lookupEntity(temp.db, 'env_var', 'ANTHROPIC_API_KEY');
    expect(env.length).toBeGreaterThanOrEqual(1);

    // Tier 2b — embed and run hybrid
    const embedStats = await embedAll(temp.db, {
      contextProviderName: 'structured',
      embeddingProviderName: 'ollama',
    });
    expect(embedStats.chunksCreated).toBeGreaterThan(0);

    const hybridResults = await hybridSearch(temp.db, 'workflow', { limit: 5 });
    expect(hybridResults.length).toBeGreaterThan(0);

    // With rerank
    const reranked = await hybridSearch(temp.db, 'workflow', {
      rerankProviderName: 'ollama-judge',
      limit: 5,
    });
    expect(reranked.length).toBeGreaterThan(0);
    // At least one result has a non-null rerank score
    expect(
      reranked.some((r) => r.rerank_score !== null),
      'at least one reranked result should have a non-null rerank_score'
    ).toBe(true);
  });

  it('counts roughly match: 3 products, 9 releases, >= 15 changes', () => {
    const stats = seedSampleProducts(temp.db);
    expect(stats.productsCount).toBe(3);
    expect(stats.releasesAdded).toBe(9);
    expect(stats.changesAdded).toBeGreaterThanOrEqual(15);
    expect(stats.entitiesAdded).toBeGreaterThanOrEqual(5);
  });
});
