// Unit tests for the OpenAI embedding provider (Wave 1, new).
//
// Mirrors test/unit/providers/embedding-voyage.test.ts. Tests are shape-only
// (mocked fetch, no real OpenAI traffic). Covers:
//   - Constructor defaults / env-var resolution
//   - Request body shape (endpoint, auth header, model, dimensions param)
//   - Response decoding (Float32Array length = dim)
//   - Error paths (429 retry, missing API key, non-200)
//   - dim override via opts.dim (uses OpenAI `dimensions` param)
//
// Shared contract per kickoff:
//   class OpenAIEmbeddingProvider — name='openai', default model
//   'text-embedding-3-small', default dim 1536, supports `dim` override that
//   becomes OpenAI's `dimensions` request param.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OpenAIEmbeddingProvider } from '../../../src/providers/embedding/openai.js';
import {
  mockFetch,
  jsonResponse,
  errorResponse,
  type FetchMockHandle,
} from '../../helpers/fetch-mock.js';

let fm: FetchMockHandle;

function makeOkRoute(dim: number) {
  return {
    method: 'POST' as const,
    urlPattern: 'api.openai.com/v1/embeddings',
    response: (req: any) => {
      const inputs = (req.body?.input ?? []) as string[];
      return jsonResponse({
        object: 'list',
        model: req.body?.model ?? 'text-embedding-3-small',
        data: inputs.map((_: string, i: number) => ({
          object: 'embedding',
          embedding: new Array(dim).fill(0.1),
          index: i,
        })),
        usage: { prompt_tokens: 1, total_tokens: 1 },
      });
    },
  };
}

beforeEach(() => {
  fm = mockFetch([makeOkRoute(1536)]);
});
afterEach(() => fm.restore());

describe('OpenAIEmbeddingProvider — construction', () => {
  it('throws AppError-style error with hint when OPENAI_API_KEY missing', () => {
    const orig = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      expect(() => new OpenAIEmbeddingProvider({})).toThrow(/OPENAI_API_KEY/);
    } finally {
      if (orig === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = orig;
    }
  });

  it('default model is "text-embedding-3-small" when no env, no opts', () => {
    const orig = process.env.OPENAI_EMBED_MODEL;
    delete process.env.OPENAI_EMBED_MODEL;
    try {
      const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
      expect(p.model).toBe('text-embedding-3-small');
    } finally {
      if (orig === undefined) delete process.env.OPENAI_EMBED_MODEL;
      else process.env.OPENAI_EMBED_MODEL = orig;
    }
  });

  it('default dim is 1536 when no opts.dim', () => {
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    expect(p.dimension).toBe(1536);
  });

  it('reads OPENAI_EMBED_MODEL from env when no opts.model', () => {
    const orig = process.env.OPENAI_EMBED_MODEL;
    process.env.OPENAI_EMBED_MODEL = 'text-embedding-3-large';
    try {
      const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
      expect(p.model).toBe('text-embedding-3-large');
    } finally {
      if (orig === undefined) delete process.env.OPENAI_EMBED_MODEL;
      else process.env.OPENAI_EMBED_MODEL = orig;
    }
  });

  it('reads OPENAI_API_KEY from env when no opts.apiKey', () => {
    const orig = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'sk-from-env';
    try {
      // No apiKey in opts — must not throw
      expect(() => new OpenAIEmbeddingProvider({})).not.toThrow();
    } finally {
      if (orig === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = orig;
    }
  });

  it('name is "openai"', () => {
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    expect(p.name).toBe('openai');
  });
});

describe('OpenAIEmbeddingProvider — request shape', () => {
  it('POSTs to api.openai.com/v1/embeddings with Bearer auth + model/input', async () => {
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    await p.embed(['hello']);
    expect(fm.calls[0].url).toMatch(/api\.openai\.com\/v1\/embeddings$/);
    expect(fm.calls[0].headers.authorization).toBe('Bearer sk-test');
    expect(fm.calls[0].body.model).toBe('text-embedding-3-small');
    expect(fm.calls[0].body.input).toEqual(['hello']);
  });

  it('content-type header is application/json', async () => {
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    await p.embed(['hello']);
    expect(fm.calls[0].headers['content-type']).toMatch(/application\/json/);
  });

  it('opts.dim is sent as OpenAI dimensions param', async () => {
    fm.restore();
    fm = mockFetch([makeOkRoute(768)]);
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test', dim: 768 });
    await p.embed(['hello']);
    expect(fm.calls[0].body.dimensions).toBe(768);
    expect(p.dimension).toBe(768);
  });

  it('default (no opts.dim) does not necessarily send dimensions param OR sends 1536', async () => {
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    await p.embed(['hello']);
    // Either omitted, or explicitly 1536 — both acceptable
    if ('dimensions' in fm.calls[0].body) {
      expect(fm.calls[0].body.dimensions).toBe(1536);
    }
  });
});

describe('OpenAIEmbeddingProvider — response decoding', () => {
  it('returns Float32Array[] one per input, length = dim', async () => {
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    const out = await p.embed(['a', 'b', 'c']);
    expect(out).toHaveLength(3);
    for (const v of out) {
      expect(v).toBeInstanceOf(Float32Array);
      expect(v.length).toBe(1536);
    }
  });

  it('honors a custom dim when both server + provider agree', async () => {
    fm.restore();
    fm = mockFetch([makeOkRoute(768)]);
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test', dim: 768 });
    const out = await p.embed(['a']);
    expect(out[0].length).toBe(768);
  });

  it('returns [] for empty input without calling fetch (mirrors Ollama provider)', async () => {
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    const out = await p.embed([]);
    expect(out).toEqual([]);
    expect(fm.calls).toHaveLength(0);
  });
});

describe('OpenAIEmbeddingProvider — error paths', () => {
  it('throws on non-200 with a meaningful message including status code', async () => {
    fm.restore();
    fm = mockFetch([
      {
        method: 'POST',
        urlPattern: 'api.openai.com/v1/embeddings',
        response: () => errorResponse(500, 'server error'),
      },
    ]);
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    await expect(p.embed(['x'])).rejects.toThrow(/500/);
  });

  it('retries on 429 (rate limited) then succeeds — exposes through retry.ts', async () => {
    let callCount = 0;
    fm.restore();
    fm = mockFetch([
      {
        method: 'POST',
        urlPattern: 'api.openai.com/v1/embeddings',
        response: () => {
          callCount++;
          if (callCount === 1) return errorResponse(429, 'rate limit');
          return jsonResponse({
            object: 'list',
            model: 'text-embedding-3-small',
            data: [{ object: 'embedding', embedding: new Array(1536).fill(0.5), index: 0 }],
            usage: { total_tokens: 1 },
          });
        },
      },
    ]);
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    const out = await p.embed(['x']);
    expect(out).toHaveLength(1);
    expect(callCount).toBeGreaterThanOrEqual(2); // retried at least once
  }, 15_000); // retry includes backoff; widen timeout

  it('eventually throws when 429 persists past max attempts', async () => {
    fm.restore();
    fm = mockFetch([
      {
        method: 'POST',
        urlPattern: 'api.openai.com/v1/embeddings',
        response: () => errorResponse(429, 'rate limit'),
      },
    ]);
    const p = new OpenAIEmbeddingProvider({ apiKey: 'sk-test' });
    await expect(p.embed(['x'])).rejects.toThrow(/429/);
  }, 30_000);
});
