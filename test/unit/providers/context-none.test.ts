import { describe, it, expect } from 'vitest';
import { NoneContextProvider } from '../../../src/providers/context/none.js';
import type { ChangeChunk, ReleaseContext } from '../../../src/providers/types.js';

function fakeChunk(): ChangeChunk {
  return {
    changeId: 1,
    product: 'x',
    releaseVersion: '1.0.0',
    releasedAt: '2026-01-01',
    kind: 'added',
    text: 't',
    ordinalInRelease: 1,
    totalInRelease: 1,
  };
}

function fakeRelease(): ReleaseContext {
  return { product: 'x', version: '1.0.0', releasedAt: '2026-01-01', siblings: [fakeChunk()] };
}

describe('NoneContextProvider', () => {
  it('returns "" for any input', async () => {
    const p = new NoneContextProvider();
    expect(await p.contextFor(fakeChunk(), fakeRelease())).toBe('');
  });

  it('has name "none"', () => {
    expect(new NoneContextProvider().name).toBe('none');
  });
});
