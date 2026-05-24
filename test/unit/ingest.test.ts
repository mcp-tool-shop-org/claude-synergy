import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ingestAll } from '../../src/ingest.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { FIXTURE_PRODUCTS_ROOT, seedSampleProducts } from '../helpers/seed-corpus.js';

let temp: TempDb;
beforeEach(() => {
  temp = createTempDb();
});
afterEach(() => {
  temp.cleanup();
});

describe('ingestAll — fixture sweep', () => {
  it('registers all 3 fixture products', () => {
    seedSampleProducts(temp.db);
    const products = temp.db.prepare(`SELECT name FROM products ORDER BY name`).all() as Array<{ name: string }>;
    expect(products.map((p) => p.name)).toEqual(['test-apps', 'test-cli', 'test-sdk']);
  });

  it('populates IngestStats with non-zero counts', () => {
    const stats = seedSampleProducts(temp.db);
    expect(stats.productsCount).toBe(3);
    expect(stats.releasesAdded).toBeGreaterThanOrEqual(9);
    expect(stats.changesAdded).toBeGreaterThan(0);
    expect(stats.entitiesAdded).toBeGreaterThanOrEqual(0);
    expect(stats.errors).toEqual([]);
  });

  it('inserts one release row per fixture file', () => {
    seedSampleProducts(temp.db);
    const row = temp.db.prepare(`SELECT COUNT(*) AS c FROM releases`).get() as { c: number };
    expect(row.c).toBe(9);
  });

  it('falls back to default tier=1, strategy=gh-releases for unknown product slugs', () => {
    seedSampleProducts(temp.db);
    const row = temp.db
      .prepare(`SELECT source_tier, fetch_strategy FROM products WHERE name = 'test-cli'`)
      .get() as { source_tier: number; fetch_strategy: string };
    expect(row.source_tier).toBe(1);
    expect(row.fetch_strategy).toBe('gh-releases');
  });
});

describe('ingest — frontmatter parsing', () => {
  it('populates release row from full frontmatter', () => {
    seedSampleProducts(temp.db);
    const row = temp.db
      .prepare(
        `SELECT product, version, released_at, source_url FROM releases WHERE product='test-cli' AND version='1.0.0'`
      )
      .get() as any;
    expect(row.product).toBe('test-cli');
    expect(row.version).toBe('1.0.0');
    expect(row.released_at).toBe('2026-01-15');
    expect(row.source_url).toBe('https://example.test/v1.0.0');
  });

  it('omitted source_url → empty string', () => {
    seedSampleProducts(temp.db);
    const row = temp.db
      .prepare(`SELECT source_url FROM releases WHERE product='test-cli' AND version='1.0.1'`)
      .get() as { source_url: string };
    expect(row.source_url).toBe('');
  });

  it('frontmatter with sub_product composes version as `${baseVersion}-${sub_product}`', () => {
    seedSampleProducts(temp.db);
    const rows = temp.db
      .prepare(`SELECT version FROM releases WHERE product='test-apps' ORDER BY version`)
      .all() as Array<{ version: string }>;
    const versions = rows.map((r) => r.version);
    expect(versions).toEqual([
      '2026-04-09-test-cowork',
      '2026-04-09-test-design',
      '2026-04-10-test-chat',
    ]);
  });

  it('bundle_size_kb_delta is stored in bundle_size_kb', () => {
    seedSampleProducts(temp.db);
    const row = temp.db
      .prepare(
        `SELECT bundle_size_kb FROM releases WHERE product='test-sdk' AND version='sdk-0.1.1'`
      )
      .get() as { bundle_size_kb: number };
    expect(row.bundle_size_kb).toBe(2.5);
  });

  it('release with no frontmatter falls back to basename(file, ".md") for version', () => {
    // Use a custom tmp products dir with a frontmatter-less file
    const dir = mkdtempSync(join(tmpdir(), 'no-fm-'));
    try {
      mkdirSync(join(dir, 'foo-product', 'releases'), { recursive: true });
      writeFileSync(
        join(dir, 'foo-product', 'releases', '9.9.9.md'),
        '# No frontmatter\n\n- One bullet'
      );
      ingestAll(temp.db, dir);
      const row = temp.db
        .prepare(`SELECT version FROM releases WHERE product='foo-product'`)
        .get() as { version: string };
      expect(row.version).toBe('9.9.9');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('ingest — bullet parsing', () => {
  beforeEach(() => {
    seedSampleProducts(temp.db);
  });

  it('extracts `- ` bullets in order', () => {
    const rows = temp.db
      .prepare(
        `SELECT ordinal, text FROM changes WHERE product='test-cli' AND version='1.0.0' ORDER BY ordinal`
      )
      .all() as Array<{ ordinal: number; text: string }>;
    expect(rows).toHaveLength(3);
    expect(rows[0].text).toContain('TEST_FLAG');
    expect(rows[1].text).toContain('test-cmd');
    expect(rows[2].text).toContain('Renamed');
  });

  it('extracts `* ` asterisk bullets', () => {
    const rows = temp.db
      .prepare(
        `SELECT text FROM changes WHERE product='test-cli' AND version='1.0.1' ORDER BY ordinal`
      )
      .all() as Array<{ text: string }>;
    expect(rows).toHaveLength(3);
    expect(rows[0].text).toContain('TEST_FLAG');
  });

  it('handles mixed `-` and `*` bullets in the same file', () => {
    const rows = temp.db
      .prepare(
        `SELECT text FROM changes WHERE product='test-cli' AND version='1.1.0' ORDER BY ordinal`
      )
      .all() as Array<{ text: string }>;
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows.some((r) => r.text.includes('claude-haiku-4-5')), 'should contain claude-haiku-4-5 bullet').toBe(true);
    expect(rows.some((r) => r.text.includes('CVE-2026-12345')), 'should contain CVE-2026-12345 bullet').toBe(true);
    expect(rows.some((r) => r.text.includes('--old-flag')), 'should contain --old-flag bullet').toBe(true);
  });

  it('does NOT extract bullets inside fenced code blocks', () => {
    const rows = temp.db
      .prepare(`SELECT text FROM changes WHERE product='test-cli' AND version='1.1.0'`)
      .all() as Array<{ text: string }>;
    const text = rows.map((r) => r.text).join('\n');
    expect(text).not.toContain('this is inside fenced block');
    expect(text).not.toContain('and this asterisk bullet too');
  });

  it('joins 2-space-indented continuation lines into the parent bullet', () => {
    const rows = temp.db
      .prepare(
        `SELECT text FROM changes WHERE product='test-cli' AND version='1.1.0' AND ordinal=1`
      )
      .all() as Array<{ text: string }>;
    expect(rows[0].text).toMatch(/claude-haiku.*indented continuation/i);
  });
});

describe('ingest — idempotency', () => {
  it('running ingest twice produces the same row counts (second run is fully skipped)', () => {
    const stats1 = seedSampleProducts(temp.db);
    const releases1 = (temp.db.prepare(`SELECT COUNT(*) AS c FROM releases`).get() as { c: number }).c;
    const changes1 = (temp.db.prepare(`SELECT COUNT(*) AS c FROM changes`).get() as { c: number }).c;

    const stats2 = seedSampleProducts(temp.db);
    const releases2 = (temp.db.prepare(`SELECT COUNT(*) AS c FROM releases`).get() as { c: number }).c;
    const changes2 = (temp.db.prepare(`SELECT COUNT(*) AS c FROM changes`).get() as { c: number }).c;

    // Table row counts must be stable across ingests
    expect(releases2).toBe(releases1);
    expect(changes2).toBe(changes1);
    // Second run: notes_hash matches → every release is skipped, not re-added.
    // Pre-v1.2 this expected releasesAdded === releasesAdded (both 9) because the
    // products UPSERT used INSERT OR REPLACE, whose CASCADE DELETE on the releases
    // FK silently wiped them before the dedup hash check could fire. v1.2 fixes
    // the cascade (regression §8.20); idempotency now means "skipped".
    expect(stats2.releasesAdded).toBe(0);
    expect(stats2.skipped).toBe(stats1.releasesAdded);
  });

  it('modifying a file then re-ingesting replaces that release\'s changes (delete + reinsert)', () => {
    // Use an isolated tmp products tree to avoid touching fixtures
    const dir = mkdtempSync(join(tmpdir(), 'modify-'));
    try {
      mkdirSync(join(dir, 'mod-product', 'releases'), { recursive: true });
      const path = join(dir, 'mod-product', 'releases', '1.0.0.md');
      writeFileSync(
        path,
        '---\nproduct: mod-product\nversion: "1.0.0"\n---\n\n- A\n- B\n- C\n'
      );
      ingestAll(temp.db, dir);
      const before = (temp.db.prepare(`SELECT COUNT(*) AS c FROM changes WHERE product='mod-product'`).get() as { c: number }).c;
      expect(before).toBe(3);

      writeFileSync(
        path,
        '---\nproduct: mod-product\nversion: "1.0.0"\n---\n\n- A\n- B\n'
      );
      ingestAll(temp.db, dir);
      const after = (temp.db.prepare(`SELECT COUNT(*) AS c FROM changes WHERE product='mod-product'`).get() as { c: number }).c;
      expect(after).toBe(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not silently delete unrelated releases', () => {
    seedSampleProducts(temp.db);
    const before = (temp.db.prepare(`SELECT COUNT(*) AS c FROM releases`).get() as { c: number }).c;
    seedSampleProducts(temp.db);
    const after = (temp.db.prepare(`SELECT COUNT(*) AS c FROM releases`).get() as { c: number }).c;
    expect(after).toBe(before);
  });
});

describe('ingest — entity extraction integration', () => {
  it('extracts env vars matching the allowed-prefix regex from change bullets', () => {
    seedSampleProducts(temp.db);
    // ANTHROPIC_API_KEY is mentioned in test-sdk/sdk-0.1.0.md
    const row = temp.db
      .prepare(
        `SELECT COUNT(*) AS c FROM entities WHERE entity_type='env_var' AND entity_value='ANTHROPIC_API_KEY'`
      )
      .get() as { c: number };
    expect(row.c).toBeGreaterThanOrEqual(1);
  });

  it('extracts slash_commands from change bullets', () => {
    seedSampleProducts(temp.db);
    const row = temp.db
      .prepare(
        `SELECT COUNT(*) AS c FROM entities WHERE entity_type='slash_command' AND entity_value='/test-cmd'`
      )
      .get() as { c: number };
    expect(row.c).toBeGreaterThanOrEqual(1);
  });
});

describe('ingest — IngestStats invariants', () => {
  it('changesAdded equals total bullets across files', () => {
    const stats = seedSampleProducts(temp.db);
    const dbCount = (temp.db.prepare(`SELECT COUNT(*) AS c FROM changes`).get() as { c: number }).c;
    expect(stats.changesAdded).toBe(dbCount);
  });

  it('entitiesAdded equals row count of entities table', () => {
    const stats = seedSampleProducts(temp.db);
    const dbCount = (temp.db.prepare(`SELECT COUNT(*) AS c FROM entities`).get() as { c: number }).c;
    expect(stats.entitiesAdded).toBe(dbCount);
  });

  it('errors array is empty on the clean fixture set', () => {
    const stats = seedSampleProducts(temp.db);
    expect(stats.errors).toEqual([]);
  });
});

describe('ingest — fixture root sanity', () => {
  it('points at the right absolute fixture dir', () => {
    expect(FIXTURE_PRODUCTS_ROOT).toMatch(/sample-products$/);
  });
});
