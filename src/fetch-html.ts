// HTML scrape fetchers for Tier 3 / Tier 4b products that publish changelogs as HTML.
// Each target picks an `htmlParser` and gets a dedicated parser function below.

import { createHash } from 'node:crypto';
import * as cheerio from 'cheerio';
import { AppError } from './errors.js';
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

// ─── Anthropic release notes helpers (claude-api / anthropic-apps) ─────────

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Strip dangerous active/executable elements and attributes (`<script>`, `<style>`,
 * `<iframe>`, `on*` event handlers, `javascript:` URLs) from scraped HTML bodies
 * before storing them to markdown files.
 */
export function sanitizeScrapedHtml(rawHtml: string): string {
  if (!rawHtml || !rawHtml.includes('<')) return rawHtml;
  const $ = cheerio.load(rawHtml, null, false);
  $('script, style, iframe').remove();
  $('*').each((_, el) => {
    const attribs = (el as any).attribs as Record<string, string> | undefined;
    if (!attribs) return;
    const $el = $(el);
    for (const [name, val] of Object.entries(attribs)) {
      const trimmed = name.trim().toLowerCase();
      if (/^on[a-z]/i.test(trimmed)) {
        $el.removeAttr(name);
      } else if (/^(?:href|src|action|formaction|xlink:href)$/i.test(trimmed)) {
        const normalized = String(val ?? '').replace(/[\x00-\x20]+/g, '').toLowerCase();
        if (normalized.startsWith('javascript:')) {
          $el.removeAttr(name);
        }
      }
    }
  });
  return ($.html() ?? '').trim();
}

/**
 * Parse a date heading like "November 23, 2026", "2026-11-23", or
 * "April 17, 2026 — Claude Design" into UTC noon ISO + YYYY-MM-DD so dates
 * never shift by host timezone, plus any trailing title suffix for slug stability.
 */
function parseHeadingDateUtc(text: string): { dateStr: string; iso: string; extraTitle: string } | null {
  const clean = text.replace(/\s+/g, ' ').trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})(?:\s*(?:[-–—:]\s*|\s+)(.+))?$/.exec(clean);
  if (ymd) {
    const y = parseInt(ymd[1], 10);
    const m = parseInt(ymd[2], 10) - 1;
    const d = parseInt(ymd[3], 10);
    const dt = new Date(Date.UTC(y, m, d, 12, 0, 0));
    if (!Number.isNaN(dt.getTime())) {
      return {
        dateStr: dt.toISOString().slice(0, 10),
        iso: dt.toISOString(),
        extraTitle: (ymd[4] ?? '').trim(),
      };
    }
  }
  const mdy = /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})(?:\s*(?:[-–—:]\s*|\s+)(.+))?$/i.exec(clean);
  if (mdy) {
    const monthIdx = MONTHS[mdy[1].toLowerCase()];
    const day = parseInt(mdy[2], 10);
    const year = parseInt(mdy[3], 10);
    if (monthIdx !== undefined && day >= 1 && day <= 31) {
      const dt = new Date(Date.UTC(year, monthIdx, day, 12, 0, 0));
      if (!Number.isNaN(dt.getTime()) && dt.getUTCMonth() === monthIdx && dt.getUTCDate() === day) {
        return {
          dateStr: dt.toISOString().slice(0, 10),
          iso: dt.toISOString(),
          extraTitle: (mdy[4] ?? '').trim(),
        };
      }
    }
  }
  return null;
}

function slugifyFragment(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

function stableSectionSlug(
  parsed: { dateStr: string; extraTitle: string },
  dateCount: number,
  anchor: string | undefined,
  body: string,
  usedSlugs: Set<string>,
  $: cheerio.CheerioAPI
): string {
  let slug = parsed.dateStr;
  if (dateCount > 1 || parsed.extraTitle) {
    const firstBoldOrText = cheerio.load(body, null, false)('strong, b, h4, li, p')
      .first()
      .text()
      .replace(/\s+/g, ' ')
      .trim();
    const semanticAnchor = anchor && !/^h_[0-9a-f]+$/i.test(anchor) ? anchor : '';
    const candidatePart =
      slugifyFragment(parsed.extraTitle) ||
      slugifyFragment(semanticAnchor) ||
      slugifyFragment(firstBoldOrText) ||
      slugifyFragment(anchor ?? '');
    slug = candidatePart
      ? `${parsed.dateStr}-${candidatePart}`
      : `${parsed.dateStr}-${createHash('sha256').update(body).digest('hex').slice(0, 8)}`;
  }

  if (usedSlugs.has(slug)) {
    const shortHash = createHash('sha256').update(`${anchor ?? ''}\n${body}`).digest('hex').slice(0, 8);
    slug = `${slug}-${shortHash}`;
  }
  usedSlugs.add(slug);
  return slug;
}

/**
 * Collect sibling elements belonging to one dated `<h3>` section, handling
 * both direct sibling layouts (claude-api docs-prose) and wrapped block
 * layouts (Intercom Help Center `div.intercom-interblocks-subheading3 > h3`).
 */
function collectSectionNodes($: cheerio.CheerioAPI, h3El: any): any[] {
  const $h3 = $(h3El);
  const directNext = $h3.nextAll().toArray();
  const walk = directNext.length > 0 ? directNext : $h3.parent().nextAll().toArray();
  const out: any[] = [];
  for (const node of walk) {
    const $node = $(node);
    if ($node.is('h1, h2, h3') || $node.find('h1, h2, h3').length > 0) {
      break;
    }
    out.push(node);
  }
  return out;
}

/**
 * Convert collected section HTML nodes into clean HTML `<ul><li>...</li></ul>`
 * or `<p>...</p>` blocks that ingestAll's turndown+parseBullets extracts cleanly.
 */
function renderSectionHtml($: cheerio.CheerioAPI, nodes: any[]): string {
  const parts: string[] = [];
  let pendingHeading: string | null = null;

  for (const node of nodes) {
    const $node = $(node);
    if ($node.is('ul, ol') || $node.find('ul, ol').length > 0) {
      if (pendingHeading) {
        parts.push(`<p>${pendingHeading}</p>`);
        pendingHeading = null;
      }
      const html = $.html(node);
      if (html) parts.push(html);
      continue;
    }

    const $p = $node.is('p') ? $node : $node.find('p').first();
    const rawText = ($p.length ? $p.text() : $node.text()).replace(/\s+/g, ' ').trim();
    if (!rawText) continue;

    // Intercom articles often use `<p><b>Feature title</b></p>` followed by
    // one or more description `<p>` blocks; combine into a list item so
    // `ingestAll` turns it into a searchable bullet row.
    const boldChild = $p.length ? $p.children('b, strong').first() : $node.children('b, strong').first();
    const isStandaloneBold =
      boldChild.length > 0 && boldChild.text().replace(/\s+/g, ' ').trim() === rawText;

    if (isStandaloneBold) {
      if (pendingHeading) {
        parts.push(`<li><strong>${pendingHeading}</strong></li>`);
      }
      pendingHeading = boldChild.text().replace(/\s+/g, ' ').trim();
    } else if (pendingHeading) {
      const inner = ($p.length ? $p.html() : $node.html()) ?? rawText;
      parts.push(`<li><strong>${pendingHeading}:</strong> ${inner.trim()}</li>`);
      pendingHeading = null;
    } else {
      const inner = ($p.length ? $p.html() : $node.html()) ?? rawText;
      parts.push(`<li>${inner.trim()}</li>`);
    }
  }

  if (pendingHeading) {
    parts.push(`<li><strong>${pendingHeading}</strong></li>`);
  }

  // If parts are bare `<li>` items, wrap in `<ul>` so turndown emits `- ` bullets.
  const hasBareLi = parts.some((p) => p.startsWith('<li>'));
  if (!hasBareLi) return parts.join('\n');
  const wrapped: string[] = [];
  let liBuffer: string[] = [];
  for (const p of parts) {
    if (p.startsWith('<li>')) {
      liBuffer.push(p);
    } else {
      if (liBuffer.length > 0) {
        wrapped.push(`<ul>${liBuffer.join('')}</ul>`);
        liBuffer = [];
      }
      wrapped.push(p);
    }
  }
  if (liBuffer.length > 0) wrapped.push(`<ul>${liBuffer.join('')}</ul>`);
  return wrapped.join('\n');
}

async function fetchDatedH3ReleaseNotes(
  url: string,
  sinceIso: string,
  signal?: AbortSignal
): Promise<HtmlItem[]> {
  const res = await fetchWithRetry(url, { headers: UA, signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const root = $('article').first();
  const h3Nodes = (
    root.length
      ? root.find('h3')
      : $('main').first().length
        ? $('main').first().find('h3')
        : $('h3')
  ).toArray();

  // Scan all headings BEFORE applying `sinceIso` so a layout change is detected even
  // when existing releases are all older than `sinceIso`, and so same-day counts stay stable.
  const datedSections: Array<{
    el: any;
    $h3: cheerio.Cheerio<any>;
    title: string;
    parsed: { dateStr: string; iso: string; extraTitle: string };
  }> = [];
  const dateCounts = new Map<string, number>();

  for (const el of h3Nodes) {
    const $h3 = $(el);
    const title = $h3.text().replace(/\s+/g, ' ').trim();
    const parsed = parseHeadingDateUtc(title);
    if (!parsed) continue;
    datedSections.push({ el, $h3, title, parsed });
    dateCounts.set(parsed.dateStr, (dateCounts.get(parsed.dateStr) ?? 0) + 1);
  }

  if (datedSections.length === 0) {
    throw new AppError({
      code: 'HTML_LAYOUT_CHANGED',
      message: `no dated release headings found at ${url} (scanned ${h3Nodes.length} <h3> elements)`,
      hint: 'Inspect the release notes page markup and update date heading selectors in src/fetch-html.ts.',
    });
  }

  const items: HtmlItem[] = [];
  const usedSlugs = new Set<string>();

  for (const entry of datedSections) {
    if (entry.parsed.iso <= sinceIso) continue;

    const sectionNodes = collectSectionNodes($, entry.el);
    const body = sanitizeScrapedHtml(renderSectionHtml($, sectionNodes)).trim();
    if (!body) continue;

    const anchor = entry.$h3.attr('id')?.trim();
    const link = anchor ? `${url}#${anchor}` : url;
    const dateCount = dateCounts.get(entry.parsed.dateStr) ?? 1;
    const slug = stableSectionSlug(entry.parsed, dateCount, anchor, body, usedSlugs, $);

    items.push({
      slug,
      title: entry.title,
      pubDate: entry.parsed.iso,
      link,
      body,
    });
  }

  return items;
}

/**
 * Fetch Claude API / Platform release notes from the server-rendered docs page.
 * Source: https://platform.claude.com/docs/en/release-notes/overview
 */
export async function fetchClaudeApiReleaseNotes(
  sinceIso: string,
  signal?: AbortSignal
): Promise<HtmlItem[]> {
  return fetchDatedH3ReleaseNotes(
    'https://platform.claude.com/docs/en/release-notes/overview',
    sinceIso,
    signal
  );
}

/**
 * Fetch Anthropic Apps release notes from the server-rendered Help Center page.
 * Source: https://support.claude.com/en/articles/12138966-release-notes
 */
export async function fetchAnthropicAppsReleaseNotes(
  sinceIso: string,
  signal?: AbortSignal
): Promise<HtmlItem[]> {
  return fetchDatedH3ReleaseNotes(
    'https://support.claude.com/en/articles/12138966-release-notes',
    sinceIso,
    signal
  );
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export type HtmlParserName =
  | 'github-copilot-blog'
  | 'windsurf-changelog'
  | 'vscode-updates'
  | 'claude-api-release-notes'
  | 'anthropic-apps-release-notes';

export async function fetchHtmlReleases(parser: HtmlParserName, sinceIso: string, signal?: AbortSignal): Promise<HtmlItem[]> {
  let items: HtmlItem[];
  switch (parser) {
    case 'github-copilot-blog':
      items = await fetchGithubCopilotBlog(sinceIso, signal);
      break;
    case 'windsurf-changelog':
      items = await fetchWindsurfChangelog(sinceIso, signal);
      break;
    case 'vscode-updates':
      items = await fetchVscodeUpdates(sinceIso, signal);
      break;
    case 'claude-api-release-notes':
      items = await fetchClaudeApiReleaseNotes(sinceIso, signal);
      break;
    case 'anthropic-apps-release-notes':
      items = await fetchAnthropicAppsReleaseNotes(sinceIso, signal);
      break;
  }
  return items.map((item) => ({ ...item, body: sanitizeScrapedHtml(item.body) }));
}
