// Raw markdown CHANGELOG/HISTORY.md fetcher. Parser variants:
//   - 'aider-history'      — handles aider/HISTORY.md where each release is a `### Aider vX.Y.Z` section.
//   - 'keep-a-changelog'   — generic Keep-a-Changelog format (`## [X.Y.Z] - YYYY-MM-DD` headings)
//                            plus a lenient mode that also accepts plain `## X.Y.Z` headings (no
//                            brackets, optional date) — claude-code, for example, uses the lenient
//                            form. The parser tolerates real-world drift documented in FE-2.
//
// Dispatch lives in fetch.ts (fetchRawChangelog); each parser is a pure function exported here.

import { execSync } from 'node:child_process';
import { fetchWithRetry } from './fetch-utils.js';

export interface ChangelogItem {
  version: string;
  releasedAt: string | null; // null when undated (HISTORY.md often is)
  body: string;
}

/** Parser name union — kept in sync with the dispatcher in fetch.ts. */
export type ChangelogParserName = 'aider-history' | 'keep-a-changelog';

export async function fetchAiderHistory(url: string, sinceIso: string, signal?: AbortSignal): Promise<ChangelogItem[]> {
  const res = await fetchWithRetry(url, {
    headers: { 'user-agent': 'claude-synergy/0.1.0' },
    signal,
  });
  if (!res.ok) throw new Error(`raw-changelog ${url} returned ${res.status}`);
  const md = await res.text();

  const items = parseAiderHistory(md);

  // Aider HISTORY.md doesn't carry dates per release; correlate with GH release tags for dates.
  const releaseDates = aiderReleaseDates();
  for (const item of items) {
    const tag = `v${item.version}`;
    if (releaseDates.has(tag)) {
      item.releasedAt = releaseDates.get(tag)!;
    }
  }

  // Filter to items newer than sinceIso (only items with a date). Undated items (main branch / patches) are always included.
  return items.filter((i) => !i.releasedAt || i.releasedAt > sinceIso);
}

function parseAiderHistory(md: string): ChangelogItem[] {
  // Each release section is `### Aider vX.Y.Z` (case-insensitive sometimes).
  // "main branch" is `### main branch`.
  const lines = md.split('\n');
  const out: ChangelogItem[] = [];
  let currentVersion: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (currentVersion) {
      out.push({
        version: currentVersion,
        releasedAt: null,
        body: currentBody.join('\n').trim(),
      });
    }
    currentBody = [];
  };

  for (const line of lines) {
    const headerMatch = line.match(/^###\s+(?:Aider\s+)?(?:v(\d+\.\d+\.\d+(?:[-.][\w.]+)?)|main\s+branch)\s*$/i);
    if (headerMatch) {
      flush();
      currentVersion = headerMatch[1] ?? 'main';
      continue;
    }
    if (currentVersion) currentBody.push(line);
  }
  flush();

  return out.filter((i) => i.body.length > 0 || i.version !== 'main');
}

// ─── Keep-a-Changelog (generic CHANGELOG.md) ──────────────────────────────────
//
// Recognized headings:
//   - `## [1.2.3] - 2026-05-22`           (canonical Keep-a-Changelog)
//   - `## [v1.2.3] - 2026-05-22`          (with optional leading `v`)
//   - `## 1.2.3 - 2026-05-22`             (no brackets)
//   - `## v1.2.3 (2026-05-22)`            (parens around date)
//
// Skipped (per FE-2 rule 4 — versions with no date):
//   - `## [Unreleased]`                   (no version digit, no date)
//   - `## 1.2.3`                          (digit-bearing but no date — undated draft)
//
// Lowercase `### added/changed/fixed/...` subsections are preserved verbatim in
// the body. Sections whose heading doesn't match the version pattern are treated
// as separators (preamble between releases is ignored).

/**
 * Fetch a Keep-a-Changelog-style CHANGELOG.md and return parsed items newer than `sinceIso`.
 * Undated entries are dropped by `parseKeepAChangelog` per FE-2 rule 4, so this
 * function only filters dated items.
 */
export async function fetchKeepAChangelog(url: string, sinceIso: string, signal?: AbortSignal): Promise<ChangelogItem[]> {
  const res = await fetchWithRetry(url, {
    headers: { 'user-agent': 'claude-synergy/0.1.0' },
    signal,
  });
  if (!res.ok) throw new Error(`raw-changelog ${url} returned ${res.status}`);
  const md = await res.text();

  const items = parseKeepAChangelog(md);

  // Drop undated drafts and anything not strictly newer than `since`. The
  // parser preserves undated entries (releasedAt: null), but for incremental
  // network sync we want only dated, in-window entries.
  return items.filter((i) => i.releasedAt !== null && i.releasedAt > sinceIso);
}

/**
 * Parse a Keep-a-Changelog-style markdown document.
 * Exported so callers (and tests) can hit the pure function without network I/O.
 *
 * Returns one ChangelogItem per recognized `## <version>` heading. Headings that
 * don't carry a version (e.g. `## [Unreleased]`, `## Changelog`) are dropped.
 *
 * Body of each version is the markdown between its heading and the next `## `
 * heading, trimmed. ISO-8601 dates (YYYY-MM-DD) are picked up if present after
 * the version (with optional `-` / `–` / parens separator); otherwise releasedAt
 * is null.
 */
export function parseKeepAChangelog(md: string): ChangelogItem[] {
  const lines = md.split(/\r?\n/);
  const out: ChangelogItem[] = [];

  // Match `## ` (level-2 heading) only. Level-3 lines like `### added` are body content.
  // Capture groups:
  //   1) version string (with optional brackets / leading `v`)
  //   2) date (YYYY-MM-DD), optional
  //
  // Tolerant patterns we accept inside group 1:
  //   [1.2.3], [v1.2.3], 1.2.3, v1.2.3, 1.2.3-rc.1, 1.2.3+build.5
  //
  // We deliberately exclude pure-text headings like `## Unreleased` /
  // `## Changelog` by requiring a digit somewhere in the version slot.
  const versionLineRe = /^##\s+(?:\[\s*)?(v?\d[\w.+\-]*?)(?:\s*\])?\s*(?:[-–(]\s*(\d{4}-\d{2}-\d{2})\s*\)?)?\s*$/i;

  let currentVersion: string | null = null;
  let currentDate: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (!currentVersion) return;
    out.push({
      version: currentVersion,
      releasedAt: currentDate,
      body: currentBody.join('\n').trim(),
    });
    currentVersion = null;
    currentDate = null;
    currentBody = [];
  };

  for (const line of lines) {
    // Only level-2 `## ` lines can start a new release section. Level-1 `# Changelog`
    // and level-3 `### added` lines fall through to body accumulation.
    if (line.startsWith('## ')) {
      const match = line.match(versionLineRe);
      if (match) {
        flush();
        currentVersion = match[1].replace(/^v/i, '');
        currentDate = match[2] ?? null;
        continue;
      }
      // Level-2 heading that doesn't parse as a version (e.g. `## [Unreleased]`,
      // `## Migration guide`) — close out any open section so its body doesn't
      // leak into the non-version chunk; we treat this as a separator.
      flush();
      continue;
    }
    if (currentVersion) currentBody.push(line);
  }
  flush();

  // Drop entries with empty bodies (stray headings with no content). Undated
  // entries are preserved with releasedAt: null — callers that need date-based
  // filtering (e.g. fetchKeepAChangelog incremental sync) drop them naturally
  // via `releasedAt > sinceIso`. Preserving them here is the right call:
  // legitimate "## 1.2.3" drafts carry version info even without a date.
  return out.filter((i) => i.body.length > 0);
}

/** Pull GH release tag → date map for aider so HISTORY.md entries can be dated when possible. */
function aiderReleaseDates(): Map<string, string> {
  try {
    const out = execSync(`gh api "repos/Aider-AI/aider/releases?per_page=100"`, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const releases = JSON.parse(out) as Array<{ tag_name: string; published_at: string }>;
    const map = new Map<string, string>();
    for (const r of releases) if (r.tag_name && r.published_at) map.set(r.tag_name, r.published_at);
    return map;
  } catch (e: any) {
    // Enrich rate-limit errors with GITHUB_TOKEN guidance
    const stderr = (e?.stderr ?? '').toString();
    if (stderr.includes('403') || stderr.includes('429') || stderr.includes('rate limit')) {
      console.error(
        '[claude-synergy] GitHub API rate limit hit while fetching aider release dates. ' +
        'Set GITHUB_TOKEN env var for 5000 req/hr (vs 60 unauthenticated).'
      );
    }
    return new Map();
  }
}
