// MCP registry catalog fetchers (Tier 4 catalog strategy).
//
// Covers two registries today:
//   - Official MCP Registry: registry.modelcontextprotocol.io (cursor pagination)
//   - Smithery Registry: registry.smithery.ai (page-numbered pagination, ~5,400 servers)
//
// Deferred: Glama (HTML scrape), GitHub MCP Registry (different API), PulseMCP, mcp.so.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export interface CatalogEntry {
  /** Stable filesystem-safe slug */
  slug: string;
  name: string;
  description: string;
  /** Homepage URL or registry detail page */
  homepage: string | null;
  /** Smithery has useCount; Official Registry doesn't expose popularity */
  popularity: number | null;
  /** ISO 8601 created/published timestamp if available */
  createdAt: string | null;
  /** Source registry */
  source: 'official-mcp-registry' | 'smithery';
  /** Optional category tag */
  category: string | null;
  /** Verified-by-registry flag (Smithery) */
  verified: boolean | null;
}

export interface CatalogFetchResult {
  source: string;
  entriesFetched: number;
  productDir: string;
  catalogPath: string;
}

const UA = { 'user-agent': 'claude-synergy/0.1.0', accept: 'application/json' };

// ─── Official MCP Registry ─────────────────────────────────────────────────

interface OfficialServerEntry {
  server: {
    name: string;
    description?: string;
    title?: string;
    version?: string;
    remotes?: Array<{ type: string; url: string }>;
  };
  _meta?: Record<string, any>;
}

interface OfficialResponse {
  servers: OfficialServerEntry[];
  metadata?: { nextCursor?: string; count?: number };
}

/**
 * Fetch the Official MCP Registry. Paginates via cursor; returns latest-version entries only
 * (the registry exposes one row per version, so we dedupe by name keeping isLatest=true).
 */
export async function fetchOfficialMcpRegistry(opts: { maxPages?: number } = {}): Promise<CatalogEntry[]> {
  const maxPages = opts.maxPages ?? 50;
  const limit = 100;
  let cursor: string | undefined;
  const byName = new Map<string, CatalogEntry>();

  for (let page = 0; page < maxPages; page++) {
    const url = `https://registry.modelcontextprotocol.io/v0/servers?limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error(`Official MCP Registry ${res.status}`);
    const json = (await res.json()) as OfficialResponse;
    if (!Array.isArray(json.servers)) break;

    for (const item of json.servers) {
      const s = item.server;
      if (!s?.name) continue;
      const meta = item._meta?.['io.modelcontextprotocol.registry/official'];
      const isLatest = meta?.isLatest === true;
      // Keep the latest version per name. If we haven't seen this name yet OR the existing
      // entry is non-latest and this one IS, replace.
      const existing = byName.get(s.name);
      if (existing && !isLatest) continue;
      byName.set(s.name, {
        slug: slugify(s.name),
        name: s.title ?? s.name,
        description: (s.description ?? '').trim(),
        homepage: s.remotes?.[0]?.url ?? null,
        popularity: null,
        createdAt: meta?.publishedAt ?? null,
        source: 'official-mcp-registry',
        category: null,
        verified: null,
      });
    }

    const next = json.metadata?.nextCursor;
    if (!next || next === cursor) break;
    cursor = next;
  }

  return [...byName.values()];
}

// ─── Smithery Registry ──────────────────────────────────────────────────────

interface SmitheryServer {
  id: string;
  qualifiedName: string;
  namespace: string;
  displayName: string;
  description: string;
  iconUrl?: string;
  verified?: boolean;
  useCount?: number;
  remote?: boolean;
  isDeployed?: boolean;
  createdAt?: string;
  homepage?: string;
  bySmithery?: boolean;
  owner?: string;
  score?: number | null;
}

interface SmitheryResponse {
  servers: SmitheryServer[];
  pagination?: { currentPage: number; pageSize: number; totalPages: number; totalCount: number };
}

/**
 * Fetch the Smithery Registry. Page-numbered pagination.
 * Smithery has thousands of servers; `maxEntries` caps the pull (default 200, top by useCount).
 */
export async function fetchSmitheryRegistry(opts: { maxEntries?: number; pageSize?: number } = {}): Promise<CatalogEntry[]> {
  const pageSize = opts.pageSize ?? 100;
  const maxEntries = opts.maxEntries ?? 200;
  const out: CatalogEntry[] = [];
  let page = 1;

  while (out.length < maxEntries) {
    const url = `https://registry.smithery.ai/servers?page=${page}&pageSize=${pageSize}`;
    const res = await fetch(url, { headers: UA });
    if (!res.ok) throw new Error(`Smithery Registry ${res.status}`);
    const json = (await res.json()) as SmitheryResponse;
    if (!Array.isArray(json.servers) || json.servers.length === 0) break;

    for (const s of json.servers) {
      if (out.length >= maxEntries) break;
      out.push({
        slug: slugify(s.qualifiedName ?? s.namespace ?? s.id),
        name: s.displayName ?? s.qualifiedName,
        description: (s.description ?? '').trim(),
        homepage: s.homepage ?? null,
        popularity: typeof s.useCount === 'number' ? s.useCount : null,
        createdAt: s.createdAt ?? null,
        source: 'smithery',
        category: null,
        verified: s.verified ?? null,
      });
    }

    const total = json.pagination?.totalPages ?? 1;
    if (page >= total) break;
    page++;
  }

  // Sort by popularity desc when available — most-used servers first
  out.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));

  return out;
}

// ─── Writer ─────────────────────────────────────────────────────────────────

/**
 * Write CATALOG.md for the given entries. Currently doesn't produce per-entry files
 * (volume control); a future iteration may add `entries/` for the top-N most popular.
 */
export function writeCatalog(productDir: string, productName: string, entries: CatalogEntry[]): CatalogFetchResult {
  mkdirSync(productDir, { recursive: true });
  const catalogPath = join(productDir, 'CATALOG.md');

  const lines: string[] = [];
  lines.push(`# ${productName} — MCP server catalog`);
  lines.push('');
  lines.push(`**Source:** ${entries[0]?.source ?? 'unknown'}`);
  lines.push(`**Entries:** ${entries.length}`);
  lines.push(`**Fetched:** ${new Date().toISOString().split('T')[0]}`);
  lines.push('');
  lines.push('| Name | Description | Popularity | Created | Homepage |');
  lines.push('|------|-------------|------------|---------|----------|');
  for (const e of entries) {
    const desc = (e.description.split('\n')[0] ?? '').slice(0, 160).replace(/\|/g, '\\|');
    const pop = e.popularity != null ? String(e.popularity) : '—';
    const date = e.createdAt ? e.createdAt.split('T')[0] : '—';
    const home = e.homepage ? `[link](${e.homepage})` : '—';
    const name = e.name.replace(/\|/g, '\\|');
    lines.push(`| ${name} | ${desc} | ${pop} | ${date} | ${home} |`);
  }
  lines.push('');

  writeFileSync(catalogPath, lines.join('\n'), 'utf-8');

  return {
    source: entries[0]?.source ?? 'unknown',
    entriesFetched: entries.length,
    productDir,
    catalogPath,
  };
}

// ─── helpers ────────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export type CatalogType = 'official-mcp-registry' | 'smithery';

export async function fetchCatalog(
  catalogType: CatalogType,
  opts: { maxEntries?: number; maxPages?: number } = {}
): Promise<CatalogEntry[]> {
  switch (catalogType) {
    case 'official-mcp-registry':
      return fetchOfficialMcpRegistry({ maxPages: opts.maxPages });
    case 'smithery':
      return fetchSmitheryRegistry({ maxEntries: opts.maxEntries });
  }
}
