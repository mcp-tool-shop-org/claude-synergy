// Shape-only test for the paid Voyage rerank provider.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VoyageRerankProvider } from '../../../src/providers/rerank/voyage.js';
import { mockFetch, jsonResponse, type FetchMockHandle } from '../../helpers/fetch-mock.js';

let fm: FetchMockHandle;

beforeEach(() => {
  fm = mockFetch([
    {
      method: 'POST',
      urlPattern: 'api.voyageai.com/v1/rerank',
      response: () =>
        jsonResponse({
          object: 'list',
          model: 'rerank-2',
          data: [
            { index: 1, relevance_score: 0.9 },
            { index: 0, relevance_score: 0.5 },
          ],
          usage: { total_tokens: 1 },
        }),
    },
  ]);
});
afterEach(() => fm.restore());

describe('VoyageRerankProvider — shape only', () => {
  it('throws when VOYAGE_API_KEY missing', () => {
    const orig = process.env.VOYAGE_API_KEY;
    delete process.env.VOYAGE_API_KEY;
    try {
      expect(() => new VoyageRerankProvider({})).toThrow(/VOYAGE_API_KEY/);
    } finally {
      if (orig !== undefined) process.env.VOYAGE_API_KEY = orig;
    }
  });

  it('uses canonical endpoint + Bearer auth + correct body shape', async () => {
    const p = new VoyageRerankProvider({ apiKey: 'vk-test' });
    await p.rerank('q', [
      { id: 100, text: 'a' },
      { id: 200, text: 'b' },
    ]);
    const call = fm.calls[0];
    expect(call.url).toBe('https://api.voyageai.com/v1/rerank');
    expect(call.headers.authorization).toBe('Bearer vk-test');
    expect(call.body.query).toBe('q');
    expect(call.body.documents).toEqual(['a', 'b']);
    expect(call.body.top_k).toBe(2);
  });

  it('maps data[].index back to candidate IDs', async () => {
    const p = new VoyageRerankProvider({ apiKey: 'vk-test' });
    const result = await p.rerank('q', [
      { id: 100, text: 'a' },
      { id: 200, text: 'b' },
    ]);
    // Response was [{index:1,score:0.9},{index:0,score:0.5}] → ids 200, 100
    expect(result).toEqual([
      { id: 200, score: 0.9 },
      { id: 100, score: 0.5 },
    ]);
  });

  it('returns [] for empty candidates without calling fetch', async () => {
    const p = new VoyageRerankProvider({ apiKey: 'vk-test' });
    fm.calls.length = 0;
    const result = await p.rerank('q', []);
    expect(result).toEqual([]);
    expect(fm.calls).toHaveLength(0);
  });
});
