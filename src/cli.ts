#!/usr/bin/env node
import { Command, Option } from 'commander';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { openDb, initSchema } from './db.js';
import {
  ingestAll,
  reextractEntities,
  rescreenChanges,
  type IngestStats,
  type ReextractStats,
  type RescreenStats,
} from './ingest.js';
import {
  searchChanges,
  lookupEntity,
  recentReleases,
  listProducts,
  entityFrequency,
  browseChanges,
  getChangesSince,
  getCorpusFreshness,
  formatFreshnessStamp,
  formatFlagMarker,
  type ChangesSinceResult,
} from './query.js';
import { embedAll } from './embed.js';
import { hybridSearch } from './hybrid.js';
import { fetchAll, seedMarkersFromDb } from './fetch.js';
import type { FetchProgressEvent, FetchAllSummary } from './fetch.js';
import { AppError, formatError } from './errors.js';
import {
  FIRST_USE_SYNC_TIMEOUT_MS,
  FirstUseSyncCoordinator,
  clearPartialSyncState,
  formatFirstUseNotice,
  formatPartialNote,
  hasAnyReleases,
  isAutoSyncDisabled,
  needsAutoSync,
  printStoreResolutionOnce,
  resolveStorePaths,
  writePartialSyncState,
  type ResolvedStore,
} from './store.js';
import type Database from 'better-sqlite3';

// ── Log levels ──────────────────────────────────────────────────────────────
// Controlled via HK_LOG_LEVEL env var or --verbose / --debug flags.
// silent=0  normal=1  verbose=2  debug=3
// Secrets (API keys, tokens) are NEVER logged at any level.
type LogLevel = 'silent' | 'normal' | 'verbose' | 'debug';
const LOG_LEVELS: Record<LogLevel, number> = { silent: 0, normal: 1, verbose: 2, debug: 3 };

function resolveLogLevel(): LogLevel {
  const env = (process.env.HK_LOG_LEVEL ?? '').toLowerCase();
  if (env in LOG_LEVELS) return env as LogLevel;
  // Backward compat: HK_DEBUG=1 maps to debug level
  if (process.env.HK_DEBUG) return 'debug';
  return 'normal';
}

let logLevel: LogLevel = resolveLogLevel();

function logVerbose(msg: string): void {
  if (LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose) process.stderr.write(`[verbose] ${msg}\n`);
}

function logDebug(msg: string): void {
  if (LOG_LEVELS[logLevel] >= LOG_LEVELS.debug) process.stderr.write(`[debug] ${msg}\n`);
}

// ── Graceful shutdown ────────────────────────────────────────────────────────
// Track the active DB handle so signal handlers can close it before exit,
// preventing SQLite WAL corruption on Ctrl-C during long-running commands.
let activeDb: Database.Database | null = null;

function shutdown(signal: string): void {
  if (activeDb) {
    try { activeDb.close(); } catch { /* best-effort */ }
    activeDb = null;
  }
  // 128 + signal number is the POSIX convention (SIGINT=2, SIGTERM=15)
  const code = signal === 'SIGINT' ? 130 : 143;
  process.exit(code);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

function resolveCliStore(opts: { db?: string; products?: string; productsRoot?: string }): ResolvedStore {
  const store = resolveStorePaths({
    explicitDb: opts.db,
    explicitProductsRoot: opts.productsRoot ?? opts.products,
  });
  printStoreResolutionOnce(store);
  return store;
}

// Single-source-of-truth version from package.json (avoids hardcoded drift).
const _require = createRequire(import.meta.url);
const { version: PKG_VERSION } = _require('../package.json') as { version: string };

/**
 * Validate a CLI integer option. Rejects NaN, non-finite, out-of-range, and
 * negative values that would otherwise propagate into SQL LIMIT clauses as
 * silent garbage (`LIMIT NaN` errors at the driver, but `LIMIT -1` runs).
 */
function intOpt(name: string, raw: string | undefined, defaultValue: number, min = 1, max = 10_000): number {
  if (raw === undefined) return defaultValue;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < min || n > max) {
    console.error(`error: --${name} must be an integer in [${min}, ${max}] (got: ${raw})`);
    process.exit(1);
  }
  return n;
}

/** Open a DB handle and register it for graceful signal-handler cleanup. */
function openTrackedDb(path: string): Database.Database {
  const db = openDb(path);
  activeDb = db;
  return db;
}

/**
 * Parse a date string into an ISO 8601 date (YYYY-MM-DD or full ISO timestamp).
 *
 * Accepts:
 *   - Relative: `Nd` (days), `Nw` (weeks), `Nm` (months), `Ny` (years)
 *     e.g. `7d` → 7 days ago, `2w` → 2 weeks ago.
 *   - ISO 8601 dates: `YYYY-MM-DD` or full `YYYY-MM-DDTHH:mm:ssZ`.
 *
 * Throws AppError on invalid input so callers can surface a friendly hint.
 */
export function parseRelativeDate(input: string, now: Date = new Date()): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new AppError({
      code: 'INVALID_DATE',
      message: 'date is empty',
      hint: 'Pass a date like 7d, 2w, 1m, 1y, or YYYY-MM-DD',
    });
  }
  // Relative: Nd / Nw / Nm / Ny
  const relMatch = /^(\d+)([dwmy])$/i.exec(trimmed);
  if (relMatch) {
    const n = parseInt(relMatch[1], 10);
    const unit = relMatch[2].toLowerCase();
    if (!Number.isFinite(n) || n < 0) {
      throw new AppError({
        code: 'INVALID_DATE',
        message: `invalid relative date: ${input}`,
        hint: 'Relative dates must be a non-negative integer (e.g. 7d, 2w, 1m, 1y)',
      });
    }
    const d = new Date(now);
    switch (unit) {
      case 'd': d.setUTCDate(d.getUTCDate() - n); break;
      case 'w': d.setUTCDate(d.getUTCDate() - n * 7); break;
      case 'm': d.setUTCMonth(d.getUTCMonth() - n); break;
      case 'y': d.setUTCFullYear(d.getUTCFullYear() - n); break;
    }
    return d.toISOString().slice(0, 10);
  }
  // ISO date: parse and re-emit normalized
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError({
      code: 'INVALID_DATE',
      message: `invalid date: ${input}`,
      hint: 'Use YYYY-MM-DD, a full ISO timestamp, or a relative form like 7d/2w/1m/1y',
    });
  }
  // YYYY-MM-DD form short-circuit (avoid time-component drift)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return parsed.toISOString();
}

/** Wrap a parse call to emit AppError JSON / formatted text and exit. */
function resolveDateOrExit(name: string, raw: string | undefined): string | undefined {
  if (raw === undefined) return undefined;
  try {
    return parseRelativeDate(raw);
  } catch (e) {
    if (e instanceof AppError) {
      if (program.opts().json) {
        console.log(JSON.stringify(e.toJSON()));
      } else {
        console.error(formatError(e, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
    } else {
      console.error(`error: --${name} ${(e as Error).message}`);
    }
    process.exit(1);
  }
}

const CONTEXT_PROVIDERS = ['none', 'structured', 'ollama', 'claude-haiku'] as const;
const EMBED_PROVIDERS = ['ollama', 'voyage'] as const;
const RERANK_PROVIDERS = ['none', 'ollama-judge', 'voyage', 'cohere'] as const;
type ContextProviderName = (typeof CONTEXT_PROVIDERS)[number];
type EmbedProviderName = (typeof EMBED_PROVIDERS)[number];
type RerankProviderName = (typeof RERANK_PROVIDERS)[number];

interface QueryDbSession {
  db: Database.Database | null;
  store: ResolvedStore;
  emptyOptOut: boolean;
  partialNote?: string;
}

const cliSyncCoordinator = new FirstUseSyncCoordinator();

/**
 * Open the resolved DB for query commands. If missing or empty (0 releases):
 * - when CLAUDE_SYNERGY_NO_AUTO_SYNC=1, emit guidance without auto-syncing;
 * - otherwise run first-use sync (fetch -> ingest, no embed) subject to the 10-minute cooldown.
 * Any `last_sync_partial` marker in `schema_meta` drives the freshness stamp only.
 */
async function openQueryDbOrFirstUse(
  opts: { db?: string },
  scopedProduct?: string
): Promise<QueryDbSession> {
  const store = resolveCliStore(opts);
  let db: Database.Database | null = existsSync(store.dbPath)
    ? openTrackedDb(store.dbPath)
    : null;

  if (db && !db.readonly) {
    const hasProducts = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='products'`)
      .get();
    if (hasProducts) {
      initSchema(db);
    }
  }

  if (!needsAutoSync(db)) {
    return { db, store, emptyOptOut: false };
  }

  if (isAutoSyncDisabled()) {
    if (!hasAnyReleases(db)) {
      if (!program.opts().json) {
        console.error('No data yet (auto-sync disabled). Run `hk sync` to fetch changelogs, then `hk query <term>` to search.');
      }
      return { db, store, emptyOptOut: true };
    }
    return { db, store, emptyOptOut: false };
  }

  const synced = await cliSyncCoordinator.ensureSynced({
    dbPath: store.dbPath,
    productsRoot: store.productsRoot,
    db: db ?? undefined,
    timeoutMs: FIRST_USE_SYNC_TIMEOUT_MS,
  });
  activeDb = synced.db;
  if (synced.cooledDown) {
    if (!hasAnyReleases(synced.db)) {
      if (!program.opts().json) {
        const reason = cliSyncCoordinator.getEmptyCorpusReason(synced.db);
        const detail =
          reason === 'failed'
            ? 'cooling down after a failed attempt (10m)'
            : 'the last attempt returned nothing (cooling down for 10m)';
        console.error(`No data yet (${detail}). Run \`hk sync\` to populate.`);
      }
      return { db: synced.db, store, emptyOptOut: true };
    }
    return { db: synced.db, store, emptyOptOut: false };
  }
  if (synced.report && synced.db) {
    const notice = formatFirstUseNotice(synced.report, synced.db, { product: scopedProduct });
    process.stderr.write(`${notice}\n`);
  }
  return {
    db: synced.db,
    store,
    emptyOptOut: !hasAnyReleases(synced.db),
    partialNote: synced.report?.partial ? formatPartialNote(synced.report) : undefined,
  };
}

function emitArrayJson(
  arr: unknown[],
  db: Database.Database | null,
  scopedProduct?: string
): void {
  console.log(JSON.stringify(arr));
  const dataAsOf = getCorpusFreshness(db, { product: scopedProduct });
  process.stderr.write(`${JSON.stringify({ data_as_of: dataAsOf })}\n`);
}

function isStampSuppressed(cmdOpts?: { stamp?: boolean }): boolean {
  return program.opts().stamp === false || cmdOpts?.stamp === false;
}

function emitTextStamp(
  db: Database.Database | null,
  scopedProduct?: string,
  partialNote?: string,
  cmdOpts?: { stamp?: boolean }
): void {
  if (isStampSuppressed(cmdOpts)) return;
  const freshness = getCorpusFreshness(db, { product: scopedProduct });
  console.log(formatFreshnessStamp(freshness, { partialNote }));
}

function emitEmptyQueryOutput(
  session: QueryDbSession,
  scopedProduct?: string,
  cmdOpts?: { stamp?: boolean }
): void {
  if (program.opts().json) {
    emitArrayJson([], session.db, scopedProduct);
  } else {
    console.log('(empty corpus — run `hk sync` to populate)');
    emitTextStamp(session.db, scopedProduct, session.partialNote, cmdOpts);
  }
  if (session.db) {
    session.db.close();
    activeDb = null;
  }
}

// ── Fetch progress helpers ──────────────────────────────────────────────────

/** Format a number with thousands separators (e.g. 1247 → "1,247"). */
function fmtNum(n: number): string {
  return n.toLocaleString('en-US');
}

/** Build an onProgress callback for fetchAll that writes real-time status to stderr. */
function makeFetchProgressWriter(): (event: FetchProgressEvent) => void {
  return (event: FetchProgressEvent) => {
    const idx = `${event.index + 1}/${event.total}`;
    switch (event.type) {
      case 'start':
        process.stderr.write(`Fetching ${event.product} (${idx})...\n`);
        break;
      case 'error':
        process.stderr.write(`✗ ${event.product}: ${event.error ?? 'unknown error'}\n`);
        break;
      case 'skip':
        process.stderr.write(`⊘ ${event.product} (skipped — ${event.error ?? 'unknown'})\n`);
        break;
      // 'done' — the start line is sufficient; no extra output needed
    }
  };
}

/** Print a clean summary line from FetchAllSummary to stderr (or return JSON-friendly object). */
function printFetchSummary(summary: FetchAllSummary): void {
  const parts = [
    `${fmtNum(summary.succeeded)} succeeded`,
    `${fmtNum(summary.failed)} failed`,
    `${fmtNum(summary.skipped)} skipped`,
    `${fmtNum(summary.newChanges)} new changes`,
  ];
  process.stderr.write(`\nSync complete: ${parts.join(', ')}\n`);
  if (summary.failed > 0 && summary.errors.length > 0) {
    const failedList = summary.errors.map(e => `${e.product} (${e.error})`).join(', ');
    process.stderr.write(`Failed: ${failedList}\n`);
  }
}

const program = new Command();
program
  .name('hk')
  .description('Claude Synergy — local Anthropic changelog mirror + cross-product synergies')
  .version(PKG_VERSION)
  .enablePositionalOptions()
  .option('--json', 'Output results as JSON (for CI/scripting)')
  .option('--no-stamp', 'Omit trailing freshness stamp from text output')
  .option('--verbose', 'Show verbose output (also: HK_LOG_LEVEL=verbose)')
  .option('--debug', 'Show debug output including query parameters (also: HK_LOG_LEVEL=debug)')
  .hook('preAction', () => {
    const opts = program.opts();
    if (opts.debug) logLevel = 'debug';
    else if (opts.verbose) logLevel = 'verbose';
  });

program
  .command('init')
  .description('Create the database file with the current schema')
  .option('-d, --db <path>', 'database path')
  .action((opts: { db?: string; stamp?: boolean }) => {
    const store = resolveCliStore(opts);
    const db = openTrackedDb(store.dbPath);
    initSchema(db);
    const dataAsOf = getCorpusFreshness(db);
    if (program.opts().json) {
      console.log(JSON.stringify({ db: resolve(store.dbPath), initialized: true, data_as_of: dataAsOf }));
    } else {
      console.log(`✓ initialized ${resolve(store.dbPath)}`);
      if (!isStampSuppressed(opts)) console.log(formatFreshnessStamp(dataAsOf));
    }
    db.close();
    activeDb = null;
  });

program
  .command('ingest')
  .description('Parse products/*/releases/*.md and load into DB (idempotent)')
  .option('-d, --db <path>', 'database path')
  .option('-p, --products <path>', 'products dir')
  .option('--reextract', 're-extract entities for all existing change rows without re-fetching')
  .option('--rescreen', 're-screen all existing change rows in DB without re-fetching')
  .action((opts: { db?: string; products?: string; reextract?: boolean; rescreen?: boolean; stamp?: boolean }) => {
    const store = resolveCliStore(opts);
    const hasProductsDir = existsSync(store.productsRoot);
    if (!hasProductsDir && !opts.reextract && !opts.rescreen) {
      const appErr = new AppError({
        code: 'PRODUCTS_DIR_NOT_FOUND',
        message: `products dir not found: ${store.productsRoot}`,
        hint: 'Pass -p <path> or --reextract / --rescreen to operate on existing DB rows.',
      });
      if (program.opts().json) {
        console.log(JSON.stringify(appErr.toJSON()));
      } else {
        console.error(`✗ products dir not found: ${store.productsRoot}`);
      }
      process.exit(1);
    }
    const db = openTrackedDb(store.dbPath);
    initSchema(db);
    const start = Date.now();
    let stats: IngestStats;
    let reextractStats: ReextractStats | undefined;
    let rescreenStats: RescreenStats | undefined;
    try {
      stats = hasProductsDir
        ? ingestAll(db, store.productsRoot)
        : {
            productsCount: 0,
            releasesAdded: 0,
            changesAdded: 0,
            entitiesAdded: 0,
            skipped: 0,
            total: 0,
            errors: [],
          };
      if (opts.rescreen) {
        rescreenStats = rescreenChanges(db);
      }
      if (opts.reextract) {
        reextractStats = reextractEntities(db);
      }
    } catch (e: any) {
      const appErr = e instanceof AppError ? e : new AppError({
        code: 'INGEST_FAILED',
        message: `ingest failed: ${e?.message ?? String(e)}`,
        hint: 'Check products markdown files and configuration.',
        cause: e?.message ?? String(e),
      });
      if (program.opts().json) {
        console.log(JSON.stringify({ ...appErr.toJSON(), data_as_of: getCorpusFreshness(db) }));
      } else {
        console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
      db.close();
      activeDb = null;
      process.exit(1);
    }
    const ms = Date.now() - start;
    const dataAsOf = getCorpusFreshness(db);
    if (program.opts().json) {
      console.log(
        JSON.stringify({
          ...stats,
          ...(rescreenStats ? { rescreen: rescreenStats } : {}),
          ...(reextractStats ? { reextract: reextractStats } : {}),
          elapsed_ms: ms,
          data_as_of: dataAsOf,
        })
      );
    } else {
      console.log(`✓ ingested ${stats.productsCount} products in ${ms}ms`);
      console.log(`  releases:  ${stats.releasesAdded}`);
      console.log(`  changes:   ${stats.changesAdded}`);
      console.log(`  entities:  ${stats.entitiesAdded}`);
      if (rescreenStats) {
        console.log(
          `  rescreen:  ${rescreenStats.changesScanned} changes scanned, ${rescreenStats.changesUpdated} updated, ${rescreenStats.changesFlagged} flagged`
        );
      }
      if (reextractStats) {
        console.log(
          `  reextract: ${reextractStats.changesScanned} changes scanned, ${reextractStats.entitiesAfter} entities (${reextractStats.entitiesAdded} new)`
        );
      }
      if (stats.errors.length > 0) {
        console.log(`\n✗ errors: ${stats.errors.length}`);
        stats.errors.slice(0, 5).forEach((e) => console.log(`  ${e.file}: ${e.error}`));
        if (stats.errors.length > 5) {
          console.log(`  ... and ${stats.errors.length - 5} more`);
        }
      }
      if (!isStampSuppressed(opts)) console.log(formatFreshnessStamp(dataAsOf));
    }
    db.close();
    activeDb = null;
  });

program
  .command('query <text>')
  .description('Full-text search across all change bullets (FTS5). Quote multi-word: hk query "managed agents"')
  .option('-d, --db <path>', 'database path')
  .option('-p, --product <name>', 'limit to one product')
  .option('-s, --since <date>', 'lower bound (YYYY-MM-DD or relative like 7d, 2w, 1m)')
  .option('-u, --until <date>', 'upper bound (YYYY-MM-DD or relative like 7d, 2w, 1m)')
  .option('-k, --kind <kind>', 'added|fixed|breaking|deprecated|renamed|removed|improved|changed')
  .option('-l, --limit <n>', 'max results', '20')
  .action(async (text: string, opts: { db?: string; product?: string; since?: string; until?: string; kind?: string; limit: string; stamp?: boolean }) => {
    logDebug(`text=${JSON.stringify(text)} opts=${JSON.stringify(opts)}`);
    const session = await openQueryDbOrFirstUse(opts, opts.product);
    if (session.emptyOptOut || !session.db) {
      emitEmptyQueryOutput(session, opts.product, opts);
      return;
    }
    const db = session.db;
    const q = text;
    const since = resolveDateOrExit('since', opts.since);
    const until = resolveDateOrExit('until', opts.until);
    let results;
    try {
      results = searchChanges(db, q, {
        product: opts.product,
        since,
        until,
        kind: opts.kind,
        limit: intOpt('limit', opts.limit, 20),
      });
    } catch (e: any) {
      const appErr = new AppError({
        code: 'QUERY_FAILED',
        message: `query failed: ${e.message}`,
        hint: `FTS5 syntax — use double quotes for phrase: hk query '"AskUserQuestion"' or use plain words: hk query AskUserQuestion`,
        cause: e.message,
      });
      if (program.opts().json) {
        console.log(JSON.stringify({ ...appErr.toJSON(), data_as_of: getCorpusFreshness(db, { product: opts.product }) }));
      } else {
        console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
      db.close();
      activeDb = null;
      process.exit(1);
    }
    if (program.opts().json) {
      emitArrayJson(
        results.map((r) => ({
          released_at: r.released_at, product: r.product, version: r.version,
          kind: r.kind, text: r.text, snippet: r.snippet, flags: r.flags,
        })),
        db,
        opts.product
      );
    } else {
      if (results.length === 0) {
        console.log('(no results)');
      } else {
        for (const r of results) {
          const flagMarker = formatFlagMarker(r.flags);
          const flagInfo = flagMarker ? ` ${flagMarker}` : '';
          console.log(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]${flagInfo}`);
          console.log(`  ${r.snippet}`);
        }
        console.log(`\n${results.length} result${results.length === 1 ? '' : 's'}`);
      }
      emitTextStamp(db, opts.product, session.partialNote, opts);
    }
    db.close();
    activeDb = null;
  });

async function runEntityCommand(
  entityType: string,
  lookupValue: string,
  label: string,
  opts: { db?: string; stamp?: boolean }
): Promise<void> {
  const session = await openQueryDbOrFirstUse(opts);
  if (session.emptyOptOut || !session.db) {
    emitEmptyQueryOutput(session, undefined, opts);
    return;
  }
  const db = session.db;
  const results = lookupEntity(db, entityType, lookupValue);
  if (program.opts().json) {
    emitArrayJson(
      results.map((r) => ({
        released_at: r.released_at, product: r.product, version: r.version,
        kind: r.kind, text: r.text, flags: r.flags,
      })),
      db
    );
  } else {
    printEntityResults(lookupValue, label, results);
    emitTextStamp(db, undefined, session.partialNote, opts);
  }
  db.close();
  activeDb = null;
}

program
  .command('env-var <name>')
  .description('Find when an env var was introduced or last changed')
  .option('-d, --db <path>', 'database path')
  .action(async (name: string, opts: { db?: string }) => {
    await runEntityCommand('env_var', name, 'env var', opts);
  });

program
  .command('command <slash>')
  .description('Find a slash command\'s history')
  .option('-d, --db <path>', 'database path')
  .action(async (slash: string, opts: { db?: string }) => {
    const normalized = slash.startsWith('/') ? slash : '/' + slash;
    await runEntityCommand('slash_command', normalized, 'slash command', opts);
  });

program
  .command('model <id>')
  .description('Find a Claude model ID\'s history (deprecations, launches)')
  .option('-d, --db <path>', 'database path')
  .action(async (id: string, opts: { db?: string }) => {
    await runEntityCommand('model_id', id, 'model id', opts);
  });

program
  .command('cve <id>')
  .description('Find releases mentioning a specific CVE')
  .option('-d, --db <path>', 'database path')
  .action(async (id: string, opts: { db?: string }) => {
    await runEntityCommand('cve', id, 'CVE', opts);
  });

program
  .command('seed-markers')
  .description('Seed fetch markers from the current DB state (run once after study-swarm to enable incremental fetch)')
  .option('-d, --db <path>', 'database path')
  .action((opts: { db?: string; stamp?: boolean }) => {
    const store = resolveCliStore(opts);
    const db = openTrackedDb(store.dbPath);
    initSchema(db);
    const results = seedMarkersFromDb(db);
    const seededCount = results.filter((r) => r.seededTo).length;
    const dataAsOf = getCorpusFreshness(db);
    if (program.opts().json) {
      console.log(JSON.stringify({ markers: results, seeded: seededCount, data_as_of: dataAsOf }));
    } else {
      for (const r of results) {
        console.log(`${r.product.padEnd(35)} ${r.seededTo ? '→ ' + r.seededTo.split('T')[0] : '(no releases on disk)'}`);
      }
      console.log(`\n✓ seeded ${seededCount} marker${seededCount === 1 ? '' : 's'}`);
      if (!isStampSuppressed(opts)) console.log(formatFreshnessStamp(dataAsOf));
    }
    db.close();
    activeDb = null;
  });

program
  .command('fetch')
  .description('Pull new GitHub releases since last sync (Tier 1 sources only — 10 SDK/CLI products)')
  .option('-d, --db <path>', 'database path')
  .option('-r, --products-root <path>', 'products dir root')
  .option('-p, --product <name>', 'limit to one product')
  .option('--since <iso>', 'override the stored marker (YYYY-MM-DD or full ISO)')
  .action(async (opts: { db?: string; productsRoot?: string; product?: string; since?: string; stamp?: boolean }) => {
    const store = resolveCliStore(opts);
    const db = openTrackedDb(store.dbPath);
    initSchema(db);
    try {
      const stats = await fetchAll(db, store.productsRoot, {
        product: opts.product,
        sinceOverride: opts.since,
        onProgress: makeFetchProgressWriter(),
      });
      if (stats.summary.failed === 0 && stats.summary.skipped === 0) {
        if (!opts.product) clearPartialSyncState(db);
      } else {
        writePartialSyncState(db, {
          succeeded: stats.summary.succeeded,
          total: stats.summary.total,
          skipped: stats
            .filter((r) => r.errors.length > 0)
            .map((r) => ({ product: r.product, reason: r.errors.join('; ') })),
        });
      }
      const dataAsOf = getCorpusFreshness(db, { product: opts.product });
      if (program.opts().json) {
        console.log(JSON.stringify({ stats, summary: stats.summary, data_as_of: dataAsOf }));
      } else {
        for (const s of stats) {
          const status = s.fetched > 0 ? `+${s.fetched} new` : `current (since ${s.newSince})`;
          console.log(`${s.product.padEnd(35)} ${status}${s.latest ? `  latest: ${s.latest.split('T')[0]}` : ''}`);
        }
        printFetchSummary(stats.summary);
        if (!isStampSuppressed(opts)) console.log(formatFreshnessStamp(dataAsOf));
      }
      // Exit code 3 = partial success (some products failed, others succeeded)
      if (stats.summary.failed > 0 && stats.summary.succeeded > 0) {
        process.exitCode = 3;
      } else if (stats.summary.failed > 0 && stats.summary.succeeded === 0) {
        process.exitCode = 2;
      }
    } finally {
      db.close();
      activeDb = null;
    }
  });

program
  .command('sync')
  .description('Run fetch → ingest → embed in sequence (for daily cron / GH Action)')
  .option('-d, --db <path>', 'database path')
  .option('-r, --products-root <path>', 'products dir')
  .option('--skip-fetch', 'skip the fetch step (just ingest+embed existing files)')
  .option('--skip-embed', 'skip the embed step (fetch+ingest only)')
  .addOption(
    new Option('-c, --context <provider>', 'context provider for embed')
      .default('structured')
      .choices([...CONTEXT_PROVIDERS])
  )
  .addOption(
    new Option('-e, --embed-provider <provider>', 'embedding provider')
      .default('ollama')
      .choices([...EMBED_PROVIDERS])
  )
  .action(
    async (opts: {
      db?: string;
      productsRoot?: string;
      skipFetch?: boolean;
      skipEmbed?: boolean;
      context: ContextProviderName;
      embedProvider: EmbedProviderName;
      stamp?: boolean;
    }) => {
      const store = resolveCliStore(opts);
      const db = openTrackedDb(store.dbPath);
      initSchema(db);
      const t0 = Date.now();
      const isJson = !!program.opts().json;
      try {
        let fetchSummary: FetchAllSummary | null = null;
        if (!opts.skipFetch) {
          process.stderr.write('=== fetch ===\n');
          const stats = await fetchAll(db, store.productsRoot, {
            onProgress: makeFetchProgressWriter(),
          });
          fetchSummary = stats.summary;
          if (stats.summary.failed === 0 && stats.summary.skipped === 0) {
            clearPartialSyncState(db);
          } else {
            writePartialSyncState(db, {
              succeeded: stats.summary.succeeded,
              total: stats.summary.total,
              skipped: stats
                .filter((r) => r.errors.length > 0)
                .map((r) => ({ product: r.product, reason: r.errors.join('; ') })),
            });
          }
          if (!isJson) {
            printFetchSummary(stats.summary);
          }
        }
        process.stderr.write('\n=== ingest ===\n');
        const ingestStats = ingestAll(db, store.productsRoot);
        if (!isJson) {
          console.log(`ingested ${ingestStats.releasesAdded} releases, ${ingestStats.changesAdded} changes, ${ingestStats.entitiesAdded} entities`);
        }

        let embedStats: Awaited<ReturnType<typeof embedAll>> | null = null;
        if (!opts.skipEmbed) {
          process.stderr.write('\n=== embed ===\n');
          embedStats = await embedAll(db, {
            contextProviderName: opts.context,
            embeddingProviderName: opts.embedProvider,
            onProgress: (p) => {
              const prov = p.provider ? ` [${p.provider}]` : '';
              const tokens = p.tokensUsed != null ? ` ${fmtNum(p.tokensUsed)} tokens` : '';
              const reqs = p.requestsMade != null ? ` ${p.requestsMade} reqs` : '';
              process.stderr.write(`  Embedding batch ${p.batchesCompleted}/${p.batchesTotal} (${p.chunksCompleted}/${p.chunksTotal} chunks)${prov}${tokens}${reqs}\n`);
            },
          });
          if (!isJson) {
            console.log(`embedded ${embedStats.chunksCreated} new chunks via ${embedStats.contextProvider} + ${embedStats.embeddingProvider}`);
          }
        }
        const elapsedMs = Date.now() - t0;
        const dataAsOf = getCorpusFreshness(db);
        if (isJson) {
          console.log(
            JSON.stringify({
              fetch: fetchSummary,
              ingest: ingestStats,
              embed: embedStats,
              elapsed_ms: elapsedMs,
              data_as_of: dataAsOf,
            })
          );
        } else {
          console.log(`\n✓ sync complete in ${elapsedMs}ms`);
          if (!isStampSuppressed(opts)) console.log(formatFreshnessStamp(dataAsOf));
        }
      } catch (e: any) {
        const appErr = e instanceof AppError ? e : new AppError({
          code: 'SYNC_FAILED',
          message: `sync failed: ${e.message}`,
          hint: 'Check network connectivity and API credentials. Re-run with --verbose for details.',
          cause: e.message,
          retryable: true,
        });
        if (isJson) {
          console.log(JSON.stringify({ ...appErr.toJSON(), data_as_of: getCorpusFreshness(db) }));
        } else {
          console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
        }
        process.exit(2);
      } finally {
        db.close();
        activeDb = null;
      }
    }
  );

program
  .command('embed')
  .description('Generate contextual chunks + embeddings (Tier 2b — opt-in semantic layer)')
  .option('-d, --db <path>', 'database path')
  .addOption(
    new Option('-c, --context <provider>', 'context provider')
      .default('structured')
      .choices([...CONTEXT_PROVIDERS])
  )
  .addOption(
    new Option('-e, --embed <provider>', 'embedding provider')
      .default('ollama')
      .choices([...EMBED_PROVIDERS])
  )
  .option('-p, --product <name>', 'limit to one product')
  .option('-l, --limit <n>', 'embed at most N pending chunks (testing)')
  .option('--batch-size <n>', 'embedding batch size', '64')
  .option('--force', 'recompute even if chunk already exists')
  .action(
    async (opts: {
      db?: string;
      context: ContextProviderName;
      embed: EmbedProviderName;
      product?: string;
      limit?: string;
      batchSize: string;
      force?: boolean;
      stamp?: boolean;
    }) => {
    const store = resolveCliStore(opts);
    const db = openTrackedDb(store.dbPath);
    const isJson = !!program.opts().json;
    try {
      const stats = await embedAll(db, {
        contextProviderName: opts.context,
        embeddingProviderName: opts.embed,
        product: opts.product,
        limit: opts.limit !== undefined ? intOpt('limit', opts.limit, 1) : undefined,
        batchSize: intOpt('batch-size', opts.batchSize, 64),
        force: opts.force,
        onProgress: (p) => {
          const prov = p.provider ? ` [${p.provider}]` : '';
          const tokens = p.tokensUsed != null ? ` ${fmtNum(p.tokensUsed)} tokens` : '';
          const reqs = p.requestsMade != null ? ` ${p.requestsMade} reqs` : '';
          process.stderr.write(`Embedding batch ${p.batchesCompleted}/${p.batchesTotal} (${p.chunksCompleted}/${p.chunksTotal} chunks)${prov}${tokens}${reqs}\n`);
        },
      });
      const dataAsOf = getCorpusFreshness(db, { product: opts.product });
      if (isJson) {
        console.log(JSON.stringify({ ...stats, data_as_of: dataAsOf }));
      } else {
        console.log(`✓ embedded ${stats.chunksCreated} chunks in ${stats.totalMs}ms`);
        console.log(`  context provider: ${stats.contextProvider} (${stats.contextMs}ms total)`);
        console.log(`  embedding model:  ${stats.embeddingProvider} (${stats.embedMs}ms total)`);
        if (stats.chunksCreated === 0) {
          console.log(`  (nothing to do — all changes already embedded; use --force to re-embed)`);
        }
        if (!isStampSuppressed(opts)) console.log(formatFreshnessStamp(dataAsOf));
      }
    } catch (e: any) {
      const hint = (e.message.includes('Ollama') || e.message.includes('11434'))
        ? "start Ollama with 'ollama serve' and pull the model: 'ollama pull nomic-embed-text'"
        : 'Check provider connectivity. Re-run with --verbose for details.';
      const appErr = new AppError({
        code: 'EMBED_FAILED',
        message: `embed failed: ${e.message}`,
        hint,
        cause: e.message,
        retryable: true,
      });
      if (isJson) {
        console.log(JSON.stringify({ ...appErr.toJSON(), data_as_of: getCorpusFreshness(db, { product: opts.product }) }));
      } else {
        console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
      process.exit(2);
    } finally {
      db.close();
      activeDb = null;
    }
  });

program
  .command('hybrid <text>')
  .description('Hybrid FTS5 + sqlite-vec search via RRF, optional rerank (requires `hk embed` first)')
  .option('-d, --db <path>', 'database path')
  .option('-p, --product <name>', 'limit to one product')
  .option('-s, --since <date>', 'lower bound (YYYY-MM-DD or relative like 7d, 2w, 1m)')
  .option('-u, --until <date>', 'upper bound (YYYY-MM-DD or relative like 7d, 2w, 1m)')
  .option('-k, --kind <kind>', 'added|fixed|breaking|deprecated|renamed|removed|improved|changed')
  .addOption(
    new Option('-e, --embed <provider>', 'embedding provider for query')
      .default('ollama')
      .choices([...EMBED_PROVIDERS])
  )
  .addOption(
    new Option('-r, --rerank <provider>', 'rerank provider')
      .default('none')
      .choices([...RERANK_PROVIDERS])
  )
  .option('-l, --limit <n>', 'max results', '10')
  .option('--top-k <n>', 'per-channel pull before fusion', '60')
  .option('--rerank-candidates <n>', 'how many RRF candidates to rerank', '20')
  .action(
    async (
      text: string,
      opts: {
        db?: string;
        product?: string;
        since?: string;
        until?: string;
        kind?: string;
        embed: EmbedProviderName;
        rerank: RerankProviderName;
        limit: string;
        topK: string;
        rerankCandidates: string;
        stamp?: boolean;
      }
    ) => {
    const session = await openQueryDbOrFirstUse(opts, opts.product);
    if (session.emptyOptOut || !session.db) {
      emitEmptyQueryOutput(session, opts.product, opts);
      return;
    }
    const db = session.db;
    const since = resolveDateOrExit('since', opts.since);
    const until = resolveDateOrExit('until', opts.until);
    try {
      const t0 = Date.now();
      const results = await hybridSearch(db, text, {
        product: opts.product,
        since,
        until,
        kind: opts.kind,
        embedProviderName: opts.embed,
        rerankProviderName: opts.rerank,
        limit: intOpt('limit', opts.limit, 10),
        topK: intOpt('top-k', opts.topK, 60),
        rerankCandidates: intOpt('rerank-candidates', opts.rerankCandidates, 20),
      });
      const ms = Date.now() - t0;
      if (program.opts().json) {
        emitArrayJson(
          results.map((r) => ({
            released_at: r.released_at, product: r.product, version: r.version,
            kind: r.kind, text: r.text, flags: r.flags, rrf_score: r.rrf_score,
            rerank_score: r.rerank_score,
          })),
          db,
          opts.product
        );
      } else {
        if (results.length === 0) {
          console.log('(no results)');
        } else {
          for (const r of results) {
            const bm = r.bm25_rank ? `bm25#${r.bm25_rank}` : '       ';
            const vec = r.vec_rank ? `vec#${r.vec_rank}` : '      ';
            const rerank = r.rerank_score !== null ? ` rerank=${r.rerank_score.toFixed(2)}` : '';
            const flagMarker = formatFlagMarker(r.flags);
            const flagInfo = flagMarker ? ` ${flagMarker}` : '';
            console.log(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]${flagInfo}  ${bm} ${vec} rrf=${r.rrf_score.toFixed(4)}${rerank}`);
            console.log(`  ${r.text.slice(0, 200)}${r.text.length > 200 ? '…' : ''}`);
          }
          console.log(`\n${results.length} result${results.length === 1 ? '' : 's'} in ${ms}ms (rerank: ${opts.rerank})`);
        }
        emitTextStamp(db, opts.product, session.partialNote, opts);
      }
    } catch (e: any) {
      const hint = (e.message.includes('Ollama') || e.message.includes('11434'))
        ? 'start Ollama and pull the embedding model (and rerank model if using ollama-judge)'
        : 'Check provider connectivity. Re-run with --verbose for details.';
      const appErr = new AppError({
        code: 'HYBRID_QUERY_FAILED',
        message: `hybrid query failed: ${e.message}`,
        hint,
        cause: e.message,
        retryable: true,
      });
      if (program.opts().json) {
        console.log(JSON.stringify({ ...appErr.toJSON(), data_as_of: getCorpusFreshness(db, { product: opts.product }) }));
      } else {
        console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
      process.exit(2);
    } finally {
      db.close();
      activeDb = null;
    }
  });

program
  .command('latest')
  .description('Recent releases across all products (or one)')
  .option('-d, --db <path>', 'database path')
  .option('-p, --product <name>', 'limit to one product')
  .option('-s, --since <date>', 'lower bound (YYYY-MM-DD or relative like 7d, 2w, 1m)')
  .option('-l, --limit <n>', 'max results', '20')
  .action(async (opts: { db?: string; product?: string; since?: string; limit: string; stamp?: boolean }) => {
    const session = await openQueryDbOrFirstUse(opts, opts.product);
    if (session.emptyOptOut || !session.db) {
      emitEmptyQueryOutput(session, opts.product, opts);
      return;
    }
    const db = session.db;
    const since = resolveDateOrExit('since', opts.since);
    const releases = recentReleases(db, opts.product, intOpt('limit', opts.limit, 20), since);
    if (program.opts().json) {
      emitArrayJson(releases, db, opts.product);
    } else {
      if (releases.length === 0) {
        console.log('(no releases)');
      } else {
        for (const r of releases) {
          console.log(`${r.released_at}  ${r.product}@${r.version}  (${r.change_count} change${r.change_count === 1 ? '' : 's'})`);
        }
      }
      emitTextStamp(db, opts.product, session.partialNote, opts);
    }
    db.close();
    activeDb = null;
  });

program
  .command('products')
  .description('List all products in the DB with release counts')
  .option('-d, --db <path>', 'database path')
  .action(async (opts: { db?: string; stamp?: boolean }) => {
    const session = await openQueryDbOrFirstUse(opts);
    if (session.emptyOptOut || !session.db) {
      emitEmptyQueryOutput(session, undefined, opts);
      return;
    }
    const db = session.db;
    const products = listProducts(db);
    if (program.opts().json) {
      emitArrayJson(products, db);
    } else {
      if (products.length === 0) {
        console.log('(no products)');
      } else {
        console.log('Product                              Releases  Latest');
        console.log('───────────────────────────────────  ────────  ──────────────────');
        for (const p of products) {
          const latest = p.latest_version ? `${p.latest_version} (${p.latest_date})` : '—';
          console.log(`${p.name.padEnd(36)} ${String(p.release_count).padStart(8)}  ${latest}`);
        }
      }
      emitTextStamp(db, undefined, session.partialNote, opts);
    }
    db.close();
    activeDb = null;
  });

// ── hk diff ────────────────────────────────────────────────────────────────
// "What changed in the last 7 days?" — grouped by product+version, with the
// version's change bullets listed underneath. The headline feature of this
// wave (IF-001).
program
  .command('diff [product]')
  .description('Show changes in a date window, grouped by release. Default: last 7 days across all products.')
  .option('-d, --db <path>', 'database path')
  .option('-s, --since <date>', 'lower bound (YYYY-MM-DD or relative like 7d, 2w, 1m)', '7d')
  .option('-u, --until <date>', 'upper bound (YYYY-MM-DD or relative); default: now')
  .option('-k, --kind <kind>', 'added|fixed|breaking|deprecated|renamed|removed|improved|changed')
  .option('-l, --limit <n>', 'max change rows', '200')
  .action(async (product: string | undefined, opts: { db?: string; since: string; until?: string; kind?: string; limit: string; stamp?: boolean }) => {
    const session = await openQueryDbOrFirstUse(opts, product);
    if (session.emptyOptOut || !session.db) {
      emitEmptyQueryOutput(session, product, opts);
      return;
    }
    const db = session.db;
    const since = resolveDateOrExit('since', opts.since);
    const until = resolveDateOrExit('until', opts.until);
    if (!since) {
      // Should be unreachable because --since has a default, but guard anyway
      console.error('error: --since is required');
      db.close();
      activeDb = null;
      process.exit(1);
      return;
    }
    let results: ChangesSinceResult[];
    try {
      results = getChangesSince(db, {
        since,
        until,
        product,
        kind: opts.kind,
        limit: intOpt('limit', opts.limit, 200, 1, 10_000),
      });
    } catch (e: any) {
      const appErr = new AppError({
        code: 'DIFF_FAILED',
        message: `diff failed: ${e.message}`,
        hint: 'Verify --since / --until parse correctly and the DB is initialized.',
        cause: e.message,
      });
      if (program.opts().json) {
        console.log(JSON.stringify({ ...appErr.toJSON(), data_as_of: getCorpusFreshness(db, { product }) }));
      } else {
        console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
      db.close();
      activeDb = null;
      process.exit(1);
      return;
    }
    if (program.opts().json) {
      emitArrayJson(results, db, product);
    } else {
      if (results.length === 0) {
        const scope = product ? ` for product "${product}"` : '';
        console.log(`(no changes in window since ${since}${until ? ` until ${until}` : ''}${scope})`);
        console.log('Try widening the date window: hk diff --since 30d, or remove --kind / --product filters.');
      } else {
        let totalChanges = 0;
        for (const rel of results) {
          const date = rel.released_at ?? '????-??-??';
          console.log(`\n${date}  ${rel.product}@${rel.version}  (${rel.changes.length} change${rel.changes.length === 1 ? '' : 's'})`);
          for (const c of rel.changes) {
            const flagMarker = formatFlagMarker(c.flags);
            const flagInfo = flagMarker ? ` ${flagMarker}` : '';
            console.log(`  - [${c.kind}]${flagInfo} ${c.text}`);
          }
          totalChanges += rel.changes.length;
        }
        const sinceLbl = opts.since;
        const untilLbl = opts.until ? ` until ${opts.until}` : '';
        console.log(`\n${totalChanges} change${totalChanges === 1 ? '' : 's'} across ${results.length} release${results.length === 1 ? '' : 's'} since ${sinceLbl}${untilLbl}`);
      }
      emitTextStamp(db, product, session.partialNote, opts);
    }
    db.close();
    activeDb = null;
  });

// ── hk breaking ────────────────────────────────────────────────────────────
// Filtered browse for breaking changes. No search term required.
program
  .command('breaking')
  .description('List breaking changes, most recent first. Filter by product / date window.')
  .option('-d, --db <path>', 'database path')
  .option('-p, --product <name>', 'limit to one product')
  .option('-s, --since <date>', 'lower bound (YYYY-MM-DD or relative like 7d, 2w, 1m)')
  .option('-u, --until <date>', 'upper bound (YYYY-MM-DD or relative like 7d, 2w, 1m)')
  .option('-l, --limit <n>', 'max results', '50')
  .action(async (opts: { db?: string; product?: string; since?: string; until?: string; limit: string; stamp?: boolean }) => {
    const session = await openQueryDbOrFirstUse(opts, opts.product);
    if (session.emptyOptOut || !session.db) {
      emitEmptyQueryOutput(session, opts.product, opts);
      return;
    }
    const db = session.db;
    const since = resolveDateOrExit('since', opts.since);
    const until = resolveDateOrExit('until', opts.until);
    let results;
    try {
      results = browseChanges(db, {
        product: opts.product,
        since,
        until,
        kind: 'breaking',
        limit: intOpt('limit', opts.limit, 50, 1, 10_000),
      });
    } catch (e: any) {
      const appErr = new AppError({
        code: 'BREAKING_FAILED',
        message: `breaking query failed: ${e.message}`,
        hint: 'Verify --since / --until parse correctly and the DB is initialized.',
        cause: e.message,
      });
      if (program.opts().json) {
        console.log(JSON.stringify({ ...appErr.toJSON(), data_as_of: getCorpusFreshness(db, { product: opts.product }) }));
      } else {
        console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
      db.close();
      activeDb = null;
      process.exit(1);
      return;
    }
    if (program.opts().json) {
      emitArrayJson(
        results.map((r) => ({
          released_at: r.released_at, product: r.product, version: r.version,
          kind: r.kind, text: r.text, flags: r.flags,
        })),
        db,
        opts.product
      );
    } else {
      if (results.length === 0) {
        console.log('(no breaking changes)');
        console.log('Note: ingest may not have classified any changes as breaking yet — try `hk query "" --kind breaking` patterns, or widen --since.');
      } else {
        for (const r of results) {
          const flagMarker = formatFlagMarker(r.flags);
          const flagInfo = flagMarker ? ` ${flagMarker}` : '';
          console.log(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]${flagInfo}`);
          console.log(`  ${r.text}`);
        }
        console.log(`\n${results.length} breaking change${results.length === 1 ? '' : 's'}`);
      }
      emitTextStamp(db, opts.product, session.partialNote, opts);
    }
    db.close();
    activeDb = null;
  });

program
  .command('top <entity-type>')
  .description('Most-mentioned entities of a type (env_var, slash_command, cli_option, model_id, beta_header, cve, ghsa, hook_event, setting_key)')
  .option('-d, --db <path>', 'database path')
  .option('-l, --limit <n>', 'max results', '30')
  .action(async (entityType: string, opts: { db?: string; limit: string; stamp?: boolean }) => {
    const session = await openQueryDbOrFirstUse(opts);
    if (session.emptyOptOut || !session.db) {
      emitEmptyQueryOutput(session, undefined, opts);
      return;
    }
    const db = session.db;
    const results = entityFrequency(db, entityType, intOpt('limit', opts.limit, 30));
    if (program.opts().json) {
      emitArrayJson(results, db);
    } else {
      if (results.length === 0) {
        console.log(`(no entities of type "${entityType}")`);
      } else {
        for (const r of results) {
          console.log(`${String(r.count).padStart(4)}  ${r.first_seen ?? '????-??-??'}  ${r.value}`);
        }
      }
      emitTextStamp(db, undefined, session.partialNote, opts);
    }
    db.close();
    activeDb = null;
  });

for (const cmd of program.commands) {
  cmd.option('--no-stamp', 'Omit trailing freshness stamp from text output');
}

function printEntityResults(name: string, label: string, results: ReturnType<typeof lookupEntity>) {
  if (results.length === 0) {
    console.log(`(${label} not found: ${name})`);
    return;
  }
  console.log(`${label} ${name} — ${results.length} mention${results.length === 1 ? '' : 's'}:\n`);
  for (const r of results) {
    const flagMarker = formatFlagMarker(r.flags);
    const flagInfo = flagMarker ? ` ${flagMarker}` : '';
    console.log(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]${flagInfo}`);
    console.log(`  ${r.text}`);
  }
}

program.parseAsync(process.argv).catch((e: Error) => {
  console.error(formatError(e, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
  if (activeDb) {
    try { activeDb.close(); } catch { /* best-effort */ }
    activeDb = null;
  }
  process.exitCode = 2;
});
