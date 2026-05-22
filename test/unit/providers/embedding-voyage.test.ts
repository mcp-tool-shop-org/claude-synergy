// Shape-only test for the paid Voyage embedding provider.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VoyageEmbeddingProvider } from '../../../src/providers/embedding/voyage.js';
import { mockFetch, jsonResponse, type FetchMockHandle } from '../../helpers/fetch-mock.js';

let fm: FetchMockHandle;

beforeEach(() => {
  fm = mockFetch([
    {
      method: 'POST',
      urlPattern: 'api.voyageai.com/v1/embeddings',
      response: (req) => {
        const inputs = (req.body?.input ?? []) as string[];
        return jsonResponse({
          object: 'list',
          model: 'voyage-3-large',
          data: inputs.map((_, i) => ({ object: 'embedding', embedding: new Array(768).fill(0.1), index: i })),
          usage: { total_tokens: 1 },
        });
      },
    },
  ]);
});
afterEach(() => fm.restore());

describe('VoyageEmbeddingProvider — shape only', () => {
  it('throws when VOYAGE_API_KEY is missing', () => {
    const orig = process.env.VOYAGE_API_KEY;
    delete process.env.VOYAGE_API_KEY;
    try {
      expect(() => new VoyageEmbeddingProvider({})).toThrow(/VOYAGE_API_KEY/);
    } finally {
      if (orig !== undefined) process.env.VOYAGE_API_KEY = orig;
    }
  });

  it('request body has output_dimension=768 (Matryoshka truncation)', async () => {
    const p = new VoyageEmbeddingProvider({ apiKey: 'vk-test' });
    await p.embed(['hello']);
    expect(fm.calls[0].body.output_dimension).toBe(768);
  });

  it('input_type is "document" for embed calls', async () => {
    const p = new VoyageEmbeddingProvider({ apiKey: 'vk-test' });
    await p.embed(['hello']);
    expect(fm.calls[0].body.input_type).toBe('document');
  });

  it('uses the canonical endpoint + Bearer auth header', async () => {
    const p = new VoyageEmbeddingProvider({ apiKey: 'vk-test' });
    await p.embed(['hello']);
    expect(fm.calls[0].url).toBe('https://api.voyageai.com/v1/embeddings');
    expect(fm.calls[0].headers.authorization).toBe('Bearer vk-test');
  });
});
