import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type Database from 'better-sqlite3';
import { openDb, initSchema } from '../../src/db.js';

export interface TempDb {
  db: Database.Database;
  path: string;
  dir: string;
  cleanup: () => void;
}

/**
 * Creates a fresh on-disk SQLite file under os.tmpdir(), runs initSchema,
 * returns the open db + path + a cleanup() that closes the db and removes the dir.
 *
 * On-disk (not :memory:) because sqlite-vec extension load semantics differ between
 * the two; the production code path is on-disk so we exercise it.
 */
export function createTempDb(opts: { loadVec?: boolean; init?: boolean } = {}): TempDb {
  const dir = mkdtempSync(join(tmpdir(), 'claude-synergy-test-'));
  const path = join(dir, 'test.db');
  const db = openDb(path, { loadVec: opts.loadVec });
  if (opts.init !== false) initSchema(db);

  const cleanup = () => {
    try {
      db.close();
    } catch {
      // already closed
    }
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      // best effort
    }
  };

  return { db, path, dir, cleanup };
}

/** Convenience: run fn with a fresh temp db, always clean up. */
export async function withTempDb<T>(
  fn: (t: TempDb) => Promise<T> | T,
  opts: { loadVec?: boolean; init?: boolean } = {}
): Promise<T> {
  const t = createTempDb(opts);
  try {
    return await fn(t);
  } finally {
    t.cleanup();
  }
}
