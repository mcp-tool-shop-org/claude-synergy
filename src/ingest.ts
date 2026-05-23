import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, basename } from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import TurndownService from 'turndown';
import type Database from 'better-sqlite3';
import { extractEntities } from './extract.js';
import { loadProductsConfig } from './products-config.js';

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
  /** Releases skipped because their content hash has not changed since last ingest. */
  skipped: number;
  /** Total release files encountered (= releasesAdded + skipped + errors). */
  total: number;
  errors: Array<{ file: string; error: string }>;
}

/** Compute a short SHA-256 hex digest of file content for dedup. */
function contentHash(raw: string): string {
  return createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

// Hardcoded fallback for PRODUCT_META, used when products.yaml is missing.
// Single source of truth lives in products.yaml at repo root.
const HARDCODED_PRODUCT_META: Record<string, { tier: number; strategy: string; url: string; display: string }> = {
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

// Compose PRODUCT_META from products.yaml (preferred) with fallback to hardcoded.
const PRODUCT_META: Record<string, { tier: number; strategy: string; url: string; display: string }> = (() => {
  const cfg = loadProductsConfig();
  if (!cfg) return HARDCODED_PRODUCT_META;
  const out: Record<string, { tier: number; strategy: string; url: string; display: string }> = {};
  for (const [name, meta] of Object.entries(cfg.productMeta)) {
    out[name] = {
      tier: meta.source_tier,
      strategy: meta.fetch_strategy,
      url: meta.source_url,
      display: meta.display_name,
    };
  }
  return out;
})();

export function ingestAll(db: Database.Database, productsRoot: string): IngestStats {
  const stats: IngestStats = {
    productsCount: 0,
    releasesAdded: 0,
    changesAdded: 0,
    entitiesAdded: 0,
    skipped: 0,
    total: 0,
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

  const selectExistingHash = db.prepare(
    `SELECT notes_hash FROM releases WHERE product = ? AND version = ?`
  );

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
          stats.total++;
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

          // Dedup: skip re-processing if content hash has not changed
          const hash = contentHash(raw);
          const existingRow = selectExistingHash.get(product, version) as { notes_hash: string | null } | undefined;
          if (existingRow?.notes_hash === hash) {
            stats.skipped++;
            continue;
          }

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
            notes_hash: hash,
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

// ─── Synergy ingestion (P1-5) ────────────────────────────────────────────

interface SynergyFrontmatter {
  name?: string;
  title?: string;
  trigger?: string;
  status?: string;
  last_validated?: string | Date;
  products?: string[];
  /** Optional explicit evidence array; otherwise we parse the **Evidence:** body section. */
  evidence?: Array<{ source_url: string; quote?: string; source_kind?: string } | string>;
  /** Optional explicit steps array; otherwise we parse the **Workflow:** body section. */
  steps?: string[];
  /** Optional explicit change refs as { product, version } pairs (resolved against the changes table). */
  change_refs?: Array<{ product: string; version: string; ordinal?: number } | string>;
}

export interface SynergyIngestStats {
  /** Synergies successfully upserted (alias: synergiesAdded). */
  ingested: number;
  /** Files that could not be ingested (= errors.length, surfaced for ergonomic checks). */
  skipped: number;
  synergiesAdded: number;
  productsLinked: number;
  stepsAdded: number;
  evidenceAdded: number;
  changeRefsAdded: number;
  /** Files that errored — file basename + message. */
  errors: Array<{ file: string; error: string }>;
}

/** URL extractor — matches the first markdown-link target or a bare https URL. */
const URL_INLINE_RE = /\[(?:[^\]]*)\]\((https?:\/\/[^)\s]+)\)|\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s)\]]+)/;

/**
 * Pull the bullet list under a named section heading like **Workflow:** /
 * **Evidence:**. The match is forgiving: numbered or `-` bullets are both
 * accepted; nested indentation under a bullet is folded back onto the
 * parent (matches parseBullets() behavior for changelog bodies).
 *
 * Stops at the next bolded section heading (`**Caveats:**`, `**Evidence:**`, etc.)
 * or end of file. Returns an array of bullet strings (already trimmed).
 */
function extractBodySection(body: string, sectionLabel: string): string[] {
  const lines = body.split('\n');
  // Find heading: `**<sectionLabel>:**` or `**<sectionLabel>**:` or heading-style `## <label>`
  const headingRe = new RegExp(
    `^\\s*(?:\\*\\*${sectionLabel}:?\\*\\*:?\\s*|##+\\s+${sectionLabel}:?\\s*)$`,
    'i'
  );
  // Generic "next bold/heading section" detector to stop at.
  const nextSectionRe = /^\s*(?:\*\*[A-Z][A-Za-z][A-Za-z /-]*:?\*\*|##+\s+[A-Z])/;
  let inSection = false;
  const bullets: string[] = [];
  let current = '';

  function flush() {
    if (current.trim()) bullets.push(current.trim());
    current = '';
  }

  for (const line of lines) {
    if (!inSection) {
      if (headingRe.test(line)) inSection = true;
      continue;
    }
    // Hit the next bold section — done. Make sure we don't re-match our own heading though.
    if (line.trim() && nextSectionRe.test(line) && !headingRe.test(line)) {
      flush();
      break;
    }
    // Numbered list: `1. text` / `1) text`
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (numbered) {
      flush();
      current = numbered[1];
      continue;
    }
    // Dash/asterisk bullet
    const bulleted = line.match(/^\s*[-*]\s+(.+)$/);
    if (bulleted) {
      flush();
      current = bulleted[1];
      continue;
    }
    // Indented continuation
    if (/^\s{2,}\S/.test(line) && current) {
      current += ' ' + line.trim();
      continue;
    }
    // Blank line — flush the current bullet
    if (line.trim() === '') {
      flush();
      continue;
    }
    // Anything else (prose) — flush the current bullet and skip
    flush();
  }
  flush();
  return bullets;
}

/**
 * Try to classify an evidence URL into one of the schema's source_kind values.
 * Falls back to null when nothing matches; callers can store NULL.
 */
function classifyEvidenceSource(url: string, surroundingText: string): string | null {
  const lower = `${url} ${surroundingText}`.toLowerCase();
  if (lower.includes('release-notes') || lower.includes('/releases/')) return 'release-notes';
  if (lower.includes('changelog')) return 'changelog';
  if (lower.includes('blog')) return 'blog';
  if (lower.includes('github.com') && lower.includes('readme')) return 'github-readme';
  if (lower.includes('/docs/') || lower.includes('docs.')) return 'docs';
  if (lower.includes('github.com')) return 'github-readme';
  return null;
}

/**
 * Convert a Date or string into a YYYY-MM-DD string. Returns null when the
 * input can't be parsed; callers fall back to today.
 */
function toIsoDate(value: string | Date | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  // string — accept YYYY-MM-DD already, else try Date()
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * Ingest synergy markdown files from `synergyDir` into the five synergy
 * tables. Idempotent: re-running replaces all data for any synergy whose
 * slug matches. Synergies referenced via filename are not deleted when
 * absent from the source directory (call sites can wipe the table first
 * if they want strict mirroring).
 *
 * Per-file flow:
 *   1. Parse frontmatter (name/title/trigger/status/products/last_validated)
 *   2. INSERT-or-REPLACE synergy row using the file slug (basename minus `.md`)
 *      as primary key when frontmatter omits `name`
 *   3. Populate synergy_products from `products: [...]` frontmatter
 *   4. Populate synergy_steps from frontmatter `steps:` if present, else
 *      parse the **Workflow:** section bullets from the body
 *   5. Populate synergy_evidence from frontmatter `evidence:` if present,
 *      else extract URLs from the **Evidence:** section bullets
 *   6. Resolve `change_refs:` frontmatter entries against the `changes` table
 *      by (product, version, ordinal?). Skipped silently when the change
 *      row is absent (e.g. product not yet ingested) so synergies can ship
 *      ahead of the changelog import for that product.
 *
 * Returns SynergyIngestStats with per-table counts and any parse errors.
 */
export function ingestSynergies(
  db: Database.Database,
  synergyDir: string
): SynergyIngestStats {
  const stats: SynergyIngestStats = {
    ingested: 0,
    skipped: 0,
    synergiesAdded: 0,
    productsLinked: 0,
    stepsAdded: 0,
    evidenceAdded: 0,
    changeRefsAdded: 0,
    errors: [],
  };

  if (!existsSync(synergyDir)) {
    return stats;
  }

  let files: string[];
  try {
    files = readdirSync(synergyDir).filter((f) => f.endsWith('.md') && f !== 'INDEX.md');
  } catch (e: any) {
    stats.errors.push({ file: synergyDir, error: e?.message ?? String(e) });
    return stats;
  }

  // Prepared statements — reused across all files
  const upsertSynergy = db.prepare(`
    INSERT INTO synergies (name, title, trigger, status, last_validated, notes_path)
    VALUES (@name, @title, @trigger, @status, @last_validated, @notes_path)
    ON CONFLICT(name) DO UPDATE SET
      title = excluded.title,
      trigger = excluded.trigger,
      status = excluded.status,
      last_validated = excluded.last_validated,
      notes_path = excluded.notes_path
  `);
  const selectSynergyIdByName = db.prepare(
    `SELECT id FROM synergies WHERE name = ?`
  );
  const deleteProductsBySynergy = db.prepare(
    `DELETE FROM synergy_products WHERE synergy_id = ?`
  );
  const deleteStepsBySynergy = db.prepare(
    `DELETE FROM synergy_steps WHERE synergy_id = ?`
  );
  const deleteEvidenceBySynergy = db.prepare(
    `DELETE FROM synergy_evidence WHERE synergy_id = ?`
  );
  const deleteChangeRefsBySynergy = db.prepare(
    `DELETE FROM synergy_change_refs WHERE synergy_id = ?`
  );
  const insertProductLink = db.prepare(`
    INSERT OR IGNORE INTO synergy_products (synergy_id, product) VALUES (?, ?)
  `);
  const insertStep = db.prepare(`
    INSERT INTO synergy_steps (synergy_id, ordinal, text) VALUES (?, ?, ?)
  `);
  const insertEvidence = db.prepare(`
    INSERT INTO synergy_evidence (synergy_id, source_url, quote, source_kind) VALUES (?, ?, ?, ?)
  `);
  const insertChangeRef = db.prepare(`
    INSERT OR IGNORE INTO synergy_change_refs (synergy_id, change_id) VALUES (?, ?)
  `);
  const selectChangeByPvOrdinal = db.prepare(`
    SELECT id FROM changes WHERE product = ? AND version = ? AND ordinal = ?
  `);
  const selectChangeByPv = db.prepare(`
    SELECT id FROM changes WHERE product = ? AND version = ? ORDER BY ordinal
  `);
  const selectProductExists = db.prepare(
    `SELECT name FROM products WHERE name = ?`
  );

  // Synergies can reference products that aren't yet ingested as full
  // products (e.g. claude-cowork, claude-design). FK enforcement on
  // synergy_products requires the row to exist — make sure they do.
  const insertStubProduct = db.prepare(`
    INSERT OR IGNORE INTO products (name, display_name, source_tier, source_url, fetch_strategy, notes)
    VALUES (@name, @display_name, 0, '', 'manual', 'synergy-stub')
  `);

  const tx = db.transaction(() => {
    for (const file of files) {
      try {
        const path = join(synergyDir, file);
        const raw = readFileSync(path, 'utf-8');
        const parsed = matter(raw);
        const fm = parsed.data as SynergyFrontmatter;
        const body = parsed.content;

        const slug = (fm.name && typeof fm.name === 'string' ? fm.name : basename(file, '.md')).trim();
        if (!slug) {
          stats.errors.push({ file, error: 'missing synergy name (frontmatter or filename)' });
          stats.skipped++;
          continue;
        }
        const title = (fm.title && typeof fm.title === 'string' ? fm.title : slug).trim();
        const trigger = typeof fm.trigger === 'string' ? fm.trigger.trim() : '';
        const status = typeof fm.status === 'string' && fm.status.trim() ? fm.status.trim() : 'speculative';
        const last_validated =
          toIsoDate(fm.last_validated) ?? new Date().toISOString().slice(0, 10);
        const notes_path = `synergies/${file}`;

        upsertSynergy.run({
          name: slug,
          title,
          trigger,
          status,
          last_validated,
          notes_path,
        });
        const synergyRow = selectSynergyIdByName.get(slug) as { id: number } | undefined;
        if (!synergyRow) {
          stats.errors.push({ file, error: 'failed to resolve synergy id after upsert' });
          stats.skipped++;
          continue;
        }
        const synergyId = synergyRow.id;
        stats.synergiesAdded++;
        stats.ingested++;

        // Wipe joined data so re-ingest is a pure refresh
        deleteProductsBySynergy.run(synergyId);
        deleteStepsBySynergy.run(synergyId);
        deleteEvidenceBySynergy.run(synergyId);
        deleteChangeRefsBySynergy.run(synergyId);

        // Products
        const products = Array.isArray(fm.products) ? fm.products.filter((p) => typeof p === 'string') : [];
        for (const product of products) {
          const productSlug = product.trim();
          if (!productSlug) continue;
          // Ensure FK target exists; create a stub if not
          if (!selectProductExists.get(productSlug)) {
            insertStubProduct.run({ name: productSlug, display_name: productSlug });
          }
          insertProductLink.run(synergyId, productSlug);
          stats.productsLinked++;
        }

        // Steps — frontmatter `steps:` wins; otherwise parse **Workflow:** bullets.
        const steps =
          Array.isArray(fm.steps) && fm.steps.length > 0
            ? fm.steps.filter((s) => typeof s === 'string').map((s) => s.trim()).filter(Boolean)
            : extractBodySection(body, 'Workflow');
        steps.forEach((stepText, idx) => {
          insertStep.run(synergyId, idx + 1, stepText);
          stats.stepsAdded++;
        });

        // Evidence — frontmatter `evidence:` wins; otherwise parse **Evidence:** bullets.
        if (Array.isArray(fm.evidence) && fm.evidence.length > 0) {
          for (const ev of fm.evidence) {
            if (typeof ev === 'string') {
              const m = ev.match(URL_INLINE_RE);
              const url = m ? (m[1] ?? m[2] ?? m[3]) : null;
              if (!url) continue;
              insertEvidence.run(synergyId, url, ev, classifyEvidenceSource(url, ev));
              stats.evidenceAdded++;
            } else if (ev && typeof ev === 'object' && typeof ev.source_url === 'string') {
              insertEvidence.run(
                synergyId,
                ev.source_url,
                ev.quote ?? null,
                ev.source_kind ?? classifyEvidenceSource(ev.source_url, ev.quote ?? '')
              );
              stats.evidenceAdded++;
            }
          }
        } else {
          const evidenceBullets = extractBodySection(body, 'Evidence');
          for (const bullet of evidenceBullets) {
            const m = bullet.match(URL_INLINE_RE);
            const url = m ? (m[1] ?? m[2] ?? m[3]) : null;
            if (!url) continue;
            insertEvidence.run(synergyId, url, bullet, classifyEvidenceSource(url, bullet));
            stats.evidenceAdded++;
          }
        }

        // Change refs — only structured frontmatter is supported here.
        // Parsing arbitrary "v2.1.147" mentions from prose is too noisy; users
        // who want strict links should declare them in frontmatter.
        if (Array.isArray(fm.change_refs)) {
          for (const ref of fm.change_refs) {
            if (typeof ref === 'string') {
              // "product@version" or "product@version#ordinal"
              const m = ref.match(/^([^@]+)@([^#]+)(?:#(\d+))?$/);
              if (!m) continue;
              const refProduct = m[1].trim();
              const refVersion = m[2].trim();
              const ordinal = m[3] ? parseInt(m[3], 10) : null;
              if (ordinal !== null) {
                const row = selectChangeByPvOrdinal.get(refProduct, refVersion, ordinal) as
                  | { id: number }
                  | undefined;
                if (row) {
                  insertChangeRef.run(synergyId, row.id);
                  stats.changeRefsAdded++;
                }
              } else {
                const rows = selectChangeByPv.all(refProduct, refVersion) as Array<{ id: number }>;
                for (const r of rows) {
                  insertChangeRef.run(synergyId, r.id);
                  stats.changeRefsAdded++;
                }
              }
            } else if (ref && typeof ref === 'object') {
              const refProduct = String(ref.product ?? '').trim();
              const refVersion = String(ref.version ?? '').trim();
              if (!refProduct || !refVersion) continue;
              if (typeof ref.ordinal === 'number') {
                const row = selectChangeByPvOrdinal.get(refProduct, refVersion, ref.ordinal) as
                  | { id: number }
                  | undefined;
                if (row) {
                  insertChangeRef.run(synergyId, row.id);
                  stats.changeRefsAdded++;
                }
              } else {
                const rows = selectChangeByPv.all(refProduct, refVersion) as Array<{ id: number }>;
                for (const r of rows) {
                  insertChangeRef.run(synergyId, r.id);
                  stats.changeRefsAdded++;
                }
              }
            }
          }
        }
      } catch (e: any) {
        stats.errors.push({ file, error: e?.message ?? String(e) });
        stats.skipped++;
      }
    }
  });
  tx();

  return stats;
}
