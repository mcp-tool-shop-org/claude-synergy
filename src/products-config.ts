// YAML-driven products config. Single source of truth for product metadata + fetcher
// dispatch. Loaded from `products.yaml` at repo root; falls back to legacy hardcoded
// data (with a one-time stderr warn) if the file is missing.
//
// Consumed by:
//   - src/fetch.ts (TARGETS array — only products with a `fetch:` block)
//   - src/ingest.ts (PRODUCT_META map — all products including catalog-only)

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface ProductMeta {
  /** Slug used as filesystem dir name + DB key. */
  name: string;
  display_name: string;
  source_tier: number;
  source_url: string;
  fetch_strategy: string;
  notes: string | null;
}

export type FetchType = 'gh-releases' | 'rss' | 'raw-changelog' | 'html-scrape' | 'catalog' | 'playwright';

export interface FetchTarget {
  product: string;
  strategy: FetchType;
  // gh-releases
  repo?: string;
  multiPackage?: boolean;
  // rss
  rssUrl?: string;
  rssTitleFilter?: RegExp;
  // raw-changelog
  rawChangelogUrl?: string;
  rawChangelogParser?: 'aider-history';
  // html-scrape
  htmlParser?: 'github-copilot-blog' | 'vscode-updates' | 'windsurf-changelog';
}

export interface ProductsConfig {
  productMeta: Record<string, ProductMeta>;
  fetchTargets: FetchTarget[];
}

interface RawYaml {
  products?: Array<{
    name: string;
    display_name: string;
    tier: number;
    source_url: string;
    fetch_strategy: string;
    notes?: string;
    fetch?: {
      type: FetchType;
      repo?: string;
      multi_package?: boolean;
      url?: string;
      title_filter?: string;
      parser?: string;
      catalog_type?: 'official-mcp-registry' | 'smithery';
      max_entries?: number;
    };
  }>;
}

let warnedAboutMissingYaml = false;

/**
 * Load products config. Tries products.yaml at the repo root; on absence,
 * returns null so callers can fall back to hardcoded defaults.
 */
export function loadProductsConfig(yamlPath?: string): ProductsConfig | null {
  const resolved = yamlPath ?? resolveYamlPath();
  if (!resolved || !existsSync(resolved)) {
    if (!warnedAboutMissingYaml) {
      console.error(`[claude-synergy] products.yaml not found at ${resolved}; using hardcoded defaults`);
      warnedAboutMissingYaml = true;
    }
    return null;
  }

  let raw: string;
  try {
    raw = readFileSync(resolved, 'utf-8');
  } catch (e: any) {
    console.error(`[claude-synergy] could not read ${resolved}: ${e.message}; using hardcoded defaults`);
    return null;
  }

  // Strip a UTF-8 BOM if present
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);

  let parsed: RawYaml;
  try {
    parsed = parseYaml(raw) as RawYaml;
  } catch (e: any) {
    throw new Error(`[claude-synergy] products.yaml parse error: ${e.message}`);
  }

  if (!parsed || !Array.isArray(parsed.products)) {
    throw new Error(`[claude-synergy] products.yaml missing required 'products' array`);
  }

  const productMeta: Record<string, ProductMeta> = {};
  const fetchTargets: FetchTarget[] = [];

  for (const p of parsed.products) {
    if (!p.name || !p.display_name) {
      throw new Error(`[claude-synergy] products.yaml entry missing name/display_name: ${JSON.stringify(p)}`);
    }
    productMeta[p.name] = {
      name: p.name,
      display_name: p.display_name,
      source_tier: p.tier ?? 1,
      source_url: p.source_url ?? '',
      fetch_strategy: p.fetch_strategy ?? 'gh-releases',
      notes: p.notes ?? null,
    };

    if (p.fetch) {
      const target = buildFetchTarget(p.name, p.fetch);
      if (target) fetchTargets.push(target);
    }
  }

  return { productMeta, fetchTargets };
}

function buildFetchTarget(name: string, fetch: NonNullable<RawYaml['products']>[number]['fetch']): FetchTarget | null {
  if (!fetch) return null;

  const target: FetchTarget = { product: name, strategy: fetch.type };

  switch (fetch.type) {
    case 'gh-releases':
      if (!fetch.repo) throw new Error(`[claude-synergy] ${name}: gh-releases requires 'repo'`);
      target.repo = fetch.repo;
      if (fetch.multi_package) target.multiPackage = true;
      break;

    case 'rss':
      if (!fetch.url) throw new Error(`[claude-synergy] ${name}: rss requires 'url'`);
      target.rssUrl = fetch.url;
      if (fetch.title_filter) {
        try {
          target.rssTitleFilter = new RegExp(fetch.title_filter, 'i');
        } catch (e: any) {
          throw new Error(`[claude-synergy] ${name}: invalid rss title_filter regex: ${e.message}`);
        }
      }
      break;

    case 'raw-changelog':
      if (!fetch.url) throw new Error(`[claude-synergy] ${name}: raw-changelog requires 'url'`);
      if (!fetch.parser) throw new Error(`[claude-synergy] ${name}: raw-changelog requires 'parser'`);
      target.rawChangelogUrl = fetch.url;
      target.rawChangelogParser = fetch.parser as 'aider-history';
      break;

    case 'html-scrape':
      if (!fetch.parser) throw new Error(`[claude-synergy] ${name}: html-scrape requires 'parser'`);
      target.htmlParser = fetch.parser as FetchTarget['htmlParser'];
      break;

    case 'catalog':
      if (!fetch.catalog_type) throw new Error(`[claude-synergy] ${name}: catalog requires 'catalog_type'`);
      (target as any).catalogType = fetch.catalog_type;
      if (fetch.max_entries) (target as any).catalogMaxEntries = fetch.max_entries;
      break;

    case 'playwright':
      // No additional config — the playwright fetcher today is hardcoded to Windsurf;
      // future versions may accept a `target_url` or `parser` for multiple CSR sites.
      break;

    default:
      throw new Error(`[claude-synergy] ${name}: unknown fetch type ${(fetch as any).type}`);
  }

  return target;
}

function resolveYamlPath(): string | null {
  // Try repo root relative to compiled bin location, then cwd
  const candidates = [
    join(__dirname, '..', 'products.yaml'),
    join(process.cwd(), 'products.yaml'),
  ];
  for (const p of candidates) {
    try {
      readFileSync(p);
      return p;
    } catch {
      // continue
    }
  }
  return candidates[0]; // return first as the "where we looked" path
}

/** Test helper: clear the one-shot warned-flag so tests can verify the warn fires. */
export function resetWarnedFlag(): void {
  warnedAboutMissingYaml = false;
}
