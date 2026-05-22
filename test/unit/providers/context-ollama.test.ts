import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OllamaContextProvider } from '../../../src/providers/context/ollama.js';
import { mockFetch, jsonResponse, errorResponse, type FetchMockHandle } from '../../helpers/fetch-mock.js';
import type { ChangeChunk, ReleaseContext } from '../../../src/providers/types.js';

let fm: FetchMockHandle;

beforeEach(() => {
  fm = mockFetch([
    {
      method: 'POST',
      urlPattern: '/api/generate',
      response: () =>
        jsonResponse({
          model: 'llama3.2:3b',
          response: '  Affects the foo workflow path; related to the bar API.  ',
          done: true,
        }),
    },
  ]);
});
afterEach(() => {
  fm.restore();
});

function ctx(overrides: Partial<ChangeChunk> = {}): ChangeChunk {
  return {
    changeId: 1,
    product: 'claude-code',
    releaseVersion: '2.1.147',
    releasedAt: '2026-04-12',
    kind: 'added',
    text: 'Added the foo bar baz',
    ordinalInRelease: 1,
    totalInRelease: 3,
    ...overrides,
  };
}

function rel(overrides: Partial<ReleaseContext> = {}): ReleaseContext {
  return {
    product: 'claude-code',
    version: '2.1.147',
    releasedAt: '2026-04-12',
    siblings: [
      ctx({ changeId: 1, text: 'A' }),
      ctx({ changeId: 2, text: 'B' }),
      ctx({ changeId: 3, text: 'C' }),
    ],
    ...overrides,
  };
}

describe('OllamaContextProvider', () => {
  it('POSTs to ${host}/api/generate with the expected body shape', async () => {
    const p = new OllamaContextProvider({ host: 'http://localhost:11434' });
    await p.contextFor(ctx(), rel());
    expect(fm.calls).toHaveLength(1);
    const call = fm.calls[0];
    expect(call.url).toContain('http://localhost:11434/api/generate');
    expect(call.method).toBe('POST');
    expect(call.body.stream).toBe(false);
    expect(call.body.options).toEqual({ temperature: 0, num_predict: 80 });
  });

  it('builds a prompt with <document> and <chunk> blocks', async () => {
    const p = new OllamaContextProvider({ host: 'http://localhost:11434' });
    await p.contextFor(ctx(), rel());
    const prompt: string = fm.calls[0].body.prompt;
    expect(prompt).toContain('<document>');
    expect(prompt).toContain('</document>');
    expect(prompt).toContain('<chunk>');
    expect(prompt).toContain('</chunk>');
    // siblings included
    expect(prompt).toContain('1. A');
    expect(prompt).toContain('2. B');
    expect(prompt).toContain('3. C');
  });

  it('trims whitespace from response', async () => {
    const p = new OllamaContextProvider({ host: 'http://localhost:11434' });
    const out = await p.contextFor(ctx(), rel());
    expect(out).toBe('Affects the foo workflow path; related to the bar API.');
  });

  it('normalizes OLLAMA_HOST without protocol → adds http://', async () => {
    const orig = process.env.OLLAMA_HOST;
    process.env.OLLAMA_HOST = '127.0.0.1:11434';
    try {
      const p = new OllamaContextProvider({});
      await p.contextFor(ctx(), rel());
      const url = fm.calls[0].url;
      expect(url.startsWith('http://127.0.0.1:11434')).toBe(true);
    } finally {
      if (orig === undefined) delete process.env.OLLAMA_HOST;
      else process.env.OLLAMA_HOST = orig;
    }
  });

  it('throws with status + body when fetch returns non-200', async () => {
    fm.restore();
    fm = mockFetch([
      {
        method: 'POST',
        urlPattern: '/api/generate',
        response: () => errorResponse(503, 'service unavailable'),
      },
    ]);
    const p = new OllamaContextProvider({ host: 'http://localhost:11434' });
    await expect(p.contextFor(ctx(), rel())).rejects.toThrow(/503/);
  });
});
