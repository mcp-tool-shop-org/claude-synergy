import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import * as sqliteVec from 'sqlite-vec';
import { AppError } from './errors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Current schema version. Increment when schema changes require migration.
 *
 * Version history:
 *   1 — Initial schema (products, releases, changes, entities, FTS5, markers, relevance, synergies)
 *   2 — Added schema_version tracking
 *   3 — Configurable embedding dimension stored in schema_meta (key: embedding_dim).
 *       Defaults to 768 for backward compat with v2 DBs.
 */
export const SCHEMA_VERSION = 3;

/** Default embedding dimension when none is recorded (matches v2 behavior). */
export const DEFAULT_EMBEDDING_DIM = 768;

/**
 * How better-sqlite3 13's driver load fails, one test per shape:
 * - a `.node` file under better-sqlite3/prebuilds or /build named in the message: no prebuild for
 *   the platform (the build/Release fallback is absent) or a prebuild that fails to dlopen;
 * - NODE_MODULE_VERSION: a binary built for another Node;
 * - ERR_DLOPEN_FAILED: any dlopen failure, whatever the message says.
 * The path branch requires `.node`, so a database path that merely contains
 * "better-sqlite3/build" is not mistaken for a driver failure.
 */
const BINDING_ERROR_RE = /better-sqlite3[\\/](?:prebuilds|build)[\\/][^\s'"]*\.node|NODE_MODULE_VERSION/i;

const PLATFORM_HINT =
  'claude-synergy needs Node 22.12 or newer on Windows, macOS or Linux (glibc or musl), x64 or arm64. 32-bit ARM is not supported.';
const ADDONS_DISABLED_HINT =
  'Native addons are disabled in this Node (--no-addons, or --permission without --allow-addons). Run claude-synergy without those flags.';

/** The hint for a driver-load failure, or null when `e` is not one. */
function bindingErrorHint(e: unknown): string | null {
  const code = (e as { code?: unknown } | null)?.code;
  if (code === 'ERR_DLOPEN_DISABLED') return ADDONS_DISABLED_HINT;
  if (code === 'ERR_DLOPEN_FAILED') return PLATFORM_HINT;
  const detail = e instanceof Error ? e.message : String(e);
  return BINDING_ERROR_RE.test(detail) ? PLATFORM_HINT : null;
}

/**
 * Open a SQLite database, turning a missing or mismatched native driver into a named
 * SQLITE_BINDING_ERROR. Other errors (a bad path, a locked file) pass through unchanged.
 * `open` is injectable for tests.
 */
export function openSqlite(
  abs: string,
  open: (p: string) => Database.Database = (p) => new Database(p),
): Database.Database {
  try {
    return open(abs);
  } catch (e: unknown) {
    const hint = bindingErrorHint(e);
    if (hint !== null) {
      throw new AppError({
        code: 'SQLITE_BINDING_ERROR',
        message: 'The SQLite driver (better-sqlite3) could not be loaded on this platform.',
        hint,
        cause: e instanceof Error ? e.message : String(e),
      });
    }
    throw e;
  }
}

export function openDb(path: string, opts: { loadVec?: boolean } = {}): Database.Database {
  const abs = resolve(path);
  mkdirSync(dirname(abs), { recursive: true });
  const db = openSqlite(abs);
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
 * If the DB is at an older version, migrations run here.
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

  if (currentVersion > SCHEMA_VERSION) {
    throw new Error(
      `Database schema version ${currentVersion} is newer than this tool supports (version ${SCHEMA_VERSION}). ` +
        `Please upgrade claude-synergy: npm update -g @mcptoolshop/claude-synergy`,
    );
  }

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
  // Migration 2 → 3: stamp the embedding dim row for backward compat with
  //   existing 768-d DBs. We do NOT recreate chunks_vec here — the table
  //   either already exists at 768d (and stays valid) or doesn't exist yet
  //   (initVecSchema will create it at the active provider's dim).
  if (fromVersion < 3 && toVersion >= 3) {
    const hasDim = db
      .prepare(`SELECT value FROM schema_meta WHERE key = 'embedding_dim'`)
      .get() as { value: string } | undefined;
    if (!hasDim) {
      db.prepare(`
        INSERT INTO schema_meta (key, value) VALUES ('embedding_dim', @dim)
      `).run({ dim: String(DEFAULT_EMBEDDING_DIM) });
    }
  }
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

/**
 * Read the active embedding dimension recorded for this database.
 * Returns `null` when no dim has been negotiated yet (fresh DB before first
 * embed). Callers that need a concrete number can fall back to DEFAULT_EMBEDDING_DIM.
 */
export function getEmbeddingDim(db: Database.Database): number | null {
  try {
    const row = db
      .prepare(`SELECT value FROM schema_meta WHERE key = 'embedding_dim'`)
      .get() as { value: string } | undefined;
    if (!row) return null;
    const n = parseInt(row.value, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Record the active embedding dimension for this database. Idempotent:
 * setting the same dim is a no-op. Setting a different dim when chunks
 * already exist throws an AppError with a clear migration hint.
 */
export function setEmbeddingDim(db: Database.Database, dim: number): void {
  if (!Number.isFinite(dim) || dim <= 0 || (dim | 0) !== dim) {
    throw new AppError({
      code: 'EMBEDDING_DIM_INVALID',
      message: `embedding dimension must be a positive integer (got ${String(dim)})`,
      hint: 'pass a positive integer dim, e.g. 768 (nomic-embed-text), 1536 (text-embedding-3-small), or 3072 (text-embedding-3-large)',
    });
  }
  // Ensure the meta table exists (defensive — initSchema usually handles this)
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  const existing = getEmbeddingDim(db);
  if (existing !== null && existing !== dim) {
    // If chunks already exist, refuse — switching dim invalidates the
    // entire vector index. User has to re-init or wipe chunks first.
    const hasChunks = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='chunks'`)
      .get();
    let chunkCount = 0;
    if (hasChunks) {
      const row = db.prepare(`SELECT COUNT(*) AS n FROM chunks`).get() as { n: number };
      chunkCount = row.n;
    }
    if (chunkCount > 0) {
      throw new AppError({
        code: 'EMBEDDING_DIM_MISMATCH',
        message: `database is configured for ${existing}-d embeddings but the requested provider produces ${dim}-d vectors (${chunkCount} existing chunks)`,
        hint: `re-init the DB to switch dimensions: rm <db-path>, then 'hk init' and 'hk embed' again. Existing chunks would be invalid against the new vector index.`,
      });
    }
  }
  db.prepare(`
    INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('embedding_dim', @dim)
  `).run({ dim: String(dim) });
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
