import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  fetchOfficialMcpRegistry,
  fetchSmitheryRegistry,
  fetchCatalog,
  writeCatalog,
  type CatalogEntry,
} from '../../src/fetch-mcp-registry.js';
import {
  mockFetch,
  jsonResponse,
  errorResponse,
  type FetchMockHandle,
} from '../helpers/fetch-mock.js';

let fm: FetchMockHandle;
let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'mcp-reg-'));
});
afterEach(() => {
  fm?.restore();
  rmSync(dir, { recursive: true, force: true });
});

describe('fetchOfficialMcpRegistry', () => {
  it('parses a single-page response and dedupes by isLatest=true', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.modelcontextprotocol.io/v0/servers',
        response: () =>
          jsonResponse({
            servers: [
              {
                server: { name: 'io.mcp/fs', title: 'FS', description: 'd', version: '1.0' },
                _meta: {
                  'io.modelcontextprotocol.registry/official': {
                    isLatest: true,
                    publishedAt: '2026-04-10T12:00:00Z',
                  },
                },
              },
              {
                server: { name: 'io.mcp/fs', title: 'FS', description: 'old', version: '0.9' },
                _meta: {
                  'io.modelcontextprotocol.registry/official': {
                    isLatest: false,
                    publishedAt: '2026-01-15T12:00:00Z',
                  },
                },
              },
            ],
            metadata: { count: 2 },
          }),
      },
    ]);
    const entries = await fetchOfficialMcpRegistry();
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('FS');
    expect(entries[0].description).toBe('d');
    expect(entries[0].createdAt).toBe('2026-04-10T12:00:00Z');
    expect(entries[0].source).toBe('official-mcp-registry');
  });

  it('paginates via cursor and terminates when cursor stops changing', async () => {
    let call = 0;
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.modelcontextprotocol.io/v0/servers',
        response: () => {
          call++;
          if (call === 1) {
            return jsonResponse({
              servers: [
                {
                  server: { name: 'io.mcp/a', title: 'A', description: '' },
                  _meta: {
                    'io.modelcontextprotocol.registry/official': { isLatest: true },
                  },
                },
              ],
              metadata: { nextCursor: 'page2' },
            });
          }
          if (call === 2) {
            return jsonResponse({
              servers: [
                {
                  server: { name: 'io.mcp/b', title: 'B', description: '' },
                  _meta: {
                    'io.modelcontextprotocol.registry/official': { isLatest: true },
                  },
                },
              ],
              metadata: { nextCursor: 'page2' }, // same as previous → terminate
            });
          }
          return jsonResponse({ servers: [] });
        },
      },
    ]);
    const entries = await fetchOfficialMcpRegistry();
    expect(entries.length).toBe(2);
    expect(call).toBe(2);
  });

  it('respects maxPages cap', async () => {
    let call = 0;
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.modelcontextprotocol.io/v0/servers',
        response: () => {
          call++;
          return jsonResponse({
            servers: [
              {
                server: { name: `io.mcp/p${call}`, title: `P${call}`, description: '' },
                _meta: {
                  'io.modelcontextprotocol.registry/official': { isLatest: true },
                },
              },
            ],
            metadata: { nextCursor: `cursor-${call}` },
          });
        },
      },
    ]);
    const entries = await fetchOfficialMcpRegistry({ maxPages: 3 });
    expect(call).toBe(3);
    expect(entries.length).toBe(3);
  });

  it('throws on non-200', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.modelcontextprotocol.io',
        response: () => errorResponse(500, 'oops'),
      },
    ]);
    await expect(fetchOfficialMcpRegistry()).rejects.toThrow(/HTTP 500.*registry\.modelcontextprotocol/);
  });

  it('empty servers array returns []', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.modelcontextprotocol.io',
        response: () => jsonResponse({ servers: [], metadata: {} }),
      },
    ]);
    const entries = await fetchOfficialMcpRegistry();
    expect(entries).toEqual([]);
  });
});

describe('fetchSmitheryRegistry', () => {
  it('parses servers and sorts by useCount desc', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.smithery.ai/servers',
        response: () =>
          jsonResponse({
            servers: [
              {
                id: 'a',
                qualifiedName: '@a/low',
                displayName: 'Low',
                description: '',
                useCount: 12,
                createdAt: '2026-04-01T10:00:00Z',
              },
              {
                id: 'b',
                qualifiedName: '@b/high',
                displayName: 'High',
                description: '',
                useCount: 9999,
                createdAt: '2026-02-14T10:00:00Z',
              },
            ],
            pagination: { currentPage: 1, pageSize: 100, totalPages: 1, totalCount: 2 },
          }),
      },
    ]);
    const entries = await fetchSmitheryRegistry();
    expect(entries.length).toBe(2);
    expect(entries[0].name).toBe('High');
    expect(entries[1].name).toBe('Low');
  });

  it('paginates by page number and stops at totalPages', async () => {
    let call = 0;
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.smithery.ai/servers',
        response: (req) => {
          call++;
          const totalPages = 3;
          return jsonResponse({
            servers: [
              {
                id: `srv${call}`,
                qualifiedName: `@p/page${call}`,
                displayName: `Page ${call}`,
                description: '',
                useCount: 10 - call,
              },
            ],
            pagination: { currentPage: call, pageSize: 100, totalPages, totalCount: 3 },
          });
        },
      },
    ]);
    const entries = await fetchSmitheryRegistry();
    expect(call).toBe(3);
    expect(entries.length).toBe(3);
  });

  it('honors maxEntries cap (stops mid-page if cap is reached)', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.smithery.ai/servers',
        response: () =>
          jsonResponse({
            servers: Array.from({ length: 100 }, (_, i) => ({
              id: `srv${i}`,
              qualifiedName: `@x/server-${i}`,
              displayName: `S${i}`,
              description: '',
              useCount: 1000 - i,
            })),
            pagination: { currentPage: 1, pageSize: 100, totalPages: 5, totalCount: 500 },
          }),
      },
    ]);
    const entries = await fetchSmitheryRegistry({ maxEntries: 7 });
    expect(entries.length).toBe(7);
  });

  it('throws on non-200', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.smithery.ai',
        response: () => errorResponse(503, 'oops'),
      },
    ]);
    await expect(fetchSmitheryRegistry()).rejects.toThrow(/HTTP 503.*registry\.smithery/);
  });

  it('empty response terminates without infinite loop', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.smithery.ai',
        response: () => jsonResponse({ servers: [], pagination: { totalPages: 999 } }),
      },
    ]);
    const entries = await fetchSmitheryRegistry();
    expect(entries).toEqual([]);
  });
});

describe('fetchCatalog dispatcher', () => {
  it('routes to official-mcp-registry', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.modelcontextprotocol.io',
        response: () => jsonResponse({ servers: [], metadata: {} }),
      },
    ]);
    const entries = await fetchCatalog('official-mcp-registry');
    expect(entries).toEqual([]);
    expect(fm.calls[0].url).toContain('modelcontextprotocol.io');
  });

  it('routes to smithery', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.smithery.ai',
        response: () => jsonResponse({ servers: [], pagination: { totalPages: 1 } }),
      },
    ]);
    const entries = await fetchCatalog('smithery');
    expect(entries).toEqual([]);
    expect(fm.calls[0].url).toContain('smithery.ai');
  });
});

describe('writeCatalog', () => {
  it('writes CATALOG.md with header + table rows', () => {
    const entries: CatalogEntry[] = [
      {
        slug: 'foo',
        name: 'Foo',
        description: 'Hello world',
        homepage: 'https://example.test/foo',
        popularity: 42,
        createdAt: '2026-04-01T12:00:00Z',
        source: 'smithery',
        category: null,
        verified: true,
      },
      {
        slug: 'bar',
        name: 'Bar',
        description: 'No homepage',
        homepage: null,
        popularity: null,
        createdAt: null,
        source: 'smithery',
        category: null,
        verified: false,
      },
    ];
    const result = writeCatalog(join(dir, 'mcp-test'), 'mcp-test', entries);
    expect(existsSync(result.catalogPath)).toBe(true);
    expect(result.entriesFetched).toBe(2);
    const body = readFileSync(result.catalogPath, 'utf-8');
    expect(body).toContain('# mcp-test — MCP server catalog');
    expect(body).toMatch(/\|\s*Name\s*\|\s*Description/);
    expect(body).toContain('| Foo | Hello world | 42 | 2026-04-01 |');
    // bar row with em-dashes for empty fields
    expect(body).toContain('| Bar | No homepage | — | — | — |');
  });

  it('escapes pipe characters inside name + description to keep table valid', () => {
    const entries: CatalogEntry[] = [
      {
        slug: 'pipe',
        name: 'Has | pipe',
        description: 'desc | with pipe',
        homepage: null,
        popularity: null,
        createdAt: null,
        source: 'official-mcp-registry',
        category: null,
        verified: null,
      },
    ];
    const result = writeCatalog(join(dir, 'pipe-test'), 'pipe-test', entries);
    const body = readFileSync(result.catalogPath, 'utf-8');
    expect(body).toContain('| Has \\| pipe | desc \\| with pipe |');
  });

  it('truncates description to 160 chars and uses only the first line', () => {
    const longDesc = 'first line ' + 'x'.repeat(300);
    const multiLine = 'first line\nsecond line should be hidden';
    const entries: CatalogEntry[] = [
      {
        slug: 'long',
        name: 'Long',
        description: longDesc,
        homepage: null,
        popularity: null,
        createdAt: null,
        source: 'smithery',
        category: null,
        verified: null,
      },
      {
        slug: 'multi',
        name: 'Multi',
        description: multiLine,
        homepage: null,
        popularity: null,
        createdAt: null,
        source: 'smithery',
        category: null,
        verified: null,
      },
    ];
    const result = writeCatalog(join(dir, 'trunc'), 'trunc', entries);
    const body = readFileSync(result.catalogPath, 'utf-8');
    expect(body).not.toContain('second line should be hidden');
    // Long line should be at most 160 chars between the leading "| " and " | <pop>"
    const longRowMatch = body.match(/\| Long \| (.+?) \| —/);
    expect(longRowMatch).toBeTruthy();
    expect(longRowMatch![1].length).toBeLessThanOrEqual(160);
  });
});

describe('slugify (via fetcher entries)', () => {
  it('produces filesystem-safe lowercase slugs from qualifiedName', async () => {
    fm = mockFetch([
      {
        method: 'GET',
        urlPattern: 'registry.smithery.ai',
        response: () =>
          jsonResponse({
            servers: [
              {
                id: 'x',
                qualifiedName: '@Scope/Capital_Letter Tool.v2',
                displayName: 'Capital',
                description: '',
                useCount: 1,
              },
            ],
            pagination: { totalPages: 1 },
          }),
      },
    ]);
    const entries = await fetchSmitheryRegistry();
    expect(entries[0].slug).toMatch(/^[a-z0-9._-]+$/);
    expect(entries[0].slug.length).toBeLessThanOrEqual(80);
  });
});
