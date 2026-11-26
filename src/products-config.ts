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
import { AppError } from './errors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Product slugs are used as filesystem directory names + SQLite keys.
 * Restrict to lowercase alphanumerics + hyphens so we can't end up with
 * '../' or whitespace in a name that later flows into path joins or SQL.
 */
const PRODUCT_NAME_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * GitHub repo slugs (owner/repo). Both segments are restricted to the
 * characters GitHub itself allows for orgs + repos (alphanumeric + dot +
 * underscore + hyphen). Exactly one '/' between them.
 */
const GH_REPO_RE = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;

export const PRODUCTS_PACKAGES_CONFIG_ERROR = 'PRODUCTS_PACKAGES_CONFIG_ERROR';

export type PackageEcosystem = 'npm' | 'pypi' | 'crates' | 'go';

export const VALID_PACKAGE_ECOSYSTEMS: ReadonlySet<PackageEcosystem> = new Set([
  'npm',
  'pypi',
  'crates',
  'go',
]);

export interface PackageIdentity {
  ecosystem: PackageEcosystem;
  name: string;
  release_prefix: string;
}

export interface ProductMeta {
  /** Slug used as filesystem dir name + DB key. */
  name: string;
  display_name: string;
  source_tier: number;
  source_url: string;
  fetch_strategy: string;
  notes: string | null;
  packages?: PackageIdentity[];
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
  rawChangelogParser?: 'aider-history' | 'keep-a-changelog';
  // html-scrape
  htmlParser?:
    | 'github-copilot-blog'
    | 'vscode-updates'
    | 'windsurf-changelog'
    | 'claude-api-release-notes'
    | 'anthropic-apps-release-notes';
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
    packages?: unknown;
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
    if (!PRODUCT_NAME_RE.test(p.name)) {
      throw new Error(
        `[claude-synergy] products.yaml: invalid product name '${p.name}' — must match /^[a-z0-9][a-z0-9-]*$/ (lowercase alphanumeric + hyphens, no leading hyphen)`
      );
    }
    const packages = p.packages !== undefined ? validateProductPackages(p.name, p.packages) : undefined;
    productMeta[p.name] = {
      name: p.name,
      display_name: p.display_name,
      source_tier: p.tier ?? 1,
      source_url: p.source_url ?? '',
      fetch_strategy: p.fetch_strategy ?? 'gh-releases',
      notes: p.notes ?? null,
      ...(packages !== undefined ? { packages } : {}),
    };

    if (p.fetch) {
      const target = buildFetchTarget(p.name, p.fetch);
      if (target) {
        // Validate gh-releases repo shape AFTER buildFetchTarget has run its
        // own 'repo is required' check, so the order of error messages is
        // (missing repo) → (malformed repo).
        if (target.strategy === 'gh-releases' && target.repo && !GH_REPO_RE.test(target.repo)) {
          throw new Error(
            `[claude-synergy] products.yaml: ${p.name}: invalid repo '${target.repo}' — must match 'owner/repo' (alphanumeric + dot/underscore/hyphen)`
          );
        }
        fetchTargets.push(target);
      }
    }
  }

  return { productMeta, fetchTargets };
}

/**
 * Validate optional `packages:` entries on a product in `products.yaml`.
 * Throws a named AppError (`PRODUCTS_PACKAGES_CONFIG_ERROR`) on unknown
 * ecosystems, empty/whitespace package names, or malformed entry shapes.
 */
export function validateProductPackages(productName: string, rawPackages: unknown): PackageIdentity[] {
  if (!Array.isArray(rawPackages)) {
    throw new AppError({
      code: PRODUCTS_PACKAGES_CONFIG_ERROR,
      message: `[claude-synergy] products.yaml: ${productName}: 'packages' must be an array`,
      hint: 'Use packages: [{ ecosystem: "npm", name: "@scope/pkg" }] with ecosystem in npm|pypi|crates|go.',
    });
  }

  const out: PackageIdentity[] = [];
  for (let i = 0; i < rawPackages.length; i++) {
    const entry = rawPackages[i];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new AppError({
        code: PRODUCTS_PACKAGES_CONFIG_ERROR,
        message: `[claude-synergy] products.yaml: ${productName}: packages[${i}] must be an object with ecosystem and name`,
        hint: 'Each packages entry requires { ecosystem: npm|pypi|crates|go, name: "<package>" }.',
      });
    }
    const rec = entry as Record<string, unknown>;
    const eco = rec.ecosystem;
    if (typeof eco !== 'string' || !VALID_PACKAGE_ECOSYSTEMS.has(eco as PackageEcosystem)) {
      throw new AppError({
        code: PRODUCTS_PACKAGES_CONFIG_ERROR,
        message: `[claude-synergy] products.yaml: ${productName}: packages[${i}] has unknown ecosystem ${JSON.stringify(eco)} (expected one of: npm, pypi, crates, go)`,
        hint: 'Supported package ecosystems are: npm, pypi, crates, go.',
      });
    }
    const rawName = rec.name;
    const trimmed = typeof rawName === 'string' ? rawName.trim() : '';
    if (!trimmed || /\s/.test(trimmed)) {
      throw new AppError({
        code: PRODUCTS_PACKAGES_CONFIG_ERROR,
        message: `[claude-synergy] products.yaml: ${productName}: packages[${i}] name must be a non-empty string without whitespace`,
        hint: 'Provide the exact package name from the package manifest (e.g., "@anthropic-ai/sdk").',
      });
    }
    const rawPrefix = rec.release_prefix;
    if (typeof rawPrefix !== 'string') {
      throw new AppError({
        code: PRODUCTS_PACKAGES_CONFIG_ERROR,
        message: `[claude-synergy] products.yaml: ${productName}: packages[${i}] release_prefix is required and must be a string`,
        hint: 'Set release_prefix (use "" when release filenames have no prefix).',
      });
    }
    if (
      rawPrefix.includes('/') ||
      rawPrefix.includes('\\') ||
      rawPrefix.includes('.') ||
      /\s|\0/.test(rawPrefix)
    ) {
      throw new AppError({
        code: PRODUCTS_PACKAGES_CONFIG_ERROR,
        message: `[claude-synergy] products.yaml: ${productName}: packages[${i}] release_prefix ${JSON.stringify(rawPrefix)} must not contain "/", ".", or whitespace`,
        hint: 'Declare only the exact filename prefix before the version digits (e.g., "sdk-" or "").',
      });
    }
    out.push({ ecosystem: eco as PackageEcosystem, name: trimmed, release_prefix: rawPrefix });
  }
  return out;
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
      // FE-2: parser is now a closed set. Validate at load time so a typo in
      // products.yaml fails fast instead of at fetch time.
      if (fetch.parser !== 'aider-history' && fetch.parser !== 'keep-a-changelog') {
        throw new Error(
          `[claude-synergy] ${name}: raw-changelog 'parser' must be one of: aider-history, keep-a-changelog (got '${fetch.parser}')`
        );
      }
      target.rawChangelogUrl = fetch.url;
      target.rawChangelogParser = fetch.parser;
      break;

    case 'html-scrape': {
      if (!fetch.parser) throw new Error(`[claude-synergy] ${name}: html-scrape requires 'parser'`);
      const validHtmlParsers = new Set([
        'github-copilot-blog',
        'vscode-updates',
        'windsurf-changelog',
        'claude-api-release-notes',
        'anthropic-apps-release-notes',
      ]);
      if (!validHtmlParsers.has(fetch.parser)) {
        throw new Error(
          `[claude-synergy] ${name}: html-scrape 'parser' must be one of: ${[...validHtmlParsers].join(', ')} (got '${fetch.parser}')`
        );
      }
      target.htmlParser = fetch.parser as FetchTarget['htmlParser'];
      break;
    }

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
  const envYaml = process.env.CLAUDE_SYNERGY_PRODUCTS_YAML?.trim();
  if (envYaml) return envYaml;
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
