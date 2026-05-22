import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  searchChanges,
  lookupEntity,
  recentReleases,
  listProducts,
  entityFrequency,
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

describe('searchChanges', () => {
  it('finds chunks by single keyword (FTS5)', () => {
    const results = searchChanges(temp.db, 'workflow');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].text.toLowerCase()).toContain('workflow');
  });

  it('returns empty array when there is no match (no error)', () => {
    const results = searchChanges(temp.db, 'definitelynotinthecorpus');
    expect(results).toEqual([]);
  });

  it('honors the --product filter', () => {
    const results = searchChanges(temp.db, 'workflow', { product: 'test-cli' });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) expect(r.product).toBe('test-cli');
  });

  it('honors the --since filter (>= date)', () => {
    const results = searchChanges(temp.db, 'workflow', { since: '2026-03-01' });
    for (const r of results) {
      expect(r.released_at).not.toBeNull();
      expect((r.released_at ?? '') >= '2026-03-01').toBe(true);
    }
  });

  it('honors the --kind filter', () => {
    const results = searchChanges(temp.db, 'workflow', { kind: 'added' });
    for (const r of results) expect(r.kind).toBe('added');
  });

  it('respects --limit', () => {
    const results = searchChanges(temp.db, 'workflow', { limit: 1 });
    expect(results.length).toBeLessThanOrEqual(1);
  });

  it('orders by released_at DESC then ordinal ASC', () => {
    const results = searchChanges(temp.db, 'workflow');
    for (let i = 1; i < results.length; i++) {
      const prev = results[i - 1];
      const cur = results[i];
      if (prev.released_at === cur.released_at) {
        expect(cur.ordinal).toBeGreaterThanOrEqual(prev.ordinal);
      } else {
        expect((prev.released_at ?? '') >= (cur.released_at ?? '')).toBe(true);
      }
    }
  });

  it('emits FTS5 snippet markers around matched terms', () => {
    const results = searchChanges(temp.db, 'workflow');
    expect(results.length).toBeGreaterThan(0);
    const snip = results[0].snippet;
    expect(snip).toContain('[[');
    expect(snip).toContain(']]');
  });

  it('matches phrase queries with double quotes', () => {
    const results = searchChanges(temp.db, '"managed agents"');
    expect(results.length).toBeGreaterThan(0);
  });

  it('returns body text in the text field (alias for c.text)', () => {
    const results = searchChanges(temp.db, 'workflow');
    expect(results[0].text).not.toBe('');
    expect(typeof results[0].text).toBe('string');
  });
});

describe('lookupEntity', () => {
  it('returns mentions for an existing entity', () => {
    const results = lookupEntity(temp.db, 'env_var', 'ANTHROPIC_API_KEY');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty for a nonexistent entity value', () => {
    const results = lookupEntity(temp.db, 'env_var', 'NEVER_SHIPPED');
    expect(results).toEqual([]);
  });

  it('is case-sensitive on entity type and value', () => {
    expect(lookupEntity(temp.db, 'env_var', 'anthropic_api_key')).toEqual([]);
    expect(lookupEntity(temp.db, 'ENV_VAR', 'ANTHROPIC_API_KEY')).toEqual([]);
  });

  it('orders results by released_at ASC (chronological)', () => {
    // CVE-2025-66414 only appears once in fixture, so insert a synthetic second mention via a custom row
    // Easier: pick an entity guaranteed to appear in multiple releases — we just verify the sort is monotonic
    const results = lookupEntity(temp.db, 'env_var', 'ANTHROPIC_API_KEY');
    for (let i = 1; i < results.length; i++) {
      expect((results[i].released_at ?? '') >= (results[i - 1].released_at ?? '')).toBe(true);
    }
  });
});

describe('recentReleases', () => {
  it('returns recent releases across all products when product is undefined', () => {
    const rows = recentReleases(temp.db, undefined, 100);
    expect(rows.length).toBe(9);
    // No way two distinct products would somehow be missing
    const products = new Set(rows.map((r) => r.product));
    expect(products.size).toBe(3);
  });

  it('filters to a single product when product is set', () => {
    const rows = recentReleases(temp.db, 'test-cli', 100);
    for (const r of rows) expect(r.product).toBe('test-cli');
  });

  it('orders by released_at DESC', () => {
    const rows = recentReleases(temp.db, undefined, 100);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].released_at >= rows[i].released_at).toBe(true);
    }
  });

  it('aggregates change_count via LEFT JOIN (includes zero-change releases)', () => {
    // Manually insert an empty release directly
    temp.db
      .prepare(
        `INSERT INTO releases (product, version, released_at, notes_path, fetched_at, source_url)
         VALUES ('test-cli', 'empty-9.9.9', '2025-01-01', 'fake', '2026-05-21', '')`
      )
      .run();
    const row = recentReleases(temp.db, 'test-cli', 100).find((r) => r.version === 'empty-9.9.9');
    expect(row).toBeDefined();
    expect(row!.change_count).toBe(0);
  });
});

describe('listProducts', () => {
  it('returns one row per registered product', () => {
    const rows = listProducts(temp.db);
    expect(rows).toHaveLength(3);
  });

  it('latest_version matches max released_at per product', () => {
    const rows = listProducts(temp.db);
    const cli = rows.find((r) => r.name === 'test-cli')!;
    expect(cli.latest_version).toBe('1.1.0');
    expect(cli.latest_date).toBe('2026-03-10');
  });

  it('orders by release_count DESC', () => {
    const rows = listProducts(temp.db);
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].release_count >= rows[i].release_count).toBe(true);
    }
  });
});

describe('entityFrequency', () => {
  it('orders by count DESC then first_seen ASC', () => {
    const rows = entityFrequency(temp.db, 'env_var', 100);
    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const cur = rows[i];
      if (prev.count === cur.count) {
        expect((prev.first_seen ?? '9999') <= (cur.first_seen ?? '9999')).toBe(true);
      } else {
        expect(prev.count > cur.count).toBe(true);
      }
    }
  });

  it('returns row count equal to distinct entities', () => {
    const rows = entityFrequency(temp.db, 'slash_command', 100);
    const distinct = temp.db
      .prepare(
        `SELECT COUNT(DISTINCT entity_value) AS c FROM entities WHERE entity_type='slash_command'`
      )
      .get() as { c: number };
    expect(rows.length).toBe(distinct.c);
  });

  it('respects limit', () => {
    const rows = entityFrequency(temp.db, 'env_var', 2);
    expect(rows.length).toBeLessThanOrEqual(2);
  });

  it('aggregate count matches actual entity row count for each value', () => {
    const rows = entityFrequency(temp.db, 'env_var', 100);
    for (const r of rows) {
      const actual = temp.db
        .prepare(
          `SELECT COUNT(*) AS c FROM entities WHERE entity_type='env_var' AND entity_value=?`
        )
        .get(r.value) as { c: number };
      expect(r.count).toBe(actual.c);
    }
  });
});
