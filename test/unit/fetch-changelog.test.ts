// Unit tests for src/fetch-changelog.ts — Aider HISTORY.md parser.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { fetchAiderHistory } from '../../src/fetch-changelog.js';
import { mockFetch, type FetchMockHandle } from '../helpers/fetch-mock.js';

// fetch-changelog uses execSync('gh api ...') to correlate version → date.
// Mock the module so the gh call doesn't hit network.
vi.mock('node:child_process', async () => {
  const actual = await vi.importActual<typeof import('node:child_process')>('node:child_process');
  return {
    ...actual,
    execSync: vi.fn(() =>
      JSON.stringify([
        { tag_name: 'v0.85.0', published_at: '2025-06-27T12:00:00Z' },
        { tag_name: 'v0.86.0', published_at: '2025-08-09T12:00:00Z' },
      ])
    ),
  };
});

let handle: FetchMockHandle | undefined;
afterEach(() => {
  handle?.restore();
  handle = undefined;
  vi.restoreAllMocks();
});

function aiderHistoryResponse(md: string): Response {
  return new Response(md, { status: 200, headers: { 'content-type': 'text/markdown' } });
}

describe('fetchAiderHistory — version parsing', () => {
  it('extracts `### Aider vX.Y.Z` sections as separate items', async () => {
    handle = mockFetch([
      {
        urlPattern: /HISTORY/,
        response: () =>
          aiderHistoryResponse(
            `### main branch\n\n- main entry one\n- main entry two\n\n` +
              `### Aider v0.86.0\n\n- v0.86 bullet one\n- v0.86 bullet two\n\n` +
              `### Aider v0.85.0\n\n- v0.85 bullet one\n\n`
          ),
      },
    ]);
    const items = await fetchAiderHistory('https://example.test/HISTORY.md', '2024-01-01');
    expect(items.map((i) => i.version)).toContain('0.86.0');
    expect(items.map((i) => i.version)).toContain('0.85.0');
    expect(items.map((i) => i.version)).toContain('main');
  });

  it('correlates GH release tag → published_at for dated entries', async () => {
    handle = mockFetch([
      {
        urlPattern: /HISTORY/,
        response: () =>
          aiderHistoryResponse(`### Aider v0.86.0\n\n- only entry\n`),
      },
    ]);
    const items = await fetchAiderHistory('https://example.test/HISTORY.md', '2024-01-01');
    const v86 = items.find((i) => i.version === '0.86.0');
    expect(v86?.releasedAt).toMatch(/2025-08-09/);
  });

  it('items without a matching GH release tag get releasedAt = null', async () => {
    handle = mockFetch([
      {
        urlPattern: /HISTORY/,
        response: () =>
          aiderHistoryResponse(`### Aider v0.85.1\n\n- patch entry\n`),
      },
    ]);
    const items = await fetchAiderHistory('https://example.test/HISTORY.md', '2024-01-01');
    const v851 = items.find((i) => i.version === '0.85.1');
    expect(v851?.releasedAt).toBeNull();
  });

  it('preserves the body verbatim (multiple bullets joined with newlines)', async () => {
    handle = mockFetch([
      {
        urlPattern: /HISTORY/,
        response: () =>
          aiderHistoryResponse(`### Aider v0.86.0\n\n- one\n- two\n- three\n`),
      },
    ]);
    const items = await fetchAiderHistory('https://example.test/HISTORY.md', '2024-01-01');
    const v86 = items.find((i) => i.version === '0.86.0');
    expect(v86?.body).toMatch(/- one/);
    expect(v86?.body).toMatch(/- two/);
    expect(v86?.body).toMatch(/- three/);
  });
});

describe('fetchAiderHistory — date filtering', () => {
  it('filters dated items at or before sinceIso, ALWAYS keeps undated (main branch + uncorrelated patches)', async () => {
    handle = mockFetch([
      {
        urlPattern: /HISTORY/,
        response: () =>
          aiderHistoryResponse(
            `### main branch\n\n- rolling entry\n\n` +
              `### Aider v0.85.0\n\n- pre-since entry (June 2025)\n\n` +
              `### Aider v0.86.0\n\n- post-since entry (Aug 2025)\n`
          ),
      },
    ]);
    // sinceIso between v0.85 and v0.86
    const items = await fetchAiderHistory('https://example.test/HISTORY.md', '2025-07-01');
    const versions = items.map((i) => i.version);
    expect(versions).toContain('main'); // undated → always included
    expect(versions).toContain('0.86.0'); // dated 2025-08-09 → after sinceIso
    expect(versions).not.toContain('0.85.0'); // dated 2025-06-27 → before sinceIso
  });
});

describe('fetchAiderHistory — error paths', () => {
  it('throws on non-200 response', async () => {
    handle = mockFetch([
      { urlPattern: /HISTORY/, response: () => new Response('not found', { status: 404 }) },
    ]);
    await expect(fetchAiderHistory('https://example.test/HISTORY.md', '2024-01-01')).rejects.toThrow(/404/);
  });
});
