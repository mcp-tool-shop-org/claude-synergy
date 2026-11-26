// Shared store path resolution and first-use auto-sync for CLI and MCP server.
//
// Resolution order (same in both MCP server and CLI):
//   1. CLAUDE_SYNERGY_DB env
//   2. explicit argv / --db
//   3. <cwd>/data/claude-synergy.db ONLY if that file already exists
//   4. <home>/.claude-synergy/data/claude-synergy.db (with products at <home>/.claude-synergy/products)
//
// CLAUDE_SYNERGY_PRODUCTS_ROOT still overrides the products root.

import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import type Database from 'better-sqlite3';
import { initSchema, openDb } from './db.js';
import { fetchAll, type FetchAllResult } from './fetch.js';
import { ingestAll, type IngestStats } from './ingest.js';
import { formatFreshnessStamp, getCorpusFreshness, type ClockInput } from './query.js';

/** Default timeout for automatic first-use sync (ms). Overridable via timeout_ms. */
export const FIRST_USE_SYNC_TIMEOUT_MS = 120_000;

/** Cooldown after a failed or empty first-use sync attempt (10 minutes). */
export const FIRST_USE_COOLDOWN_MS = 10 * 60 * 1000;

/** Metadata key in `schema_meta` storing persisted partial first-use sync state. */
export const FIRST_USE_PARTIAL_META_KEY = 'first_use_partial';

export type StoreResolutionRule =
  | 'env:CLAUDE_SYNERGY_DB'
  | 'explicit-arg'
  | 'cwd-existing'
  | 'user-home-default';

export interface ResolvedStore {
  dbPath: string;
  productsRoot: string;
  rule: StoreResolutionRule;
}

export interface ResolveStoreOptions {
  explicitDb?: string;
  explicitProductsRoot?: string;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  homeDir?: string;
}

import { AppError } from './errors.js';

function resolveUserHome(explicitHome?: string): string {
  if (explicitHome && explicitHome.trim().length > 0) return resolve(explicitHome.trim());
  return homedir();
}

function resolveNowMs(now?: ClockInput): number {
  if (typeof now === 'function') return now().getTime();
  if (now instanceof Date) return now.getTime();
  const envNow = process.env.CLAUDE_SYNERGY_NOW?.trim();
  if (envNow) {
    const parsed = Date.parse(envNow);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}

/**
 * Resolve the SQLite DB path and products root using the canonical 4-rule
 * precedence shared by `hk` (CLI) and `claude-synergy-mcp` (MCP server).
 */
export function resolveStorePaths(opts: ResolveStoreOptions = {}): ResolvedStore {
  const cwd = opts.cwd ? resolve(opts.cwd) : process.cwd();
  const env = opts.env ?? process.env;
  const home = resolveUserHome(opts.homeDir);

  const envDb = env.CLAUDE_SYNERGY_DB?.trim();
  const argDb = opts.explicitDb?.trim();
  const cwdCandidate = join(cwd, 'data', 'claude-synergy.db');

  let dbPath: string;
  let rule: StoreResolutionRule;

  if (envDb) {
    dbPath = resolve(cwd, envDb);
    rule = 'env:CLAUDE_SYNERGY_DB';
  } else if (argDb) {
    dbPath = resolve(cwd, argDb);
    rule = 'explicit-arg';
  } else if (existsSync(cwdCandidate)) {
    dbPath = cwdCandidate;
    rule = 'cwd-existing';
  } else {
    dbPath = join(home, '.claude-synergy', 'data', 'claude-synergy.db');
    rule = 'user-home-default';
  }

  const envProducts = env.CLAUDE_SYNERGY_PRODUCTS_ROOT?.trim();
  const argProducts = opts.explicitProductsRoot?.trim();
  let productsRoot: string;

  if (envProducts) {
    productsRoot = resolve(cwd, envProducts);
  } else if (argProducts) {
    productsRoot = resolve(cwd, argProducts);
  } else if (rule === 'user-home-default') {
    productsRoot = join(home, '.claude-synergy', 'products');
  } else {
    const dbDir = dirname(dbPath);
    productsRoot = basename(dbDir) === 'data'
      ? join(dbDir, '..', 'products')
      : join(dbDir, 'products');
  }

  return { dbPath, productsRoot, rule };
}

let storeNoticePrinted = false;

/**
 * Print the resolved DB path and choosing rule once per process.
 */
export function printStoreResolutionOnce(
  resolved: ResolvedStore,
  write: (line: string) => void = (s) => process.stderr.write(s)
): boolean {
  if (storeNoticePrinted) return false;
  storeNoticePrinted = true;
  write(`[claude-synergy] store: ${resolved.dbPath} (rule: ${resolved.rule})\n`);
  return true;
}

/** Test helper to reset the one-time store resolution print guard. */
export function resetStoreNoticeForTests(): void {
  storeNoticePrinted = false;
}

export function isAutoSyncDisabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env.CLAUDE_SYNERGY_NO_AUTO_SYNC?.trim().toLowerCase();
  return raw === '1' || raw === 'true';
}

export function hasAnyReleases(db: Database.Database | null): boolean {
  if (!db) return false;
  try {
    const row = db.prepare(`SELECT COUNT(*) AS n FROM releases`).get() as { n: number } | undefined;
    return !!row && row.n > 0;
  } catch {
    return false;
  }
}

export interface SkippedProductInfo {
  product: string;
  reason: string;
}

export interface FirstUseSyncReport {
  dbPath: string;
  productsRoot: string;
  total: number;
  succeeded: number;
  skipped: SkippedProductInfo[];
  partial: boolean;
  ingestedReleases: number;
  ingestedChanges: number;
  ingestedEntities: number;
}

export interface PartialSyncState {
  succeeded: number;
  total: number;
  skipped: SkippedProductInfo[];
  recorded_at?: string;
}

/**
 * Persist partial first-use sync details in `schema_meta` so subsequent runs
 * report the incomplete state and retry skipped products once cooldown expires.
 */
export function writePartialSyncState(
  db: Database.Database,
  state: PartialSyncState
): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  const payload: PartialSyncState = {
    succeeded: state.succeeded,
    total: state.total,
    skipped: state.skipped,
    recorded_at: state.recorded_at ?? new Date().toISOString(),
  };
  db.prepare(`
    INSERT OR REPLACE INTO schema_meta (key, value) VALUES (?, ?)
  `).run(FIRST_USE_PARTIAL_META_KEY, JSON.stringify(payload));
}

/** Remove the persisted partial first-use marker after a full clean sync. */
export function clearPartialSyncState(db: Database.Database | null): void {
  if (!db) return;
  try {
    db.prepare(`DELETE FROM schema_meta WHERE key = ?`).run(FIRST_USE_PARTIAL_META_KEY);
  } catch {
    // schema_meta absent -> nothing to clear
  }
}

/** Read any persisted partial first-use marker from `schema_meta`. */
export function readPartialSyncState(db: Database.Database | null): PartialSyncState | null {
  if (!db) return null;
  try {
    const row = db
      .prepare(`SELECT value FROM schema_meta WHERE key = ?`)
      .get(FIRST_USE_PARTIAL_META_KEY) as { value: string } | undefined;
    if (!row?.value) return null;
    const parsed = JSON.parse(row.value) as Partial<PartialSyncState>;
    if (typeof parsed.succeeded === 'number' && typeof parsed.total === 'number') {
      return {
        succeeded: parsed.succeeded,
        total: parsed.total,
        skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
        recorded_at: typeof parsed.recorded_at === 'string' ? parsed.recorded_at : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** True when the DB is missing/empty OR still carries an unresolved partial marker. */
export function needsAutoSync(db: Database.Database | null): boolean {
  return !hasAnyReleases(db) || readPartialSyncState(db) !== null;
}

export interface FirstUseSyncOptions {
  dbPath: string;
  productsRoot: string;
  db?: Database.Database;
  timeoutMs?: number;
  fetchRunner?: typeof fetchAll;
  ingestRunner?: typeof ingestAll;
  now?: ClockInput;
}

/**
 * Initialize schema (if needed) and run fetch -> ingest (NO embed) bounded by
 * `timeoutMs` (defaults to FIRST_USE_SYNC_TIMEOUT_MS). Any product whose fetcher
 * fails or is skipped due to timeout is recorded in `skipped` and persisted in
 * `schema_meta.first_use_partial`. Propagates configuration `AppError`s.
 */
export async function runFirstUseSync(
  opts: FirstUseSyncOptions
): Promise<{ db: Database.Database; report: FirstUseSyncReport }> {
  const db = opts.db ?? openDb(opts.dbPath);
  initSchema(db);

  const timeoutMs = opts.timeoutMs ?? FIRST_USE_SYNC_TIMEOUT_MS;
  const runFetch = opts.fetchRunner ?? fetchAll;
  const runIngest = opts.ingestRunner ?? ingestAll;

  let fetchResults: FetchAllResult | null = null;
  const skipped: SkippedProductInfo[] = [];

  try {
    fetchResults = await runFetch(db, opts.productsRoot, { timeoutMs });
  } catch (e: any) {
    if (e instanceof AppError) throw e;
    skipped.push({
      product: 'fetch',
      reason: e?.message ?? String(e),
    });
  }

  let succeeded = 0;
  let total = 0;
  if (fetchResults) {
    total = fetchResults.length;
    for (const r of fetchResults) {
      if (r.errors.length === 0) {
        succeeded++;
      } else {
        skipped.push({
          product: r.product,
          reason: r.errors.join('; '),
        });
      }
    }
  }

  let ingestStats: IngestStats = {
    productsCount: 0,
    releasesAdded: 0,
    changesAdded: 0,
    entitiesAdded: 0,
    skipped: 0,
    total: 0,
    errors: [],
  };
  if (existsSync(opts.productsRoot)) {
    ingestStats = runIngest(db, opts.productsRoot);
  }

  const partial = skipped.length > 0 || (total > 0 && succeeded < total);
  if (partial) {
    writePartialSyncState(db, { succeeded, total, skipped });
  } else if (total > 0) {
    clearPartialSyncState(db);
  }

  const report: FirstUseSyncReport = {
    dbPath: opts.dbPath,
    productsRoot: opts.productsRoot,
    total,
    succeeded,
    skipped,
    partial,
    ingestedReleases: ingestStats.releasesAdded,
    ingestedChanges: ingestStats.changesAdded,
    ingestedEntities: ingestStats.entitiesAdded,
  };

  return { db, report };
}

export function formatPartialNote(report: Pick<FirstUseSyncReport, 'succeeded' | 'total' | 'skipped'>): string {
  const skippedNames = report.skipped.map((s) => `${s.product} (${s.reason})`).join(', ');
  return skippedNames
    ? `partial corpus: synced ${report.succeeded} of ${report.total} products (skipped: ${skippedNames})`
    : `partial corpus: synced ${report.succeeded} of ${report.total} products`;
}

export function formatFirstUseNotice(
  report: FirstUseSyncReport,
  db: Database.Database | null,
  opts: { product?: string; now?: ClockInput } = {}
): string {
  const freshness = getCorpusFreshness(db, { product: opts.product, now: opts.now });
  const stamp = formatFreshnessStamp(freshness);
  if (report.skipped.length > 0) {
    const skippedStr = report.skipped.map((s) => `${s.product}: ${s.reason}`).join(', ');
    const prefix = report.partial ? 'first use (partial corpus)' : 'first use';
    return `${prefix}: synced ${report.succeeded} of ${report.total} products into ${report.dbPath} (skipped: ${skippedStr}); ${stamp}`;
  }
  return `first use: synced ${report.succeeded} of ${report.total} products into ${report.dbPath}; ${stamp}`;
}

export interface EnsureSyncedResult {
  db: Database.Database | null;
  report: FirstUseSyncReport | null;
  performedByThisCall: boolean;
  cooledDown: boolean;
  waitedForManualSync: boolean;
}

/**
 * Coordinates first-use sync and manual `sync_now` calls in-process so:
 * - concurrent first calls run only one sync;
 * - first-use calls wait on an active manual `sync_now` instead of racing `fetchAll`;
 * - failed/empty/partial first-use attempts cool down for FIRST_USE_COOLDOWN_MS (10m).
 */
export class FirstUseSyncCoordinator {
  private inFlightFirstUse: Promise<{ db: Database.Database; report: FirstUseSyncReport }> | null = null;
  private firstUseStarting = false;
  private manualSyncActive = false;
  private manualSyncPromise: Promise<unknown> | null = null;
  private manualSyncResolver: (() => void) | null = null;
  private lastPartialNote: string | null = null;
  private cooldownUntilMs: number | null = null;

  isSyncInProgress(): boolean {
    return this.firstUseStarting || this.inFlightFirstUse !== null || this.manualSyncActive;
  }

  getPartialNote(): string | null {
    return this.lastPartialNote;
  }

  clearPartialNote(): void {
    this.lastPartialNote = null;
  }

  isCoolingDown(now?: ClockInput): boolean {
    if (this.cooldownUntilMs === null) return false;
    return resolveNowMs(now) < this.cooldownUntilMs;
  }

  resetCooldown(): void {
    this.cooldownUntilMs = null;
  }

  setManualSyncActive(active: boolean): void {
    if (active) {
      this.manualSyncActive = true;
      if (!this.manualSyncPromise) {
        this.manualSyncPromise = new Promise<void>((resolvePromise) => {
          this.manualSyncResolver = resolvePromise;
        });
      }
    } else {
      this.manualSyncActive = false;
      const done = this.manualSyncResolver;
      this.manualSyncResolver = null;
      this.manualSyncPromise = null;
      done?.();
    }
  }

  async runManualSync<T>(fn: () => Promise<T>): Promise<T> {
    this.setManualSyncActive(true);
    try {
      return await fn();
    } finally {
      this.setManualSyncActive(false);
    }
  }

  async ensureSynced(opts: FirstUseSyncOptions): Promise<EnsureSyncedResult> {
    if (this.manualSyncPromise) {
      try {
        await this.manualSyncPromise;
      } catch {
        // Ignore manual sync errors here; caller checks DB state below.
      }
      const reopened = opts.db ?? (existsSync(opts.dbPath) ? openDb(opts.dbPath) : null);
      return {
        db: reopened,
        report: null,
        performedByThisCall: false,
        cooledDown: false,
        waitedForManualSync: true,
      };
    }

    if (this.inFlightFirstUse) {
      const result = await this.inFlightFirstUse;
      return {
        ...result,
        performedByThisCall: false,
        cooledDown: false,
        waitedForManualSync: false,
      };
    }

    if (this.isCoolingDown(opts.now)) {
      return {
        db: opts.db ?? null,
        report: null,
        performedByThisCall: false,
        cooledDown: true,
        waitedForManualSync: false,
      };
    }

    this.firstUseStarting = true;
    const run = runFirstUseSync(opts).then((res) => {
      if (res.report.partial) {
        this.lastPartialNote = formatPartialNote(res.report);
        this.cooldownUntilMs = resolveNowMs(opts.now) + FIRST_USE_COOLDOWN_MS;
      } else if (!hasAnyReleases(res.db)) {
        this.lastPartialNote = null;
        this.cooldownUntilMs = resolveNowMs(opts.now) + FIRST_USE_COOLDOWN_MS;
      } else {
        this.lastPartialNote = null;
        this.cooldownUntilMs = null;
      }
      return res;
    });

    this.inFlightFirstUse = run;
    try {
      const result = await run;
      return {
        ...result,
        performedByThisCall: true,
        cooledDown: false,
        waitedForManualSync: false,
      };
    } catch (e) {
      this.cooldownUntilMs = resolveNowMs(opts.now) + FIRST_USE_COOLDOWN_MS;
      throw e;
    } finally {
      this.firstUseStarting = false;
      this.inFlightFirstUse = null;
    }
  }
}
