// Unit tests for Wave 1 query functions:
//   - searchChanges (with `until` filter)
//   - browseChanges (no search term)
//   - getChangesSince (date window, grouped by product+version)
//   - compareVersions (between two versions)
//   - recentReleases (with `since` filter)
//
// These exercise the new query surfaces added in Wave 1 alongside the existing
// FTS5 searchChanges. The shared contract is:
//   QueryOptions { product?, since?, until?, kind?, limit? }
//   BrowseOptions { product?, since?, until?, kind?, limit? }
//   ChangesSinceOptions { since: string; until?; product?; kind?; limit? }
//   ChangesSinceResult { product, version, released_at, changes: Array<{ordinal, kind, text}> }
//
// Fixtures (test/fixtures/sample-products/):
//   - test-cli @ 1.0.0 (2026-01-15), 1.0.1 (2026-02-01), 1.1.0 (2026-03-10)
//   - test-sdk @ sdk-0.1.0 (2026-01-20), sdk-0.1.1 (2026-02-15), vertex-sdk-0.2.0 (2026-03-05)
//   - test-apps @ 2026-04-09-test-cowork, 2026-04-09-test-design, 2026-04-10-test-chat
//   - test-cli@1.1.0 has a "Breaking change: --old-flag is now removed entirely" bullet (kind: breaking)

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  searchChanges,
  browseChanges,
  getChangesSince,
  compareVersions,
  recentReleases,
} from '../../src/query.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';

let temp: TempDb;
beforeEach(() => {
  temp = createTempDb();
  seedSampleProducts(temp.db);
});
afterEach(() => {
  temp.cleanup();
});

// ── searchChanges with --until filter ────────────────────────────────────
describe('searchChanges with until filter', () => {
  it('honors the --until filter (<= date)', () => {
    const results = searchChanges(temp.db, 'workflow', { until: '2026-02-01' });
    for (const r of results) {
      expect(r.released_at).not.toBeNull();
      expect(
        r.released_at ?? '',
        `released_at "${r.released_at}" should be <= 2026-02-01`
      ).toSatisfy((d: string) => d <= '2026-02-01');
    }
  });

  it('boundary case: until equals a release date includes that release', () => {
    // test-cli@1.0.1 is released 2026-02-01 and matches "workflow"
    const results = searchChanges(temp.db, 'workflow', { until: '2026-02-01' });
    const has0101 = results.some((r) => r.product === 'test-cli' && r.version === '1.0.1');
    expect(has0101, 'until=2026-02-01 should include the release on that exact date').toBe(true);
  });

  it('combines --since and --until window correctly', () => {
    const results = searchChanges(temp.db, 'workflow', {
      since: '2026-02-01',
      until: '2026-03-31',
    });
    for (const r of results) {
      expect(r.released_at).not.toBeNull();
      expect(r.released_at ?? '').toSatisfy((d: string) => d >= '2026-02-01' && d <= '2026-03-31');
    }
  });

  it('--until in the past returns empty array, not an error', () => {
    const results = searchChanges(temp.db, 'workflow', { until: '2020-01-01' });
    expect(results).toEqual([]);
  });
});

// ── browseChanges (no search term) ──────────────────────────────────────
describe('browseChanges (filter-only, no search term)', () => {
  it('returns rows matching kind filter only', () => {
    const results = browseChanges(temp.db, { kind: 'breaking' });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) expect(r.kind).toBe('breaking');
  });

  it('returns rows matching product filter only', () => {
    const results = browseChanges(temp.db, { product: 'test-cli' });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) expect(r.product).toBe('test-cli');
  });

  it('returns rows matching since/until window', () => {
    const results = browseChanges(temp.db, {
      since: '2026-03-01',
      until: '2026-03-31',
    });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.released_at ?? '').toSatisfy((d: string) => d >= '2026-03-01' && d <= '2026-03-31');
    }
  });

  it('with no filters returns all changes (respects limit)', () => {
    const results = browseChanges(temp.db, { limit: 5 });
    expect(results.length).toBeLessThanOrEqual(5);
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns empty array for filters with no matches (no throw)', () => {
    const results = browseChanges(temp.db, { product: 'nonexistent-product' });
    expect(results).toEqual([]);
  });

  it('orders by released_at DESC then ordinal ASC', () => {
    const results = browseChanges(temp.db, { limit: 100 });
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const cur = results[i];
      if (prev.released_at === cur.released_at) {
        // Same release date — within a release, ordinal ASC; across releases on same date, allow any.
        // We only assert when same product+version
        if (prev.product === cur.product && prev.version === cur.version) {
          expect(cur.ordinal).toBeGreaterThanOrEqual(prev.ordinal);
        }
      } else {
        expect(prev.released_at ?? '').toSatisfy((d: string) => d >= (cur.released_at ?? ''));
      }
    }
  });

  it('combines kind + product filters', () => {
    const results = browseChanges(temp.db, { kind: 'breaking', product: 'test-cli' });
    for (const r of results) {
      expect(r.kind).toBe('breaking');
      expect(r.product).toBe('test-cli');
    }
  });
});

// ── getChangesSince ──────────────────────────────────────────────────────
describe('getChangesSince', () => {
  it('groups change rows by product+version', () => {
    const results = getChangesSince(temp.db, { since: '2026-01-01' });
    expect(results.length).toBeGreaterThan(0);
    // No two result entries should have the same product+version
    const seen = new Set<string>();
    for (const r of results) {
      const key = `${r.product}@${r.version}`;
      expect(seen.has(key), `duplicate release key in getChangesSince: ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it('each result entry has the expected shape: product, version, released_at, changes[]', () => {
    const results = getChangesSince(temp.db, { since: '2026-01-01' });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(typeof r.product).toBe('string');
      expect(typeof r.version).toBe('string');
      expect(Array.isArray(r.changes)).toBe(true);
      for (const c of r.changes) {
        expect(typeof c.ordinal).toBe('number');
        expect(typeof c.kind).toBe('string');
        expect(typeof c.text).toBe('string');
      }
    }
  });

  it('sorts releases newest first', () => {
    const results = getChangesSince(temp.db, { since: '2026-01-01' });
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1].released_at ?? '';
      const cur = results[i].released_at ?? '';
      expect(prev, `result[${i - 1}].released_at "${prev}" should be >= result[${i}].released_at "${cur}"`).toSatisfy(
        (d: string) => d >= cur
      );
    }
  });

  it('respects since filter — excludes releases strictly before since', () => {
    // sinceIso = 2026-02-15, so test-cli@1.0.0 (2026-01-15) and test-cli@1.0.1 (2026-02-01) excluded
    const results = getChangesSince(temp.db, { since: '2026-02-15' });
    for (const r of results) {
      expect(r.released_at ?? '').toSatisfy((d: string) => d >= '2026-02-15');
    }
    const has100 = results.some((r) => r.product === 'test-cli' && r.version === '1.0.0');
    expect(has100).toBe(false);
  });

  it('respects until filter — excludes releases after until', () => {
    const results = getChangesSince(temp.db, { since: '2026-01-01', until: '2026-02-15' });
    for (const r of results) {
      expect(r.released_at ?? '').toSatisfy(
        (d: string) => d >= '2026-01-01' && d <= '2026-02-15'
      );
    }
  });

  it('respects kind: "breaking" filter — only breaking changes returned', () => {
    const results = getChangesSince(temp.db, { since: '2026-01-01', kind: 'breaking' });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      for (const c of r.changes) {
        expect(c.kind).toBe('breaking');
      }
    }
  });

  it('respects product filter', () => {
    const results = getChangesSince(temp.db, { since: '2026-01-01', product: 'test-cli' });
    for (const r of results) {
      expect(r.product).toBe('test-cli');
    }
  });

  it('returns empty array when no releases match window (no throw)', () => {
    const results = getChangesSince(temp.db, { since: '2099-01-01' });
    expect(results).toEqual([]);
  });

  it('changes within a release are ordered by ordinal ASC', () => {
    const results = getChangesSince(temp.db, { since: '2026-01-01' });
    for (const r of results) {
      for (let i = 1; i < r.changes.length; i++) {
        expect(r.changes[i].ordinal).toBeGreaterThanOrEqual(r.changes[i - 1].ordinal);
      }
    }
  });
});

// ── compareVersions ──────────────────────────────────────────────────────
describe('compareVersions', () => {
  it('returns all releases between fromVersion (exclusive) and toVersion (inclusive)', () => {
    // test-cli: 1.0.0 (2026-01-15), 1.0.1 (2026-02-01), 1.1.0 (2026-03-10)
    // from=1.0.0 to=1.1.0 → should include 1.0.1, 1.1.0 (not 1.0.0)
    const results = compareVersions(temp.db, {
      product: 'test-cli',
      fromVersion: '1.0.0',
      toVersion: '1.1.0',
    });
    const versions = results.map((r) => r.version);
    expect(versions).toContain('1.0.1');
    expect(versions).toContain('1.1.0');
    expect(versions, 'fromVersion is exclusive — 1.0.0 should NOT be in the result').not.toContain(
      '1.0.0'
    );
  });

  it('toVersion is inclusive — including when from===to-1', () => {
    const results = compareVersions(temp.db, {
      product: 'test-cli',
      fromVersion: '1.0.0',
      toVersion: '1.0.1',
    });
    const versions = results.map((r) => r.version);
    expect(versions).toContain('1.0.1');
    expect(versions).not.toContain('1.0.0');
  });

  it('returns empty array when versions do not exist', () => {
    const results = compareVersions(temp.db, {
      product: 'test-cli',
      fromVersion: '99.0.0',
      toVersion: '99.9.9',
    });
    expect(results).toEqual([]);
  });

  it('returns empty array when product does not exist', () => {
    const results = compareVersions(temp.db, {
      product: 'no-such-product',
      fromVersion: '1.0.0',
      toVersion: '2.0.0',
    });
    expect(results).toEqual([]);
  });

  it('returns ChangesSinceResult shape (grouped by version with changes[])', () => {
    const results = compareVersions(temp.db, {
      product: 'test-cli',
      fromVersion: '1.0.0',
      toVersion: '1.1.0',
    });
    for (const r of results) {
      expect(r.product).toBe('test-cli');
      expect(typeof r.version).toBe('string');
      expect(Array.isArray(r.changes)).toBe(true);
      expect(r.changes.length).toBeGreaterThan(0);
      for (const c of r.changes) {
        expect(typeof c.ordinal).toBe('number');
        expect(typeof c.kind).toBe('string');
        expect(typeof c.text).toBe('string');
      }
    }
  });

  it('reverse range (from > to chronologically) returns empty array', () => {
    const results = compareVersions(temp.db, {
      product: 'test-cli',
      fromVersion: '1.1.0',
      toVersion: '1.0.0',
    });
    expect(results).toEqual([]);
  });
});

// ── recentReleases with --since filter ──────────────────────────────────
describe('recentReleases with since filter', () => {
  it('filters releases to those at or after since', () => {
    const rows = recentReleases(temp.db, undefined, 100, '2026-03-01');
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) {
      expect(r.released_at).toSatisfy((d: string) => d >= '2026-03-01');
    }
  });

  it('without since (undefined) returns all releases', () => {
    const rows = recentReleases(temp.db, undefined, 100, undefined);
    expect(rows.length).toBeGreaterThanOrEqual(9); // 3+3+3 fixture releases
  });

  it('with future since returns empty array', () => {
    const rows = recentReleases(temp.db, undefined, 100, '2099-01-01');
    expect(rows).toEqual([]);
  });

  it('combines product + since', () => {
    const rows = recentReleases(temp.db, 'test-cli', 100, '2026-02-01');
    for (const r of rows) {
      expect(r.product).toBe('test-cli');
      expect(r.released_at).toSatisfy((d: string) => d >= '2026-02-01');
    }
  });

  it('still respects DESC ordering after since filter', () => {
    const rows = recentReleases(temp.db, undefined, 100, '2026-01-01');
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].released_at).toSatisfy((d: string) => d >= rows[i].released_at);
    }
  });
});
