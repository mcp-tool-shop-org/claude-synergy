#!/usr/bin/env node
// MCP server exposing claude-synergy queries to other Claude agents
// (Claude Code sessions, Agent SDK apps, Cowork plugins, etc).
//
// Run via stdio:
//   claude-synergy-mcp                              # uses ./data/claude-synergy.db
//   CLAUDE_SYNERGY_DB=path/to/file.db claude-synergy-mcp
//
// In Claude Code .mcp.json:
//   {
//     "mcpServers": {
//       "claude-synergy": {
//         "command": "claude-synergy-mcp",
//         "env": { "CLAUDE_SYNERGY_DB": "E:/AI/claude-synergy/data/claude-synergy.db" }
//       }
//     }
//   }

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import matter from 'gray-matter';
import { openDb } from './db.js';
import {
  searchChanges,
  lookupEntity,
  recentReleases,
  listProducts,
  entityFrequency,
  browseChanges,
  getChangesSince,
  compareVersions,
  listSynergies,
  getSynergy,
  getSyncStatus,
  type ChangesSinceResult,
  type QueryResult,
  type SyncStatusRow,
} from './query.js';
import { hybridSearch } from './hybrid.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Single-source-of-truth version from package.json (avoids hardcoded drift).
const _require = createRequire(import.meta.url);
const { version: PKG_VERSION } = _require('../package.json') as { version: string };

// Synergy names: lowercase + digits + dash/underscore (filenames on disk).
const SYNERGY_NAME_RE = /^[a-z0-9_-]+$/i;

const DB_PATH =
  process.env.CLAUDE_SYNERGY_DB ??
  process.argv[2] ??
  join(process.cwd(), 'data', 'claude-synergy.db');

const SYNERGIES_DIR =
  process.env.CLAUDE_SYNERGY_SYNERGIES_DIR ??
  resolveSynergiesDir();

// Where sync_now writes new release files. Defaults to <db-parent>/../products so
// the usual layout (data/claude-synergy.db + products/<slug>/releases/*.md) works
// without configuration. Override via env for tests or non-standard layouts.
const PRODUCTS_ROOT =
  process.env.CLAUDE_SYNERGY_PRODUCTS_ROOT ??
  join(dirname(DB_PATH), '..', 'products');

function resolveSynergiesDir(): string {
  // Try repo-root/synergies relative to DB, then cwd
  const dbDir = dirname(DB_PATH);
  const candidates = [
    join(dbDir, '..', 'synergies'),
    join(process.cwd(), 'synergies'),
    join(__dirname, '..', 'synergies'),
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return candidates[0];
}

if (!existsSync(DB_PATH)) {
  console.error(
    `claude-synergy-mcp: DB not found at ${DB_PATH}. Run 'hk init && hk ingest && hk embed' first, or set CLAUDE_SYNERGY_DB.`
  );
  process.exit(1);
}

const db = openDb(DB_PATH);
const hasChunks =
  db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='chunks'`).get() !== undefined;

const server = new Server(
  { name: 'claude-synergy', version: PKG_VERSION },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search',
      description:
        'Search the Anthropic product changelog corpus. Use mode=hybrid (default, requires embeddings) for semantic/conceptual queries; mode=fts for exact keyword/phrase matching. Returns ranked changelog bullets with product+version+date metadata.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query. Natural language works for hybrid; FTS5 syntax for fts mode.' },
          mode: { type: 'string', enum: ['hybrid', 'fts'], description: 'hybrid = FTS5+vec via RRF (best for concepts); fts = BM25 only (best for exact terms)', default: 'hybrid' },
          product: { type: 'string', description: 'Limit to one product (e.g. claude-code, claude-agent-sdk-python, anthropic-cli)' },
          since: { type: 'string', description: 'YYYY-MM-DD lower bound on release date' },
          until: { type: 'string', description: 'YYYY-MM-DD upper bound on release date' },
          kind: { type: 'string', description: 'Filter by change kind: added | fixed | breaking | deprecated | renamed | removed | improved | changed' },
          rerank: { type: 'string', enum: ['none', 'ollama-judge'], description: 'Rerank top-K candidates (hybrid mode only). Defaults to none for speed.', default: 'none' },
          limit: { type: 'number', description: 'Max results (default 10)', default: 10 },
        },
        required: ['query'],
      },
    },
    {
      name: 'lookup_entity',
      description:
        'Find every release that mentions a specific entity: env var, slash command, CLI option, model ID, beta header, hook event, CVE, GHSA. Returns chronological history of mentions across products.',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['env_var', 'slash_command', 'cli_option', 'model_id', 'beta_header', 'hook_event', 'setting_key', 'cve', 'ghsa'],
            description: 'Entity type',
          },
          value: { type: 'string', description: 'Exact entity value (e.g. CLAUDE_CODE_WORKFLOWS, /code-review, claude-opus-4-7, CVE-2025-66414)' },
        },
        required: ['type', 'value'],
      },
    },
    {
      name: 'latest_releases',
      description: 'Get recent releases across all products (or one). Use this to orient on what shipped recently before recommending features.',
      inputSchema: {
        type: 'object',
        properties: {
          product: { type: 'string', description: 'Limit to one product' },
          since: { type: 'string', description: 'YYYY-MM-DD lower bound on release date' },
          limit: { type: 'number', description: 'Max releases', default: 20 },
        },
      },
    },
    {
      name: 'get_release',
      description: 'Full content of one specific release (all change bullets + metadata).',
      inputSchema: {
        type: 'object',
        properties: {
          product: { type: 'string' },
          version: { type: 'string' },
        },
        required: ['product', 'version'],
      },
    },
    {
      name: 'list_products',
      description: 'Enumerate products in the database with release counts and date of latest release. Use this for orientation.',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'top_entities',
      description: 'Most-mentioned entities of a given type (e.g. top env vars, top slash commands). Useful for "what env vars exist in Claude Code".',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['env_var', 'slash_command', 'cli_option', 'model_id', 'beta_header', 'hook_event', 'setting_key', 'cve', 'ghsa'],
          },
          limit: { type: 'number', default: 30 },
        },
        required: ['type'],
      },
    },
    {
      name: 'list_synergies',
      description: 'List curated cross-product workflows (Claude Design ↔ Code bundle, MCP server portability, etc). Each synergy describes a composition pattern with evidence.',
      inputSchema: {
        type: 'object',
        properties: {
          product: { type: 'string', description: 'Filter to synergies that mention this product (e.g. claude-code)' },
        },
      },
    },
    {
      name: 'read_synergy',
      description: 'Read one synergy file in full. Use after list_synergies to drill into a specific pattern.',
      inputSchema: {
        type: 'object',
        properties: { name: { type: 'string', description: 'Synergy name from list_synergies (e.g. skill-portability)' } },
        required: ['name'],
      },
    },
    {
      name: 'get_changes_since',
      description:
        'Get all changes in a date window, grouped by product+version. The LLM-orientation tool: "what shipped in the last 7 days" without needing a search term. Use this before recommending features to know the current ground truth.',
      inputSchema: {
        type: 'object',
        properties: {
          since: { type: 'string', description: 'Lower bound — YYYY-MM-DD, full ISO, or relative (e.g. 7d, 2w, 1m, 1y)' },
          until: { type: 'string', description: 'Upper bound — YYYY-MM-DD, full ISO, or relative; defaults to now' },
          product: { type: 'string', description: 'Limit to one product' },
          kind: { type: 'string', description: 'Filter by change kind: added | fixed | breaking | deprecated | renamed | removed | improved | changed' },
          limit: { type: 'number', description: 'Max change rows returned (default 200)', default: 200 },
        },
        required: ['since'],
      },
    },
    {
      name: 'search_breaking_changes',
      description:
        'Browse breaking changes in a date window. No search term required — returns all changes with kind=breaking, most recent first. Use this for upgrade-planning and migration workflows.',
      inputSchema: {
        type: 'object',
        properties: {
          product: { type: 'string', description: 'Limit to one product' },
          since: { type: 'string', description: 'Lower bound — YYYY-MM-DD, full ISO, or relative (e.g. 7d)' },
          until: { type: 'string', description: 'Upper bound — YYYY-MM-DD, full ISO, or relative; defaults to now' },
          limit: { type: 'number', description: 'Max results (default 50)', default: 50 },
        },
      },
    },
    {
      name: 'compare_versions',
      description:
        'Cumulative diff between two versions of a product, grouped by intermediate release. Use for upgrade planning ("I am on python 0.88.0, what changed through 0.94.0?"). Single call replaces N+1 get_release lookups.',
      inputSchema: {
        type: 'object',
        properties: {
          product: { type: 'string', description: 'Product slug (e.g. anthropic-sdk-python)' },
          from_version: { type: 'string', description: 'Starting version, exclusive (you are already on this)' },
          to_version: { type: 'string', description: 'Target version, inclusive' },
        },
        required: ['product', 'from_version', 'to_version'],
      },
    },
    {
      name: 'sync_status',
      description:
        'Per-product sync freshness. Returns one row per product with last-fetched timestamp, hours since last fetch, and ingested release count. Use BEFORE trusting latest_releases / search results to know if the corpus is stale, and BEFORE calling sync_now to know what needs refreshing.',
      inputSchema: {
        type: 'object',
        properties: {
          product: { type: 'string', description: 'Limit to one product' },
          stale_only: { type: 'boolean', description: 'Only return products older than stale_hours (or never fetched)', default: false },
          stale_hours: { type: 'number', description: 'Threshold for stale_only (default 24)', default: 24 },
        },
      },
    },
    {
      name: 'sync_now',
      description:
        'Refresh the corpus by running fetch → ingest → embed (mirrors `hk sync`). Pass dry_run=true to enumerate what would be fetched without writes. By default runs the full pipeline so new releases are immediately queryable via search/lookup_entity. Concurrency: rejected with InvalidParams if another sync_now is already in flight. Does NOT commit to git — caller decides.',
      inputSchema: {
        type: 'object',
        properties: {
          product: { type: 'string', description: 'Limit to one product' },
          dry_run: { type: 'boolean', description: 'Enumerate targets and report what would be fetched, no writes', default: false },
          include_ingest: { type: 'boolean', description: 'Run ingest step after fetch (default true)', default: true },
          include_embed: { type: 'boolean', description: 'Run embed step after ingest (requires Ollama; default true)', default: true },
          timeout_ms: { type: 'number', description: 'Hard timeout for the entire sync (default 300000 = 5 min, max 600000)', default: 300000 },
        },
      },
    },
  ],
}));

// ── argument guards ───────────────────────────────────────────────────────
// Per-handler validation. We treat `arguments` as `unknown` and narrow with
// shape checks before passing into typed handlers. This replaces the previous
// `args as any` casts which would have let malformed clients crash deep in
// query/hybrid layers.

const SEARCH_MODES = new Set(['hybrid', 'fts']);
const RERANK_MODES = new Set(['none', 'ollama-judge']);
const ENTITY_TYPES = new Set([
  'env_var',
  'slash_command',
  'cli_option',
  'model_id',
  'beta_header',
  'hook_event',
  'setting_key',
  'cve',
  'ghsa',
]);

function asRecord(args: unknown, tool: string): Record<string, unknown> {
  if (args === null || typeof args !== 'object' || Array.isArray(args)) {
    throw new McpError(ErrorCode.InvalidParams, `${tool}: arguments must be an object`);
  }
  return args as Record<string, unknown>;
}

function requireString(rec: Record<string, unknown>, field: string, tool: string): string {
  const v = rec[field];
  if (typeof v !== 'string' || v.length === 0) {
    throw new McpError(ErrorCode.InvalidParams, `${tool}: ${field} must be a non-empty string`);
  }
  return v;
}

function optString(rec: Record<string, unknown>, field: string, tool: string): string | undefined {
  const v = rec[field];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, `${tool}: ${field} must be a string`);
  }
  return v;
}

function optInt(
  rec: Record<string, unknown>,
  field: string,
  tool: string,
  min = 1,
  max = 10_000
): number | undefined {
  const v = rec[field];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'number' || !Number.isFinite(v) || !Number.isInteger(v) || v < min || v > max) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `${tool}: ${field} must be an integer in [${min}, ${max}]`
    );
  }
  return v;
}

function optBool(rec: Record<string, unknown>, field: string, tool: string): boolean | undefined {
  const v = rec[field];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'boolean') {
    throw new McpError(ErrorCode.InvalidParams, `${tool}: ${field} must be a boolean`);
  }
  return v;
}

function optEnum<T extends string>(
  rec: Record<string, unknown>,
  field: string,
  allowed: Set<string>,
  tool: string
): T | undefined {
  const v = rec[field];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'string' || !allowed.has(v)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `${tool}: ${field} must be one of ${[...allowed].join(', ')}`
    );
  }
  return v as T;
}

// ── Server-level timeout ─────────────────────────────────────────────────────
// Prevents a hung embedding provider from blocking the entire MCP server.
const SEARCH_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new McpError(ErrorCode.InternalError, message)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'search': {
        const r = asRecord(args, 'search');
        const searchResult = await withTimeout(
          handleSearch({
            query: requireString(r, 'query', 'search'),
            mode: optEnum<'hybrid' | 'fts'>(r, 'mode', SEARCH_MODES, 'search'),
            product: optString(r, 'product', 'search'),
            since: optString(r, 'since', 'search'),
            until: optString(r, 'until', 'search'),
            kind: optString(r, 'kind', 'search'),
            rerank: optEnum<'none' | 'ollama-judge'>(r, 'rerank', RERANK_MODES, 'search'),
            limit: optInt(r, 'limit', 'search'),
          }),
          SEARCH_TIMEOUT_MS,
          'search timed out (30s) — is the embedding provider (Ollama) running?',
        );
        return {
          content: [{ type: 'text', text: searchResult }],
        };
      }
      case 'lookup_entity': {
        const r = asRecord(args, 'lookup_entity');
        const type = requireString(r, 'type', 'lookup_entity');
        if (!ENTITY_TYPES.has(type)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `lookup_entity: type must be one of ${[...ENTITY_TYPES].join(', ')}`
          );
        }
        return {
          content: [
            {
              type: 'text',
              text: handleLookupEntity({ type, value: requireString(r, 'value', 'lookup_entity') }),
            },
          ],
        };
      }
      case 'latest_releases': {
        const r = asRecord(args ?? {}, 'latest_releases');
        return {
          content: [
            {
              type: 'text',
              text: handleLatestReleases({
                product: optString(r, 'product', 'latest_releases'),
                since: optString(r, 'since', 'latest_releases'),
                limit: optInt(r, 'limit', 'latest_releases'),
              }),
            },
          ],
        };
      }
      case 'get_release': {
        const r = asRecord(args, 'get_release');
        return {
          content: [
            {
              type: 'text',
              text: handleGetRelease({
                product: requireString(r, 'product', 'get_release'),
                version: requireString(r, 'version', 'get_release'),
              }),
            },
          ],
        };
      }
      case 'list_products':
        return { content: [{ type: 'text', text: handleListProducts() }] };
      case 'top_entities': {
        const r = asRecord(args, 'top_entities');
        const type = requireString(r, 'type', 'top_entities');
        if (!ENTITY_TYPES.has(type)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `top_entities: type must be one of ${[...ENTITY_TYPES].join(', ')}`
          );
        }
        return {
          content: [
            {
              type: 'text',
              text: handleTopEntities({ type, limit: optInt(r, 'limit', 'top_entities') }),
            },
          ],
        };
      }
      case 'list_synergies': {
        const r = asRecord(args ?? {}, 'list_synergies');
        return {
          content: [
            {
              type: 'text',
              text: handleListSynergies({ product: optString(r, 'product', 'list_synergies') }),
            },
          ],
        };
      }
      case 'read_synergy': {
        const r = asRecord(args, 'read_synergy');
        const synName = requireString(r, 'name', 'read_synergy');
        if (!SYNERGY_NAME_RE.test(synName)) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'read_synergy: name must match /^[a-z0-9_-]+$/i'
          );
        }
        return { content: [{ type: 'text', text: handleReadSynergy({ name: synName }) }] };
      }
      case 'get_changes_since': {
        const r = asRecord(args, 'get_changes_since');
        return {
          content: [
            {
              type: 'text',
              text: handleGetChangesSince({
                since: requireString(r, 'since', 'get_changes_since'),
                until: optString(r, 'until', 'get_changes_since'),
                product: optString(r, 'product', 'get_changes_since'),
                kind: optString(r, 'kind', 'get_changes_since'),
                limit: optInt(r, 'limit', 'get_changes_since'),
              }),
            },
          ],
        };
      }
      case 'search_breaking_changes': {
        const r = asRecord(args ?? {}, 'search_breaking_changes');
        return {
          content: [
            {
              type: 'text',
              text: handleSearchBreakingChanges({
                product: optString(r, 'product', 'search_breaking_changes'),
                since: optString(r, 'since', 'search_breaking_changes'),
                until: optString(r, 'until', 'search_breaking_changes'),
                limit: optInt(r, 'limit', 'search_breaking_changes'),
              }),
            },
          ],
        };
      }
      case 'compare_versions': {
        const r = asRecord(args, 'compare_versions');
        return {
          content: [
            {
              type: 'text',
              text: handleCompareVersions({
                product: requireString(r, 'product', 'compare_versions'),
                from_version: requireString(r, 'from_version', 'compare_versions'),
                to_version: requireString(r, 'to_version', 'compare_versions'),
              }),
            },
          ],
        };
      }
      case 'sync_status': {
        const r = asRecord(args ?? {}, 'sync_status');
        return {
          content: [
            {
              type: 'text',
              text: handleSyncStatus({
                product: optString(r, 'product', 'sync_status'),
                staleOnly: optBool(r, 'stale_only', 'sync_status'),
                staleHours: optInt(r, 'stale_hours', 'sync_status', 1, 100_000),
              }),
            },
          ],
        };
      }
      case 'sync_now': {
        const r = asRecord(args ?? {}, 'sync_now');
        const text = await handleSyncNow({
          product: optString(r, 'product', 'sync_now'),
          dryRun: optBool(r, 'dry_run', 'sync_now'),
          includeIngest: optBool(r, 'include_ingest', 'sync_now'),
          includeEmbed: optBool(r, 'include_embed', 'sync_now'),
          timeoutMs: optInt(r, 'timeout_ms', 'sync_now', 1_000, 600_000),
        });
        return { content: [{ type: 'text', text }] };
      }
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (e: any) {
    if (e instanceof McpError) throw e;
    throw new McpError(ErrorCode.InternalError, e.message);
  }
});

async function handleSearch(args: { query: string; mode?: 'hybrid' | 'fts'; product?: string; since?: string; until?: string; kind?: string; rerank?: 'none' | 'ollama-judge'; limit?: number }): Promise<string> {
  const mode = args.mode ?? 'hybrid';
  const limit = args.limit ?? 10;

  if (mode === 'fts') {
    const results = searchChanges(db, args.query, {
      product: args.product,
      since: args.since,
      until: args.until,
      kind: args.kind,
      limit,
    });
    return formatSearchResults(results.map((r) => ({
      product: r.product,
      version: r.version,
      released_at: r.released_at,
      kind: r.kind,
      text: r.text,
      mode: 'fts',
    })));
  }

  // mode === 'hybrid'. Refuse to silently fall back to FTS — clients asking
  // for semantic search deserve a clear contract failure they can catch.
  if (!hasChunks) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'hybrid mode requires embeddings — run `hk embed` first, or pass mode="fts"'
    );
  }

  const results = await hybridSearch(db, args.query, {
    product: args.product,
    since: args.since,
    until: args.until,
    kind: args.kind,
    rerankProviderName: args.rerank ?? 'none',
    limit,
  });
  return formatSearchResults(results.map((r) => ({
    product: r.product,
    version: r.version,
    released_at: r.released_at,
    kind: r.kind,
    text: r.text,
    mode: 'hybrid',
    rrf_score: r.rrf_score,
    rerank_score: r.rerank_score,
  })));
}

function formatSearchResults(results: any[]): string {
  if (results.length === 0) return '(no results)';
  const lines: string[] = [];
  for (const r of results) {
    const scoreInfo = r.rerank_score != null ? ` rerank=${r.rerank_score.toFixed(2)}` : r.rrf_score != null ? ` rrf=${r.rrf_score.toFixed(4)}` : '';
    lines.push(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]${scoreInfo}`);
    lines.push(`  ${r.text}`);
    lines.push('');
  }
  lines.push(`${results.length} result${results.length === 1 ? '' : 's'}`);
  return lines.join('\n');
}

function handleLookupEntity(args: { type: string; value: string }): string {
  const results = lookupEntity(db, args.type, args.value);
  if (results.length === 0) return `(no mentions of ${args.type}: ${args.value})`;
  const lines = [`${args.type} ${args.value} — ${results.length} mention${results.length === 1 ? '' : 's'}:\n`];
  for (const r of results) {
    lines.push(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]`);
    lines.push(`  ${r.text}`);
    lines.push('');
  }
  return lines.join('\n');
}

function handleLatestReleases(args: { product?: string; since?: string; limit?: number }): string {
  const limit = args.limit ?? 20;
  const releases = recentReleases(db, args.product, limit, args.since);
  if (releases.length === 0) return '(no releases)';
  return releases
    .map((r) => `${r.released_at}  ${r.product}@${r.version}  (${r.change_count} change${r.change_count === 1 ? '' : 's'})`)
    .join('\n');
}

function handleGetRelease(args: { product: string; version: string }): string {
  const release = db
    .prepare(`SELECT product, version, released_at, source_url, notes_path FROM releases WHERE product = ? AND version = ?`)
    .get(args.product, args.version) as any;
  if (!release) return `(no such release: ${args.product}@${args.version})`;
  const changes = db
    .prepare(`SELECT ordinal, kind, text FROM changes WHERE product = ? AND version = ? ORDER BY ordinal`)
    .all(args.product, args.version) as any[];
  const lines = [
    `# ${release.product} ${release.version}`,
    `Released: ${release.released_at}`,
    `Source: ${release.source_url}`,
    `Notes file: ${release.notes_path}`,
    ``,
    `## Changes (${changes.length})`,
    ``,
  ];
  for (const c of changes) {
    lines.push(`- [${c.kind}] ${c.text}`);
  }
  return lines.join('\n');
}

function handleListProducts(): string {
  const products = listProducts(db);
  if (products.length === 0) return '(no products)';
  const lines = [
    'Product                              Releases  Latest',
    '───────────────────────────────────  ────────  ──────────────────',
  ];
  for (const p of products) {
    const latest = p.latest_version ? `${p.latest_version} (${p.latest_date})` : '—';
    lines.push(`${p.name.padEnd(36)} ${String(p.release_count).padStart(8)}  ${latest}`);
  }
  return lines.join('\n');
}

function handleTopEntities(args: { type: string; limit?: number }): string {
  const results = entityFrequency(db, args.type, args.limit ?? 30);
  if (results.length === 0) return `(no entities of type ${args.type})`;
  return results
    .map((r) => `${String(r.count).padStart(4)}  ${r.first_seen ?? '????-??-??'}  ${r.value}`)
    .join('\n');
}

// ── Synergy handlers ───────────────────────────────────────────────────────
// Prefer DB-backed reads (populated by `ingestSynergies()` in CORE). Fall
// back to filesystem when the DB tables are empty — "lazy migration": existing
// installs that haven't re-ingested still get an answer.

function dbSynergiesEmpty(): boolean {
  try {
    const row = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='synergies'`)
      .get();
    if (!row) return true;
    const count = db.prepare(`SELECT COUNT(*) AS n FROM synergies`).get() as { n: number } | undefined;
    return !count || count.n === 0;
  } catch {
    return true;
  }
}

function handleListSynergies(args: { product?: string } = {}): string {
  // Try DB first
  if (!dbSynergiesEmpty()) {
    try {
      const rows = listSynergies(db, args.product ? { product: args.product } : undefined);
      if (rows.length === 0) {
        return args.product
          ? `(no synergies mention product "${args.product}")`
          : '(no synergies)';
      }
      const lines = [`Synergies (${rows.length}):\n`];
      for (const s of rows as any[]) {
        const name = s.name ?? '';
        const title = s.title ?? name;
        const products = Array.isArray(s.products)
          ? s.products.join(', ')
          : (s.products as string | undefined) ?? 'unknown';
        const trigger = (s.trigger as string | undefined) ?? '';
        lines.push(`- ${name}: ${title}`);
        lines.push(`    products: ${products}`);
        if (trigger) lines.push(`    trigger:  ${trigger}`);
        lines.push('');
      }
      return lines.join('\n');
    } catch {
      // fall through to filesystem
    }
  }
  // Filesystem fallback
  return listSynergiesFromDisk(args.product);
}

function listSynergiesFromDisk(productFilter?: string): string {
  if (!existsSync(SYNERGIES_DIR)) return '(synergies dir not found)';
  const files = readdirSync(SYNERGIES_DIR).filter((f) => f.endsWith('.md') && f !== 'INDEX.md');
  if (files.length === 0) return '(no synergies)';
  const lines: string[] = [];
  let count = 0;
  for (const f of files) {
    try {
      const raw = readFileSync(join(SYNERGIES_DIR, f), 'utf-8');
      const { data } = matter(raw);
      const products = Array.isArray(data.products) ? (data.products as string[]) : [];
      if (productFilter && !products.includes(productFilter)) continue;
      const name = (data.name as string) ?? f.replace(/\.md$/, '');
      const title = (data.title as string) ?? name;
      const trigger = (data.trigger as string) ?? '';
      lines.push(`- ${name}: ${title}`);
      lines.push(`    products: ${products.length > 0 ? products.join(', ') : 'unknown'}`);
      if (trigger) lines.push(`    trigger:  ${trigger}`);
      lines.push('');
      count += 1;
    } catch {}
  }
  if (count === 0) {
    return productFilter
      ? `(no synergies mention product "${productFilter}")`
      : '(no synergies)';
  }
  return [`Synergies (${count}):\n`, ...lines].join('\n');
}

function handleReadSynergy(args: { name: string }): string {
  // Defense-in-depth recheck (upstream also validates)
  if (!SYNERGY_NAME_RE.test(args.name)) {
    return `(synergy not found: ${args.name})`;
  }
  // Try DB first
  if (!dbSynergiesEmpty()) {
    try {
      const synergy = getSynergy(db, args.name) as any;
      if (synergy && synergy.body) {
        return synergy.body as string;
      }
    } catch {
      // fall through to filesystem
    }
  }
  // Filesystem fallback
  if (!existsSync(SYNERGIES_DIR)) return `(synergy not found: ${args.name})`;
  const files = readdirSync(SYNERGIES_DIR).filter((f) => f.endsWith('.md'));
  const targetFile = files.find((f) => basename(f, '.md') === args.name);
  if (targetFile) {
    return readFileSync(join(SYNERGIES_DIR, targetFile), 'utf-8');
  }
  for (const f of files) {
    try {
      const raw = readFileSync(join(SYNERGIES_DIR, f), 'utf-8');
      const { data } = matter(raw);
      if (data.name === args.name) return raw;
    } catch {}
  }
  return `(synergy not found: ${args.name})`;
}

// ── New tool handlers (Wave 1: get_changes_since / search_breaking_changes / compare_versions) ──

function formatChangesSinceResults(results: ChangesSinceResult[]): string {
  if (results.length === 0) {
    return '(no changes in window — try widening --since)';
  }
  const lines: string[] = [];
  let total = 0;
  for (const rel of results) {
    const date = rel.released_at ?? '????-??-??';
    lines.push(`${date}  ${rel.product}@${rel.version}  (${rel.changes.length} change${rel.changes.length === 1 ? '' : 's'})`);
    for (const c of rel.changes) {
      lines.push(`  - [${c.kind}] ${c.text}`);
    }
    lines.push('');
    total += rel.changes.length;
  }
  lines.push(`${total} change${total === 1 ? '' : 's'} across ${results.length} release${results.length === 1 ? '' : 's'}`);
  return lines.join('\n');
}

function handleGetChangesSince(args: { since: string; until?: string; product?: string; kind?: string; limit?: number }): string {
  let results: ChangesSinceResult[];
  try {
    results = getChangesSince(db, {
      since: args.since,
      until: args.until,
      product: args.product,
      kind: args.kind,
      limit: args.limit ?? 200,
    });
  } catch (e: any) {
    throw new McpError(ErrorCode.InvalidParams, `get_changes_since: ${e.message}`);
  }
  return formatChangesSinceResults(results);
}

function handleSearchBreakingChanges(args: { product?: string; since?: string; until?: string; limit?: number }): string {
  let results: QueryResult[];
  try {
    results = browseChanges(db, {
      product: args.product,
      since: args.since,
      until: args.until,
      kind: 'breaking',
      limit: args.limit ?? 50,
    });
  } catch (e: any) {
    throw new McpError(ErrorCode.InvalidParams, `search_breaking_changes: ${e.message}`);
  }
  if (results.length === 0) {
    return '(no breaking changes — note: ingest may not have classified any changes as breaking yet)';
  }
  const lines: string[] = [];
  for (const r of results) {
    lines.push(`${r.released_at ?? '????-??-??'}  ${r.product}@${r.version}  [${r.kind}]`);
    lines.push(`  ${r.text}`);
    lines.push('');
  }
  lines.push(`${results.length} breaking change${results.length === 1 ? '' : 's'}`);
  return lines.join('\n');
}

// ── Sync handlers ──────────────────────────────────────────────────────────
// sync_status is pure SQL → fast, no I/O beyond DB.
// sync_now mutates: writes release files to PRODUCTS_ROOT, ingests into DB,
// optionally generates embeddings. Guarded by an in-process lock so two
// concurrent MCP calls cannot race on the same SQLite WAL.

function formatHours(h: number | null): string {
  if (h == null) return 'never';
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 48) return `${h.toFixed(1)}h`;
  return `${Math.round(h / 24)}d`;
}

function handleSyncStatus(args: { product?: string; staleOnly?: boolean; staleHours?: number }): string {
  const rows: SyncStatusRow[] = getSyncStatus(db, {
    product: args.product,
    staleOnly: args.staleOnly,
    staleHours: args.staleHours,
  });
  if (rows.length === 0) {
    return args.staleOnly
      ? `(no stale products — threshold ${args.staleHours ?? 24}h)`
      : '(no products in DB — run `hk ingest` first)';
  }
  const lines = [
    'Product                              Strategy        Last fetch  Hours  Ingested  Latest release',
    '───────────────────────────────────  ──────────────  ──────────  ─────  ────────  ──────────────',
  ];
  for (const r of rows) {
    const product = (r.product ?? '').padEnd(36);
    const strategy = (r.fetch_strategy ?? '—').padEnd(14);
    const lastFetch = r.last_fetch_attempt ? r.last_fetch_attempt.split('T')[0] : 'never     ';
    const hours = formatHours(r.hours_since_fetch).padStart(5);
    const ingested = String(r.releases_ingested).padStart(8);
    const latest = r.last_release_at ? r.last_release_at.split('T')[0] : '—';
    lines.push(`${product} ${strategy} ${lastFetch}  ${hours}  ${ingested}  ${latest}`);
  }
  lines.push('');
  lines.push(`${rows.length} product${rows.length === 1 ? '' : 's'}`);
  return lines.join('\n');
}

// Module-level lock — second concurrent sync_now call rejects rather than
// races on the SQLite WAL. Reset in finally{} so a thrown error doesn't
// leave the lock stuck.
let syncInProgress = false;

interface SyncNowArgs {
  product?: string;
  dryRun?: boolean;
  includeIngest?: boolean;
  includeEmbed?: boolean;
  timeoutMs?: number;
}

async function handleSyncNow(args: SyncNowArgs): Promise<string> {
  if (syncInProgress) {
    throw new McpError(
      ErrorCode.InvalidParams,
      'sync_now: another sync is already in progress — retry after it completes (or call sync_status to see progress)',
    );
  }

  const dryRun = args.dryRun ?? false;
  const includeIngest = args.includeIngest ?? true;
  const includeEmbed = args.includeEmbed ?? true;
  const timeoutMs = args.timeoutMs ?? 300_000;

  // Lazy-load fetch/ingest/embed so the MCP startup stays light for sessions
  // that never call sync_now.
  const { fetchAll, listFetchTargets } = await import('./fetch.js');

  // dry_run: just enumerate targets + their current markers, no writes.
  if (dryRun) {
    const targets = args.product
      ? listFetchTargets().filter((t) => t.product === args.product)
      : listFetchTargets();
    if (targets.length === 0) {
      throw new McpError(ErrorCode.InvalidParams, `sync_now: unknown product: ${args.product}`);
    }
    const lines = [`(dry_run — would fetch ${targets.length} product${targets.length === 1 ? '' : 's'})`, ''];
    for (const t of targets) {
      const marker = db
        .prepare(`SELECT version FROM markers WHERE product = ? AND name = 'last_fetched_release_at'`)
        .get(t.product) as { version: string } | undefined;
      const since = marker?.version ?? '2026-01-01 (no marker)';
      lines.push(`  ${t.product.padEnd(36)} ${t.strategy.padEnd(14)} since ${since}`);
    }
    return lines.join('\n');
  }

  syncInProgress = true;
  const t0 = Date.now();
  try {
    // === fetch ===
    const fetchStats = await fetchAll(db, PRODUCTS_ROOT, {
      product: args.product,
      timeoutMs,
    });
    const fetched = fetchStats.summary;

    // === ingest ===
    let ingestSummary = '';
    if (includeIngest) {
      const { ingestAll } = await import('./ingest.js');
      const ingestStats = ingestAll(db, PRODUCTS_ROOT);
      ingestSummary = `ingested: +${ingestStats.releasesAdded} releases, +${ingestStats.changesAdded} changes, +${ingestStats.entitiesAdded} entities`;
    }

    // === embed === (best-effort — Ollama may be unreachable)
    let embedSummary = '';
    let embedError = '';
    if (includeEmbed) {
      try {
        const { embedAll } = await import('./embed.js');
        const embedStats = await embedAll(db, {
          contextProviderName: 'structured',
          embeddingProviderName: 'ollama',
        });
        embedSummary = `embedded: +${embedStats.chunksCreated} chunks via ${embedStats.contextProvider} + ${embedStats.embeddingProvider}`;
      } catch (e: any) {
        embedError = `embed skipped: ${e.message ?? String(e)}`;
      }
    }

    const elapsedMs = Date.now() - t0;
    const lines = [
      `sync_now complete in ${(elapsedMs / 1000).toFixed(1)}s`,
      '',
      `fetched: ${fetched.succeeded}/${fetched.total} products ok, ${fetched.failed} failed, ${fetched.skipped} skipped, +${fetched.newChanges} new releases`,
    ];
    if (fetched.errors.length > 0) {
      lines.push('');
      lines.push('fetch errors:');
      for (const e of fetched.errors.slice(0, 10)) {
        lines.push(`  ${e.product}: ${e.error}`);
      }
      if (fetched.errors.length > 10) lines.push(`  … ${fetched.errors.length - 10} more`);
    }
    if (ingestSummary) lines.push(ingestSummary);
    if (embedSummary) lines.push(embedSummary);
    if (embedError) lines.push(embedError);
    return lines.join('\n');
  } finally {
    syncInProgress = false;
  }
}

function handleCompareVersions(args: { product: string; from_version: string; to_version: string }): string {
  let results: ChangesSinceResult[];
  try {
    results = compareVersions(db, {
      product: args.product,
      fromVersion: args.from_version,
      toVersion: args.to_version,
    });
  } catch (e: any) {
    throw new McpError(ErrorCode.InvalidParams, `compare_versions: ${e.message}`);
  }
  if (results.length === 0) {
    return `(no intermediate releases between ${args.product}@${args.from_version} and ${args.product}@${args.to_version})`;
  }
  return formatChangesSinceResults(results);
}

// ── Graceful shutdown ────────────────────────────────────────────────────────
// Close DB and exit cleanly on signals or MCP transport disconnect.
function shutdownMcp(): void {
  try { db.close(); } catch { /* best-effort */ }
  process.exit(0);
}

server.onclose = shutdownMcp;
process.on('SIGINT', shutdownMcp);
process.on('SIGTERM', shutdownMcp);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`claude-synergy-mcp ready (db: ${DB_PATH}, vec: ${hasChunks ? 'on' : 'off'})`);
