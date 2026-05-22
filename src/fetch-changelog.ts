// Raw markdown CHANGELOG/HISTORY.md fetcher. Currently has one parser variant:
// 'aider-history' — handles aider/HISTORY.md where each release is a `### Aider vX.Y.Z` section.

import { execSync } from 'node:child_process';
import { fetchWithRetry } from './fetch-utils.js';

export interface ChangelogItem {
  version: string;
  releasedAt: string | null; // null when undated (HISTORY.md often is)
  body: string;
}

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
  } catch {
    return new Map();
  }
}
