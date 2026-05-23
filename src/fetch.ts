// Incremental release sync — fetch strategies:
//   - gh-releases:   GitHub Releases API (uniform; preferred when available)
//   - rss:           RSS 2.0 feed (Cursor, Cody Enterprise)
//   - raw-changelog: raw markdown CHANGELOG/HISTORY.md — dispatches on parser:
//                      • aider-history    (Aider HISTORY.md)
//                      • keep-a-changelog (generic Keep-a-Changelog format)
//   - html-scrape:   cheerio-based HTML parser (GitHub blog, VS Code updates)
//   - playwright:    headless Chromium for client-rendered pages (Windsurf)
//   - catalog:       MCP registry snapshots (Official + Smithery)

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type Database from 'better-sqlite3';
import { fetchRssReleases } from './fetch-rss.js';
import { fetchAiderHistory, fetchKeepAChangelog, type ChangelogParserName, type ChangelogItem } from './fetch-changelog.js';
import { fetchHtmlReleases, type HtmlParserName, type HtmlItem } from './fetch-html.js';
import { fetchCatalog, writeCatalog, type CatalogType } from './fetch-mcp-registry.js';
import { loadProductsConfig } from './products-config.js';
import { createFetchAllController, DEFAULT_FETCH_ALL_TIMEOUT_MS } from './fetch-utils.js';

// ─── Security helpers ──────────────────────────────────────────────────────
//
// All filesystem-name inputs from external sources (GH tag names, RSS slugs,
// HTML headings, Playwright DOM ids, etc.) flow through sanitizeFilename()
// before being passed to join(). External shell inputs (gh CLI `repo` field)
// flow through assertRepoShape() and are passed via execFileSync's argv path,
// not execSync's shell template.

const REPO_PATTERN = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/;
const PRODUCT_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function assertRepoShape(repo: string): void {
  if (!REPO_PATTERN.test(repo)) {
    throw new Error(
      `invalid repo: ${JSON.stringify(repo)} — expected "<org>/<repo>" with safe chars [A-Za-z0-9._-]`
    );
  }
}

function assertProductShape(product: string): void {
  if (!PRODUCT_PATTERN.test(product)) {
    throw new Error(
      `invalid product name: ${JSON.stringify(product)} — expected [a-z0-9][a-z0-9-]*`
    );
  }
}

function sanitizeFilename(s: string): string {
  const cleaned = s
    .replace(/[\/\\]/g, '-') // path separators → dash
    .replace(/^\.+/, '') // strip leading dots
    .replace(/\.\./g, '-') // strip embedded ..
    .replace(/[<>:"|?*\x00-\x1f]/g, '-') // Windows-reserved + control
    .slice(0, 100);
  // Defensive double-check: refuse to return a string that still has traversal chars.
  if (cleaned.includes('..') || cleaned.includes('/') || cleaned.includes('\\')) {
    throw new Error(`sanitizeFilename produced unsafe output: ${JSON.stringify(cleaned)}`);
  }
  return cleaned;
}

function assertSafeFilename(name: string, context: string): void {
  if (!name || name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error(`unsafe filename in ${context}: ${JSON.stringify(name)}`);
  }
}

interface GhRelease {
  tag_name: string;
  published_at: string;
  name: string | null;
  body: string | null;
  html_url: string;
}

export interface FetchTarget {
  product: string;
  strategy: 'gh-releases' | 'rss' | 'raw-changelog' | 'html-scrape' | 'catalog' | 'playwright';
  // gh-releases
  repo?: string;
  multiPackage?: boolean;
  // rss
  rssUrl?: string;
  /** Optional filter for RSS feeds that mix multiple products (e.g. Sourcegraph carries non-Cody entries) */
  rssTitleFilter?: RegExp;
  // raw-changelog
  rawChangelogUrl?: string;
  rawChangelogParser?: ChangelogParserName;
  // html-scrape
  htmlParser?: HtmlParserName;
  // catalog
  catalogType?: CatalogType;
  catalogMaxEntries?: number;
}

// Hardcoded fallback used when products.yaml is missing (e.g. in some test
// environments that exercise this module without the full repo tree).
// Single source of truth lives in products.yaml at repo root.
const HARDCODED_FALLBACK_TARGETS: FetchTarget[] = [
  // ── Existing Anthropic GH-Releases sources ────────────────────────────────
  // FE-1: claude-code is the flagship product — wired to gh-releases because the
  // repo publishes Releases whose bodies mirror CHANGELOG.md but carry real dates.
  { product: 'claude-code', strategy: 'gh-releases', repo: 'anthropics/claude-code' },
  { product: 'claude-agent-sdk-python', strategy: 'gh-releases', repo: 'anthropics/claude-agent-sdk-python' },
  { product: 'claude-agent-sdk-typescript', strategy: 'gh-releases', repo: 'anthropics/claude-agent-sdk-typescript' },
  { product: 'anthropic-cli', strategy: 'gh-releases', repo: 'anthropics/anthropic-cli' },
  { product: 'anthropic-sdk-python', strategy: 'gh-releases', repo: 'anthropics/anthropic-sdk-python' },
  { product: 'anthropic-sdk-typescript', strategy: 'gh-releases', repo: 'anthropics/anthropic-sdk-typescript', multiPackage: true },
  { product: 'anthropic-sdk-go', strategy: 'gh-releases', repo: 'anthropics/anthropic-sdk-go' },
  { product: 'anthropic-sdk-java', strategy: 'gh-releases', repo: 'anthropics/anthropic-sdk-java' },
  { product: 'anthropic-sdk-ruby', strategy: 'gh-releases', repo: 'anthropics/anthropic-sdk-ruby' },
  { product: 'anthropic-sdk-csharp', strategy: 'gh-releases', repo: 'anthropics/anthropic-sdk-csharp', multiPackage: true },
  { product: 'anthropic-sdk-php', strategy: 'gh-releases', repo: 'anthropics/anthropic-sdk-php' },
  { product: 'claude-code-action', strategy: 'gh-releases', repo: 'anthropics/claude-code-action' },
  { product: 'claude-code-security-review', strategy: 'gh-releases', repo: 'anthropics/claude-code-security-review' },

  // ── Tier 4a additions ─────────────────────────────────────────────────────
  // MCP ecosystem SDKs (modelcontextprotocol/*)
  { product: 'mcp-python-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/python-sdk' },
  { product: 'mcp-typescript-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/typescript-sdk', multiPackage: true },
  { product: 'mcp-go-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/go-sdk' },
  { product: 'mcp-java-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/java-sdk' },
  { product: 'mcp-csharp-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/csharp-sdk' },
  { product: 'mcp-kotlin-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/kotlin-sdk' },
  { product: 'mcp-ruby-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/ruby-sdk' },
  { product: 'mcp-swift-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/swift-sdk' },
  { product: 'mcp-rust-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/rust-sdk' },
  { product: 'mcp-php-sdk', strategy: 'gh-releases', repo: 'modelcontextprotocol/php-sdk' },
  { product: 'mcp-spec', strategy: 'gh-releases', repo: 'modelcontextprotocol/modelcontextprotocol' },
  { product: 'mcp-inspector', strategy: 'gh-releases', repo: 'modelcontextprotocol/inspector' },
  { product: 'mcp-registry', strategy: 'gh-releases', repo: 'modelcontextprotocol/registry' },
  { product: 'mcp-mcpb', strategy: 'gh-releases', repo: 'modelcontextprotocol/mcpb' },
  { product: 'mcp-conformance', strategy: 'gh-releases', repo: 'modelcontextprotocol/conformance' },

  // Continue.dev (multi-platform tagged releases)
  { product: 'continue-dev', strategy: 'gh-releases', repo: 'continuedev/continue', multiPackage: true },
  { product: 'continue-cli', strategy: 'gh-releases', repo: 'continuedev/continue-cli' },

  // RSS-based feeds
  { product: 'cursor', strategy: 'rss', rssUrl: 'https://cursor.com/changelog/rss.xml' },
  { product: 'cody-enterprise', strategy: 'rss', rssUrl: 'https://sourcegraph.com/changelog/featured.rss', rssTitleFilter: /cody|sourcegraph/i },

  // Raw markdown CHANGELOG
  { product: 'aider', strategy: 'raw-changelog', rawChangelogUrl: 'https://raw.githubusercontent.com/Aider-AI/aider/main/HISTORY.md', rawChangelogParser: 'aider-history' },

  // ── Tier 4b additions — HTML-scraped sources ──────────────────────────────
  { product: 'github-copilot', strategy: 'html-scrape', htmlParser: 'github-copilot-blog' },
  { product: 'vscode-copilot-chat', strategy: 'html-scrape', htmlParser: 'vscode-updates' },
  { product: 'windsurf', strategy: 'html-scrape', htmlParser: 'windsurf-changelog' },
];

// Load TARGETS from products.yaml; fall back to hardcoded if YAML is unavailable.
const TARGETS: FetchTarget[] = (loadProductsConfig()?.fetchTargets as FetchTarget[]) ?? HARDCODED_FALLBACK_TARGETS;

export interface FetchStats {
  product: string;
  fetched: number;
  newSince: string;
  latest: string | null;
  errors: string[];
}

// ─── Progress & Summary types (Stage C — behavioral humanization) ──────────

/** Emitted by fetchAll for each product as it progresses through the sync loop. */
export interface FetchProgressEvent {
  type: 'start' | 'done' | 'error' | 'skip';
  product: string;
  index: number;
  total: number;
  error?: string;
}

/** Callback signature for progress reporting. The CLI wires this to stderr. */
export type OnProgress = (event: FetchProgressEvent) => void;

/** Consolidated summary returned alongside per-product stats from fetchAll. */
export interface FetchAllSummary {
  total: number;
  succeeded: number;
  failed: number;
  skipped: number;
  newChanges: number;
  errors: Array<{ product: string; error: string }>;
}

/** FetchStats array augmented with a summary property for consolidated reporting. */
export type FetchAllResult = FetchStats[] & { summary: FetchAllSummary };

export async function fetchAll(
  db: Database.Database,
  productsRoot: string,
  opts: { product?: string; sinceOverride?: string; timeoutMs?: number; onProgress?: OnProgress } = {}
): Promise<FetchAllResult> {
  const targets = opts.product ? TARGETS.filter((t) => t.product === opts.product) : TARGETS;
  if (targets.length === 0) {
    throw new Error(`unknown product: ${opts.product} (available: ${TARGETS.map((t) => t.product).join(', ')})`);
  }

  const total = targets.length;
  const onProgress = opts.onProgress;

  // H-2: Global timeout for the entire fetchAll run. Propagates AbortSignal to all
  // individual fetches so they bail if the parent is cancelled (timeout or SIGINT).
  const globalTimeoutMs = opts.timeoutMs ?? DEFAULT_FETCH_ALL_TIMEOUT_MS;
  const { controller, signal } = createFetchAllController(globalTimeoutMs);

  const results: FetchStats[] = [];
  try {
    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];

      if (signal.aborted) {
        onProgress?.({ type: 'skip', product: target.product, index: i, total, error: 'global timeout exceeded' });
        results.push({
          product: target.product,
          fetched: 0,
          newSince: opts.sinceOverride ?? '',
          latest: null,
          errors: ['skipped: global timeout exceeded'],
        });
        continue;
      }

      onProgress?.({ type: 'start', product: target.product, index: i, total });

      const stats = await fetchOne(db, productsRoot, target, opts.sinceOverride, signal);
      results.push(stats);

      if (stats.errors.length > 0) {
        onProgress?.({ type: 'error', product: target.product, index: i, total, error: stats.errors[0] });
      } else {
        onProgress?.({ type: 'done', product: target.product, index: i, total });
      }
    }
  } finally {
    // Clean up the global timeout timer
    controller.abort();
  }

  // Augment the results array with a consolidated summary for CLI consumption.
  // The array is still iterable/indexable as FetchStats[], preserving backward compat.
  const augmented = results as FetchAllResult;
  augmented.summary = buildSummary(results);
  return augmented;
}

function buildSummary(results: FetchStats[]): FetchAllSummary {
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  let newChanges = 0;
  const errors: Array<{ product: string; error: string }> = [];

  for (const r of results) {
    const isSkipped = r.errors.some((e) => e.startsWith('skipped:'));
    const isFailed = r.errors.length > 0 && !isSkipped;

    if (isSkipped) {
      skipped++;
    } else if (isFailed) {
      failed++;
      for (const e of r.errors) {
        errors.push({ product: r.product, error: e });
      }
    } else {
      succeeded++;
    }
    newChanges += r.fetched;
  }

  return { total: results.length, succeeded, failed, skipped, newChanges, errors };
}

async function fetchOne(
  db: Database.Database,
  productsRoot: string,
  target: FetchTarget,
  sinceOverride?: string,
  signal?: AbortSignal
): Promise<FetchStats> {
  // F-004: validate product name shape before joining into a path. Defense-in-depth
  // against a malformed products.yaml entry or hardcoded fallback typo.
  assertProductShape(target.product);

  const since = sinceOverride ?? readMarker(db, target.product) ?? '2026-01-01';
  const outDir = resolve(productsRoot, target.product, 'releases');
  mkdirSync(outDir, { recursive: true });

  try {
    switch (target.strategy) {
      case 'gh-releases':
        return await fetchGhReleases(db, outDir, target, since);
      case 'rss':
        return await fetchRss(db, outDir, target, since, signal);
      case 'raw-changelog':
        return await fetchRawChangelog(db, outDir, target, since, signal);
      case 'html-scrape':
        return await fetchHtmlScrape(db, outDir, target, since, signal);
      case 'catalog':
        return await fetchCatalogStrategy(db, productsRoot, target, since, signal);
      case 'playwright':
        return await fetchPlaywrightStrategy(db, outDir, target, since);
    }
  } catch (e: any) {
    return {
      product: target.product,
      fetched: 0,
      newSince: since,
      latest: null,
      errors: [`fetch failed: ${e.message}`],
    };
  }
}

// ─── Strategy: gh-releases ───────────────────────────────────────────────────

async function fetchGhReleases(
  db: Database.Database,
  outDir: string,
  target: FetchTarget,
  since: string
): Promise<FetchStats> {
  if (!target.repo) throw new Error(`${target.product}: gh-releases strategy requires repo`);

  const releases = ghReleases(target.repo, since);
  let latest: string | null = null;
  let fetched = 0;
  const errors: string[] = [];

  for (const r of releases) {
    try {
      // F-002: both filename and vPath must derive from sanitized output, never from
      // a raw tag_name (which can contain `/`, `@`, `..`). The v-prefixed dual-form
      // existsSync check preserves idempotency against legacy v-prefixed files (see
      // regression test §8.10): if disk has `v1.0.29.md` we treat it as already-fetched.
      const baseName = filenameFor(target, r.tag_name);
      const filename = sanitizeFilename(baseName);
      assertSafeFilename(filename, `gh-releases filename for tag ${JSON.stringify(r.tag_name)}`);
      const vName = sanitizeFilename(`v${baseName}`);
      assertSafeFilename(vName, `gh-releases vName for tag ${JSON.stringify(r.tag_name)}`);
      const path = join(outDir, `${filename}.md`);
      const vPath = join(outDir, `${vName}.md`);
      if (existsSync(path) || existsSync(vPath)) {
        if (!latest || r.published_at > latest) latest = r.published_at;
        continue;
      }
      writeFileSync(path, renderGhRelease(target.product, r), 'utf-8');
      fetched++;
      if (!latest || r.published_at > latest) latest = r.published_at;
    } catch (e: any) {
      errors.push(`${r.tag_name}: ${e.message}`);
    }
  }

  if (latest) writeMarker(db, target.product, latest, target.strategy);

  return { product: target.product, fetched, newSince: since, latest, errors };
}

function ghReleases(repo: string, sinceIso: string): GhRelease[] {
  // F-001: validate repo shape before passing to a subprocess. Belt-and-suspenders:
  // assertRepoShape() guards against command injection even though execFileSync's
  // argv path already prevents shell parsing of `repo`.
  assertRepoShape(repo);

  // F-007: paginate past the GitHub default 100/page cap. Repos with >100 releases
  // (continue-dev, anthropic-sdk-typescript with multi-package tagging, etc.) need
  // multiple pages. Hard ceiling at 50 pages = 5,000 releases as a sanity cap.
  //
  // FE-3: short-circuit pagination once we see a full page whose LAST release is
  // older than sinceIso. GitHub returns releases in `created_at` DESC order by
  // default, which for the overwhelming majority of repos matches `published_at`
  // ordering. We filter on `published_at` (it's the production-visible timestamp)
  // and accept the tiny risk that a release was drafted long before publish — the
  // user can always force a full re-sync with `--since 2024-01-01`.
  //
  // Correctness contract: we only early-exit when EVERY release on the current
  // page is <= sinceIso. That guarantees no in-window release on a later page
  // (since the API order is monotonic-ish DESC). This trades a small chance of
  // missing a backdated release for huge API-quota savings on high-velocity
  // repos (continue-dev publishes 100+/month).
  const all: GhRelease[] = [];
  const MAX_PAGES = 50;
  for (let page = 1; page <= MAX_PAGES; page++) {
    let out: string;
    try {
      out = execFileSync(
        'gh',
        ['api', `repos/${repo}/releases?per_page=100&page=${page}`],
        { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }
      );
    } catch (e: any) {
      // 404 (repo missing/private) or rate limit — surface as empty result, not crash.
      // First-page 404 = repo unreachable; later-page 404 should not normally happen,
      // but if it does we stop pagination and return what we have.
      const stderr = (e.stderr ?? '').toString();
      if (stderr.includes('404')) return page === 1 ? [] : filterAndShape(all, sinceIso);
      // Enrich rate-limit errors with GITHUB_TOKEN guidance
      if (stderr.includes('403') || stderr.includes('429') || stderr.includes('rate limit')) {
        throw new Error(
          `GitHub API rate limit hit for ${repo}. ` +
          'Set GITHUB_TOKEN env var for 5000 req/hr (vs 60 unauthenticated). ' +
          `Original error: ${e.message}`
        );
      }
      throw e;
    }

    let batch: GhRelease[];
    try {
      batch = JSON.parse(out) as GhRelease[];
    } catch {
      // Malformed JSON on first page = bail entirely; later pages = stop pagination.
      return page === 1 ? [] : filterAndShape(all, sinceIso);
    }
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);

    // FE-3 early exit — if the LAST release on this full page is already <= sinceIso,
    // every release on later pages will be too (DESC order). Save the next API call.
    // Skip this check for partial pages — we already know there's no next page.
    if (batch.length === 100) {
      const lastPubAt = batch[batch.length - 1]?.published_at;
      if (lastPubAt && lastPubAt <= sinceIso) break;
    }

    if (batch.length < 100) break; // last page (partial)
  }

  return filterAndShape(all, sinceIso);
}

/**
 * Filter releases newer than sinceIso and project to the minimal shape downstream consumers expect.
 * Extracted so the early-exit code paths in ghReleases() can short-circuit cleanly.
 */
function filterAndShape(all: GhRelease[], sinceIso: string): GhRelease[] {
  return all
    .filter((r) => r.published_at && r.published_at > sinceIso)
    .map((r) => ({
      tag_name: r.tag_name,
      published_at: r.published_at,
      name: r.name,
      body: r.body,
      html_url: r.html_url,
    }));
}

function filenameFor(target: FetchTarget, tag: string): string {
  if (target.multiPackage) {
    // Handle multiple multi-package formats:
    //   "sdk-v0.98.0"                                → "sdk-0.98.0"                                 (Anthropic-style)
    //   "@modelcontextprotocol/server@2.0.0-alpha.2" → "modelcontextprotocol-server-2.0.0-alpha.2"  (npm-scoped)
    //   "@continuedev/config-yaml@1.42.0"            → "continuedev-config-yaml-1.42.0"
    //   "v1.3.38-vscode"                             → "1.3.38-vscode"                              (Continue platform suffix)
    return tag
      .replace(/^@/, '')           // strip leading @ from scoped npm tags
      .replace(/\//g, '-')          // / → -
      .replace(/@/g, '-')           // @ between name and version → -
      .replace(/-v(\d)/g, '-$1')   // strip v before any version digit
      .replace(/^v/, '');           // also strip leading v if present
  }
  return tag.replace(/^v/, '');
}

/**
 * F-006: escape a value before inlining into a `key: "..."` YAML frontmatter slot.
 * Strips control chars, escapes backslashes, then escapes embedded double quotes.
 * Prevents body content with stray `"` or `\` characters from breaking the
 * frontmatter parse and from sneaking extra keys into the YAML block.
 */
function yamlQuote(s: string | null | undefined): string {
  if (s == null) return '';
  return s
    .replace(/[\x00-\x1f]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
}

function renderGhRelease(product: string, r: GhRelease): string {
  const version = (r.tag_name ?? '').replace(/^v/, '');
  return [
    '---',
    `product: ${product}`,
    `version: "${yamlQuote(version)}"`,
    `released_at: "${r.published_at.split('T')[0]}"`,
    `source_url: "${yamlQuote(r.html_url)}"`,
    `fetched_at: "${new Date().toISOString().split('T')[0]}"`,
    '---',
    '',
    `# ${product} ${r.tag_name}`,
    '',
    r.body ?? '(no body)',
    '',
  ].join('\n');
}

// ─── Strategy: rss ──────────────────────────────────────────────────────────

async function fetchRss(
  db: Database.Database,
  outDir: string,
  target: FetchTarget,
  since: string,
  signal?: AbortSignal
): Promise<FetchStats> {
  if (!target.rssUrl) throw new Error(`${target.product}: rss strategy requires rssUrl`);

  const items = await fetchRssReleases(target.rssUrl, since, target.rssTitleFilter, signal);
  let latest: string | null = null;
  let fetched = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      // F-003: sanitize item.slug before joining into the filesystem path.
      const safeSlug = sanitizeFilename(item.slug);
      assertSafeFilename(safeSlug, `rss slug for ${JSON.stringify(item.slug)}`);
      const path = join(outDir, `${safeSlug}.md`);
      if (existsSync(path)) {
        if (!latest || item.pubDate > latest) latest = item.pubDate;
        continue;
      }
      // F-006: escape every untrusted string before inlining into a YAML quoted scalar.
      const body = [
        '---',
        `product: ${target.product}`,
        `version: "${yamlQuote(safeSlug)}"`,
        `released_at: "${item.pubDate.split('T')[0]}"`,
        `source_url: "${yamlQuote(item.link)}"`,
        `fetched_at: "${new Date().toISOString().split('T')[0]}"`,
        `title: "${yamlQuote(item.title ?? '')}"`,
        '---',
        '',
        `# ${target.product} — ${item.title ?? safeSlug}`,
        '',
        item.body ?? '(no body)',
        '',
      ].join('\n');
      writeFileSync(path, body, 'utf-8');
      fetched++;
      if (!latest || item.pubDate > latest) latest = item.pubDate;
    } catch (e: any) {
      errors.push(`${item.slug}: ${e.message}`);
    }
  }

  if (latest) writeMarker(db, target.product, latest, target.strategy);

  return { product: target.product, fetched, newSince: since, latest, errors };
}

// ─── Strategy: raw-changelog ────────────────────────────────────────────────

async function fetchRawChangelog(
  db: Database.Database,
  outDir: string,
  target: FetchTarget,
  since: string,
  signal?: AbortSignal
): Promise<FetchStats> {
  if (!target.rawChangelogUrl) throw new Error(`${target.product}: raw-changelog requires url`);

  // FE-2: dispatch on parser field instead of hardcoding aider-history. Each
  // parser implementation lives in fetch-changelog.ts; this switch is the only
  // place that grows when a new format is added.
  let items: ChangelogItem[];
  switch (target.rawChangelogParser) {
    case 'aider-history':
      items = await fetchAiderHistory(target.rawChangelogUrl, since, signal);
      break;
    case 'keep-a-changelog':
      items = await fetchKeepAChangelog(target.rawChangelogUrl, since, signal);
      break;
    default:
      throw new Error(`${target.product}: unsupported parser ${target.rawChangelogParser}`);
  }
  let latest: string | null = null;
  let fetched = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      // F-003: sanitize item.version before joining into the filesystem path.
      const safeVersion = sanitizeFilename(item.version);
      assertSafeFilename(safeVersion, `raw-changelog version for ${JSON.stringify(item.version)}`);
      const path = join(outDir, `${safeVersion}.md`);
      if (existsSync(path)) {
        if (item.releasedAt && (!latest || item.releasedAt > latest)) latest = item.releasedAt;
        continue;
      }
      const body = [
        '---',
        `product: ${target.product}`,
        `version: "${yamlQuote(safeVersion)}"`,
        `released_at: ${item.releasedAt ? `"${yamlQuote(item.releasedAt)}"` : 'null'}`,
        `source_url: "${yamlQuote(target.rawChangelogUrl ?? '')}"`,
        `fetched_at: "${new Date().toISOString().split('T')[0]}"`,
        '---',
        '',
        `# ${target.product} v${item.version}`,
        '',
        item.body,
        '',
      ].join('\n');
      writeFileSync(path, body, 'utf-8');
      fetched++;
      if (item.releasedAt && (!latest || item.releasedAt > latest)) latest = item.releasedAt;
    } catch (e: any) {
      errors.push(`${item.version}: ${e.message}`);
    }
  }

  if (latest) writeMarker(db, target.product, latest, target.strategy);

  return { product: target.product, fetched, newSince: since, latest, errors };
}

// ─── Strategy: html-scrape ──────────────────────────────────────────────────

async function fetchHtmlScrape(
  db: Database.Database,
  outDir: string,
  target: FetchTarget,
  since: string,
  signal?: AbortSignal
): Promise<FetchStats> {
  if (!target.htmlParser) throw new Error(`${target.product}: html-scrape requires htmlParser`);

  const items = await fetchHtmlReleases(target.htmlParser, since, signal);
  let latest: string | null = null;
  let fetched = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      // F-003: sanitize item.slug before joining into the filesystem path.
      const safeSlug = sanitizeFilename(item.slug);
      assertSafeFilename(safeSlug, `html-scrape slug for ${JSON.stringify(item.slug)}`);
      const path = join(outDir, `${safeSlug}.md`);
      if (existsSync(path)) {
        if (!latest || item.pubDate > latest) latest = item.pubDate;
        continue;
      }
      const body = [
        '---',
        `product: ${target.product}`,
        `version: "${yamlQuote(safeSlug)}"`,
        `released_at: "${item.pubDate.split('T')[0]}"`,
        `source_url: "${yamlQuote(item.link)}"`,
        `fetched_at: "${new Date().toISOString().split('T')[0]}"`,
        `title: "${yamlQuote(item.title ?? '')}"`,
        '---',
        '',
        `# ${target.product} — ${item.title ?? safeSlug}`,
        '',
        item.body ?? '(no body)',
        '',
      ].join('\n');
      writeFileSync(path, body, 'utf-8');
      fetched++;
      if (!latest || item.pubDate > latest) latest = item.pubDate;
    } catch (e: any) {
      errors.push(`${item.slug}: ${e.message}`);
    }
  }

  if (latest) writeMarker(db, target.product, latest, target.strategy);

  return { product: target.product, fetched, newSince: since, latest, errors };
}

// ─── Strategy: playwright (CSR fetcher) ────────────────────────────────────

async function fetchPlaywrightStrategy(
  db: Database.Database,
  outDir: string,
  target: FetchTarget,
  since: string
): Promise<FetchStats> {
  // Lazy-load to keep playwright OPTIONAL — the import resolves only when this strategy fires
  const { fetchWindsurfWithPlaywright } = await import('./fetch-playwright.js');

  const items: HtmlItem[] = await fetchWindsurfWithPlaywright(since);
  let latest: string | null = null;
  let fetched = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      // F-003: sanitize item.slug (sourced from Playwright DOM ids) before joining.
      const safeSlug = sanitizeFilename(item.slug);
      assertSafeFilename(safeSlug, `playwright slug for ${JSON.stringify(item.slug)}`);
      const path = join(outDir, `${safeSlug}.md`);
      if (existsSync(path)) {
        if (!latest || item.pubDate > latest) latest = item.pubDate;
        continue;
      }
      const body = [
        '---',
        `product: ${target.product}`,
        `version: "${yamlQuote(safeSlug)}"`,
        `released_at: "${item.pubDate.split('T')[0]}"`,
        `source_url: "${yamlQuote(item.link)}"`,
        `fetched_at: "${new Date().toISOString().split('T')[0]}"`,
        `title: "${yamlQuote(item.title ?? '')}"`,
        '---',
        '',
        `# ${target.product} — ${item.title ?? safeSlug}`,
        '',
        item.body ?? '(no body)',
        '',
      ].join('\n');
      writeFileSync(path, body, 'utf-8');
      fetched++;
      if (!latest || item.pubDate > latest) latest = item.pubDate;
    } catch (e: any) {
      errors.push(`${item.slug}: ${e.message}`);
    }
  }

  if (latest) writeMarker(db, target.product, latest, target.strategy);

  return { product: target.product, fetched, newSince: since, latest, errors };
}

// ─── Strategy: catalog (MCP registries) ────────────────────────────────────

async function fetchCatalogStrategy(
  db: Database.Database,
  productsRoot: string,
  target: FetchTarget,
  since: string,
  signal?: AbortSignal
): Promise<FetchStats> {
  if (!target.catalogType) throw new Error(`${target.product}: catalog requires catalogType`);

  const entries = await fetchCatalog(target.catalogType, { maxEntries: target.catalogMaxEntries, signal });
  const productDir = resolve(productsRoot, target.product);
  writeCatalog(productDir, target.product, entries);

  // Catalog snapshots: marker is the date of this sync, not a release timestamp
  const nowIso = new Date().toISOString();
  writeMarker(db, target.product, nowIso, target.strategy);

  return {
    product: target.product,
    fetched: entries.length,
    newSince: since,
    latest: nowIso,
    errors: [],
  };
}

// ─── Markers ────────────────────────────────────────────────────────────────

function readMarker(db: Database.Database, product: string): string | null {
  const row = db
    .prepare(`SELECT version FROM markers WHERE product = ? AND name = 'last_fetched_release_at'`)
    .get(product) as { version: string } | undefined;
  return row?.version ?? null;
}

function writeMarker(
  db: Database.Database,
  product: string,
  isoTimestamp: string,
  // F-005: pass the actual fetch_strategy through instead of hardcoding 'gh-releases'.
  // Optional so existing callers without a strategy (e.g. legacy paths) still compile;
  // when omitted, we fall back to 'gh-releases' to preserve prior behavior.
  fetchStrategy: string = 'gh-releases'
): void {
  // F-004 + F-005: validate inputs at the boundary so an injected products.yaml row
  // cannot taint the lazy-insert path. (Strategy is bounded by the union type in
  // FetchTarget — runtime check kept lightweight.)
  assertProductShape(product);

  // markers.product is FK → products.name; lazy-insert the product row so first-fetch
  // can run before any `hk ingest`. ingest's INSERT OR REPLACE on products will fill in
  // proper metadata later.
  db.prepare(`
    INSERT OR IGNORE INTO products (name, display_name, source_tier, source_url, fetch_strategy, notes)
    VALUES (?, ?, 1, '', ?, NULL)
  `).run(product, product, fetchStrategy);

  db.prepare(`
    INSERT INTO markers (product, name, version, updated_at)
    VALUES (?, 'last_fetched_release_at', ?, ?)
    ON CONFLICT(product, name) DO UPDATE SET version = excluded.version, updated_at = excluded.updated_at
  `).run(product, isoTimestamp, new Date().toISOString());
}

export function listFetchTargets(): readonly FetchTarget[] {
  return TARGETS;
}

export function seedMarkersFromDb(db: Database.Database): Array<{ product: string; seededTo: string | null }> {
  const rows = db
    .prepare(
      `SELECT product, MAX(released_at) AS max_date FROM releases WHERE released_at IS NOT NULL GROUP BY product`
    )
    .all() as Array<{ product: string; max_date: string }>;
  const out: Array<{ product: string; seededTo: string | null }> = [];
  for (const t of TARGETS) {
    const r = rows.find((x) => x.product === t.product);
    if (r?.max_date) {
      const iso = r.max_date.includes('T') ? r.max_date : `${r.max_date}T23:59:59Z`;
      writeMarker(db, t.product, iso, t.strategy);
      out.push({ product: t.product, seededTo: iso });
    } else {
      out.push({ product: t.product, seededTo: null });
    }
  }
  return out;
}
