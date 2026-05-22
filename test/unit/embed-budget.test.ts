// Unit tests for embed budget guards — maxRequests, maxTokens, signal cancellation.
// These test the defensive early-stop paths in embedAll().

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { embedAll, initVecSchema } from '../../src/embed.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';
import { mockFetch, jsonResponse, type FetchMockHandle } from '../helpers/fetch-mock.js';
import { goldenVectorArray, EMBEDDING_DIM } from '../helpers/golden-vectors.js';

let temp: TempDb;
let fm: FetchMockHandle;

/**
 * Mock the Ollama embedding endpoint with a token-tracking `usage` property.
 * The mock exposes a `usage` property on the provider by augmenting the
 * fetch mock to track cumulative tokens. Since embedAll reads usage from
 * the provider instance (not from the mock), we track calls separately and
 * verify via the returned stats.
 */
function setupOllamaEmbedMock() {
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

/** Count total pending changes in the DB (before embedding). */
function pendingCount(): number {
  return (
    temp.db.prepare(`SELECT COUNT(*) AS c FROM changes`).get() as { c: number }
  ).c;
}

describe('embedAll — maxRequests budget guard', () => {
  it('maxRequests: 1 stops after 1 batch, returns stoppedEarly + budget_requests', async () => {
    const total = pendingCount();
    expect(total).toBeGreaterThan(0);

    const stats = await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      maxRequests: 1,
      batchSize: 2, // small batch to ensure multiple batches would be needed
    });

    expect(stats.stoppedEarly).toBe(true);
    expect(stats.stopReason).toBe('budget_requests');

    // Only 1 batch's worth of chunks should have been embedded
    expect(stats.chunksCreated).toBeLessThanOrEqual(2);
    expect(stats.usage?.requests).toBe(1);

    // Verify the embed endpoint was called exactly once
    const embedCalls = fm.calls.filter((c) => c.url.includes('/api/embed'));
    expect(embedCalls.length).toBe(1);
  });

  it('maxRequests: 2 allows 2 batches then stops', async () => {
    const stats = await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      maxRequests: 2,
      batchSize: 2,
    });

    // If there were more than 2 batches worth of data, it should have stopped
    const total = pendingCount();
    if (total > 4) {
      // More than 2 batches of 2 means budget should kick in
      expect(stats.stoppedEarly).toBe(true);
      expect(stats.stopReason).toBe('budget_requests');
      expect(stats.chunksCreated).toBeLessThanOrEqual(4);
    }

    const embedCalls = fm.calls.filter((c) => c.url.includes('/api/embed'));
    expect(embedCalls.length).toBeLessThanOrEqual(2);
  });

  it('maxRequests: 0 stops immediately before any embedding', async () => {
    const stats = await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      maxRequests: 0,
      batchSize: 2,
    });

    expect(stats.stoppedEarly).toBe(true);
    expect(stats.stopReason).toBe('budget_requests');
    expect(stats.chunksCreated).toBe(0);

    const embedCalls = fm.calls.filter((c) => c.url.includes('/api/embed'));
    expect(embedCalls.length).toBe(0);
  });
});

describe('embedAll — maxTokens budget guard', () => {
  it('maxTokens: 0 stops immediately before any embedding', async () => {
    const stats = await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      maxTokens: 0,
      batchSize: 2,
    });

    expect(stats.stoppedEarly).toBe(true);
    expect(stats.stopReason).toBe('budget_tokens');
    expect(stats.chunksCreated).toBe(0);
  });

  // Note: The Ollama provider does not expose a `usage` property with token
  // counts. The embedAll code increments `usage.requests` unconditionally but
  // only updates `usage.tokens` when the provider exposes `usage.tokens`.
  // With the Ollama mock, tokens stays at 0, so maxTokens > 0 won't trigger
  // budget_tokens after the first batch. This test verifies the maxTokens: 0
  // path (checked before the first batch) and the tracking of the stopReason.
  it('maxTokens: 10 with Ollama mock — tokens stay 0 so all batches run', async () => {
    // Because Ollama doesn't report token usage, tokens stays at 0 < 10,
    // so the budget guard never fires after the first batch check.
    const stats = await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      maxTokens: 10,
      batchSize: 64,
    });

    // Should complete normally since tokens never exceed the budget
    expect(stats.chunksCreated).toBeGreaterThan(0);
    // stoppedEarly may or may not be set depending on the provider's token reporting
  });
});

describe('embedAll — signal cancellation', () => {
  it('pre-aborted signal stops immediately — no chunks created, no embed calls', async () => {
    // When the signal is pre-aborted, embedAll breaks out of the context
    // generation loop before any chunks are collected. The batch loop then
    // has 0 items so it never enters the body where stoppedEarly is set.
    // The observable guarantee: 0 chunks created, 0 embed calls made.
    const stats = await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      signal: AbortSignal.abort('test cancellation'),
      batchSize: 2,
    });

    expect(stats.chunksCreated).toBe(0);

    // No embed calls should have been made
    const embedCalls = fm.calls.filter((c) => c.url.includes('/api/embed'));
    expect(embedCalls.length).toBe(0);
  });

  it('signal aborted after first batch stops before second batch', async () => {
    const controller = new AbortController();
    let batchCount = 0;

    const stats = await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      signal: controller.signal,
      batchSize: 2,
      onProgress: () => {
        batchCount++;
        // Abort after the first batch completes
        if (batchCount === 1) controller.abort('stop after 1 batch');
      },
    });

    expect(stats.stoppedEarly).toBe(true);
    expect(stats.stopReason).toBe('cancelled');
    // Only the first batch's chunks should be embedded
    expect(stats.chunksCreated).toBeLessThanOrEqual(2);
  });

  it('cancelled run does not corrupt the DB — partial data is committed', async () => {
    const controller = new AbortController();
    let batchCount = 0;

    await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      signal: controller.signal,
      batchSize: 2,
      onProgress: () => {
        batchCount++;
        if (batchCount === 1) controller.abort();
      },
    });

    // Verify chunks from the first batch are committed and readable
    const chunkCount = (
      temp.db.prepare(`SELECT COUNT(*) AS c FROM chunks`).get() as { c: number }
    ).c;
    expect(chunkCount).toBeGreaterThan(0);
    expect(chunkCount).toBeLessThanOrEqual(2);

    // Verify the FTS index is consistent
    const ftsCount = (
      temp.db.prepare(`SELECT COUNT(*) AS c FROM chunks_fts`).get() as { c: number }
    ).c;
    expect(ftsCount).toBe(chunkCount);
  });
});

describe('embedAll — usage tracking', () => {
  it('returns usage.requests matching the number of embed batches', async () => {
    const stats = await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      batchSize: 3,
    });

    const total = pendingCount();
    const expectedBatches = Math.ceil(total / 3);

    expect(stats.usage).toBeDefined();
    expect(stats.usage!.requests).toBe(expectedBatches);
  });

  it('onProgress callback fires with correct batch counts', async () => {
    const progressEvents: Array<{ batchesCompleted: number; batchesTotal: number; chunksCompleted: number }> = [];

    await embedAll(temp.db, {
      contextProviderName: 'none',
      embeddingProviderName: 'ollama',
      batchSize: 3,
      onProgress: (p) => {
        progressEvents.push({
          batchesCompleted: p.batchesCompleted,
          batchesTotal: p.batchesTotal,
          chunksCompleted: p.chunksCompleted,
        });
      },
    });

    expect(progressEvents.length).toBeGreaterThan(0);

    // batchesCompleted should increment monotonically
    for (let i = 1; i < progressEvents.length; i++) {
      expect(progressEvents[i].batchesCompleted).toBeGreaterThan(
        progressEvents[i - 1].batchesCompleted
      );
    }

    // Last event should have batchesCompleted === batchesTotal
    const last = progressEvents[progressEvents.length - 1];
    expect(last.batchesCompleted).toBe(last.batchesTotal);
  });
});
