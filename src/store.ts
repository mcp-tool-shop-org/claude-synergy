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

function resolveUserHome(env: NodeJS.ProcessEnv, explicitHome?: string): string {
  if (explicitHome && explicitHome.trim().length > 0) return resolve(explicitHome.trim());
  const envHome = env.HOME?.trim() || env.USERPROFILE?.trim();
  if (envHome) return resolve(envHome);
  return homedir();
}

/**
 * Resolve the SQLite DB path and products root using the canonical 4-rule
 * precedence shared by `hk` (CLI) and `claude-synergy-mcp` (MCP server).
 */
export function resolveStorePaths(opts: ResolveStoreOptions = {}): ResolvedStore {
  const cwd = opts.cwd ? resolve(opts.cwd) : process.cwd();
  const env = opts.env ?? process.env;
  const home = resolveUserHome(env, opts.homeDir);

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
 * fails or is skipped due to timeout is recorded in `skipped` rather than
 * aborting the entire first-use initialization.
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

/**
 * Coordinates first-use sync and manual `sync_now` calls in-process so
 * concurrent first calls run only one sync and `sync_now` never races on WAL.
 */
export class FirstUseSyncCoordinator {
  private inFlightFirstUse: Promise<{ db: Database.Database; report: FirstUseSyncReport }> | null = null;
  private firstUseStarting = false;
  private manualSyncActive = false;
  private lastPartialNote: string | null = null;

  isSyncInProgress(): boolean {
    return this.firstUseStarting || this.inFlightFirstUse !== null || this.manualSyncActive;
  }

  getPartialNote(): string | null {
    return this.lastPartialNote;
  }

  clearPartialNote(): void {
    this.lastPartialNote = null;
  }

  setManualSyncActive(active: boolean): void {
    this.manualSyncActive = active;
  }

  async ensureSynced(
    opts: FirstUseSyncOptions
  ): Promise<{ db: Database.Database; report: FirstUseSyncReport; performedByThisCall: boolean }> {
    if (this.inFlightFirstUse) {
      const result = await this.inFlightFirstUse;
      return { ...result, performedByThisCall: false };
    }

    this.firstUseStarting = true;
    const run = runFirstUseSync(opts).then((res) => {
      if (res.report.partial) {
        this.lastPartialNote = formatPartialNote(res.report);
      } else {
        this.lastPartialNote = null;
      }
      return res;
    });

    this.inFlightFirstUse = run;
    try {
      const result = await run;
      return { ...result, performedByThisCall: true };
    } finally {
      this.firstUseStarting = false;
      this.inFlightFirstUse = null;
    }
  }
}
