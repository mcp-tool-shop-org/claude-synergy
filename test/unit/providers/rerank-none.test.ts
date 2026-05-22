import { describe, it, expect } from 'vitest';
import { NoneRerankProvider } from '../../../src/providers/rerank/none.js';

describe('NoneRerankProvider', () => {
  it('returns N results with monotonically decreasing scores (length - index)', async () => {
    const p = new NoneRerankProvider();
    const candidates = [
      { id: 10, text: 'a' },
      { id: 20, text: 'b' },
      { id: 30, text: 'c' },
    ];
    const results = await p.rerank('q', candidates);
    expect(results).toEqual([
      { id: 10, score: 3 },
      { id: 20, score: 2 },
      { id: 30, score: 1 },
    ]);
  });

  it('returns [] on empty input', async () => {
    const p = new NoneRerankProvider();
    expect(await p.rerank('q', [])).toEqual([]);
  });

  it('has name "none"', () => {
    expect(new NoneRerankProvider().name).toBe('none');
  });
});
