import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fetchAll, seedMarkersFromDb, listFetchTargets } from '../../src/fetch.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';

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
    execFileSync: vi.fn(respond),
    execSync: vi.fn(respond),
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
    expect(existsSync(path)).toBe(true);
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
      existsSync(join(productsRoot, 'claude-agent-sdk-python', 'releases', '1.2.3.md'))
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
      existsSync(join(productsRoot, 'anthropic-sdk-typescript', 'releases', 'sdk-0.98.0.md'))
    ).toBe(true);
    expect(
      existsSync(
        join(productsRoot, 'anthropic-sdk-typescript', 'releases', 'bedrock-sdk-0.29.2.md')
      )
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
      execFileSync: vi.fn(thrower),
      execSync: vi.fn(thrower),
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
      existsSync(join(productsRoot, 'claude-agent-sdk-python', 'releases', '0.2.0.md'))
    ).toBe(true);
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
