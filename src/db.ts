import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import * as sqliteVec from 'sqlite-vec';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Current schema version. Increment when schema changes require migration.
 *
 * Version history:
 *   1 — Initial schema (products, releases, changes, entities, FTS5, markers, relevance, synergies)
 *   2 — Added schema_version tracking (this version)
 */
export const SCHEMA_VERSION = 2;

export function openDb(path: string, opts: { loadVec?: boolean } = {}): Database.Database {
  const abs = resolve(path);
  mkdirSync(dirname(abs), { recursive: true });
  const db = new Database(abs);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  if (opts.loadVec !== false) {
    try {
      sqliteVec.load(db);
    } catch (e: any) {
      // sqlite-vec is opt-in for Tier 2b; queries using only changes_fts work without it.
      // Respect the legacy HK_DEBUG_VEC_LOAD_FAIL_SILENT plus the broader CLAUDE_SYNERGY_QUIET
      // (set by the MCP-stdio entry point so we never contaminate the JSON-RPC channel).
      const quiet =
        process.env.HK_DEBUG_VEC_LOAD_FAIL_SILENT ||
        process.env.CLAUDE_SYNERGY_QUIET ||
        process.env.MCP_QUIET;
      if (!quiet) {
        console.error(`[warn] sqlite-vec load failed: ${e.message}`);
      }
    }
  }
  return db;
}

export function initSchema(db: Database.Database, schemaPath?: string): void {
  // Idempotent — skip if already initialized
  const existing = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='products'`)
    .get();
  if (existing) {
    // Schema exists — ensure version marker is present and run migrations if needed
    ensureSchemaVersion(db);
    return;
  }
  const resolved = schemaPath ?? resolveSchemaPath();
  const sql = readFileSync(resolved, 'utf-8');
  db.exec(sql);
  // Stamp the new database with the current schema version
  ensureSchemaVersion(db);
}

/**
 * Ensure the schema_meta table exists and the version marker is set.
 * If the DB is at an older version, migrations run here (future-proofing).
 */
function ensureSchemaVersion(db: Database.Database): void {
  // Create the version tracking table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  const row = db
    .prepare(`SELECT value FROM schema_meta WHERE key = 'schema_version'`)
    .get() as { value: string } | undefined;

  const currentVersion = row ? parseInt(row.value, 10) : 0;

  if (currentVersion < SCHEMA_VERSION) {
    // Run migrations for each version step
    migrateSchema(db, currentVersion, SCHEMA_VERSION);

    // Stamp the version
    db.prepare(`
      INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('schema_version', @version)
    `).run({ version: String(SCHEMA_VERSION) });
  }
}

/**
 * Run schema migrations from `fromVersion` to `toVersion`.
 * Each migration is additive (no destructive changes without explicit user action).
 */
function migrateSchema(db: Database.Database, fromVersion: number, toVersion: number): void {
  // Migration 0 → 1: no-op (initial schema already applied by initSchema)
  // Migration 1 → 2: just the schema_meta table (created above)
  // Future migrations go here as `if (fromVersion < N) { ... }`
  void db;
  void fromVersion;
  void toVersion;
}

/**
 * Get the current schema version of a database. Returns 0 if no version marker exists.
 */
export function getSchemaVersion(db: Database.Database): number {
  try {
    const row = db
      .prepare(`SELECT value FROM schema_meta WHERE key = 'schema_version'`)
      .get() as { value: string } | undefined;
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    // Table doesn't exist yet
    return 0;
  }
}

function resolveSchemaPath(): string {
  // when running via tsx from repo root: ../schema.sql
  // when running as compiled bin: ../schema.sql (relative to dist/)
  const candidates = [
    join(__dirname, '..', 'schema.sql'),
    join(process.cwd(), 'schema.sql'),
  ];
  for (const p of candidates) {
    try {
      readFileSync(p);
      return p;
    } catch {
      // continue
    }
  }
  throw new Error(`schema.sql not found in: ${candidates.join(', ')}`);
}
