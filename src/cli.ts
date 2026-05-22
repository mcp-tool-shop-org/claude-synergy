#!/usr/bin/env node
import { Command } from 'commander';
import { join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { openDb, initSchema } from './db.js';
import { ingestAll } from './ingest.js';
import { searchChanges, lookupEntity, recentReleases, listProducts, entityFrequency } from './query.js';
import { embedAll } from './embed.js';
import { hybridSearch } from './hybrid.js';
import { fetchAll, listFetchTargets, seedMarkersFromDb } from './fetch.js';

const cwd = process.cwd();
const DEFAULT_DB = join(cwd, 'data', 'claude-synergy.db');
const DEFAULT_PRODUCTS = join(cwd, 'products');

const program = new Command();
program
  .name('hk')
  .description('Claude Synergy — local Anthropic changelog mirror + cross-product synergies')
  .version('0.1.0')
  .enablePositionalOptions();

program
  .command('init')
  .description('Create the database file with the current schema')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((opts: { db: string }) => {
    const db = openDb(opts.db);
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
    const db = openDb(opts.db);
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
    if (process.env.HK_DEBUG) {
      console.error(`[debug] text=${JSON.stringify(text)} opts=${JSON.stringify(opts)}`);
    }
    const db = openDb(opts.db);
    const q = text;
    let results;
    try {
      results = searchChanges(db, q, {
        product: opts.product,
        since: opts.since,
        kind: opts.kind,
        limit: parseInt(opts.limit, 10),
      });
    } catch (e: any) {
      console.error(`✗ query failed: ${e.message}`);
      console.error(`  query: ${q}`);
      console.error(`  hint: FTS5 syntax — use double quotes for phrase: hk query '"AskUserQuestion"' or use plain words: hk query AskUserQuestion`);
      db.close();
      process.exit(1);
    }
    if (results.length === 0) {
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
    const db = openDb(opts.db);
    const results = lookupEntity(db, 'env_var', name);
    printEntityResults(name, 'env var', results);
    db.close();
  });

program
  .command('command <slash>')
  .description('Find a slash command\'s history')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((slash: string, opts: { db: string }) => {
    const db = openDb(opts.db);
    const normalized = slash.startsWith('/') ? slash : '/' + slash;
    const results = lookupEntity(db, 'slash_command', normalized);
    printEntityResults(normalized, 'slash command', results);
    db.close();
  });

program
  .command('model <id>')
  .description('Find a Claude model ID\'s history (deprecations, launches)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((id: string, opts: { db: string }) => {
    const db = openDb(opts.db);
    const results = lookupEntity(db, 'model_id', id);
    printEntityResults(id, 'model id', results);
    db.close();
  });

program
  .command('cve <id>')
  .description('Find releases mentioning a specific CVE')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((id: string, opts: { db: string }) => {
    const db = openDb(opts.db);
    const results = lookupEntity(db, 'cve', id);
    printEntityResults(id, 'CVE', results);
    db.close();
  });

program
  .command('seed-markers')
  .description('Seed fetch markers from the current DB state (run once after study-swarm to enable incremental fetch)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((opts: { db: string }) => {
    const db = openDb(opts.db);
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
    const db = openDb(opts.db);
    initSchema(db);
    try {
      const stats = await fetchAll(db, opts.productsRoot, {
        product: opts.product,
        sinceOverride: opts.since,
      });
      let totalFetched = 0;
      for (const s of stats) {
        const status = s.fetched > 0 ? `+${s.fetched} new` : `current (since ${s.newSince})`;
        console.log(`${s.product.padEnd(35)} ${status}${s.latest ? `  latest: ${s.latest.split('T')[0]}` : ''}`);
        for (const e of s.errors) console.log(`  ✗ ${e}`);
        totalFetched += s.fetched;
      }
      console.log(`\n✓ fetched ${totalFetched} new release${totalFetched === 1 ? '' : 's'} across ${stats.length} product${stats.length === 1 ? '' : 's'}`);
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
  .option('-c, --context <provider>', 'context provider for embed', 'structured')
  .option('-e, --embed-provider <provider>', 'embedding provider', 'ollama')
  .action(async (opts: { db: string; productsRoot: string; skipFetch?: boolean; skipEmbed?: boolean; context: string; embedProvider: string }) => {
    const db = openDb(opts.db);
    initSchema(db);
    const t0 = Date.now();
    try {
      if (!opts.skipFetch) {
        console.log('=== fetch ===');
        const stats = await fetchAll(db, opts.productsRoot);
        const total = stats.reduce((sum, s) => sum + s.fetched, 0);
        console.log(`fetched ${total} new release${total === 1 ? '' : 's'}`);
      }
      console.log('\n=== ingest ===');
      const { ingestAll } = await import('./ingest.js');
      const ingestStats = ingestAll(db, opts.productsRoot);
      console.log(`ingested ${ingestStats.releasesAdded} releases, ${ingestStats.changesAdded} changes, ${ingestStats.entitiesAdded} entities`);

      if (!opts.skipEmbed) {
        console.log('\n=== embed ===');
        const embedStats = await embedAll(db, {
          contextProviderName: opts.context as any,
          embeddingProviderName: opts.embedProvider as any,
        });
        console.log(`embedded ${embedStats.chunksCreated} new chunks via ${embedStats.contextProvider} + ${embedStats.embeddingProvider}`);
      }
      console.log(`\n✓ sync complete in ${Date.now() - t0}ms`);
    } catch (e: any) {
      console.error(`✗ sync failed: ${e.message}`);
      process.exit(1);
    } finally {
      db.close();
    }
  });

program
  .command('embed')
  .description('Generate contextual chunks + embeddings (Tier 2b — opt-in semantic layer)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .option('-c, --context <provider>', 'context provider: none | structured | ollama | claude-haiku', 'structured')
  .option('-e, --embed <provider>', 'embedding provider: ollama | voyage', 'ollama')
  .option('-p, --product <name>', 'limit to one product')
  .option('-l, --limit <n>', 'embed at most N pending chunks (testing)')
  .option('--batch-size <n>', 'embedding batch size', '64')
  .option('--force', 'recompute even if chunk already exists')
  .action(async (opts: { db: string; context: string; embed: string; product?: string; limit?: string; batchSize: string; force?: boolean }) => {
    const db = openDb(opts.db);
    try {
      const stats = await embedAll(db, {
        contextProviderName: opts.context as any,
        embeddingProviderName: opts.embed as any,
        product: opts.product,
        limit: opts.limit ? parseInt(opts.limit, 10) : undefined,
        batchSize: parseInt(opts.batchSize, 10),
        force: opts.force,
      });
      console.log(`✓ embedded ${stats.chunksCreated} chunks in ${stats.totalMs}ms`);
      console.log(`  context provider: ${stats.contextProvider} (${stats.contextMs}ms total)`);
      console.log(`  embedding model:  ${stats.embeddingProvider} (${stats.embedMs}ms total)`);
      if (stats.chunksCreated === 0) {
        console.log(`  (nothing to do — all changes already embedded; use --force to re-embed)`);
      }
    } catch (e: any) {
      console.error(`✗ embed failed: ${e.message}`);
      if (e.message.includes('Ollama') || e.message.includes('11434')) {
        console.error(`  hint: start Ollama with 'ollama serve' and pull the model: 'ollama pull nomic-embed-text'`);
      }
      process.exit(1);
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
  .option('-e, --embed <provider>', 'embedding provider for query', 'ollama')
  .option('-r, --rerank <provider>', 'rerank provider: none | ollama-judge | voyage | cohere', 'none')
  .option('-l, --limit <n>', 'max results', '10')
  .option('--top-k <n>', 'per-channel pull before fusion', '60')
  .option('--rerank-candidates <n>', 'how many RRF candidates to rerank', '20')
  .action(async (text: string, opts: { db: string; product?: string; since?: string; kind?: string; embed: string; rerank: string; limit: string; topK: string; rerankCandidates: string }) => {
    const db = openDb(opts.db);
    try {
      const t0 = Date.now();
      const results = await hybridSearch(db, text, {
        product: opts.product,
        since: opts.since,
        kind: opts.kind,
        embedProviderName: opts.embed as any,
        rerankProviderName: opts.rerank as any,
        limit: parseInt(opts.limit, 10),
        topK: parseInt(opts.topK, 10),
        rerankCandidates: parseInt(opts.rerankCandidates, 10),
      });
      const ms = Date.now() - t0;
      if (results.length === 0) {
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
      console.error(`✗ hybrid query failed: ${e.message}`);
      if (e.message.includes('Ollama') || e.message.includes('11434')) {
        console.error(`  hint: start Ollama and pull the embedding model (and rerank model if using ollama-judge)`);
      }
      process.exit(1);
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
    const db = openDb(opts.db);
    const releases = recentReleases(db, opts.product, parseInt(opts.limit, 10));
    for (const r of releases) {
      console.log(`${r.released_at}  ${r.product}@${r.version}  (${r.change_count} change${r.change_count === 1 ? '' : 's'})`);
    }
    db.close();
  });

program
  .command('products')
  .description('List all products in the DB with release counts')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .action((opts: { db: string }) => {
    const db = openDb(opts.db);
    const products = listProducts(db);
    console.log('Product                              Releases  Latest');
    console.log('───────────────────────────────────  ────────  ──────────────────');
    for (const p of products) {
      const latest = p.latest_version ? `${p.latest_version} (${p.latest_date})` : '—';
      console.log(`${p.name.padEnd(36)} ${String(p.release_count).padStart(8)}  ${latest}`);
    }
    db.close();
  });

program
  .command('top <entity-type>')
  .description('Most-mentioned entities of a type (env_var, slash_command, cli_option, model_id, beta_header, cve, ghsa, hook_event, setting_key)')
  .option('-d, --db <path>', 'database path', DEFAULT_DB)
  .option('-l, --limit <n>', 'max results', '30')
  .action((entityType: string, opts: { db: string; limit: string }) => {
    const db = openDb(opts.db);
    const results = entityFrequency(db, entityType, parseInt(opts.limit, 10));
    if (results.length === 0) {
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

program.parseAsync(process.argv);
