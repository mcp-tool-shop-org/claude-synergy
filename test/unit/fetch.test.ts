import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fetchAll, seedMarkersFromDb, listFetchTargets, resolveEffectiveSince, scanDiskReleaseBounds } from '../../src/fetch.js';
import { ingestAll } from '../../src/ingest.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';
import { mockFetch } from '../helpers/fetch-mock.js';
import { createExecFileMock } from '../helpers/mock-gh-api.js';

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/html' } });
}

let temp: TempDb;
let productsRoot: string;

beforeEach(() => {
  temp = createTempDb();
  productsRoot = mkdtempSync(join(tmpdir(), 'fetch-test-products-'));
});
afterEach(() => {
  temp.cleanup();
  rmSync(productsRoot, { recursive: true, force: true });
  vi.restoreAllMocks();
});

/**
 * Mock the gh-api subprocess call. Returns the given release set as JSON
 * on the first page and an empty array on subsequent pages (so the
 * pagination loop terminates cleanly).
 *
 * src/fetch.ts now uses execFileSync('gh', ['api', ...]) instead of execSync —
 * the mock provides BOTH for backward compat with any callers that still use
 * execSync; the executable is the first arg, the argv array is the second.
 */
function mockGhApi(releases: any[]) {
  let callCount = 0;
  const respond = () => {
    callCount += 1;
    return callCount === 1
      ? Buffer.from(JSON.stringify(releases), 'utf-8').toString('utf-8')
      : '[]';
  };
  vi.doMock('node:child_process', () => ({
    execFile: createExecFileMock(respond),
  }));
}

describe('listFetchTargets', () => {
  it('returns the 12 known Tier 1 targets', () => {
    const targets = listFetchTargets();
    expect(targets.length).toBeGreaterThanOrEqual(10);
    const slugs = targets.map((t) => t.product);
    expect(slugs).toContain('claude-agent-sdk-python');
    expect(slugs).toContain('anthropic-sdk-typescript');
    expect(slugs).toContain('claude-code-action');
  });
});

describe('fetchAll', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('writes a new file with proper frontmatter when releases are new', async () => {
    mockGhApi([
      {
        tag_name: 'v0.2.0',
        published_at: '2026-04-01T10:00:00Z',
        name: 'Release 0.2.0',
        body: '- Added new `EXAMPLE_FLAG`',
        html_url: 'https://github.com/anthropics/claude-agent-sdk-python/releases/tag/v0.2.0',
      },
    ]);
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const stats = await fetchAllMocked(temp.db, productsRoot, {
      product: 'claude-agent-sdk-python',
    });
    expect(stats[0].fetched).toBe(1);
    const path = join(productsRoot, 'claude-agent-sdk-python', 'releases', '0.2.0.md');
    expect(existsSync(path), 'release file should be written to disk').toBe(true);
    const body = readFileSync(path, 'utf-8');
    expect(body).toMatch(/product: claude-agent-sdk-python/);
    expect(body).toMatch(/version: "0\.2\.0"/);
    expect(body).toMatch(/released_at: "2026-04-01"/);
    expect(body).toMatch(/source_url: ".*v0\.2\.0/);
  });

  it('strips leading `v` from the filename', async () => {
    mockGhApi([
      {
        tag_name: 'v1.2.3',
        published_at: '2026-04-02T10:00:00Z',
        name: 'r',
        body: '- one',
        html_url: 'u',
      },
    ]);
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    await fetchAllMocked(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    expect(
      existsSync(join(productsRoot, 'claude-agent-sdk-python', 'releases', '1.2.3.md')),
      'v-stripped filename 1.2.3.md should exist'
    ).toBe(true);
  });

  it('multi-package products keep prefix and strip `v` only from version segment', async () => {
    mockGhApi([
      {
        tag_name: 'sdk-v0.98.0',
        published_at: '2026-04-20T10:00:00Z',
        name: 'sdk 0.98.0',
        body: '- sdk',
        html_url: 'u',
      },
      {
        tag_name: 'bedrock-sdk-v0.29.2',
        published_at: '2026-04-21T10:00:00Z',
        name: 'bedrock 0.29.2',
        body: '- bedrock',
        html_url: 'u',
      },
    ]);
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    await fetchAllMocked(temp.db, productsRoot, { product: 'anthropic-sdk-typescript' });
    expect(
      existsSync(join(productsRoot, 'anthropic-sdk-typescript', 'releases', 'sdk-0.98.0.md')),
      'sdk release file should exist with prefix preserved'
    ).toBe(true);
    expect(
      existsSync(
        join(productsRoot, 'anthropic-sdk-typescript', 'releases', 'bedrock-sdk-0.29.2.md')
      ),
      'bedrock-sdk release file should exist with prefix preserved'
    ).toBe(true);
  });

  it('idempotent — second run with same input writes 0 new files', async () => {
    mockGhApi([
      {
        tag_name: 'v0.2.0',
        published_at: '2026-04-01T10:00:00Z',
        name: 'r',
        body: '- one',
        html_url: 'u',
      },
    ]);
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const first = await fetchAllMocked(temp.db, productsRoot, {
      product: 'claude-agent-sdk-python',
    });
    expect(first[0].fetched).toBe(1);
    const second = await fetchAllMocked(temp.db, productsRoot, {
      product: 'claude-agent-sdk-python',
    });
    expect(second[0].fetched).toBe(0);
  });

  it('idempotent against pre-existing v-prefixed filename (dual-form existsSync)', async () => {
    // The "swarm convention" used v-prefixed filenames in some places.
    // fetchAll should treat both `1.0.29.md` and `v1.0.29.md` as already-fetched.
    mkdirSync(join(productsRoot, 'claude-code-action', 'releases'), { recursive: true });
    writeFileSync(
      join(productsRoot, 'claude-code-action', 'releases', 'v1.0.29.md'),
      '# already here\n'
    );
    mockGhApi([
      {
        tag_name: 'v1.0.29',
        published_at: '2026-04-01T10:00:00Z',
        name: 'r',
        body: '- one',
        html_url: 'u',
      },
    ]);
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const stats = await fetchAllMocked(temp.db, productsRoot, { product: 'claude-code-action' });
    expect(stats[0].fetched).toBe(0);
    // The "1.0.29.md" file should NOT have been written
    expect(
      existsSync(join(productsRoot, 'claude-code-action', 'releases', '1.0.29.md'))
    ).toBe(false);
    // Marker should still advance
    const marker = temp.db
      .prepare(`SELECT version FROM markers WHERE product='claude-code-action'`)
      .get() as any;
    expect(marker?.version).toMatch(/2026-04-01/);
  });

  it('writes marker with upsert on (product, name)', async () => {
    mockGhApi([
      {
        tag_name: 'v0.2.0',
        published_at: '2026-04-01T10:00:00Z',
        name: 'r',
        body: '- one',
        html_url: 'u',
      },
    ]);
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    await fetchAllMocked(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    mockGhApi([
      {
        tag_name: 'v0.3.0',
        published_at: '2026-04-15T10:00:00Z',
        name: 'r',
        body: '- two',
        html_url: 'u',
      },
    ]);
    vi.resetModules();
    const { fetchAll: fetchAllMocked2 } = await import('../../src/fetch.js');
    await fetchAllMocked2(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    const rows = temp.db
      .prepare(`SELECT * FROM markers WHERE product='claude-agent-sdk-python'`)
      .all() as any[];
    expect(rows.length).toBe(1);
    expect(rows[0].version).toMatch(/2026-04-15/);
  });

  it('unknown product slug → throws with helpful list', async () => {
    const { fetchAll: fetchAllReal } = await import('../../src/fetch.js');
    await expect(
      fetchAllReal(temp.db, productsRoot, { product: 'not-real' })
    ).rejects.toThrow(/unknown product.*available/i);
  });

  it('gh CLI throwing is captured in errors[] (wrapped as "fetch failed: ...") and does not crash', async () => {
    const thrower = () => {
      throw new Error('gh: command not found');
    };
    vi.doMock('node:child_process', () => ({
      execFile: createExecFileMock(thrower),
    }));
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const stats = await fetchAllMocked(temp.db, productsRoot, {
      product: 'claude-agent-sdk-python',
    });
    expect(stats[0].fetched).toBe(0);
    expect(stats[0].errors.length).toBeGreaterThan(0);
    expect(stats[0].errors[0]).toMatch(/fetch failed/);
  });

  it('filters by published_at > since (server-side filter happens in JS)', async () => {
    mockGhApi([
      {
        tag_name: 'v0.1.0',
        published_at: '2025-12-01T10:00:00Z', // before default since
        name: 'old',
        body: '- old',
        html_url: 'u',
      },
      {
        tag_name: 'v0.2.0',
        published_at: '2026-04-01T10:00:00Z', // after default since
        name: 'new',
        body: '- new',
        html_url: 'u',
      },
    ]);
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const stats = await fetchAllMocked(temp.db, productsRoot, {
      product: 'claude-agent-sdk-python',
    });
    expect(stats[0].fetched).toBe(1);
    expect(
      existsSync(join(productsRoot, 'claude-agent-sdk-python', 'releases', '0.1.0.md'))
    ).toBe(false);
    expect(
      existsSync(join(productsRoot, 'claude-agent-sdk-python', 'releases', '0.2.0.md')),
      'new release after since-date should be written to disk'
    ).toBe(true);
  });
});

describe('fetchAll pagination', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('walks beyond the 100-release first page', async () => {
    // 100 items on page 1, 30 items on page 2, then [] → terminate.
    // Exercises the new ghReleases() pagination loop (page < 50 ceiling).
    const page1 = Array.from({ length: 100 }, (_, i) => ({
      tag_name: `v0.${i + 1}.0`,
      published_at: '2026-04-15T10:00:00Z',
      name: 'r',
      body: '- one',
      html_url: 'u',
    }));
    const page2 = Array.from({ length: 30 }, (_, i) => ({
      tag_name: `v0.${i + 101}.0`,
      published_at: '2026-04-16T10:00:00Z',
      name: 'r',
      body: '- one',
      html_url: 'u',
    }));
    let call = 0;
    const respond = () => {
      call += 1;
      if (call === 1) return JSON.stringify(page1);
      if (call === 2) return JSON.stringify(page2);
      return '[]';
    };
    vi.doMock('node:child_process', () => ({
      execFile: createExecFileMock(respond),
    }));
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const stats = await fetchAllMocked(temp.db, productsRoot, {
      product: 'claude-agent-sdk-python',
    });
    // All 130 releases land on disk
    expect(stats[0].fetched).toBe(130);
    expect(call).toBeGreaterThanOrEqual(2);
  });

  it('terminates cleanly on partial first page (< 100 results)', async () => {
    let call = 0;
    const respond = () => {
      call += 1;
      return JSON.stringify(
        call === 1
          ? [
              {
                tag_name: 'v0.1.0',
                published_at: '2026-04-15T10:00:00Z',
                name: 'r',
                body: '- one',
                html_url: 'u',
              },
            ]
          : []
      );
    };
    vi.doMock('node:child_process', () => ({
      execFile: createExecFileMock(respond),
    }));
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const stats = await fetchAllMocked(temp.db, productsRoot, {
      product: 'claude-agent-sdk-python',
    });
    expect(stats[0].fetched).toBe(1);
    // Should NOT have called past page 1 — partial-page early break
    expect(call).toBe(1);
  });
});

describe('seedMarkersFromDb', () => {
  it('populates markers based on max released_at per product', () => {
    seedSampleProducts(temp.db);
    const results = seedMarkersFromDb(temp.db);
    // The fetcher's TARGETS doesn't include test-cli/test-sdk/test-apps; results
    // are keyed by TARGETS. Each returned row should have seededTo=null because
    // none of those products are in releases.
    for (const r of results) {
      expect(r.seededTo).toBeNull();
    }
  });

  it('seeds with full ISO when seeded from a date-only released_at', () => {
    // Insert a fake release row for a real target
    temp.db
      .prepare(`INSERT INTO products (name, display_name, source_tier, source_url, fetch_strategy) VALUES (?,?,?,?,?)`)
      .run('claude-agent-sdk-python', 'd', 1, '', 'gh-releases');
    temp.db
      .prepare(
        `INSERT INTO releases (product, version, released_at, notes_path, fetched_at, source_url)
         VALUES (?,?,?,?,?,?)`
      )
      .run('claude-agent-sdk-python', '0.1.0', '2026-04-01', 'x', '2026-05-21', '');
    const results = seedMarkersFromDb(temp.db);
    const py = results.find((r) => r.product === 'claude-agent-sdk-python');
    expect(py?.seededTo).toMatch(/^2026-04-01T23:59:59Z$/);
  });
});

describe('Part 6a — disk-bounded fetch window', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('bounds file-backed strategies by diskNewest and exempts catalog snapshots', () => {
    for (const strategy of ['gh-releases', 'rss', 'raw-changelog', 'html-scrape', 'playwright'] as const) {
      expect(resolveEffectiveSince(strategy, '2026-11-25T10:00:00Z', '2026-10-06')).toBe('2026-10-06');
      expect(resolveEffectiveSince(strategy, '2026-09-01T00:00:00Z', '2026-10-06')).toBe('2026-09-01T00:00:00Z');
      expect(resolveEffectiveSince(strategy, '2026-11-25T10:00:00Z', null)).toBe('2026-01-01');
      expect(resolveEffectiveSince(strategy, '2026-11-25T10:00:00Z', '2026-10-06', '2026-05-01')).toBe('2026-05-01');
    }
    expect(resolveEffectiveSince('catalog', '2026-11-25T10:00:00Z', null)).toBe('2026-11-25T10:00:00Z');
    expect(resolveEffectiveSince('catalog', null, null)).toBe('2026-01-01');
  });

  it('scans oldest/newest released_at and published_at dates and ignores non-md/undated files', () => {
    const empty = join(productsRoot, 'missing-dir');
    expect(scanDiskReleaseBounds(empty)).toEqual({ oldest: null, newest: null });

    const relDir = join(productsRoot, 'demo', 'releases');
    mkdirSync(relDir, { recursive: true });
    writeFileSync(join(relDir, 'notes.txt'), 'ignored');
    writeFileSync(join(relDir, 'no-fm.md'), '# no frontmatter');
    writeFileSync(join(relDir, 'undated.md'), '---\nproduct: demo\nreleased_at: null\n---\n');
    writeFileSync(join(relDir, 'a.md'), '---\nreleased_at: "2026-03-10"\n---\n');
    writeFileSync(join(relDir, 'b.md'), '---\npublished_at: "2026-05-12"\n---\n');
    expect(scanDiskReleaseBounds(relDir)).toEqual({ oldest: '2026-03-10', newest: '2026-05-12' });
  });

  it('(a) two-version jump writes and ingests X+1 and X+2 when marker is already at X+2; (b) second sync is idempotent', async () => {
    const prodDir = join(productsRoot, 'claude-code');
    const relDir = join(prodDir, 'releases');
    mkdirSync(relDir, { recursive: true });
    writeFileSync(
      join(prodDir, 'PRODUCT.md'),
      [
        '---',
        'product: claude-code',
        'display_name: Claude Code',
        'source_tier: 1',
        'source_url: https://github.com/anthropics/claude-code/releases',
        'fetch_strategy: gh-releases',
        '---',
        '',
      ].join('\n')
    );
    writeFileSync(
      join(relDir, '1.0.0.md'),
      [
        '---',
        'product: claude-code',
        'version: "1.0.0"',
        'released_at: "2026-10-06"',
        'source_url: "https://example.invalid/v1.0.0"',
        'fetched_at: "2026-10-06"',
        '---',
        '',
        '# claude-code v1.0.0',
        '',
        '- Initial X baseline',
        '',
      ].join('\n')
    );

    // Seed cached marker already past X+2 while files on disk stop at X (1.0.0).
    temp.db
      .prepare(
        `INSERT INTO products (name, display_name, source_tier, source_url, fetch_strategy)
         VALUES ('claude-code', 'Claude Code', 1, '', 'gh-releases')`
      )
      .run();
    temp.db
      .prepare(
        `INSERT INTO markers (product, name, version, updated_at)
         VALUES ('claude-code', 'last_fetched_release_at', '2026-10-08T10:00:00Z', '2026-10-08T10:00:00Z')`
      )
      .run();

    const upstream = [
      {
        tag_name: 'v1.0.2',
        published_at: '2026-10-08T10:00:00Z',
        name: '1.0.2',
        body: '- Added feature X+2',
        html_url: 'https://example.invalid/v1.0.2',
      },
      {
        tag_name: 'v1.0.1',
        published_at: '2026-10-07T10:00:00Z',
        name: '1.0.1',
        body: '- Added feature X+1',
        html_url: 'https://example.invalid/v1.0.1',
      },
      {
        tag_name: 'v1.0.0',
        published_at: '2026-10-06T10:00:00Z',
        name: '1.0.0',
        body: '- Initial X baseline',
        html_url: 'https://example.invalid/v1.0.0',
      },
    ];
    vi.doMock('node:child_process', () => ({
      execFile: createExecFileMock(() => JSON.stringify(upstream)),
    }));
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');

    // (a) First sync writes both missing versions X+1 and X+2 and ingests them.
    const firstFetch = await fetchAllMocked(temp.db, productsRoot, { product: 'claude-code' });
    expect(firstFetch[0].fetched).toBe(2);
    expect(firstFetch[0].newSince).toBe('2026-10-06');
    expect(existsSync(join(relDir, '1.0.1.md'))).toBe(true);
    expect(existsSync(join(relDir, '1.0.2.md'))).toBe(true);

    const firstIngest = ingestAll(temp.db, productsRoot);
    expect(firstIngest.releasesAdded).toBe(3); // 1.0.0, 1.0.1, 1.0.2
    const versions = (
      temp.db.prepare(`SELECT version FROM releases WHERE product = 'claude-code' ORDER BY version`).all() as Array<{
        version: string;
      }>
    ).map((r) => r.version);
    expect(versions).toEqual(['1.0.0', '1.0.1', '1.0.2']);

    // (b) Second sync with same upstream is idempotent and writes nothing.
    const secondFetch = await fetchAllMocked(temp.db, productsRoot, { product: 'claude-code' });
    expect(secondFetch[0].fetched).toBe(0);
    const secondIngest = ingestAll(temp.db, productsRoot);
    expect(secondIngest.releasesAdded).toBe(0);
  });

  it('(c) with no files and no marker, the default 2026-01-01 window is unchanged', async () => {
    mockGhApi([
      {
        tag_name: 'v0.9.0',
        published_at: '2025-12-20T10:00:00Z',
        name: 'old',
        body: '- pre-default',
        html_url: 'u-old',
      },
      {
        tag_name: 'v1.0.0',
        published_at: '2026-02-01T10:00:00Z',
        name: 'new',
        body: '- post-default',
        html_url: 'u-new',
      },
    ]);
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const stats = await fetchAllMocked(temp.db, productsRoot, { product: 'claude-code' });
    expect(stats[0].newSince).toBe('2026-01-01');
    expect(stats[0].fetched).toBe(1);
    expect(existsSync(join(productsRoot, 'claude-code', 'releases', '0.9.0.md'))).toBe(false);
    expect(existsSync(join(productsRoot, 'claude-code', 'releases', '1.0.0.md'))).toBe(true);
  });

  it('fills interior gap when 2.1.292 and 2.1.332 exist on disk without 2.1.293..2.1.331', async () => {
    const relDir = join(productsRoot, 'claude-code', 'releases');
    mkdirSync(relDir, { recursive: true });
    writeFileSync(join(relDir, '2.1.292.md'), '---\nreleased_at: "2026-10-06"\n---\n- old\n');
    writeFileSync(join(relDir, '2.1.332.md'), '---\nreleased_at: "2026-11-25"\n---\n- island\n');

    const upstream = Array.from({ length: 41 }, (_, idx) => {
      const patch = 332 - idx;
      const dayNum = patch === 292 ? 6 : 7 + Math.floor((patch - 293) / 2);
      const day = String(Math.min(28, dayNum)).padStart(2, '0');
      const month = patch === 332 ? '11' : '10';
      return {
        tag_name: `v2.1.${patch}`,
        published_at: `2026-${month}-${day}T12:00:00Z`,
        name: `2.1.${patch}`,
        body: `- Change ${patch}`,
        html_url: `https://example.invalid/v2.1.${patch}`,
      };
    });

    vi.doMock('node:child_process', () => ({
      execFile: createExecFileMock(() => JSON.stringify(upstream)),
    }));
    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const stats = await fetchAllMocked(temp.db, productsRoot, { product: 'claude-code' });
    expect(stats[0].fetched).toBe(39);
    expect(existsSync(join(relDir, '2.1.293.md'))).toBe(true);
    expect(existsSync(join(relDir, '2.1.331.md'))).toBe(true);
  });

  it('continues past page 1 when an island gap spans into page 2 and stops on page 1 afterward (Item 6)', async () => {
    const relDir = join(productsRoot, 'claude-code', 'releases');
    mkdirSync(relDir, { recursive: true });
    // Anchor oldest on disk at 2026-06-01, newest on disk at 2026-11-25.
    writeFileSync(join(relDir, '2.0.1.md'), '---\nreleased_at: "2026-06-01"\n---\n- baseline\n');
    writeFileSync(join(relDir, '2.0.205.md'), '---\nreleased_at: "2026-11-25"\n---\n- island\n');

    // Page 1 (100 items): v2.0.205 .. v2.0.106; pre-seed v2.0.106 (page 1's last item!)
    // so only `pageHadMissingInWindow` keeps pagination going into Page 2!
    writeFileSync(join(relDir, '2.0.106.md'), '---\nreleased_at: "2026-08-15"\n---\n- boundary\n');
    const page1 = Array.from({ length: 100 }, (_, i) => {
      const minor = 205 - i;
      const date = minor === 205 ? '2026-11-25T10:00:00Z' : '2026-08-15T10:00:00Z';
      return {
        tag_name: `v2.0.${minor}`,
        published_at: date,
        name: `2.0.${minor}`,
        body: `- Item ${minor}`,
        html_url: `https://example.invalid/v2.0.${minor}`,
      };
    });
    const page2 = [
      {
        tag_name: 'v2.0.105',
        published_at: '2026-07-10T10:00:00Z',
        name: '2.0.105',
        body: '- Page 2 gap item',
        html_url: 'https://example.invalid/v2.0.105',
      },
      {
        tag_name: 'v2.0.1',
        published_at: '2026-06-01T10:00:00Z',
        name: '2.0.1',
        body: '- Baseline',
        html_url: 'https://example.invalid/v2.0.1',
      },
    ];

    let ghCalls = 0;
    const respond = (pageUrlOrArgs: any) => {
      ghCalls++;
      const joined = Array.isArray(pageUrlOrArgs) ? pageUrlOrArgs.join(' ') : String(pageUrlOrArgs);
      if (/[?&]page=1(?:&|$)/.test(joined)) return JSON.stringify(page1);
      if (/[?&]page=2(?:&|$)/.test(joined)) return JSON.stringify(page2);
      return '[]';
    };
    vi.doMock('node:child_process', () => ({
      execFile: createExecFileMock((_file, args) => respond(args)),
    }));

    const { fetchAll: fetchAllMocked } = await import('../../src/fetch.js');
    const first = await fetchAllMocked(temp.db, productsRoot, { product: 'claude-code' });
    // 98 missing on page 1 (205 & 106 existed) + 1 missing on page 2 (105; 1 existed) = 99!
    expect(first[0].fetched).toBe(99);
    expect(existsSync(join(relDir, '2.0.105.md'))).toBe(true);
    expect(ghCalls).toBe(2);

    // Second run: every item on page 1 exists on disk (and last item <= sinceIso is saved),
    // so pagination short-circuits after page 1 (only 1 gh call) and fetches 0.
    ghCalls = 0;
    const second = await fetchAllMocked(temp.db, productsRoot, { product: 'claude-code' });
    expect(second[0].fetched).toBe(0);
    expect(ghCalls).toBe(1);
  });

  it('matches hand-seeded <YYYY-MM-DD>-<subproduct>.md files for anthropic-apps without re-writing or advancing marker on layout error (Items 7 & 14)', async () => {
    const relDir = join(productsRoot, 'anthropic-apps', 'releases');
    mkdirSync(relDir, { recursive: true });
    writeFileSync(
      join(relDir, '2026-04-17-claude-design.md'),
      `---\nproduct: anthropic-apps\nversion: "2026-04-17"\nreleased_at: "2026-04-17"\nfetched_at: "2026-05-21"\n---\n\n- Launched Claude Design\n`,
      'utf-8'
    );

    const html = `<!doctype html><html><body><article>
      <div class="intercom-interblocks-subheading3"><h3 id="h_new">November 24, 2026</h3></div>
      <div class="intercom-interblocks-paragraph"><p>Added workspace export.</p></div>
      <div class="intercom-interblocks-subheading3"><h3 id="h_old">April 17, 2026</h3></div>
      <div class="intercom-interblocks-paragraph"><p>Launched Claude Design.</p></div>
    </article></body></html>`;

    const fetchHandle = mockFetch([
      { urlPattern: /support\.claude\.com\/en\/articles\/12138966/, response: () => htmlResponse(html) },
    ]);
    try {
      const { fetchAll: fetchAllReal } = await import('../../src/fetch.js');
      const stats = await fetchAllReal(temp.db, productsRoot, { product: 'anthropic-apps' });
      expect(stats[0].fetched).toBe(1);
      expect(existsSync(join(relDir, '2026-11-24.md'))).toBe(true);
      expect(existsSync(join(relDir, '2026-04-17.md'))).toBe(false);
    } finally {
      fetchHandle.restore();
    }

    // Item 7: broken layout leaves existing marker untouched and returns error.
    const beforeMarker = temp.db
      .prepare(`SELECT version FROM markers WHERE product='anthropic-apps'`)
      .get() as { version: string };
    const badFetchHandle = mockFetch([
      { urlPattern: /support\.claude\.com/, response: () => htmlResponse('<html><body><h3>Overview</h3></body></html>') },
    ]);
    try {
      const { fetchAll: fetchAllReal } = await import('../../src/fetch.js');
      const errStats = await fetchAllReal(temp.db, productsRoot, { product: 'anthropic-apps' });
      expect(errStats[0].fetched).toBe(0);
      expect(errStats[0].errors[0]).toMatch(/no dated release headings/i);
      const afterMarker = temp.db
        .prepare(`SELECT version FROM markers WHERE product='anthropic-apps'`)
        .get() as { version: string };
      expect(afterMarker.version).toBe(beforeMarker.version);
    } finally {
      badFetchHandle.restore();
    }
  });

  it('writes GitHub release bodies byte-for-byte identically to base 667ff72 (FIX-3 Item 1)', async () => {
    const prodDir = join(productsRoot, 'claude-code');
    const relDir = join(prodDir, 'releases');
    mkdirSync(relDir, { recursive: true });
    const rawBody = [
      '## Highlights',
      '- Generic types `Vec<T>`, `Map<K, V>`, and inline `a < b && c > d` work cleanly',
      '- Literal escaped example: &lt;img src=x onerror=1&gt;',
      '```ts',
      'const items: Array<number> = [1, 2, 3];',
      '```',
    ].join('\n');
    const rel = {
      tag_name: 'v3.0.0',
      published_at: '2026-11-26T10:00:00Z',
      name: '3.0.0',
      body: rawBody,
      html_url: 'https://example.invalid/v3.0.0',
    };
    mockGhApi([rel]);
    const { fetchAll: fetchAllMocked, renderGhRelease } = await import('../../src/fetch.js');
    const expectedBase = [
      '---',
      'product: claude-code',
      'version: "3.0.0"',
      'released_at: "2026-11-26"',
      'source_url: "https://example.invalid/v3.0.0"',
      `fetched_at: "${new Date().toISOString().split('T')[0]}"`,
      '---',
      '',
      '# claude-code v3.0.0',
      '',
      rawBody,
      '',
    ].join('\n');
    expect(renderGhRelease('claude-code', rel)).toBe(expectedBase);

    const stats = await fetchAllMocked(temp.db, productsRoot, {
      product: 'claude-code',
      sinceOverride: '2026-01-01',
    });
    expect(stats[0].fetched).toBe(1);
    const written = readFileSync(join(relDir, '3.0.0.md'), 'utf-8');
    expect(written).toBe(expectedBase);
  });
});
