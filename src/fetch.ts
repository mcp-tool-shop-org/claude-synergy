// Incremental release sync — Tier 4 extends to three fetch strategies:
//   - gh-releases: GitHub Releases API (uniform; preferred when available)
//   - rss:         RSS 2.0 feed (Cursor, Cody Enterprise)
//   - raw-changelog: raw markdown CHANGELOG/HISTORY.md (Aider)

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type Database from 'better-sqlite3';
import { fetchRssReleases } from './fetch-rss.js';
import { fetchAiderHistory } from './fetch-changelog.js';
import { fetchHtmlReleases, type HtmlParserName } from './fetch-html.js';

interface GhRelease {
  tag_name: string;
  published_at: string;
  name: string | null;
  body: string | null;
  html_url: string;
}

export interface FetchTarget {
  product: string;
  strategy: 'gh-releases' | 'rss' | 'raw-changelog' | 'html-scrape';
  // gh-releases
  repo?: string;
  multiPackage?: boolean;
  // rss
  rssUrl?: string;
  /** Optional filter for RSS feeds that mix multiple products (e.g. Sourcegraph carries non-Cody entries) */
  rssTitleFilter?: RegExp;
  // raw-changelog
  rawChangelogUrl?: string;
  rawChangelogParser?: 'aider-history';
  // html-scrape
  htmlParser?: HtmlParserName;
}

const TARGETS: FetchTarget[] = [
  // ── Existing Anthropic GH-Releases sources ────────────────────────────────
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

export interface FetchStats {
  product: string;
  fetched: number;
  newSince: string;
  latest: string | null;
  errors: string[];
}

export async function fetchAll(
  db: Database.Database,
  productsRoot: string,
  opts: { product?: string; sinceOverride?: string } = {}
): Promise<FetchStats[]> {
  const targets = opts.product ? TARGETS.filter((t) => t.product === opts.product) : TARGETS;
  if (targets.length === 0) {
    throw new Error(`unknown product: ${opts.product} (available: ${TARGETS.map((t) => t.product).join(', ')})`);
  }

  const results: FetchStats[] = [];
  for (const target of targets) {
    results.push(await fetchOne(db, productsRoot, target, opts.sinceOverride));
  }
  return results;
}

async function fetchOne(
  db: Database.Database,
  productsRoot: string,
  target: FetchTarget,
  sinceOverride?: string
): Promise<FetchStats> {
  const since = sinceOverride ?? readMarker(db, target.product) ?? '2026-01-01';
  const outDir = resolve(productsRoot, target.product, 'releases');
  mkdirSync(outDir, { recursive: true });

  try {
    switch (target.strategy) {
      case 'gh-releases':
        return await fetchGhReleases(db, outDir, target, since);
      case 'rss':
        return await fetchRss(db, outDir, target, since);
      case 'raw-changelog':
        return await fetchRawChangelog(db, outDir, target, since);
      case 'html-scrape':
        return await fetchHtmlScrape(db, outDir, target, since);
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
      const filename = filenameFor(target, r.tag_name);
      const path = join(outDir, `${filename}.md`);
      const vPath = join(outDir, `${r.tag_name}.md`);
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

  if (latest) writeMarker(db, target.product, latest);

  return { product: target.product, fetched, newSince: since, latest, errors };
}

function ghReleases(repo: string, sinceIso: string): GhRelease[] {
  const cmd = `gh api "repos/${repo}/releases?per_page=100"`;
  let out: string;
  try {
    out = execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e: any) {
    // 404 (repo missing/private) or rate limit — surface as empty result, not crash
    if (e.stderr?.includes('404')) return [];
    throw e;
  }
  let all: GhRelease[];
  try {
    all = JSON.parse(out) as GhRelease[];
  } catch {
    return [];
  }
  if (!Array.isArray(all)) return [];
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

function renderGhRelease(product: string, r: GhRelease): string {
  const version = (r.tag_name ?? '').replace(/^v/, '');
  return [
    '---',
    `product: ${product}`,
    `version: "${version}"`,
    `released_at: "${r.published_at.split('T')[0]}"`,
    `source_url: "${r.html_url}"`,
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
  since: string
): Promise<FetchStats> {
  if (!target.rssUrl) throw new Error(`${target.product}: rss strategy requires rssUrl`);

  const items = await fetchRssReleases(target.rssUrl, since, target.rssTitleFilter);
  let latest: string | null = null;
  let fetched = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      const path = join(outDir, `${item.slug}.md`);
      if (existsSync(path)) {
        if (!latest || item.pubDate > latest) latest = item.pubDate;
        continue;
      }
      const body = [
        '---',
        `product: ${target.product}`,
        `version: "${item.slug}"`,
        `released_at: "${item.pubDate.split('T')[0]}"`,
        `source_url: "${item.link}"`,
        `fetched_at: "${new Date().toISOString().split('T')[0]}"`,
        `title: "${(item.title ?? '').replace(/"/g, "'")}"`,
        '---',
        '',
        `# ${target.product} — ${item.title ?? item.slug}`,
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

  if (latest) writeMarker(db, target.product, latest);

  return { product: target.product, fetched, newSince: since, latest, errors };
}

// ─── Strategy: raw-changelog ────────────────────────────────────────────────

async function fetchRawChangelog(
  db: Database.Database,
  outDir: string,
  target: FetchTarget,
  since: string
): Promise<FetchStats> {
  if (!target.rawChangelogUrl) throw new Error(`${target.product}: raw-changelog requires url`);
  if (target.rawChangelogParser !== 'aider-history') {
    throw new Error(`${target.product}: unsupported parser ${target.rawChangelogParser}`);
  }

  const items = await fetchAiderHistory(target.rawChangelogUrl, since);
  let latest: string | null = null;
  let fetched = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      const path = join(outDir, `${item.version}.md`);
      if (existsSync(path)) {
        if (item.releasedAt && (!latest || item.releasedAt > latest)) latest = item.releasedAt;
        continue;
      }
      const body = [
        '---',
        `product: ${target.product}`,
        `version: "${item.version}"`,
        `released_at: ${item.releasedAt ? `"${item.releasedAt}"` : 'null'}`,
        `source_url: "${target.rawChangelogUrl}"`,
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

  if (latest) writeMarker(db, target.product, latest);

  return { product: target.product, fetched, newSince: since, latest, errors };
}

// ─── Strategy: html-scrape ──────────────────────────────────────────────────

async function fetchHtmlScrape(
  db: Database.Database,
  outDir: string,
  target: FetchTarget,
  since: string
): Promise<FetchStats> {
  if (!target.htmlParser) throw new Error(`${target.product}: html-scrape requires htmlParser`);

  const items = await fetchHtmlReleases(target.htmlParser, since);
  let latest: string | null = null;
  let fetched = 0;
  const errors: string[] = [];

  for (const item of items) {
    try {
      const path = join(outDir, `${item.slug}.md`);
      if (existsSync(path)) {
        if (!latest || item.pubDate > latest) latest = item.pubDate;
        continue;
      }
      const body = [
        '---',
        `product: ${target.product}`,
        `version: "${item.slug}"`,
        `released_at: "${item.pubDate.split('T')[0]}"`,
        `source_url: "${item.link}"`,
        `fetched_at: "${new Date().toISOString().split('T')[0]}"`,
        `title: "${(item.title ?? '').replace(/"/g, "'")}"`,
        '---',
        '',
        `# ${target.product} — ${item.title ?? item.slug}`,
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

  if (latest) writeMarker(db, target.product, latest);

  return { product: target.product, fetched, newSince: since, latest, errors };
}

// ─── Markers ────────────────────────────────────────────────────────────────

function readMarker(db: Database.Database, product: string): string | null {
  const row = db
    .prepare(`SELECT version FROM markers WHERE product = ? AND name = 'last_fetched_release_at'`)
    .get(product) as { version: string } | undefined;
  return row?.version ?? null;
}

function writeMarker(db: Database.Database, product: string, isoTimestamp: string): void {
  // markers.product is FK → products.name; lazy-insert the product row so first-fetch
  // can run before any `hk ingest`. ingest's INSERT OR REPLACE on products will fill in
  // proper metadata later.
  db.prepare(`
    INSERT OR IGNORE INTO products (name, display_name, source_tier, source_url, fetch_strategy, notes)
    VALUES (?, ?, 1, '', 'gh-releases', NULL)
  `).run(product, product);

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
      writeMarker(db, t.product, iso);
      out.push({ product: t.product, seededTo: iso });
    } else {
      out.push({ product: t.product, seededTo: null });
    }
  }
  return out;
}
