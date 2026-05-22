#!/usr/bin/env node
import { Command, Option } from 'commander';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { openDb, initSchema } from './db.js';
import { ingestAll } from './ingest.js';
import { searchChanges, lookupEntity, recentReleases, listProducts, entityFrequency } from './query.js';
import { embedAll } from './embed.js';
import { hybridSearch } from './hybrid.js';
import { fetchAll, listFetchTargets, seedMarkersFromDb } from './fetch.js';
import type { FetchProgressEvent, FetchAllSummary } from './fetch.js';
import { AppError, formatError } from './errors.js';
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

const cwd = process.cwd();
const DEFAULT_DB = join(cwd, 'data', 'claude-synergy.db');
const DEFAULT_PRODUCTS = join(cwd, 'products');

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

const CONTEXT_PROVIDERS = ['none', 'structured', 'ollama', 'claude-haiku'] as const;
const EMBED_PROVIDERS = ['ollama', 'voyage'] as const;
const RERANK_PROVIDERS = ['none', 'ollama-judge', 'voyage', 'cohere'] as const;
type ContextProviderName = (typeof CONTEXT_PROVIDERS)[number];
type EmbedProviderName = (typeof EMBED_PROVIDERS)[number];
type RerankProviderName = (typeof RERANK_PROVIDERS)[number];

/** Check if the database has any ingested changes. */
function isDbEmpty(db: Database.Database): boolean {
  try {
    const row = db.prepare('SELECT COUNT(*) AS n FROM changes').get() as { n: number } | undefined;
    return !row || row.n === 0;
  } catch {
    // Table doesn't exist yet (DB was never initialized)
    return true;
  }
}

/** Print empty-DB guidance to stderr and return true if empty. */
function warnIfEmpty(db: Database.Database): boolean {
  if (isDbEmpty(db)) {
    console.error('No data yet. Run `hk sync` to fetch changelogs, then `hk query <term>` to search.');
    return true;
  }
  return false;
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
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((opts: { db: string }) => {
    const db = openTrackedDb(opts.db);
    initSchema(db);
    console.log(`✓ initialized ${resolve(opts.db)}`);
    db.close();
  });

program
  .command('ingest')
  .description('Parse products/*/releases/*.md and load into DB (idempotent)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .option('-p, --products <path>', 'products dir', DEFAULT_PRODUCTS)
  .action((opts: { db: string; products: string }) => {
    if (!existsSync(opts.products)) {
      console.error(`✗ products dir not found: ${opts.products}`);
      process.exit(1);
    }
    const db = openTrackedDb(opts.db);
    initSchema(db);
    const start = Date.now();
    const stats = ingestAll(db, opts.products);
    const ms = Date.now() - start;
    console.log(`✓ ingested ${stats.productsCount} products in ${ms}ms`);
    console.log(`  releases:  ${stats.releasesAdded}`);
    console.log(`  changes:   ${stats.changesAdded}`);
    console.log(`  entities:  ${stats.entitiesAdded}`);
    if (stats.errors.length > 0) {
      console.log(`\n✗ errors: ${stats.errors.length}`);
      stats.errors.slice(0, 5).forEach((e) => console.log(`  ${e.file}: ${e.error}`));
      if (stats.errors.length > 5) {
        console.log(`  ... and ${stats.errors.length - 5} more`);
      }
    }
    db.close();
  });

program
  .command('query <text>')
  .description('Full-text search across all change bullets (FTS5). Quote multi-word: hk query "managed agents"')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .option('-p, --product <name>', 'limit to one product')
  .option('-s, --since <date>', 'YYYY-MM-DD lower bound')
  .option('-k, --kind <kind>', 'added|fixed|breaking|deprecated|renamed|removed|improved|changed')
  .option('-l, --limit <n>', 'max results', '20')
  .action((text: string, opts: { db: string; product?: string; since?: string; kind?: string; limit: string }) => {
    logDebug(`text=${JSON.stringify(text)} opts=${JSON.stringify(opts)}`);
    const db = openTrackedDb(opts.db);
    if (warnIfEmpty(db)) { db.close(); return; }
    const q = text;
    let results;
    try {
      results = searchChanges(db, q, {
        product: opts.product,
        since: opts.since,
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
        console.log(JSON.stringify(appErr.toJSON()));
      } else {
        console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
      db.close();
      process.exit(1);
    }
    if (program.opts().json) {
      console.log(JSON.stringify(results.map(r => ({
        released_at: r.released_at, product: r.product, version: r.version,
        kind: r.kind, text: r.text, snippet: r.snippet,
      }))));
    } else if (results.length === 0) {
      console.log('(no results)');
    } else {
      for (const r of results) {
        console.log(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]`);
        console.log(`  ${r.snippet}`);
      }
      console.log(`\n${results.length} result${results.length === 1 ? '' : 's'}`);
    }
    db.close();
  });

program
  .command('env-var <name>')
  .description('Find when an env var was introduced or last changed')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((name: string, opts: { db: string }) => {
    const db = openTrackedDb(opts.db);
    if (warnIfEmpty(db)) { db.close(); return; }
    const results = lookupEntity(db, 'env_var', name);
    if (program.opts().json) {
      console.log(JSON.stringify(results.map(r => ({
        released_at: r.released_at, product: r.product, version: r.version,
        kind: r.kind, text: r.text,
      }))));
    } else {
      printEntityResults(name, 'env var', results);
    }
    db.close();
  });

program
  .command('command <slash>')
  .description('Find a slash command\'s history')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((slash: string, opts: { db: string }) => {
    const db = openTrackedDb(opts.db);
    if (warnIfEmpty(db)) { db.close(); return; }
    const normalized = slash.startsWith('/') ? slash : '/' + slash;
    const results = lookupEntity(db, 'slash_command', normalized);
    if (program.opts().json) {
      console.log(JSON.stringify(results.map(r => ({
        released_at: r.released_at, product: r.product, version: r.version,
        kind: r.kind, text: r.text,
      }))));
    } else {
      printEntityResults(normalized, 'slash command', results);
    }
    db.close();
  });

program
  .command('model <id>')
  .description('Find a Claude model ID\'s history (deprecations, launches)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((id: string, opts: { db: string }) => {
    const db = openTrackedDb(opts.db);
    if (warnIfEmpty(db)) { db.close(); return; }
    const results = lookupEntity(db, 'model_id', id);
    if (program.opts().json) {
      console.log(JSON.stringify(results.map(r => ({
        released_at: r.released_at, product: r.product, version: r.version,
        kind: r.kind, text: r.text,
      }))));
    } else {
      printEntityResults(id, 'model id', results);
    }
    db.close();
  });

program
  .command('cve <id>')
  .description('Find releases mentioning a specific CVE')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((id: string, opts: { db: string }) => {
    const db = openTrackedDb(opts.db);
    if (warnIfEmpty(db)) { db.close(); return; }
    const results = lookupEntity(db, 'cve', id);
    if (program.opts().json) {
      console.log(JSON.stringify(results.map(r => ({
        released_at: r.released_at, product: r.product, version: r.version,
        kind: r.kind, text: r.text,
      }))));
    } else {
      printEntityResults(id, 'CVE', results);
    }
    db.close();
  });

program
  .command('seed-markers')
  .description('Seed fetch markers from the current DB state (run once after study-swarm to enable incremental fetch)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((opts: { db: string }) => {
    const db = openTrackedDb(opts.db);
    initSchema(db);
    const results = seedMarkersFromDb(db);
    for (const r of results) {
      console.log(`${r.product.padEnd(35)} ${r.seededTo ? '→ ' + r.seededTo.split('T')[0] : '(no releases on disk)'}`);
    }
    console.log(`\n✓ seeded ${results.filter((r) => r.seededTo).length} marker${results.filter((r) => r.seededTo).length === 1 ? '' : 's'}`);
    db.close();
  });

program
  .command('fetch')
  .description('Pull new GitHub releases since last sync (Tier 1 sources only — 10 SDK/CLI products)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .option('-r, --products-root <path>', 'products dir root', DEFAULT_PRODUCTS)
  .option('-p, --product <name>', 'limit to one product')
  .option('--since <iso>', 'override the stored marker (YYYY-MM-DD or full ISO)')
  .action(async (opts: { db: string; productsRoot: string; product?: string; since?: string }) => {
    const db = openTrackedDb(opts.db);
    initSchema(db);
    try {
      const stats = await fetchAll(db, opts.productsRoot, {
        product: opts.product,
        sinceOverride: opts.since,
        onProgress: makeFetchProgressWriter(),
      });
      // Per-product detail to stdout
      for (const s of stats) {
        const status = s.fetched > 0 ? `+${s.fetched} new` : `current (since ${s.newSince})`;
        console.log(`${s.product.padEnd(35)} ${status}${s.latest ? `  latest: ${s.latest.split('T')[0]}` : ''}`);
      }
      // Consolidated summary
      if (program.opts().json) {
        console.log(JSON.stringify({ stats, summary: stats.summary }));
      } else {
        printFetchSummary(stats.summary);
      }
      // Exit code 3 = partial success (some products failed, others succeeded)
      if (stats.summary.failed > 0 && stats.summary.succeeded > 0) {
        process.exitCode = 3;
      } else if (stats.summary.failed > 0 && stats.summary.succeeded === 0) {
        process.exitCode = 2;
      }
    } finally {
      db.close();
    }
  });

program
  .command('sync')
  .description('Run fetch → ingest → embed in sequence (for daily cron / GH Action)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .option('-r, --products-root <path>', 'products dir', DEFAULT_PRODUCTS)
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
      db: string;
      productsRoot: string;
      skipFetch?: boolean;
      skipEmbed?: boolean;
      context: ContextProviderName;
      embedProvider: EmbedProviderName;
    }) => {
      const db = openTrackedDb(opts.db);
      initSchema(db);
      const t0 = Date.now();
      try {
        if (!opts.skipFetch) {
          process.stderr.write('=== fetch ===\n');
          const stats = await fetchAll(db, opts.productsRoot, {
            onProgress: makeFetchProgressWriter(),
          });
          if (program.opts().json) {
            // JSON summary deferred to final output
          } else {
            printFetchSummary(stats.summary);
          }
        }
        process.stderr.write('\n=== ingest ===\n');
        const { ingestAll } = await import('./ingest.js');
        const ingestStats = ingestAll(db, opts.productsRoot);
        console.log(`ingested ${ingestStats.releasesAdded} releases, ${ingestStats.changesAdded} changes, ${ingestStats.entitiesAdded} entities`);

        if (!opts.skipEmbed) {
          process.stderr.write('\n=== embed ===\n');
          const embedStats = await embedAll(db, {
            contextProviderName: opts.context,
            embeddingProviderName: opts.embedProvider,
            onProgress: (p) => {
              const prov = p.provider ? ` [${p.provider}]` : '';
              const tokens = p.tokensUsed != null ? ` ${fmtNum(p.tokensUsed)} tokens` : '';
              const reqs = p.requestsMade != null ? ` ${p.requestsMade} reqs` : '';
              process.stderr.write(`  Embedding batch ${p.batchesCompleted}/${p.batchesTotal} (${p.chunksCompleted}/${p.chunksTotal} chunks)${prov}${tokens}${reqs}\n`);
            },
          });
          console.log(`embedded ${embedStats.chunksCreated} new chunks via ${embedStats.contextProvider} + ${embedStats.embeddingProvider}`);
        }
        console.log(`\n✓ sync complete in ${Date.now() - t0}ms`);
      } catch (e: any) {
        const appErr = new AppError({
          code: 'SYNC_FAILED',
          message: `sync failed: ${e.message}`,
          hint: 'Check network connectivity and API credentials. Re-run with --verbose for details.',
          cause: e.message,
          retryable: true,
        });
        if (program.opts().json) {
          console.log(JSON.stringify(appErr.toJSON()));
        } else {
          console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
        }
        process.exit(2);
      } finally {
        db.close();
      }
    }
  );

program
  .command('embed')
  .description('Generate contextual chunks + embeddings (Tier 2b — opt-in semantic layer)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
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
      db: string;
      context: ContextProviderName;
      embed: EmbedProviderName;
      product?: string;
      limit?: string;
      batchSize: string;
      force?: boolean;
    }) => {
    const db = openTrackedDb(opts.db);
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
      console.log(`✓ embedded ${stats.chunksCreated} chunks in ${stats.totalMs}ms`);
      console.log(`  context provider: ${stats.contextProvider} (${stats.contextMs}ms total)`);
      console.log(`  embedding model:  ${stats.embeddingProvider} (${stats.embedMs}ms total)`);
      if (stats.chunksCreated === 0) {
        console.log(`  (nothing to do — all changes already embedded; use --force to re-embed)`);
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
      if (program.opts().json) {
        console.log(JSON.stringify(appErr.toJSON()));
      } else {
        console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
      process.exit(2);
    } finally {
      db.close();
    }
  });

program
  .command('hybrid <text>')
  .description('Hybrid FTS5 + sqlite-vec search via RRF, optional rerank (requires `hk embed` first)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .option('-p, --product <name>', 'limit to one product')
  .option('-s, --since <date>', 'YYYY-MM-DD lower bound')
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
        db: string;
        product?: string;
        since?: string;
        kind?: string;
        embed: EmbedProviderName;
        rerank: RerankProviderName;
        limit: string;
        topK: string;
        rerankCandidates: string;
      }
    ) => {
    const db = openTrackedDb(opts.db);
    try {
      const t0 = Date.now();
      const results = await hybridSearch(db, text, {
        product: opts.product,
        since: opts.since,
        kind: opts.kind,
        embedProviderName: opts.embed,
        rerankProviderName: opts.rerank,
        limit: intOpt('limit', opts.limit, 10),
        topK: intOpt('top-k', opts.topK, 60),
        rerankCandidates: intOpt('rerank-candidates', opts.rerankCandidates, 20),
      });
      const ms = Date.now() - t0;
      if (program.opts().json) {
        console.log(JSON.stringify(results.map(r => ({
          released_at: r.released_at, product: r.product, version: r.version,
          kind: r.kind, text: r.text, rrf_score: r.rrf_score,
          rerank_score: r.rerank_score,
        }))));
      } else if (results.length === 0) {
        console.log('(no results)');
      } else {
        for (const r of results) {
          const bm = r.bm25_rank ? `bm25#${r.bm25_rank}` : '       ';
          const vec = r.vec_rank ? `vec#${r.vec_rank}` : '      ';
          const rerank = r.rerank_score !== null ? ` rerank=${r.rerank_score.toFixed(2)}` : '';
          console.log(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]  ${bm} ${vec} rrf=${r.rrf_score.toFixed(4)}${rerank}`);
          console.log(`  ${r.text.slice(0, 200)}${r.text.length > 200 ? '…' : ''}`);
        }
        console.log(`\n${results.length} result${results.length === 1 ? '' : 's'} in ${ms}ms (rerank: ${opts.rerank})`);
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
        console.log(JSON.stringify(appErr.toJSON()));
      } else {
        console.error(formatError(appErr, LOG_LEVELS[logLevel] >= LOG_LEVELS.verbose));
      }
      process.exit(2);
    } finally {
      db.close();
    }
  });

program
  .command('latest')
  .description('Recent releases across all products (or one)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .option('-p, --product <name>', 'limit to one product')
  .option('-l, --limit <n>', 'max results', '20')
  .action((opts: { db: string; product?: string; limit: string }) => {
    const db = openTrackedDb(opts.db);
    if (warnIfEmpty(db)) { db.close(); return; }
    const releases = recentReleases(db, opts.product, intOpt('limit', opts.limit, 20));
    if (program.opts().json) {
      console.log(JSON.stringify(releases));
    } else if (releases.length === 0) {
      console.log('(no releases)');
    } else {
      for (const r of releases) {
        console.log(`${r.released_at}  ${r.product}@${r.version}  (${r.change_count} change${r.change_count === 1 ? '' : 's'})`);
      }
    }
    db.close();
  });

program
  .command('products')
  .description('List all products in the DB with release counts')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((opts: { db: string }) => {
    const db = openTrackedDb(opts.db);
    if (warnIfEmpty(db)) { db.close(); return; }
    const products = listProducts(db);
    if (program.opts().json) {
      console.log(JSON.stringify(products));
    } else if (products.length === 0) {
      console.log('(no products)');
    } else {
      console.log('Product                              Releases  Latest');
      console.log('───────────────────────────────────  ────────  ──────────────────');
      for (const p of products) {
        const latest = p.latest_version ? `${p.latest_version} (${p.latest_date})` : '—';
        console.log(`${p.name.padEnd(36)} ${String(p.release_count).padStart(8)}  ${latest}`);
      }
    }
    db.close();
  });

program
  .command('top <entity-type>')
  .description('Most-mentioned entities of a type (env_var, slash_command, cli_option, model_id, beta_header, cve, ghsa, hook_event, setting_key)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .option('-l, --limit <n>', 'max results', '30')
  .action((entityType: string, opts: { db: string; limit: string }) => {
    const db = openTrackedDb(opts.db);
    if (warnIfEmpty(db)) { db.close(); return; }
    const results = entityFrequency(db, entityType, intOpt('limit', opts.limit, 30));
    if (program.opts().json) {
      console.log(JSON.stringify(results));
    } else if (results.length === 0) {
      console.log(`(no entities of type "${entityType}")`);
    } else {
      for (const r of results) {
        console.log(`${String(r.count).padStart(4)}  ${r.first_seen ?? '????-??-??'}  ${r.value}`);
      }
    }
    db.close();
  });

function printEntityResults(name: string, label: string, results: ReturnType<typeof lookupEntity>) {
  if (results.length === 0) {
    console.log(`(${label} not found: ${name})`);
    return;
  }
  console.log(`${label} ${name} — ${results.length} mention${results.length === 1 ? '' : 's'}:\n`);
  for (const r of results) {
    console.log(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]`);
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
