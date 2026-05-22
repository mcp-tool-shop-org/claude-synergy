import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import matter from 'gray-matter';
import TurndownService from 'turndown';
import type Database from 'better-sqlite3';
import { extractEntities } from './extract.js';

// Turndown converts HTML release bodies (github-copilot, vscode-copilot-chat) to markdown
// so parseBullets can extract <li> elements as bullet rows for FTS5 + entity extraction.
const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
});
// Drop link syntax in favor of just the text — keeps bullets clean for indexing
turndown.addRule('plainLinks', {
  filter: 'a',
  replacement: (content, node) => {
    const href = (node as any).getAttribute?.('href');
    return href ? `${content} (${href})` : content;
  },
});

function maybeConvertHtmlToMarkdown(content: string): string {
  // Heuristic: count opening tags. HTML bodies (Cursor RSS, github-copilot, vscode pages)
  // have many; markdown-native bodies (most release notes) have few or none.
  const tagCount = (content.match(/<\/?[a-z][^>]*>/gi) || []).length;
  if (tagCount < 5) return content;
  try {
    return turndown.turndown(content);
  } catch {
    return content;
  }
}

/**
 * Compact bodies whose bullets are mostly raw git-commit dumps.
 *
 * Example pattern (continue-cli, anthropic-cli-style auto-generated release notes):
 *   * 6ad60da114171ac9e9d51f67ec80fd413a27efcd refactor: rename checks CLI (#3516)
 *
 * When a release body has >=10 SHA-prefixed bullets AND that's >=50% of the
 * total, replace the bullets with one summary line. Original file on disk is
 * preserved; this only affects what gets indexed in `changes` / FTS5 / vec.
 */
function compactCommitDumpBody(bullets: string[]): string[] {
  if (bullets.length < 10) return bullets;

  // Match SHA prefix: 7-40 hex chars + whitespace. Tolerate leading whitespace.
  const SHA_PREFIX = /^\s*[0-9a-f]{7,40}\b/i;
  const commitLines = bullets.filter((b) => SHA_PREFIX.test(b)).length;
  const ratio = commitLines / bullets.length;

  if (commitLines >= 10 && ratio >= 0.5) {
    const nonCommitLines = bullets.length - commitLines;
    const noteParts = [`Auto-generated release notes: ${commitLines} commits from previous release. See source_url for full commit list.`];
    if (nonCommitLines > 0) {
      // Preserve any non-commit bullets (e.g. "What's Changed" header text)
      const preserved = bullets.filter((b) => !SHA_PREFIX.test(b));
      noteParts.push(...preserved);
    }
    return noteParts;
  }
  return bullets;
}

interface Frontmatter {
  product?: string;
  version?: string;
  released_at?: string;
  source_url?: string;
  fetched_at?: string;
  package?: string;
  sub_product?: string;
  bundle_size_kb_delta?: number;
}

export interface IngestStats {
  productsCount: number;
  releasesAdded: number;
  changesAdded: number;
  entitiesAdded: number;
  skipped: number;
  errors: Array<{ file: string; error: string }>;
}

// Default source-tier + fetch-strategy mapping per product.
// Keep in sync with SOURCES.md.
const PRODUCT_META: Record<string, { tier: number; strategy: string; url: string; display: string }> = {
  'claude-code': { tier: 2, strategy: 'git-changelog', url: 'https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md', display: 'Claude Code' },
  'claude-api': { tier: 3, strategy: 'webfetch', url: 'https://platform.claude.com/docs/en/release-notes/overview', display: 'Claude API / Platform' },
  'anthropic-apps': { tier: 3, strategy: 'webfetch', url: 'https://support.claude.com/en/articles/12138966-release-notes', display: 'Anthropic Apps (Design / Cowork / Chat / Mobile)' },
  'claude-agent-sdk-python': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/claude-agent-sdk-python', display: 'Claude Agent SDK (Python)' },
  'claude-agent-sdk-typescript': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/claude-agent-sdk-typescript', display: 'Claude Agent SDK (TypeScript)' },
  'anthropic-cli': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/anthropic-cli', display: 'Anthropic CLI (ant)' },
  'anthropic-sdk-python': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/anthropic-sdk-python', display: 'Anthropic SDK (Python)' },
  'anthropic-sdk-typescript': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/anthropic-sdk-typescript', display: 'Anthropic SDK (TypeScript)' },
  'anthropic-sdk-go': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/anthropic-sdk-go', display: 'Anthropic SDK (Go)' },
  'anthropic-sdk-java': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/anthropic-sdk-java', display: 'Anthropic SDK (Java)' },
  'anthropic-sdk-ruby': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/anthropic-sdk-ruby', display: 'Anthropic SDK (Ruby)' },
  'anthropic-sdk-csharp': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/anthropic-sdk-csharp', display: 'Anthropic SDK (C#)' },
  'anthropic-sdk-php': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/anthropic-sdk-php', display: 'Anthropic SDK (PHP)' },
  'claude-code-action': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/claude-code-action', display: 'Claude Code Action (GitHub Action)' },
  'claude-code-security-review': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/anthropics/claude-code-security-review', display: 'Claude Code Security Review (GitHub Action)' },
  'skills': { tier: 4, strategy: 'git-snapshot', url: 'https://github.com/anthropics/skills', display: 'Anthropic Skills Catalog' },
  'plugins-official': { tier: 4, strategy: 'git-snapshot', url: 'https://github.com/anthropics/claude-plugins-official', display: 'Claude Plugins (Official)' },
  'plugins-community': { tier: 4, strategy: 'git-snapshot', url: 'https://github.com/anthropics/claude-plugins-community', display: 'Claude Plugins (Community)' },
  'plugins-knowledge-work': { tier: 4, strategy: 'git-snapshot', url: 'https://github.com/anthropics/knowledge-work-plugins', display: 'Knowledge Work Plugins (Cowork)' },

  // Tier 4a additions — MCP ecosystem
  'mcp-python-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/python-sdk', display: 'MCP Python SDK' },
  'mcp-typescript-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/typescript-sdk', display: 'MCP TypeScript SDK' },
  'mcp-go-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/go-sdk', display: 'MCP Go SDK' },
  'mcp-java-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/java-sdk', display: 'MCP Java SDK' },
  'mcp-csharp-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/csharp-sdk', display: 'MCP C# SDK' },
  'mcp-kotlin-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/kotlin-sdk', display: 'MCP Kotlin SDK' },
  'mcp-ruby-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/ruby-sdk', display: 'MCP Ruby SDK' },
  'mcp-swift-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/swift-sdk', display: 'MCP Swift SDK' },
  'mcp-rust-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/rust-sdk', display: 'MCP Rust SDK' },
  'mcp-php-sdk': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/php-sdk', display: 'MCP PHP SDK' },
  'mcp-spec': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/modelcontextprotocol', display: 'MCP Specification' },
  'mcp-inspector': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/inspector', display: 'MCP Inspector' },
  'mcp-registry': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/registry', display: 'MCP Registry' },
  'mcp-mcpb': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/mcpb', display: 'MCP Bundle (mcpb)' },
  'mcp-conformance': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/modelcontextprotocol/conformance', display: 'MCP Conformance' },

  // Tier 4a additions — non-Anthropic AI dev tools
  'continue-dev': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/continuedev/continue', display: 'Continue.dev' },
  'continue-cli': { tier: 1, strategy: 'gh-releases', url: 'https://github.com/continuedev/continue-cli', display: 'Continue.dev CLI' },
  'cursor': { tier: 3, strategy: 'rss', url: 'https://cursor.com/changelog/rss.xml', display: 'Cursor' },
  'cody-enterprise': { tier: 3, strategy: 'rss', url: 'https://sourcegraph.com/changelog/featured.rss', display: 'Sourcegraph Cody Enterprise' },
  'aider': { tier: 2, strategy: 'raw-changelog', url: 'https://raw.githubusercontent.com/Aider-AI/aider/main/HISTORY.md', display: 'Aider' },

  // Tier 4b additions — HTML-scraped sources
  'github-copilot': { tier: 3, strategy: 'html-scrape', url: 'https://github.blog/changelog/label/copilot/', display: 'GitHub Copilot' },
  'vscode-copilot-chat': { tier: 3, strategy: 'html-scrape', url: 'https://code.visualstudio.com/updates/', display: 'VS Code Copilot Chat (editor)' },
  'windsurf': { tier: 3, strategy: 'html-scrape', url: 'https://windsurf.com/changelog', display: 'Windsurf (Cognition)' },
};

export function ingestAll(db: Database.Database, productsRoot: string): IngestStats {
  const stats: IngestStats = {
    productsCount: 0,
    releasesAdded: 0,
    changesAdded: 0,
    entitiesAdded: 0,
    skipped: 0,
    errors: [],
  };

  const productDirs = readdirSync(productsRoot).filter((name) => {
    try {
      return statSync(join(productsRoot, name)).isDirectory();
    } catch {
      return false;
    }
  });

  const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products (name, display_name, source_tier, source_url, fetch_strategy, notes)
    VALUES (@name, @display_name, @source_tier, @source_url, @fetch_strategy, @notes)
  `);

  const insertRelease = db.prepare(`
    INSERT OR REPLACE INTO releases (product, version, released_at, notes_path, fetched_at, source_url, bundle_size_kb, notes_hash)
    VALUES (@product, @version, @released_at, @notes_path, @fetched_at, @source_url, @bundle_size_kb, @notes_hash)
  `);

  const insertChange = db.prepare(`
    INSERT INTO changes (product, version, ordinal, kind, text)
    VALUES (@product, @version, @ordinal, @kind, @text)
  `);

  const deleteChanges = db.prepare(`DELETE FROM changes WHERE product = ? AND version = ?`);

  const insertEntity = db.prepare(`
    INSERT INTO entities (change_id, entity_type, entity_value)
    VALUES (?, ?, ?)
  `);

  for (const product of productDirs) {
    const releasesDir = join(productsRoot, product, 'releases');
    if (!existsSync(releasesDir)) {
      // catalog product (skills, plugins-*) — no releases dir; skip for now
      // (Tier 2 catalog ingest will handle CATALOG.md / ACTIVITY.md separately)
      continue;
    }

    let releaseFiles: string[];
    try {
      releaseFiles = readdirSync(releasesDir).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }

    if (releaseFiles.length === 0) {
      continue;
    }

    stats.productsCount++;

    const meta = PRODUCT_META[product] ?? {
      tier: 1,
      strategy: 'gh-releases',
      url: '',
      display: product,
    };
    insertProduct.run({
      name: product,
      display_name: meta.display,
      source_tier: meta.tier,
      source_url: meta.url,
      fetch_strategy: meta.strategy,
      notes: null,
    });

    const ingestTransaction = db.transaction(() => {
      for (const file of releaseFiles) {
        try {
          const path = join(releasesDir, file);
          const raw = readFileSync(path, 'utf-8');
          const { data: fm, content } = matter(raw);
          const fmTyped = fm as Frontmatter;

          // For multi-product feeds (anthropic-apps) compose version with sub_product
          // to keep each Help Center entry as a distinct release row
          const baseVersion = fmTyped.version ?? basename(file, '.md');
          const version = fmTyped.sub_product
            ? `${baseVersion}-${fmTyped.sub_product}`
            : baseVersion;
          const released_at = fmTyped.released_at ?? null;
          const source_url = fmTyped.source_url ?? '';
          const fetched_at = fmTyped.fetched_at ?? new Date().toISOString().split('T')[0];
          const bundle_size_kb = fmTyped.bundle_size_kb_delta ?? null;

          deleteChanges.run(product, version);

          insertRelease.run({
            product,
            version,
            released_at,
            notes_path: relative(productsRoot, path).replace(/\\/g, '/'),
            fetched_at,
            source_url,
            bundle_size_kb,
            notes_hash: null,
          });
          stats.releasesAdded++;

          const bullets = compactCommitDumpBody(parseBullets(maybeConvertHtmlToMarkdown(content)));
          bullets.forEach((bullet, i) => {
            const kind = classifyKind(bullet);
            const result = insertChange.run({
              product,
              version,
              ordinal: i + 1,
              kind,
              text: bullet,
            });
            stats.changesAdded++;

            const changeId = result.lastInsertRowid as number;
            const entities = extractEntities(bullet);
            for (const [type, value] of entities) {
              insertEntity.run(changeId, type, value);
              stats.entitiesAdded++;
            }
          });
        } catch (e: any) {
          stats.errors.push({ file, error: e.message });
        }
      }
    });
    ingestTransaction();
  }

  return stats;
}

function parseBullets(content: string): string[] {
  const lines = content.split('\n');
  const bullets: string[] = [];
  let current = '';
  let inFencedBlock = false;

  for (const line of lines) {
    // Skip fenced code blocks (don't accidentally extract list items from inside them)
    if (line.trim().startsWith('```')) {
      inFencedBlock = !inFencedBlock;
      continue;
    }
    if (inFencedBlock) continue;

    // Match top-level bullets only (- or * markdown markers; not nested sub-bullets, which are continuation)
    const bulletMatch = line.match(/^[-*] (.+)$/);
    if (bulletMatch) {
      if (current) bullets.push(current.trim());
      current = bulletMatch[1];
    } else if (line.match(/^\s{2,}\S/) && current) {
      // indented continuation of previous bullet
      current += ' ' + line.trim();
    } else if (line.trim() === '' || line.match(/^#/) || line.match(/^\|/)) {
      // blank line, heading, or table row — flush current bullet
      if (current) {
        bullets.push(current.trim());
        current = '';
      }
    }
  }
  if (current) bullets.push(current.trim());
  return bullets;
}

function classifyKind(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('breaking')) return 'breaking';
  if (lower.startsWith('added') || lower.match(/^new /)) return 'added';
  if (lower.startsWith('fixed') || lower.startsWith('fix ')) return 'fixed';
  if (lower.startsWith('removed') || lower.startsWith('retired')) return 'removed';
  if (lower.includes('deprecat')) return 'deprecated';
  if (lower.startsWith('renamed')) return 'renamed';
  if (lower.startsWith('improved')) return 'improved';
  return 'changed';
}
