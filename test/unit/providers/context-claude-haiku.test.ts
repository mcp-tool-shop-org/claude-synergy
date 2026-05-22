// Shape-only test for the paid Anthropic / Haiku provider.
// No real API calls; mocked fetch with assertions on request shape.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClaudeHaikuContextProvider } from '../../../src/providers/context/claude-haiku.js';
import { mockFetch, jsonResponse, type FetchMockHandle } from '../../helpers/fetch-mock.js';
import type { ChangeChunk, ReleaseContext } from '../../../src/providers/types.js';

let fm: FetchMockHandle;

beforeEach(() => {
  fm = mockFetch([
    {
      method: 'POST',
      urlPattern: 'api.anthropic.com/v1/messages',
      response: () =>
        jsonResponse({
          id: 'msg',
          type: 'message',
          role: 'assistant',
          model: 'claude-haiku-4-5-20251001',
          content: [{ type: 'text', text: ' Cached context for the focused chunk. ' }],
          stop_reason: 'end_turn',
          usage: { input_tokens: 100, output_tokens: 20 },
        }),
    },
  ]);
});
afterEach(() => fm.restore());

function ctx(): ChangeChunk {
  return {
    changeId: 1,
    product: 'p',
    releaseVersion: 'v',
    releasedAt: '2026-01-01',
    kind: 'added',
    text: 'Focused bullet about FOO_BAR env var',
    ordinalInRelease: 1,
    totalInRelease: 2,
  };
}

function rel(): ReleaseContext {
  return {
    product: 'p',
    version: 'v',
    releasedAt: '2026-01-01',
    siblings: [ctx(), { ...ctx(), changeId: 2, text: 'sibling bullet' }],
  };
}

describe('ClaudeHaikuContextProvider — shape only', () => {
  it('throws when ANTHROPIC_API_KEY is missing', () => {
    const orig = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      expect(() => new ClaudeHaikuContextProvider({})).toThrow(/ANTHROPIC_API_KEY/);
    } finally {
      // Canonical env-restore (matches test/regression/bugs.test.ts §8.6).
      if (orig === undefined) delete process.env.ANTHROPIC_API_KEY;
      else process.env.ANTHROPIC_API_KEY = orig;
    }
  });

  it('sets cache_control on the system block (prompt caching)', async () => {
    const p = new ClaudeHaikuContextProvider({ apiKey: 'sk-test' });
    await p.contextFor(ctx(), rel());
    const call = fm.calls[0];
    expect(call.body.system[0].cache_control).toEqual({ type: 'ephemeral' });
  });

  it('uses claude-haiku-4-5-20251001 model by default', async () => {
    const p = new ClaudeHaikuContextProvider({ apiKey: 'sk-test' });
    await p.contextFor(ctx(), rel());
    expect(fm.calls[0].body.model).toBe('claude-haiku-4-5-20251001');
  });

  it('assembles the system text from release.siblings', async () => {
    const p = new ClaudeHaikuContextProvider({ apiKey: 'sk-test' });
    await p.contextFor(ctx(), rel());
    const sys: string = fm.calls[0].body.system[0].text;
    expect(sys).toContain('Focused bullet about FOO_BAR env var');
    expect(sys).toContain('sibling bullet');
  });

  it('caches document per release key — 2 chunks in the same release reuse the cached doc', async () => {
    const p = new ClaudeHaikuContextProvider({ apiKey: 'sk-test' });
    await p.contextFor(ctx(), rel());
    await p.contextFor({ ...ctx(), changeId: 2 }, rel());
    // Same product + version → siblings doc should be unchanged
    expect(fm.calls[0].body.system[0].text).toBe(fm.calls[1].body.system[0].text);
  });

  it('uses the x-api-key + anthropic-version headers', async () => {
    const p = new ClaudeHaikuContextProvider({ apiKey: 'sk-test' });
    await p.contextFor(ctx(), rel());
    expect(fm.calls[0].headers['x-api-key']).toBe('sk-test');
    expect(fm.calls[0].headers['anthropic-version']).toBe('2023-06-01');
  });
});
