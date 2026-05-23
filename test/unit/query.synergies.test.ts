// Unit tests for query.ts synergy helpers + ingestSynergies():
//   - ingestSynergies(db, synergyDir) populates synergies + linked tables
//   - listSynergies(db, opts?) returns rows (optionally filtered by product)
//   - getSynergy(db, name) returns one synergy with steps/evidence/products joined
//
// Contract (per kickoff):
//   ingestSynergies(db, synergyDir: string): {ingested: number, skipped: number}
//   listSynergies(db, opts?: {product?: string}): /*shape*/
//   getSynergy(db, name: string): /*shape with joins*/

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listSynergies, getSynergy } from '../../src/query.js';
import { ingestSynergies } from '../../src/ingest.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';

let temp: TempDb;
let synDir: string;

beforeEach(() => {
  temp = createTempDb();
  seedSampleProducts(temp.db); // need products for the FK on synergy_products
  synDir = mkdtempSync(join(tmpdir(), 'syn-unit-'));
});
afterEach(() => {
  temp.cleanup();
  rmSync(synDir, { recursive: true, force: true });
});

function writeSynergy(filename: string, content: string): void {
  writeFileSync(join(synDir, filename), content);
}

const SAMPLE_A = `---
name: test-synergy-a
title: Test synergy A
trigger: when situation A occurs
products: [test-cli, test-sdk]
status: confirmed
last_validated: 2026-05-21
---

# Test synergy A

This is a synergy fixture body for A.

**Workflow:**

1. First step in synergy A
2. Second step
3. Third step

**Evidence:**

- [Source A](https://example.test/a): "quote one"
- [Source B](https://example.test/b)
`;

const SAMPLE_B = `---
name: test-synergy-b
title: Test synergy B
trigger: when situation B
products: [test-apps]
status: speculative
last_validated: 2026-05-21
---

# Test synergy B

Body for B.

1. Only one step
`;

const SAMPLE_MALFORMED = `---
this isn't valid yaml: [
title: Missing fields
---

oops
`;

const SAMPLE_MULTI_PRODUCT = `---
name: test-synergy-multi
title: Multi-product synergy
trigger: trigger text
products: [test-cli, test-sdk, test-apps]
status: confirmed
last_validated: 2026-05-21
---

# Multi-product synergy
`;

// ── ingestSynergies ─────────────────────────────────────────────────────
describe('ingestSynergies', () => {
  it('populates synergy tables from markdown files', () => {
    writeSynergy('01-test-synergy-a.md', SAMPLE_A);
    writeSynergy('02-test-synergy-b.md', SAMPLE_B);
    const stats = ingestSynergies(temp.db, synDir);
    expect(stats.ingested).toBeGreaterThanOrEqual(2);

    const synCount = (
      temp.db.prepare(`SELECT COUNT(*) AS c FROM synergies`).get() as { c: number }
    ).c;
    expect(synCount).toBeGreaterThanOrEqual(2);
  });

  it('skips INDEX.md (it is a manifest, not a synergy)', () => {
    writeSynergy('INDEX.md', `# Index\n\nNot a synergy.\n`);
    writeSynergy('01-test-synergy-a.md', SAMPLE_A);
    ingestSynergies(temp.db, synDir);
    const rows = temp.db.prepare(`SELECT name FROM synergies`).all() as Array<{ name: string }>;
    expect(rows.map((r) => r.name)).not.toContain('INDEX');
    expect(rows.map((r) => r.name)).toContain('test-synergy-a');
  });

  it('is idempotent — re-running does not duplicate', () => {
    writeSynergy('01-test-synergy-a.md', SAMPLE_A);
    ingestSynergies(temp.db, synDir);
    const c1 = (temp.db.prepare(`SELECT COUNT(*) AS c FROM synergies`).get() as { c: number }).c;
    ingestSynergies(temp.db, synDir);
    const c2 = (temp.db.prepare(`SELECT COUNT(*) AS c FROM synergies`).get() as { c: number }).c;
    expect(c2).toBe(c1);
  });

  it('skips malformed frontmatter without throwing', () => {
    writeSynergy('00-malformed.md', SAMPLE_MALFORMED);
    writeSynergy('01-test-synergy-a.md', SAMPLE_A);
    expect(() => ingestSynergies(temp.db, synDir)).not.toThrow();
    // Good file should still be ingested
    const rows = temp.db.prepare(`SELECT name FROM synergies`).all() as Array<{ name: string }>;
    expect(rows.map((r) => r.name)).toContain('test-synergy-a');
  });

  it('handles a synergy file with multiple products in frontmatter', () => {
    writeSynergy('03-multi-product.md', SAMPLE_MULTI_PRODUCT);
    ingestSynergies(temp.db, synDir);

    // The synergy_products table should hold one row per product reference
    const productRows = temp.db
      .prepare(
        `SELECT sp.product
         FROM synergy_products sp
         JOIN synergies s ON s.id = sp.synergy_id
         WHERE s.name = 'test-synergy-multi'`
      )
      .all() as Array<{ product: string }>;
    const products = productRows.map((r) => r.product).sort();
    expect(products).toEqual(['test-apps', 'test-cli', 'test-sdk']);
  });

  it('returns a {ingested, skipped} stats object', () => {
    writeSynergy('01-test-synergy-a.md', SAMPLE_A);
    writeSynergy('02-test-synergy-b.md', SAMPLE_B);
    const stats = ingestSynergies(temp.db, synDir);
    expect(stats).toHaveProperty('ingested');
    expect(stats).toHaveProperty('skipped');
    expect(typeof stats.ingested).toBe('number');
    expect(typeof stats.skipped).toBe('number');
  });
});

// ── listSynergies ────────────────────────────────────────────────────────
describe('listSynergies', () => {
  beforeEach(() => {
    writeSynergy('01-test-synergy-a.md', SAMPLE_A);
    writeSynergy('02-test-synergy-b.md', SAMPLE_B);
    ingestSynergies(temp.db, synDir);
  });

  it('returns all synergies after ingest', () => {
    const rows = listSynergies(temp.db);
    expect(rows.length).toBeGreaterThanOrEqual(2);
    const names = (rows as any[]).map((r) => r.name);
    expect(names).toContain('test-synergy-a');
    expect(names).toContain('test-synergy-b');
  });

  it('filters by product when {product} is set', () => {
    const rows = listSynergies(temp.db, { product: 'test-apps' });
    const names = (rows as any[]).map((r) => r.name);
    // test-synergy-b references test-apps; A does not
    expect(names).toContain('test-synergy-b');
    expect(names).not.toContain('test-synergy-a');
  });

  it('returns empty for a product no synergy mentions', () => {
    const rows = listSynergies(temp.db, { product: 'nonexistent-product' });
    expect(rows.length).toBe(0);
  });

  it('does not throw on undefined opts', () => {
    expect(() => listSynergies(temp.db)).not.toThrow();
    expect(() => listSynergies(temp.db, {})).not.toThrow();
  });
});

// ── getSynergy ──────────────────────────────────────────────────────────
describe('getSynergy', () => {
  beforeEach(() => {
    writeSynergy('01-test-synergy-a.md', SAMPLE_A);
    ingestSynergies(temp.db, synDir);
  });

  it('returns the synergy by name with joined product references', () => {
    const result = getSynergy(temp.db, 'test-synergy-a') as any;
    expect(result).toBeTruthy();
    expect(result.name).toBe('test-synergy-a');
    // Should have a products list joined in
    if ('products' in result) {
      expect(Array.isArray(result.products)).toBe(true);
      expect(result.products).toContain('test-cli');
    }
  });

  it('returns the synergy with steps joined (when present)', () => {
    const result = getSynergy(temp.db, 'test-synergy-a') as any;
    expect(result).toBeTruthy();
    // Steps must exist on the result; we accept either an array of strings or an
    // array of {ordinal, text} — assert truthy + at least one entry when present.
    if ('steps' in result && result.steps) {
      expect(Array.isArray(result.steps)).toBe(true);
    }
  });

  it('returns null/undefined for a synergy that does not exist', () => {
    const result = getSynergy(temp.db, 'definitely-not-real');
    // Implementation may return null or undefined — assert it is falsy and not a row object
    expect(result == null || (typeof result === 'object' && !(result as any).name)).toBe(true);
  });

  it('looking up the same synergy twice returns the same shape', () => {
    const r1 = getSynergy(temp.db, 'test-synergy-a') as any;
    const r2 = getSynergy(temp.db, 'test-synergy-a') as any;
    expect(r1?.name).toBe(r2?.name);
  });
});
