import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OllamaEmbeddingProvider } from '../../../src/providers/embedding/ollama.js';
import { mockFetch, jsonResponse, errorResponse, type FetchMockHandle } from '../../helpers/fetch-mock.js';
import { goldenVectorArray, EMBEDDING_DIM } from '../../helpers/golden-vectors.js';

let fm: FetchMockHandle;

beforeEach(() => {
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
  ]);
});
afterEach(() => fm.restore());

describe('OllamaEmbeddingProvider', () => {
  it('POSTs to ${host}/api/embed with { model, input: string[] }', async () => {
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    await p.embed(['hello', 'world']);
    const call = fm.calls[0];
    expect(call.url).toBe('http://localhost:11434/api/embed');
    expect(call.body.model).toBe('nomic-embed-text');
    expect(call.body.input).toEqual(['hello', 'world']);
  });

  it('returns Float32Array[] one per input, all dim=768', async () => {
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    const out = await p.embed(['a', 'b', 'c']);
    expect(out).toHaveLength(3);
    for (const v of out) {
      expect(v).toBeInstanceOf(Float32Array);
      expect(v.length).toBe(EMBEDDING_DIM);
    }
  });

  it('throws a clear error when the response dimension does not match', async () => {
    fm.restore();
    fm = mockFetch([
      {
        method: 'POST',
        urlPattern: '/api/embed',
        response: () =>
          jsonResponse({
            model: 'wrong-model',
            embeddings: [[1, 2, 3]], // only 3-d
          }),
      },
    ]);
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    await expect(p.embed(['x'])).rejects.toThrow(/dimension 768/);
  });

  it('returns [] for empty input without calling fetch', async () => {
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    const out = await p.embed([]);
    expect(out).toEqual([]);
    expect(fm.calls).toHaveLength(0);
  });

  it('normalizes OLLAMA_HOST without protocol', async () => {
    const orig = process.env.OLLAMA_HOST;
    process.env.OLLAMA_HOST = '127.0.0.1:11434';
    try {
      const p = new OllamaEmbeddingProvider({});
      await p.embed(['x']);
      expect(fm.calls[0].url.startsWith('http://127.0.0.1:11434')).toBe(true);
    } finally {
      if (orig === undefined) delete process.env.OLLAMA_HOST;
      else process.env.OLLAMA_HOST = orig;
    }
  });

  it('throws when fetch returns non-200', async () => {
    fm.restore();
    fm = mockFetch([
      {
        method: 'POST',
        urlPattern: '/api/embed',
        response: () => errorResponse(500, 'oops'),
      },
    ]);
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    await expect(p.embed(['x'])).rejects.toThrow(/500/);
  });
});
