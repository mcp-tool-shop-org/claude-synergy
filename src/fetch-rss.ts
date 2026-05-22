// RSS 2.0 feed fetcher for changelog feeds (Cursor, Sourcegraph Cody, etc).
// Returns structured items; caller decides what to do with them.

import { XMLParser } from 'fast-xml-parser';

export interface RssItem {
  /** Stable filesystem-safe slug (derived from guid or pubDate) */
  slug: string;
  title: string | null;
  link: string;
  /** ISO 8601 timestamp */
  pubDate: string;
  /** HTML or text body — content:encoded preferred, falls back to description */
  body: string | null;
}

export async function fetchRssReleases(
  url: string,
  sinceIso: string,
  titleFilter?: RegExp
): Promise<RssItem[]> {
  const res = await fetch(url, { headers: { 'user-agent': 'claude-synergy/0.1.0' } });
  if (!res.ok) throw new Error(`RSS ${url} returned ${res.status}`);
  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    cdataPropName: '__cdata',
    parseTagValue: false,
    trimValues: true,
  });
  const parsed = parser.parse(xml);

  // Path: rss.channel.item[]
  const rawItems = parsed?.rss?.channel?.item ?? [];
  const items: any[] = Array.isArray(rawItems) ? rawItems : [rawItems];

  const out: RssItem[] = [];
  for (const it of items) {
    if (!it) continue;
    const title = pickString(it.title);
    if (titleFilter && title && !titleFilter.test(title)) continue;

    const link = pickString(it.link) ?? pickString(it.guid) ?? '';
    const pubDateRaw = pickString(it.pubDate) ?? pickString(it['dc:date']) ?? '';
    const pubDateIso = parsePubDate(pubDateRaw);
    if (!pubDateIso) continue;
    if (pubDateIso <= sinceIso) continue;

    const guid = pickString(it.guid) ?? link;
    const slug = makeSlug(guid, pubDateIso, title);

    const body =
      pickString(it['content:encoded']) ??
      pickString(it.description) ??
      null;

    out.push({ slug, title, link, pubDate: pubDateIso, body });
  }

  return out;
}

/** RSS values can be strings, arrays, or { __cdata } when ignoreAttributes parsing is on */
function pickString(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string') return v.trim() || null;
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (typeof o.__cdata === 'string') return (o.__cdata as string).trim() || null;
    if (typeof o['#text'] === 'string') return (o['#text'] as string).trim() || null;
    if (typeof (o as any).toString === 'function') {
      const s = String(v);
      if (s !== '[object Object]') return s.trim() || null;
    }
  }
  return null;
}

function parsePubDate(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function makeSlug(guid: string, isoDate: string, title: string | null): string {
  // Prefer URL path tail (Cursor's permalinks are /changelog/MM-DD-YY or /changelog/slug).
  // F-003: tighten regex to require the slug start with [a-z0-9] (NOT a dot), so a
  // crafted feed cannot yield a leading-dot slug that survives sanitization downstream.
  try {
    const u = new URL(guid);
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^[a-z0-9][a-z0-9._-]*$/i.test(last)) {
      return last.replace(/\.html?$/, '').toLowerCase();
    }
  } catch {}

  // Fall back to date + slugified title
  const date = isoDate.split('T')[0];
  if (title) {
    const titleSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
    return `${date}-${titleSlug}`;
  }
  return date;
}
