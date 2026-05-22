import { describe, it, expect } from 'vitest';
import { StructuredContextProvider } from '../../../src/providers/context/structured.js';
import type { ChangeChunk, ReleaseContext } from '../../../src/providers/types.js';

function chunk(overrides: Partial<ChangeChunk> = {}): ChangeChunk {
  return {
    changeId: 1,
    product: 'claude-code',
    releaseVersion: '2.1.147',
    releasedAt: '2026-04-12',
    kind: 'added',
    text: 'Added the foo bar baz',
    ordinalInRelease: 2,
    totalInRelease: 5,
    ...overrides,
  };
}

function release(overrides: Partial<ReleaseContext> = {}): ReleaseContext {
  return {
    product: 'claude-code',
    version: '2.1.147',
    releasedAt: '2026-04-12',
    siblings: [chunk()],
    ...overrides,
  };
}

describe('StructuredContextProvider', () => {
  it('builds the expected prefix using product, version, date, kind, ordinal/total', async () => {
    const p = new StructuredContextProvider();
    const result = await p.contextFor(chunk(), release());
    expect(result).toBe('In claude-code 2.1.147 (2026-04-12), added (change 2 of 5):');
  });

  it('substitutes "unknown date" when releasedAt is null', async () => {
    const p = new StructuredContextProvider();
    const result = await p.contextFor(chunk({ releasedAt: null }), release({ releasedAt: null }));
    expect(result).toContain('(unknown date)');
  });

  it('preserves kind verbatim (no casing change)', async () => {
    const p = new StructuredContextProvider();
    const result = await p.contextFor(chunk({ kind: 'breaking' }), release());
    expect(result).toContain('breaking');
  });

  it('has name "structured"', () => {
    expect(new StructuredContextProvider().name).toBe('structured');
  });
});
