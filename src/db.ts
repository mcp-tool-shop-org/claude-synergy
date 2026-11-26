import Database from 'better-sqlite3';
import { accessSync, constants, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import * as sqliteVec from 'sqlite-vec';
import { AppError } from './errors.js';
import { deleteChangeChildren, rescreenChanges } from './ingest.js';
import { deriveReleaseIdentity, loadProductsConfig } from './products-config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Current schema version. Increment when schema changes require migration.
 *
 * Version history:
 *   1 — Initial schema (products, releases, changes, entities, FTS5, markers, relevance, synergies)
 *   2 — Added schema_version tracking
 *   3 — Configurable embedding dimension stored in schema_meta (key: embedding_dim).
 *       Defaults to 768 for backward compat with v2 DBs.
 *   4 — Added changes.flags JSON array column, changes_fts_update trigger, and
 *       one-time deterministic vendor text screening of stored changes.
 *   5 — Added package column to releases, changes, and chunks with
 *       PRIMARY KEY (product, package, version), re-deriving package and
 *       prefix-stripped versions from products.yaml.
 */
export const SCHEMA_VERSION = 5;

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

/** Return true when an error indicates a read-only filesystem or unwritable SQLite file. */
export function isReadonlyDbError(e: unknown): boolean {
  const code = String((e as { code?: unknown } | null)?.code ?? '');
  if (
    code === 'EACCES' ||
    code === 'EROFS' ||
    code === 'EPERM' ||
    code === 'SQLITE_PERM' ||
    code === 'SQLITE_READONLY' ||
    code.startsWith('SQLITE_READONLY_')
  ) {
    return true;
  }
  const msg = e instanceof Error ? e.message : String(e);
  return /read-?only database|SQLITE_READONLY/i.test(msg);
}

function isUnwritableExistingOpenError(e: unknown, absPath: string): boolean {
  if (isReadonlyDbError(e)) return true;
  const code = String((e as { code?: unknown } | null)?.code ?? '');
  return (code === 'SQLITE_CANTOPEN' || code.startsWith('SQLITE_CANTOPEN_')) && existsSync(absPath);
}

function hasTableColumn(
  db: Database.Database,
  tableName: 'changes' | 'releases' | 'chunks',
  columnName: string,
  cacheKey: '__synergyHasChangesFlags' | '__synergyHasReleasesPackage' | '__synergyHasChunksPackage',
): boolean {
  const tagged = db as Database.Database & Partial<Record<typeof cacheKey, boolean>>;
  if (tagged[cacheKey] === true) return true;
  if (tagged[cacheKey] === false && db.readonly) return false;
  try {
    const cols = db.pragma(`table_info(${tableName})`) as Array<{ name: string }>;
    const has = cols.some((c) => c.name === columnName);
    if (has || db.readonly) {
      tagged[cacheKey] = has;
    }
    return has;
  } catch {
    return false;
  }
}

/** Cacheable check for whether `changes.flags` exists (false on unmigrated v3 read-only DBs). */
export function hasChangesFlagsColumn(db: Database.Database): boolean {
  return hasTableColumn(db, 'changes', 'flags', '__synergyHasChangesFlags');
}

/** Cacheable check for whether `releases.package` exists (false on unmigrated pre-v5 read-only DBs). */
export function hasReleasesPackageColumn(db: Database.Database): boolean {
  return hasTableColumn(db, 'releases', 'package', '__synergyHasReleasesPackage');
}

/** Cacheable check for whether `chunks.package` exists (false on unmigrated pre-v5 read-only DBs). */
export function hasChunksPackageColumn(db: Database.Database): boolean {
  return hasTableColumn(db, 'chunks', 'package', '__synergyHasChunksPackage');
}

export function openDb(
  path: string,
  opts: { loadVec?: boolean; readonly?: boolean } = {},
): Database.Database {
  const abs = resolve(path);
  const parentDir = dirname(abs);
  if (!opts.readonly && !existsSync(parentDir)) {
    try {
      mkdirSync(parentDir, { recursive: true });
    } catch (e) {
      if (!isReadonlyDbError(e) || !existsSync(abs)) {
        throw e;
      }
    }
  }

  let db: Database.Database;
  if (opts.readonly) {
    db = openSqlite(abs, (p) => new Database(p, { readonly: true }));
    db.pragma('busy_timeout = 5000');
  } else {
    let rwDb: Database.Database | null = null;
    try {
      if (existsSync(abs)) {
        accessSync(abs, constants.W_OK);
      }
      rwDb = openSqlite(abs);
      rwDb.pragma('busy_timeout = 5000');
      rwDb.pragma('journal_mode = WAL');
      db = rwDb;
    } catch (e) {
      if (rwDb) {
        try { rwDb.close(); } catch { /* ignore */ }
      }
      if (!isUnwritableExistingOpenError(e, abs)) {
        throw e;
      }
      db = openSqlite(abs, (p) => new Database(p, { readonly: true }));
      db.pragma('busy_timeout = 5000');
    }
  }

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

export function initSchema(
  db: Database.Database,
  schemaPath?: string,
  opts: { onBeforeMigrationLock?: () => void } = {},
): void {
  // Idempotent — skip DDL if already initialized
  const existing = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='products'`)
    .get();
  if (existing) {
    // Schema exists — ensure version marker is present and run migrations under lock if needed
    ensureSchemaVersion(db, opts.onBeforeMigrationLock);
    return;
  }
  const resolved = schemaPath ?? resolveSchemaPath();
  const sql = readFileSync(resolved, 'utf-8');
  db.exec(sql);
  // Stamp the new database with the current schema version
  ensureSchemaVersion(db, opts.onBeforeMigrationLock);
}

/**
 * Ensure the schema_meta table exists and the version marker is set.
 * Runs check, ALTER, trigger creation, and rescreen inside an IMMEDIATE transaction
 * and re-reads `schema_version` once the write lock is held.
 */
function ensureSchemaVersion(
  db: Database.Database,
  onBeforeMigrationLock?: () => void,
): void {
  // Fast path: avoid acquiring a write lock on already-current or read-only DBs.
  try {
    const fastRow = db
      .prepare(`SELECT value FROM schema_meta WHERE key = 'schema_version'`)
      .get() as { value: string } | undefined;
    const fastVersion = fastRow ? parseInt(fastRow.value, 10) : 0;
    if (fastVersion > SCHEMA_VERSION) {
      throw new Error(
        `Database schema version ${fastVersion} is newer than this tool supports (version ${SCHEMA_VERSION}). ` +
          `Please upgrade claude-synergy: npm update -g @mcptoolshop/claude-synergy`,
      );
    }
    if (fastVersion === SCHEMA_VERSION) {
      return;
    }
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('is newer than this tool supports')) {
      throw e;
    }
  }

  onBeforeMigrationLock?.();

  // Disable foreign_keys outside the IMMEDIATE transaction when rebuilding
  // `releases` / `changes`, because child tables (`entities`, `chunks`) hold
  // FKs to `changes(id)` and SQLite ignores `PRAGMA foreign_keys` mid-tx.
  const fkWasOn = !db.readonly && db.pragma('foreign_keys', { simple: true }) === 1;
  if (fkWasOn) {
    db.pragma('foreign_keys = OFF');
  }
  try {
    const runMigration = db.transaction(() => {
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
        migrateSchema(db, currentVersion, SCHEMA_VERSION);

        db.prepare(`
          INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('schema_version', @version)
        `).run({ version: String(SCHEMA_VERSION) });
      }
    });
    runMigration.immediate();
  } finally {
    if (fkWasOn) {
      try {
        db.pragma('foreign_keys = ON');
      } catch {
        /* ignore if db was closed on error */
      }
    }
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
  // Migration 3 → 4: add changes.flags, add changes_fts_update trigger, and
  // rescreen all existing change rows once.
  if (fromVersion < 4 && toVersion >= 4) {
    const hasChanges = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='changes'`)
      .get();
    if (hasChanges) {
      const cols = db.pragma('table_info(changes)') as Array<{ name: string }>;
      if (!cols.some((c) => c.name === 'flags')) {
        db.exec(`ALTER TABLE changes ADD COLUMN flags TEXT NOT NULL DEFAULT '[]'`);
      }
      const hasChangesFts = db
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='changes_fts'`)
        .get();
      if (hasChangesFts) {
        db.exec(`
          CREATE TRIGGER IF NOT EXISTS changes_fts_update AFTER UPDATE OF text ON changes BEGIN
            INSERT INTO changes_fts(changes_fts, rowid, text) VALUES('delete', old.id, old.text);
            INSERT INTO changes_fts(rowid, text) VALUES (new.id, new.text);
          END;
        `);
      }
      rescreenChanges(db);
    }
  }
  // Migration 4 → 5: add `package` to releases, changes, and chunks with
  // PRIMARY KEY (product, package, version), re-deriving package and
  // normalized version from products.yaml for every existing row.
  if (fromVersion < 5 && toVersion >= 5) {
    migrateToV5PackageSchema(db);
  }
  void toVersion;
}

function migrateToV5PackageSchema(db: Database.Database): void {
  const hasReleases = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='releases'`)
    .get();
  if (!hasReleases) return;

  const relCols = db.pragma('table_info(releases)') as Array<{ name: string }>;
  const releasesNeedsRebuild = !relCols.some((c) => c.name === 'package');

  if (releasesNeedsRebuild) {
    const cfg = loadProductsConfig();
    type OldReleaseRow = {
      rowid: number;
      product: string;
      version: string;
      released_at: string | null;
      notes_path: string;
      fetched_at: string;
      source_url: string;
      bundle_size_kb: number | null;
      notes_hash: string | null;
    };
    const oldReleases = db
      .prepare(
        `SELECT rowid, product, version, released_at, notes_path, fetched_at, source_url, bundle_size_kb, notes_hash
         FROM releases
         ORDER BY rowid ASC`,
      )
      .all() as OldReleaseRow[];

    const isNewerRelease = (candidate: OldReleaseRow, incumbent: OldReleaseRow): boolean => {
      const cFetched = candidate.fetched_at ?? '';
      const iFetched = incumbent.fetched_at ?? '';
      if (cFetched !== iFetched) return cFetched > iFetched;
      const cHash = candidate.notes_hash ?? '';
      const iHash = incumbent.notes_hash ?? '';
      if (cHash !== iHash) return cHash > iHash;
      return candidate.rowid > incumbent.rowid;
    };

    // Derive target (package, version) per legacy row, picking a deterministic
    // collision winner by newer fetched_at, then notes_hash, then rowid.
    const identityByLegacyKey = new Map<string, { pkg: string; version: string }>();
    const winnerRowByTarget = new Map<string, { legacyKey: string; row: OldReleaseRow }>();
    for (const r of oldReleases) {
      const legacyKey = `${r.product}\0${r.version}`;
      const derived = deriveReleaseIdentity(r.product, r.version, r.notes_path, cfg, r.source_url);
      identityByLegacyKey.set(legacyKey, derived);
      const targetKey = `${r.product}\0${derived.pkg}\0${derived.version}`;
      const incumbent = winnerRowByTarget.get(targetKey);
      if (!incumbent || isNewerRelease(r, incumbent.row)) {
        winnerRowByTarget.set(targetKey, { legacyKey, row: r });
      }
    }
    const winningLegacyKeyByTarget = new Map<string, string>();
    for (const [targetKey, entry] of winnerRowByTarget) {
      winningLegacyKeyByTarget.set(targetKey, entry.legacyKey);
    }

    const hasChanges = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='changes'`)
      .get();
    const hasChangesFts = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='changes_fts'`)
      .get();
    let droppedChangeCount = 0;

    db.pragma('legacy_alter_table = ON');
    try {
      db.exec(`
        DROP TRIGGER IF EXISTS changes_fts_insert;
        DROP TRIGGER IF EXISTS changes_fts_delete;
        DROP TRIGGER IF EXISTS changes_fts_update;
        CREATE TABLE releases_v5 (
          product          TEXT NOT NULL REFERENCES products(name) ON DELETE CASCADE,
          package          TEXT NOT NULL DEFAULT '',
          version          TEXT NOT NULL,
          released_at      DATE,
          notes_path       TEXT NOT NULL,
          fetched_at       DATETIME NOT NULL,
          source_url       TEXT NOT NULL,
          bundle_size_kb   REAL,
          notes_hash       TEXT,
          PRIMARY KEY (product, package, version)
        );
      `);

      const insertRelV5 = db.prepare(`
        INSERT INTO releases_v5 (product, package, version, released_at, notes_path, fetched_at, source_url, bundle_size_kb, notes_hash)
        VALUES (@product, @package, @version, @released_at, @notes_path, @fetched_at, @source_url, @bundle_size_kb, @notes_hash)
      `);
      for (const r of oldReleases) {
        const legacyKey = `${r.product}\0${r.version}`;
        const derived = identityByLegacyKey.get(legacyKey)!;
        const targetKey = `${r.product}\0${derived.pkg}\0${derived.version}`;
        if (winningLegacyKeyByTarget.get(targetKey) !== legacyKey) continue;
        insertRelV5.run({
          product: r.product,
          package: derived.pkg,
          version: derived.version,
          released_at: r.released_at,
          notes_path: r.notes_path,
          fetched_at: r.fetched_at,
          source_url: r.source_url,
          bundle_size_kb: r.bundle_size_kb,
          notes_hash: r.notes_hash,
        });
      }

      if (hasChanges) {
        const chCols = db.pragma('table_info(changes)') as Array<{ name: string }>;
        const hasFlags = chCols.some((c) => c.name === 'flags');
        const oldChanges = db
          .prepare(
            `SELECT id, product, version, ordinal, kind, text, ${hasFlags ? 'flags' : "'[]' AS flags"}
             FROM changes
             ORDER BY id ASC`,
          )
          .all() as Array<{
          id: number;
          product: string;
          version: string;
          ordinal: number;
          kind: string;
          text: string;
          flags: string;
        }>;

        db.exec(`
          CREATE TABLE changes_v5 (
            id               INTEGER PRIMARY KEY,
            product          TEXT NOT NULL,
            package          TEXT NOT NULL DEFAULT '',
            version          TEXT NOT NULL,
            ordinal          INTEGER NOT NULL,
            kind             TEXT NOT NULL,
            text             TEXT NOT NULL,
            flags            TEXT NOT NULL DEFAULT '[]',
            FOREIGN KEY (product, package, version) REFERENCES releases(product, package, version) ON DELETE CASCADE,
            UNIQUE (product, package, version, ordinal)
          );
        `);

        const insertChV5 = db.prepare(`
          INSERT INTO changes_v5 (id, product, package, version, ordinal, kind, text, flags)
          VALUES (@id, @product, @package, @version, @ordinal, @kind, @text, @flags)
        `);
        const winningChangeIdByTargetOrdinal = new Map<string, number>();
        const losingChanges: Array<{ id: number; targetOrdinalKey: string | null }> = [];
        for (const ch of oldChanges) {
          const legacyKey = `${ch.product}\0${ch.version}`;
          const derived = identityByLegacyKey.get(legacyKey);
          if (!derived) {
            losingChanges.push({ id: ch.id, targetOrdinalKey: null });
            continue;
          }
          const targetKey = `${ch.product}\0${derived.pkg}\0${derived.version}`;
          if (winningLegacyKeyByTarget.get(targetKey) !== legacyKey) {
            losingChanges.push({ id: ch.id, targetOrdinalKey: `${targetKey}\0${ch.ordinal}` });
            continue;
          }
          winningChangeIdByTargetOrdinal.set(`${targetKey}\0${ch.ordinal}`, ch.id);
          insertChV5.run({
            id: ch.id,
            product: ch.product,
            package: derived.pkg,
            version: derived.version,
            ordinal: ch.ordinal,
            kind: ch.kind,
            text: ch.text,
            flags: ch.flags ?? '[]',
          });
        }

        if (losingChanges.length > 0) {
          droppedChangeCount = losingChanges.length;
          const rePointByChangeId = new Map<number, number>();
          const losingIds: number[] = [];
          for (const lc of losingChanges) {
            losingIds.push(lc.id);
            if (lc.targetOrdinalKey) {
              const winId = winningChangeIdByTargetOrdinal.get(lc.targetOrdinalKey);
              if (winId !== undefined) {
                rePointByChangeId.set(lc.id, winId);
              }
            }
          }
          deleteChangeChildren(db, losingIds, rePointByChangeId);
        }

        db.exec(`DROP TABLE changes;`);
      }

      db.exec(`DROP TABLE releases;`);
      db.exec(`ALTER TABLE releases_v5 RENAME TO releases;`);
      db.exec(`
        CREATE INDEX idx_releases_date ON releases(released_at);
        CREATE INDEX idx_releases_prod_pkg_date ON releases(product, package, released_at);
        CREATE INDEX idx_releases_prod_path ON releases(product, notes_path);
      `);

      if (hasChanges) {
        db.exec(`ALTER TABLE changes_v5 RENAME TO changes;`);
        db.exec(`
          CREATE INDEX idx_changes_pv ON changes(product, package, version);
          CREATE INDEX idx_changes_kind ON changes(kind);
        `);
        if (hasChangesFts) {
          db.exec(`
            CREATE TRIGGER changes_fts_insert AFTER INSERT ON changes BEGIN
              INSERT INTO changes_fts(rowid, text) VALUES (new.id, new.text);
            END;
            CREATE TRIGGER changes_fts_delete AFTER DELETE ON changes BEGIN
              INSERT INTO changes_fts(changes_fts, rowid, text) VALUES('delete', old.id, old.text);
            END;
            CREATE TRIGGER changes_fts_update AFTER UPDATE OF text ON changes BEGIN
              INSERT INTO changes_fts(changes_fts, rowid, text) VALUES('delete', old.id, old.text);
              INSERT INTO changes_fts(rowid, text) VALUES (new.id, new.text);
            END;
          `);
          if (droppedChangeCount > 0) {
            db.exec(`INSERT INTO changes_fts(changes_fts) VALUES('rebuild');`);
          }
        }
      }
    } finally {
      db.pragma('legacy_alter_table = OFF');
    }
  }

  const hasChunks = db
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='chunks'`)
    .get();
  if (hasChunks) {
    const chunkCols = db.pragma('table_info(chunks)') as Array<{ name: string }>;
    if (!chunkCols.some((c) => c.name === 'package')) {
      db.exec(`ALTER TABLE chunks ADD COLUMN package TEXT NOT NULL DEFAULT ''`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_chunks_prod_pkg ON chunks(product, package, released_at)`);
      db.exec(`
        UPDATE chunks
        SET package = COALESCE((SELECT c.package FROM changes c WHERE c.id = chunks.change_id), ''),
            release_version = COALESCE((SELECT c.version FROM changes c WHERE c.id = chunks.change_id), release_version)
      `);
    }
  }

  const fkErrors = db.pragma('foreign_key_check') as unknown[];
  if (fkErrors.length > 0) {
    throw new AppError({
      code: 'SCHEMA_MIGRATION_FK_ERROR',
      message: `Database migration to schema v${SCHEMA_VERSION} failed foreign key integrity check.`,
      hint: 'Delete the local database file (e.g. ~/.claude-synergy/data/claude-synergy.db or CLAUDE_SYNERGY_DB) and run `hk sync` to rebuild the store from release notes.',
      cause: JSON.stringify(fkErrors[0]),
    });
  }

  const tagged = db as Database.Database & {
    __synergyHasReleasesPackage?: boolean;
    __synergyHasChunksPackage?: boolean;
  };
  delete tagged.__synergyHasReleasesPackage;
  delete tagged.__synergyHasChunksPackage;
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
