import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OllamaJudgeRerankProvider } from '../../../src/providers/rerank/ollama-judge.js';
import { mockFetch, jsonResponse, type FetchMockHandle } from '../../helpers/fetch-mock.js';

let fm: FetchMockHandle;
function setupJudge(responseText: string) {
  fm?.restore();
  fm = mockFetch([
    {
      method: 'POST',
      urlPattern: '/api/generate',
      response: () => jsonResponse({ model: 'qwen3:8b', response: responseText, done: true }),
    },
  ]);
}

afterEach(() => {
  fm?.restore();
});

describe('OllamaJudgeRerankProvider — defaults', () => {
  it('default model is qwen3:8b', () => {
    const orig = process.env.OLLAMA_RERANK_MODEL;
    delete process.env.OLLAMA_RERANK_MODEL;
    try {
      const p = new OllamaJudgeRerankProvider();
      expect((p as any).model).toBe('qwen3:8b');
    } finally {
      // Canonical env-restore: handle both "was unset" and "was set" cases
      // symmetrically. Matches the pattern in test/regression/bugs.test.ts §8.6.
      if (orig === undefined) delete process.env.OLLAMA_RERANK_MODEL;
      else process.env.OLLAMA_RERANK_MODEL = orig;
    }
  });

  it('has name "ollama-judge"', () => {
    expect(new OllamaJudgeRerankProvider().name).toBe('ollama-judge');
  });
});

describe('OllamaJudgeRerankProvider — request shape', () => {
  it('sends think: false in body (qwen3 thinking-mode workaround)', async () => {
    setupJudge('8\n0\n7');
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]);
    expect(fm.calls[0].body.think).toBe(false);
  });

  it('prompt asks for EXACTLY N integers, one per line', async () => {
    setupJudge('5\n5\n5');
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]);
    const prompt: string = fm.calls[0].body.prompt;
    expect(prompt).toContain('EXACTLY 3 integers');
  });
});

describe('OllamaJudgeRerankProvider — score parsing', () => {
  it('parses bare-integer lines: "8\\n0\\n7" → [8, 0, 7]', async () => {
    setupJudge('8\n0\n7');
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    const result = await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]);
    expect(result).toEqual([
      { id: 1, score: 8 },
      { id: 2, score: 0 },
      { id: 3, score: 7 },
    ]);
  });

  it('parses lines with prefix: "Doc 1: 8\\nDoc 2: 0" → first integer per line', async () => {
    // Note: parser grabs first integer per line. "Doc 1: 8" → first int is 1, not 8 — known limitation.
    // The spec says first-integer extraction is acceptable. We pin the actual behavior.
    setupJudge('Doc 1: 8\nDoc 2: 0');
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    const result = await p.rerank('q', [
      { id: 10, text: 'a' },
      { id: 20, text: 'b' },
    ]);
    // first int on "Doc 1: 8" is `1`; first int on "Doc 2: 0" is `2`. Document this real behavior.
    expect(result).toEqual([
      { id: 10, score: 1 },
      { id: 20, score: 2 },
    ]);
  });

  it('tolerates whitespace: "  10  \\n  5  " → [10, 5]', async () => {
    setupJudge('  10  \n  5  ');
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    const result = await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ]);
    expect(result[0].score).toBe(10);
    expect(result[1].score).toBe(5);
  });

  it('non-integer garbage → padded with 0', async () => {
    setupJudge('abc');
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    const result = await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ]);
    expect(result).toEqual([
      { id: 1, score: 0 },
      { id: 2, score: 0 },
    ]);
  });

  it('clamps scores above 10 → 10', async () => {
    setupJudge('11\n5');
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    const result = await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ]);
    expect(result[0].score).toBe(10);
  });

  it('clamps negative scores → 0', async () => {
    setupJudge('-3\n5');
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    const result = await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ]);
    expect(result[0].score).toBe(0);
  });

  it('fewer scores than expected → padded with 0', async () => {
    setupJudge('7'); // only one
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    const result = await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]);
    expect(result[0].score).toBe(7);
    expect(result[1].score).toBe(0);
    expect(result[2].score).toBe(0);
  });

  it('more scores than expected → truncated to N', async () => {
    setupJudge('1\n2\n3\n4\n5\n6\n7\n8');
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    const result = await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
    ]);
    expect(result).toHaveLength(2);
  });

  it('empty candidates → [] without calling fetch', async () => {
    setupJudge('does not matter');
    fm.calls.length = 0;
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    const result = await p.rerank('q', []);
    expect(result).toEqual([]);
    expect(fm.calls).toHaveLength(0);
  });
});
