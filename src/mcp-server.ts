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
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { openDb } from './db.js';
import { searchChanges, lookupEntity, recentReleases, listProducts, entityFrequency } from './query.js';
import { hybridSearch } from './hybrid.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_PATH =
  process.env.CLAUDE_SYNERGY_DB ??
  process.argv[2] ??
  join(process.cwd(), 'data', 'claude-synergy.db');

const SYNERGIES_DIR =
  process.env.CLAUDE_SYNERGY_SYNERGIES_DIR ??
  resolveSynergiesDir();

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
  { name: 'claude-synergy', version: '0.1.0' },
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
      inputSchema: { type: 'object', properties: {} },
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
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case 'search':
        return { content: [{ type: 'text', text: await handleSearch(args as any) }] };
      case 'lookup_entity':
        return { content: [{ type: 'text', text: handleLookupEntity(args as any) }] };
      case 'latest_releases':
        return { content: [{ type: 'text', text: handleLatestReleases(args as any) }] };
      case 'get_release':
        return { content: [{ type: 'text', text: handleGetRelease(args as any) }] };
      case 'list_products':
        return { content: [{ type: 'text', text: handleListProducts() }] };
      case 'top_entities':
        return { content: [{ type: 'text', text: handleTopEntities(args as any) }] };
      case 'list_synergies':
        return { content: [{ type: 'text', text: handleListSynergies() }] };
      case 'read_synergy':
        return { content: [{ type: 'text', text: handleReadSynergy(args as any) }] };
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (e: any) {
    if (e instanceof McpError) throw e;
    throw new McpError(ErrorCode.InternalError, e.message);
  }
});

async function handleSearch(args: { query: string; mode?: 'hybrid' | 'fts'; product?: string; since?: string; kind?: string; rerank?: string; limit?: number }): Promise<string> {
  const mode = args.mode ?? 'hybrid';
  const limit = args.limit ?? 10;

  if (mode === 'fts' || !hasChunks) {
    const results = searchChanges(db, args.query, {
      product: args.product,
      since: args.since,
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

  const results = await hybridSearch(db, args.query, {
    product: args.product,
    since: args.since,
    kind: args.kind,
    rerankProviderName: (args.rerank as any) ?? 'none',
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

function handleLatestReleases(args: { product?: string; limit?: number }): string {
  const limit = args.limit ?? 20;
  const releases = recentReleases(db, args.product, limit);
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

function handleListSynergies(): string {
  if (!existsSync(SYNERGIES_DIR)) return '(synergies dir not found)';
  const files = readdirSync(SYNERGIES_DIR).filter((f) => f.endsWith('.md') && f !== 'INDEX.md');
  if (files.length === 0) return '(no synergies)';
  const lines = [`Synergies (${files.length}):\n`];
  for (const f of files) {
    try {
      const raw = readFileSync(join(SYNERGIES_DIR, f), 'utf-8');
      const { data } = matter(raw);
      const name = (data.name as string) ?? f.replace(/\.md$/, '');
      const title = (data.title as string) ?? name;
      const products = Array.isArray(data.products) ? (data.products as string[]).join(', ') : 'unknown';
      const trigger = (data.trigger as string) ?? '';
      lines.push(`- ${name}: ${title}`);
      lines.push(`    products: ${products}`);
      if (trigger) lines.push(`    trigger:  ${trigger}`);
      lines.push('');
    } catch {}
  }
  return lines.join('\n');
}

function handleReadSynergy(args: { name: string }): string {
  if (!existsSync(SYNERGIES_DIR)) return '(synergies dir not found)';
  const files = readdirSync(SYNERGIES_DIR).filter((f) => f.endsWith('.md'));
  for (const f of files) {
    const path = join(SYNERGIES_DIR, f);
    try {
      const raw = readFileSync(path, 'utf-8');
      const { data } = matter(raw);
      if (data.name === args.name || f.replace(/\.md$/, '').endsWith(args.name)) {
        return raw;
      }
    } catch {}
  }
  return `(synergy not found: ${args.name})`;
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`claude-synergy-mcp ready (db: ${DB_PATH}, vec: ${hasChunks ? 'on' : 'off'})`);
