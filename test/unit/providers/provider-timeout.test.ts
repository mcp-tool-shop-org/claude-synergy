// T-02: Provider AbortSignal.timeout paths untested.
//
// All local providers (OllamaEmbeddingProvider, OllamaContextProvider,
// OllamaJudgeRerankProvider) have timeout guards via AbortSignal.timeout()
// controlled by CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS. This file exercises the
// timeout branch by mocking fetch to never resolve and setting the env var
// to a minimal value (1ms).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OllamaEmbeddingProvider } from '../../../src/providers/embedding/ollama.js';
import { OllamaContextProvider } from '../../../src/providers/context/ollama.js';
import { OllamaJudgeRerankProvider } from '../../../src/providers/rerank/ollama-judge.js';
import type { ChangeChunk, ReleaseContext } from '../../../src/providers/types.js';

let origTimeout: string | undefined;

beforeEach(() => {
  origTimeout = process.env.CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS;
  // Set a very short timeout to trigger the AbortSignal.timeout() path
  process.env.CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS = '1';
});

afterEach(() => {
  if (origTimeout === undefined) delete process.env.CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS;
  else process.env.CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS = origTimeout;
  vi.restoreAllMocks();
});

/**
 * Mock fetch to hang forever (never resolve). The AbortSignal should abort it.
 */
function mockHangingFetch() {
  return vi.spyOn(global, 'fetch').mockImplementation(
    (_input: any, init?: any) =>
      new Promise((_resolve, reject) => {
        // If the caller passed an AbortSignal, listen for abort and reject
        const signal = init?.signal as AbortSignal | undefined;
        if (signal) {
          if (signal.aborted) {
            reject(signal.reason ?? new DOMException('This operation was aborted', 'AbortError'));
            return;
          }
          signal.addEventListener('abort', () => {
            reject(signal.reason ?? new DOMException('This operation was aborted', 'AbortError'));
          });
        }
        // Otherwise: hang forever (the test timeout will catch this if the abort fails)
      })
  );
}

function sampleChunk(): ChangeChunk {
  return {
    changeId: 1,
    product: 'test-product',
    releaseVersion: 'v1.0.0',
    releasedAt: '2026-05-01',
    kind: 'added',
    text: 'Added timeout test feature',
    ordinalInRelease: 1,
    totalInRelease: 1,
  };
}

function sampleRelease(): ReleaseContext {
  const chunk = sampleChunk();
  return {
    product: 'test-product',
    version: 'v1.0.0',
    releasedAt: '2026-05-01',
    siblings: [chunk],
  };
}

describe('OllamaEmbeddingProvider — timeout fires on hanging fetch', () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spy = mockHangingFetch();
  });
  afterEach(() => {
    spy.mockRestore();
  });

  it('rejects with structured timeout error when fetch hangs', async () => {
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    await expect(p.embed(['hello'])).rejects.toThrow(/timed out after 1ms/);
  }, 10_000);

  it('error message mentions Ollama server responsiveness', async () => {
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    await expect(p.embed(['hello'])).rejects.toThrow(/Ollama.*responsive/);
  }, 10_000);
});

describe('OllamaContextProvider — timeout fires on hanging fetch', () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spy = mockHangingFetch();
  });
  afterEach(() => {
    spy.mockRestore();
  });

  it('rejects with structured timeout error when fetch hangs', async () => {
    const p = new OllamaContextProvider({ host: 'http://localhost:11434' });
    await expect(p.contextFor(sampleChunk(), sampleRelease())).rejects.toThrow(
      /timed out after 1ms/
    );
  }, 10_000);

  it('error message mentions Ollama server responsiveness', async () => {
    const p = new OllamaContextProvider({ host: 'http://localhost:11434' });
    await expect(p.contextFor(sampleChunk(), sampleRelease())).rejects.toThrow(
      /Ollama.*responsive/
    );
  }, 10_000);
});

describe('OllamaJudgeRerankProvider — timeout fires on hanging fetch', () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spy = mockHangingFetch();
  });
  afterEach(() => {
    spy.mockRestore();
  });

  it('rejects with structured timeout error when fetch hangs', async () => {
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    await expect(
      p.rerank('test query', [
        { id: 1, text: 'candidate A' },
        { id: 2, text: 'candidate B' },
      ])
    ).rejects.toThrow(/timed out after 1ms/);
  }, 10_000);

  it('error message mentions Ollama server responsiveness', async () => {
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    await expect(
      p.rerank('test query', [{ id: 1, text: 'candidate A' }])
    ).rejects.toThrow(/Ollama.*responsive/);
  }, 10_000);
});

describe('provider timeout env var parsing', () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spy = mockHangingFetch();
  });
  afterEach(() => {
    spy.mockRestore();
  });

  it('invalid env value (non-numeric) falls back to 60_000ms default (times out test if broken)', async () => {
    process.env.CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS = 'not-a-number';
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    // With a 60s default and a hanging fetch, this would timeout at 60s.
    // We just verify it does NOT throw immediately (it should hang, proving the 60s default is used).
    // Use a race with a short timer to verify it's NOT the 1ms timeout:
    const result = await Promise.race([
      p.embed(['hello']).then(() => 'resolved').catch((e) => e.message),
      new Promise<string>((r) => setTimeout(() => r('still-pending'), 50)),
    ]);
    // If the timeout was 1ms, it would have already rejected. At 60s default, it's still pending at 50ms.
    expect(result).toBe('still-pending');
  }, 10_000);

  it('zero env value falls back to default (rejected non-positive)', async () => {
    process.env.CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS = '0';
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    const result = await Promise.race([
      p.embed(['hello']).then(() => 'resolved').catch((e) => e.message),
      new Promise<string>((r) => setTimeout(() => r('still-pending'), 50)),
    ]);
    expect(result).toBe('still-pending');
  }, 10_000);

  it('negative env value falls back to default', async () => {
    process.env.CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS = '-100';
    const p = new OllamaEmbeddingProvider({ host: 'http://localhost:11434' });
    const result = await Promise.race([
      p.embed(['hello']).then(() => 'resolved').catch((e) => e.message),
      new Promise<string>((r) => setTimeout(() => r('still-pending'), 50)),
    ]);
    expect(result).toBe('still-pending');
  }, 10_000);
});
