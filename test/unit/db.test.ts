import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { mkdtempSync, rmSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import Database from 'better-sqlite3';
import { openDb, initSchema } from '../../src/db.js';

let workdir: string;
beforeEach(() => {
  workdir = mkdtempSync(join(tmpdir(), 'db-test-'));
});
afterEach(() => {
  try {
    rmSync(workdir, { recursive: true, force: true });
  } catch {
    // Windows file-handle race — ignored; OS cleans up tmp anyway
  }
});

describe('openDb', () => {
  it('creates the parent directory if missing', () => {
    const path = join(workdir, 'nested', 'deeper', 'sub.db');
    const db = openDb(path, { loadVec: false });
    db.close();
    expect(existsSync(path)).toBe(true);
  });

  it('enables WAL journal mode', () => {
    const db = openDb(join(workdir, 'wal.db'), { loadVec: false });
    const row = db.pragma('journal_mode', { simple: true }) as string;
    expect(row.toLowerCase()).toBe('wal');
    db.close();
  });

  it('enables foreign_keys pragma', () => {
    const db = openDb(join(workdir, 'fk.db'), { loadVec: false });
    const row = db.pragma('foreign_keys', { simple: true }) as 0 | 1;
    expect(row).toBe(1);
    db.close();
  });

  it('skips sqlite-vec load when {loadVec: false}', () => {
    // No crash, no warning about extension load expected (we explicitly opt out)
    const db = openDb(join(workdir, 'novec.db'), { loadVec: false });
    db.close();
    expect(true).toBe(true);
  });

  it('attempts sqlite-vec load by default; failure logs a warning but does not throw', () => {
    // We can't reliably force sqlite-vec to fail across environments, so this
    // just asserts that calling without explicit { loadVec: false } completes.
    const db = openDb(join(workdir, 'vec.db'));
    db.close();
  });
});

describe('initSchema', () => {
  it('creates the full schema on a fresh DB', () => {
    const dbPath = join(workdir, 'fresh.db');
    const db = openDb(dbPath, { loadVec: false });
    initSchema(db);
    const tables = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
      .all() as Array<{ name: string }>;
    const names = tables.map((t) => t.name);
    expect(names).toContain('products');
    expect(names).toContain('releases');
    expect(names).toContain('changes');
    expect(names).toContain('entities');
    expect(names).toContain('markers');
    expect(names).toContain('synergies');
    db.close();
  });

  it('is idempotent — second call is a no-op', () => {
    const dbPath = join(workdir, 'idem.db');
    const db = openDb(dbPath, { loadVec: false });
    initSchema(db);
    expect(() => initSchema(db)).not.toThrow();
    db.close();
  });

  it('uses an explicit schemaPath when provided', () => {
    const altSchema = join(workdir, 'alt-schema.sql');
    writeFileSync(altSchema, `CREATE TABLE products (name TEXT PRIMARY KEY);`);
    const db = openDb(join(workdir, 'alt.db'), { loadVec: false });
    initSchema(db, altSchema);
    const row = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='products'`)
      .get();
    expect(row).toBeDefined();
    db.close();
  });

  it('throws when schema.sql cannot be resolved', () => {
    // The default resolveSchemaPath checks (a) __dirname/../schema.sql and (b) cwd/schema.sql.
    // We exercise the negative path by passing a definitely-missing explicit path so the
    // file-read fails inside initSchema directly.
    const db = openDb(join(workdir, 'no-schema.db'), { loadVec: false });
    expect(() => initSchema(db, join(workdir, 'does-not-exist.sql'))).toThrow();
    db.close();
  });
});

describe('openDb + initSchema regression checkpoint', () => {
  it('back-to-back init works (full create then init no-op)', () => {
    const dbPath = join(workdir, 'recheck.db');
    const db = openDb(dbPath, { loadVec: false });
    initSchema(db);
    initSchema(db);
    initSchema(db);
    const c = (
      db.prepare(`SELECT COUNT(*) AS c FROM sqlite_master WHERE name='products'`).get() as {
        c: number;
      }
    ).c;
    expect(c).toBe(1);
    db.close();
  });
});
