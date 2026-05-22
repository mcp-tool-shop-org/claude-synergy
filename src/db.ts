import Database from 'better-sqlite3';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import * as sqliteVec from 'sqlite-vec';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  if (existing) return;
  const resolved = schemaPath ?? resolveSchemaPath();
  const sql = readFileSync(resolved, 'utf-8');
  db.exec(sql);
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
