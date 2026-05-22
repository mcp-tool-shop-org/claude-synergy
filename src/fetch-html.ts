// HTML scrape fetchers for Tier 4b products that publish changelogs as HTML.
// Each target picks an `htmlParser` and gets a dedicated parser function below.

import * as cheerio from 'cheerio';
import { fetchWithRetry } from './fetch-utils.js';

export interface HtmlItem {
  slug: string;
  title: string;
  pubDate: string; // ISO 8601
  link: string;
  body: string; // HTML or markdown
}

const UA = { 'user-agent': 'claude-synergy/0.1.0' };

// ─── github-copilot-blog ────────────────────────────────────────────────────
// Source: https://github.blog/changelog/label/copilot/
// Listing page links to /changelog/YYYY-MM-DD-slug/ permalinks.

export async function fetchGithubCopilotBlog(sinceIso: string, signal?: AbortSignal): Promise<HtmlItem[]> {
  const baseUrl = 'https://github.blog/changelog/label/copilot/';

  // Listing pages — fetch up to 3 (covers ~60-90 entries; plenty for daily sync)
  const entryUrls = new Set<string>();
  for (let page = 1; page <= 3; page++) {
    const url = page === 1 ? baseUrl : `${baseUrl}page/${page}/`;
    try {
      const res = await fetchWithRetry(url, { headers: UA, signal });
      if (!res.ok) break;
      const html = await res.text();
      const $ = cheerio.load(html);
      $('a[href*="/changelog/"]').each((_, el) => {
        const href = $(el).attr('href');
        if (!href) return;
        // Match /changelog/YYYY-MM-DD-... permalinks
        const m = href.match(/^(?:https:\/\/github\.blog)?(\/changelog\/20\d{2}-\d{2}-\d{2}-[^/?#]+\/?)$/);
        if (m) entryUrls.add(`https://github.blog${m[1].startsWith('/') ? m[1] : '/' + m[1]}`);
      });
    } catch {
      break;
    }
  }

  const items: HtmlItem[] = [];
  for (const url of entryUrls) {
    const slugMatch = url.match(/\/changelog\/(20\d{2}-\d{2}-\d{2})-([^/]+)\/?$/);
    if (!slugMatch) continue;
    const dateStr = slugMatch[1];
    const pubDate = new Date(`${dateStr}T12:00:00Z`).toISOString();
    if (pubDate <= sinceIso) continue;

    try {
      const res = await fetchWithRetry(url, { headers: UA, signal });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      const title = ($('h1').first().text() || $('meta[property="og:title"]').attr('content') || '').trim();
      // Body is the article content; github.blog wraps in <article> or <main>
      const bodyEl = $('article').first();
      const body = (bodyEl.length ? bodyEl.html() : $('main').first().html()) ?? '';
      items.push({
        slug: `${dateStr}-${slugMatch[2]}`,
        title,
        pubDate,
        link: url,
        body: body.trim(),
      });
    } catch {
      continue;
    }
  }

  return items;
}

// ─── windsurf-changelog ─────────────────────────────────────────────────────
// Source: https://windsurf.com/changelog
// IMPORTANT: Windsurf's changelog is a Next.js client-rendered SPA — the static HTML
// from a plain fetch does NOT include entry content. Three paths:
//   1. Headless browser (Playwright) to render JS — see src/fetch-playwright.ts (v0.7+)
//   2. Mine the embedded Next.js __NEXT_DATA__ JSON if present. Best-effort below.
//   3. Return [] gracefully with a clear log message.
//
// This parser tries (2), and on failure logs a hint pointing at the playwright path.

export async function fetchWindsurfChangelog(sinceIso: string, signal?: AbortSignal): Promise<HtmlItem[]> {
  const url = 'https://windsurf.com/changelog';
  const res = await fetchWithRetry(url, { headers: UA, signal });
  if (!res.ok) throw new Error(`Windsurf ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Try to find __NEXT_DATA__ script with build-time props
  const nextDataScript = $('script#__NEXT_DATA__').html();
  if (!nextDataScript) {
    // No SSR data — Windsurf is fully CSR. Log and return empty.
    // Use `hk fetch --product windsurf --playwright` (or the playwright strategy in products.yaml) for full coverage.
    console.error('[fetch-html] windsurf: __NEXT_DATA__ not found; changelog is client-rendered. Use the playwright strategy (src/fetch-playwright.ts) for full coverage. 0 entries.');
    return [];
  }

  try {
    const data = JSON.parse(nextDataScript);
    // Recursively walk to find an array of changelog entries.
    // Common shapes: data.props.pageProps.entries[] or data.props.pageProps.changelog[]
    const entries = findChangelogEntries(data);
    if (!entries || entries.length === 0) {
      console.error('[fetch-html] windsurf: __NEXT_DATA__ present but no entry array found. 0 entries.');
      return [];
    }

    const items: HtmlItem[] = [];
    for (const e of entries) {
      const title = (e.title ?? e.heading ?? e.name ?? '').toString().trim();
      const dateRaw = (e.date ?? e.publishedAt ?? e.published_at ?? '').toString();
      if (!title || !dateRaw) continue;
      const d = new Date(dateRaw);
      if (Number.isNaN(d.getTime())) continue;
      const pubDate = d.toISOString();
      if (pubDate <= sinceIso) continue;

      const body = (e.body ?? e.content ?? e.description ?? '').toString();
      const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
      const slug = `${pubDate.split('T')[0]}-${titleSlug || 'entry'}`;
      items.push({ slug, title, pubDate, link: `${url}#${titleSlug}`, body });
    }
    return items;
  } catch (e: any) {
    console.error(`[fetch-html] windsurf: __NEXT_DATA__ parse failed: ${e.message}`);
    return [];
  }
}

function findChangelogEntries(obj: unknown, depth = 0): any[] | null {
  if (depth > 8 || !obj || typeof obj !== 'object') return null;
  // Heuristic: an array of objects with `title` AND (`date` or `publishedAt`) is likely entries.
  if (Array.isArray(obj)) {
    if (
      obj.length > 0 &&
      typeof obj[0] === 'object' &&
      obj[0] !== null &&
      (typeof (obj[0] as any).title === 'string' || typeof (obj[0] as any).heading === 'string') &&
      (typeof (obj[0] as any).date === 'string' ||
        typeof (obj[0] as any).publishedAt === 'string' ||
        typeof (obj[0] as any).published_at === 'string')
    ) {
      return obj as any[];
    }
    return null;
  }
  for (const v of Object.values(obj as Record<string, unknown>)) {
    const found = findChangelogEntries(v, depth + 1);
    if (found) return found;
  }
  return null;
}

// ─── vscode-updates ─────────────────────────────────────────────────────────
// Source: https://code.visualstudio.com/updates/v1_NNN (monthly pages)
// VS Code H1 is just "Visual Studio Code 1.115" — no date — so we map version→month.
// Cadence: v1_X ships roughly one minor version per month. v1_110 = Feb 2026.

const VSCODE_V_TO_MONTH: Record<number, [number, number]> = {
  // version → [year, month-1 (0-indexed)]
  100: [2025, 3],   // April 2025
  101: [2025, 4],   // May 2025
  102: [2025, 5],   // June 2025
  103: [2025, 6],   // July 2025
  104: [2025, 7],   // August 2025
  105: [2025, 8],   // September 2025
  106: [2025, 9],   // October 2025
  107: [2025, 10],  // November 2025
  108: [2025, 11],  // December 2025
  109: [2026, 0],   // January 2026
  110: [2026, 1],   // February 2026
  111: [2026, 2],   // March 2026
  112: [2026, 3],   // April 2026
  113: [2026, 4],   // May 2026
  114: [2026, 5],   // June 2026 (future / Insiders)
  115: [2026, 6],   // July 2026 (future / Insiders)
  116: [2026, 7],
  117: [2026, 8],
  118: [2026, 9],
  119: [2026, 10],
  120: [2026, 11],
};

/**
 * F-008: extract the actual Release-date from the VS Code updates page HTML.
 * The monthly page always carries a line like `<em>Release date: March 25, 2026</em>`
 * (verified across v1_109 → v1_113 in the on-disk corpus). Returns ISO date or null.
 * Also tries a `<time datetime="...">` tag and a generic "Welcome to the ... release"
 * paragraph as secondary signals before giving up.
 */
function parseVscodeReleaseDate(html: string, $: cheerio.CheerioAPI): string | null {
  // Primary signal: `<em>Release date: <Month> <Day>, <Year></em>`
  const releaseDateMatch = html.match(
    /Release\s+date[:\s]*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},\s*\d{4})/i
  );
  if (releaseDateMatch) {
    const d = new Date(releaseDateMatch[1]);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  // Secondary signal: `<time datetime="2026-03-25">` style
  const timeEl = $('time[datetime]').first();
  if (timeEl.length) {
    const iso = timeEl.attr('datetime');
    if (iso) {
      const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
  }

  // Tertiary signal: "Welcome to the <Month> <Year> release"
  const welcomeMatch = html.match(
    /Welcome to the\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i
  );
  if (welcomeMatch) {
    // No day → use mid-month; this is still better than the version→month table fallback
    // because at least the month is read from the page itself.
    const d = new Date(`${welcomeMatch[1]} 15`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }

  return null;
}

export async function fetchVscodeUpdates(sinceIso: string, signal?: AbortSignal): Promise<HtmlItem[]> {
  const items: HtmlItem[] = [];
  for (const [vStr, [year, monthIdx]] of Object.entries(VSCODE_V_TO_MONTH)) {
    const v = parseInt(vStr, 10);
    // F-008: keep the version→month table as a FALLBACK only. Primary path reads
    // the actual `Release date:` line from the page below.
    const fallbackIsoDate = new Date(Date.UTC(year, monthIdx, 15, 12)).toISOString();

    const versionTag = `v1_${v}`;
    const url = `https://code.visualstudio.com/updates/${versionTag}`;

    // Fast-skip optimization: real release dates are within ±31 days of the mid-month
    // fallback (release moves around by a few weeks, never by a full month). If even
    // fallback+31d is still ≤ sinceIso, we can confidently skip without HTTP fetch.
    const fallbackPlus31d = new Date(Date.parse(fallbackIsoDate) + 31 * 24 * 3600 * 1000).toISOString();
    if (fallbackPlus31d <= sinceIso) continue;

    try {
      const res = await fetchWithRetry(url, { headers: UA, signal, maxRetries: 1 });
      if (res.status === 404) continue;
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      // F-008: primary path — extract date from page content. If absent, warn + fall back.
      let isoDate = parseVscodeReleaseDate(html, $);
      if (!isoDate) {
        console.warn(
          `[fetch-html] vscode ${versionTag}: no Release-date line found; falling back to mid-month (${fallbackIsoDate.split('T')[0]})`
        );
        isoDate = fallbackIsoDate;
      }

      if (isoDate <= sinceIso) continue;

      const title = $('h1').first().text().trim() || `Visual Studio Code 1.${v}`;
      const body = ($('main').first().html() || $('article').first().html() || '').trim();

      // Skip pages with empty body (future versions that 200 but have no content)
      if (body.length < 200) continue;

      items.push({
        slug: versionTag,
        title,
        pubDate: isoDate,
        link: url,
        body,
      });
    } catch {
      continue;
    }
  }
  return items;
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export type HtmlParserName = 'github-copilot-blog' | 'windsurf-changelog' | 'vscode-updates';

export async function fetchHtmlReleases(parser: HtmlParserName, sinceIso: string, signal?: AbortSignal): Promise<HtmlItem[]> {
  switch (parser) {
    case 'github-copilot-blog':
      return fetchGithubCopilotBlog(sinceIso, signal);
    case 'windsurf-changelog':
      return fetchWindsurfChangelog(sinceIso, signal);
    case 'vscode-updates':
      return fetchVscodeUpdates(sinceIso, signal);
  }
}
