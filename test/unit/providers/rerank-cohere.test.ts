// Shape-only test for the paid Cohere rerank provider.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CohereRerankProvider } from '../../../src/providers/rerank/cohere.js';
import { mockFetch, jsonResponse, type FetchMockHandle } from '../../helpers/fetch-mock.js';

let fm: FetchMockHandle;

beforeEach(() => {
  fm = mockFetch([
    {
      method: 'POST',
      urlPattern: 'api.cohere.com/v2/rerank',
      response: () =>
        jsonResponse({
          id: 'r',
          results: [
            { index: 2, relevance_score: 0.95 },
            { index: 0, relevance_score: 0.6 },
            { index: 1, relevance_score: 0.3 },
          ],
        }),
    },
  ]);
});
afterEach(() => fm.restore());

describe('CohereRerankProvider — shape only', () => {
  it('throws when COHERE_API_KEY missing', () => {
    const orig = process.env.COHERE_API_KEY;
    delete process.env.COHERE_API_KEY;
    try {
      expect(() => new CohereRerankProvider({})).toThrow(/COHERE_API_KEY/);
    } finally {
      if (orig !== undefined) process.env.COHERE_API_KEY = orig;
    }
  });

  it('uses canonical v2/rerank endpoint + Bearer auth', async () => {
    const p = new CohereRerankProvider({ apiKey: 'ck-test' });
    await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]);
    const call = fm.calls[0];
    expect(call.url).toBe('https://api.cohere.com/v2/rerank');
    expect(call.headers.authorization).toBe('Bearer ck-test');
    expect(call.body.documents).toEqual(['a', 'b', 'c']);
    expect(call.body.top_n).toBe(3);
  });

  it('maps results[].index back to candidate IDs', async () => {
    const p = new CohereRerankProvider({ apiKey: 'ck-test' });
    const result = await p.rerank('q', [
      { id: 100, text: 'a' },
      { id: 200, text: 'b' },
      { id: 300, text: 'c' },
    ]);
    expect(result).toEqual([
      { id: 300, score: 0.95 },
      { id: 100, score: 0.6 },
      { id: 200, score: 0.3 },
    ]);
  });

  it('returns [] for empty candidates without calling fetch', async () => {
    const p = new CohereRerankProvider({ apiKey: 'ck-test' });
    fm.calls.length = 0;
    const result = await p.rerank('q', []);
    expect(result).toEqual([]);
    expect(fm.calls).toHaveLength(0);
  });
});
