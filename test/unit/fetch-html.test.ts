// Unit tests for src/fetch-html.ts — HTML-scrape fetchers (Tier 3 / Tier 4b).

import { describe, it, expect, afterEach, vi } from 'vitest';
import { readFileSync, mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fetchGithubCopilotBlog,
  fetchWindsurfChangelog,
  fetchVscodeUpdates,
  fetchClaudeApiReleaseNotes,
  fetchAnthropicAppsReleaseNotes,
  fetchHtmlReleases,
  sanitizeScrapedHtml,
} from '../../src/fetch-html.js';
import { AppError } from '../../src/errors.js';
import { ingestAll } from '../../src/ingest.js';
import { createTempDb } from '../helpers/temp-db.js';
import { mockFetch, type FetchMockHandle } from '../helpers/fetch-mock.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, '..', 'fixtures', 'mock-responses');

let handle: FetchMockHandle | undefined;
afterEach(() => {
  handle?.restore();
  handle = undefined;
  vi.restoreAllMocks();
});

function htmlResponse(body: string, status = 200): Response {
  return new Response(body, { status, headers: { 'content-type': 'text/html' } });
}

// ─── github-copilot-blog ────────────────────────────────────────────────────

describe('fetchGithubCopilotBlog', () => {
  it('extracts entry permalinks from listing, fetches detail pages, returns items', async () => {
    const listingHtml = `<html><body>
      <a href="/changelog/2026-05-20-foo-feature/">Foo</a>
      <a href="/changelog/2026-05-19-bar-fix/">Bar</a>
      <a href="/changelog/some-other-page/">Other</a>
      <a href="https://github.blog/changelog/2026-05-18-baz/">Baz absolute</a>
    </body></html>`;
    const detailHtml = (title: string) =>
      `<html><body><article><h1>${title}</h1><p>The release body.</p></article></body></html>`;

    handle = mockFetch([
      {
        urlPattern: /label\/copilot/,
        response: () => htmlResponse(listingHtml),
      },
      {
        urlPattern: /2026-05-20-foo/,
        response: () => htmlResponse(detailHtml('Foo Feature')),
      },
      {
        urlPattern: /2026-05-19-bar/,
        response: () => htmlResponse(detailHtml('Bar Fix')),
      },
      {
        urlPattern: /2026-05-18-baz/,
        response: () => htmlResponse(detailHtml('Baz')),
      },
    ]);

    const items = await fetchGithubCopilotBlog('2026-01-01');
    expect(items.length).toBe(3);
    const slugs = items.map((i) => i.slug).sort();
    expect(slugs).toContain('2026-05-20-foo-feature');
    expect(slugs).toContain('2026-05-19-bar-fix');
    expect(slugs).toContain('2026-05-18-baz');
  });

  it('skips entries dated at or before sinceIso', async () => {
    const listingHtml = `<html><body>
      <a href="/changelog/2026-05-20-recent/">R</a>
      <a href="/changelog/2025-12-01-old/">O</a>
    </body></html>`;
    handle = mockFetch([
      { urlPattern: /label\/copilot/, response: () => htmlResponse(listingHtml) },
      { urlPattern: /2026-05-20-recent/, response: () => htmlResponse('<article><h1>R</h1></article>') },
      { urlPattern: /2025-12-01-old/, response: () => htmlResponse('<article><h1>O</h1></article>') },
    ]);
    const items = await fetchGithubCopilotBlog('2026-01-01');
    expect(items.length).toBe(1);
    expect(items[0].slug).toMatch(/2026-05-20-recent/);
  });

  it('throws HTML_LAYOUT_CHANGED when page 1 has zero changelog entry links (FIX-2 Item 4)', async () => {
    handle = mockFetch([
      {
        urlPattern: /label\/copilot/,
        response: () => htmlResponse('<html><body><main><p>Changed layout</p></main></body></html>'),
      },
    ]);
    await expect(fetchGithubCopilotBlog('2026-01-01')).rejects.toMatchObject({
      code: 'HTML_LAYOUT_CHANGED',
    });
  });
});

// ─── windsurf-changelog ─────────────────────────────────────────────────────

describe('fetchWindsurfChangelog', () => {
  it('returns empty array when __NEXT_DATA__ script is absent (CSR fallback)', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    handle = mockFetch([
      {
        urlPattern: /windsurf\.com\/changelog/,
        response: () =>
          htmlResponse(
            '<!DOCTYPE html><html><body><h1>Windsurf Editor Changelog</h1></body></html>'
          ),
      },
    ]);
    const items = await fetchWindsurfChangelog('2026-01-01');
    expect(items).toEqual([]);
    expect(errSpy).toHaveBeenCalled(); // logged the gap message
  });

  it('parses entries from __NEXT_DATA__ when present', async () => {
    const nextData = {
      props: {
        pageProps: {
          entries: [
            { title: 'Version 2.3.9', date: '2026-05-17', body: 'Fixed availability issues.' },
            { title: 'Claude Opus 4.7', date: '2026-05-12', body: 'Now available.' },
            { title: 'Old entry', date: '2025-11-01', body: 'Old release.' },
          ],
        },
      },
    };
    const html = `<!DOCTYPE html><html><body>
      <script id="__NEXT_DATA__" type="application/json">${JSON.stringify(nextData)}</script>
    </body></html>`;
    handle = mockFetch([
      { urlPattern: /windsurf\.com\/changelog/, response: () => htmlResponse(html) },
    ]);

    const items = await fetchWindsurfChangelog('2026-01-01');
    expect(items.length).toBe(2); // old entry filtered out
    expect(items.map((i) => i.title)).toContain('Version 2.3.9');
    expect(items.map((i) => i.title)).toContain('Claude Opus 4.7');
  });

  it('throws HTML_LAYOUT_CHANGED when __NEXT_DATA__ is present without changelog entries (FIX-2 Item 4)', async () => {
    const html = `<!DOCTYPE html><html><body><script id="__NEXT_DATA__" type="application/json">{"props":{"pageProps":{"entries":[]}}}</script></body></html>`;
    handle = mockFetch([
      { urlPattern: /windsurf\.com\/changelog/, response: () => htmlResponse(html) },
    ]);
    await expect(fetchWindsurfChangelog('2026-01-01')).rejects.toMatchObject({
      code: 'HTML_LAYOUT_CHANGED',
    });
  });

  it('throws on non-200 response from windsurf.com', async () => {
    handle = mockFetch([
      { urlPattern: /windsurf/, response: () => htmlResponse('error', 500) },
    ]);
    await expect(fetchWindsurfChangelog('2026-01-01')).rejects.toThrow(/500/);
  });
});

// ─── vscode-updates ─────────────────────────────────────────────────────────

describe('fetchVscodeUpdates', () => {
  it('skips versions that return 404', async () => {
    handle = mockFetch([
      {
        // Match all VS Code update URLs and return 404 to simulate missing pages
        urlPattern: /code\.visualstudio\.com\/updates/,
        response: () => htmlResponse('not found', 404),
      },
    ]);
    const items = await fetchVscodeUpdates('2025-01-01');
    expect(items).toEqual([]);
  });

  it('produces items for valid version pages with non-empty body', async () => {
    handle = mockFetch([
      {
        urlPattern: /v1_113/,
        response: () =>
          htmlResponse(
            `<html><body><main><h1>Visual Studio Code 1.113</h1>${'<p>significant body content here to clear 200 char threshold; '.repeat(15)}</p></main></body></html>`
          ),
      },
      {
        urlPattern: /code\.visualstudio\.com\/updates/,
        response: () => htmlResponse('not found', 404),
      },
    ]);
    const items = await fetchVscodeUpdates('2025-01-01');
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.some((i) => i.slug === 'v1_113'), 'should include the v1_113 VS Code update').toBe(true);
  });

  it('skips entries dated at or before sinceIso', async () => {
    handle = mockFetch([
      // ALL VS Code update pages return non-empty content
      {
        urlPattern: /code\.visualstudio\.com\/updates/,
        response: (req) =>
          htmlResponse(
            `<html><body><main><h1>VS Code ${req.url.split('/').pop()}</h1>${'<p>body content '.repeat(30)}</p></main></body></html>`
          ),
      },
    ]);
    // sinceIso pushed to May 2026 — only versions mapped to dates after May 15 2026 land
    const items = await fetchVscodeUpdates('2026-05-15T13:00:00Z');
    // v1_113 maps to 2026-05-15 12:00 UTC which is BEFORE this since; v1_114 → 2026-06 etc. should land
    expect(
      items.every((i) => i.pubDate > '2026-05-15T13:00:00Z'),
      'all returned items should have pubDate after the since cutoff'
    ).toBe(true);
  });
});

// ─── Dispatcher ─────────────────────────────────────────────────────────────

describe('fetchHtmlReleases dispatcher', () => {
  it('routes to github-copilot-blog parser', async () => {
    handle = mockFetch([
      {
        urlPattern: /label\/copilot/,
        response: () => htmlResponse('<html><body><a href="/changelog/2026-05-20-dispatch/">Dispatch</a></body></html>'),
      },
    ]);
    const items = await fetchHtmlReleases('github-copilot-blog', '2026-12-01');
    expect(items).toEqual([]);
  });

  it('routes to windsurf-changelog parser', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    handle = mockFetch([
      { urlPattern: /windsurf/, response: () => htmlResponse('<html><body></body></html>') },
    ]);
    const items = await fetchHtmlReleases('windsurf-changelog', '2026-01-01');
    expect(items).toEqual([]);
  });

  it('routes to claude-api-release-notes and anthropic-apps-release-notes parsers', async () => {
    const apiHtml = readFileSync(join(FIXTURES_DIR, 'claude-api-release-notes.html'), 'utf-8');
    const appsHtml = readFileSync(join(FIXTURES_DIR, 'anthropic-apps-release-notes.html'), 'utf-8');
    handle = mockFetch([
      { urlPattern: /platform\.claude\.com\/docs\/en\/release-notes\/overview/, response: () => htmlResponse(apiHtml) },
      { urlPattern: /support\.claude\.com\/en\/articles\/12138966/, response: () => htmlResponse(appsHtml) },
    ]);
    const apiItems = await fetchHtmlReleases('claude-api-release-notes', '2026-11-01T00:00:00Z');
    const appsItems = await fetchHtmlReleases('anthropic-apps-release-notes', '2026-11-01T00:00:00Z');
    expect(apiItems).toHaveLength(2);
    expect(appsItems).toHaveLength(2);
  });
});

// ─── claude-api-release-notes & anthropic-apps-release-notes ────────────────

describe('fetchClaudeApiReleaseNotes', () => {
  it('parses dated h3 sections from fixture HTML, filters by sinceIso, and round-trips through ingest', async () => {
    const html = readFileSync(join(FIXTURES_DIR, 'claude-api-release-notes.html'), 'utf-8');
    handle = mockFetch([
      {
        urlPattern: /platform\.claude\.com\/docs\/en\/release-notes\/overview/,
        response: () => htmlResponse(html),
      },
    ]);

    const items = await fetchClaudeApiReleaseNotes('2026-06-01T00:00:00Z');
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.slug)).toEqual(['2026-11-23', '2026-11-17']);
    expect(items[0].link).toBe('https://platform.claude.com/docs/en/release-notes/overview#november-23-2026');
    expect(items[0].pubDate).toBe('2026-11-23T12:00:00.000Z');

    // Round-trip into ingestAll to confirm bullets and entities index cleanly
    const dir = mkdtempSync(join(tmpdir(), 'api-ingest-'));
    const temp = createTempDb({ loadVec: false });
    try {
      const relDir = join(dir, 'claude-api', 'releases');
      mkdirSync(relDir, { recursive: true });
      for (const item of items) {
        writeFileSync(
          join(relDir, `${item.slug}.md`),
          `---\nproduct: claude-api\nversion: "${item.slug}"\nreleased_at: "${item.pubDate.split('T')[0]}"\nsource_url: "${item.link}"\nfetched_at: "2026-11-26"\n---\n\n${item.body}\n`,
          'utf-8'
        );
      }
      const stats = ingestAll(temp.db, dir);
      expect(stats.releasesAdded).toBe(2);
      expect(stats.changesAdded).toBe(3);
      const modelEnt = temp.db
        .prepare(`SELECT entity_value FROM entities WHERE entity_type='model_id'`)
        .all() as Array<{ entity_value: string }>;
      expect(modelEnt.map((e) => e.entity_value)).toContain('claude-mythos-5-2');
    } finally {
      temp.cleanup();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('throws on HTTP error response', async () => {
    handle = mockFetch([
      {
        urlPattern: /platform\.claude\.com/,
        response: () => htmlResponse('error', 404),
      },
    ]);
    await expect(fetchClaudeApiReleaseNotes('2026-01-01')).rejects.toThrow(/404/);
  });
});

describe('fetchAnthropicAppsReleaseNotes', () => {
  it('parses Intercom subheading3 sections from fixture HTML, filters by sinceIso, and round-trips through ingest', async () => {
    const html = readFileSync(join(FIXTURES_DIR, 'anthropic-apps-release-notes.html'), 'utf-8');
    handle = mockFetch([
      {
        urlPattern: /support\.claude\.com\/en\/articles\/12138966/,
        response: () => htmlResponse(html),
      },
    ]);

    const items = await fetchAnthropicAppsReleaseNotes('2026-06-01T00:00:00Z');
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.slug)).toEqual(['2026-11-24', '2026-11-20']);
    expect(items[0].link).toBe('https://support.claude.com/en/articles/12138966-release-notes#h_21ad83d886');
    expect(items[0].body).toContain('Workspace artifact export');

    const dir = mkdtempSync(join(tmpdir(), 'apps-ingest-'));
    const temp = createTempDb({ loadVec: false });
    try {
      const relDir = join(dir, 'anthropic-apps', 'releases');
      mkdirSync(relDir, { recursive: true });
      for (const item of items) {
        writeFileSync(
          join(relDir, `${item.slug}.md`),
          `---\nproduct: anthropic-apps\nversion: "${item.slug}"\nreleased_at: "${item.pubDate.split('T')[0]}"\nsource_url: "${item.link}"\nfetched_at: "2026-11-26"\n---\n\n${item.body}\n`,
          'utf-8'
        );
      }
      const stats = ingestAll(temp.db, dir);
      expect(stats.releasesAdded).toBe(2);
      expect(stats.changesAdded).toBe(2);
    } finally {
      temp.cleanup();
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('throws on HTTP error response', async () => {
    handle = mockFetch([
      {
        urlPattern: /support\.claude\.com/,
        response: () => htmlResponse('error', 404),
      },
    ]);
    await expect(fetchAnthropicAppsReleaseNotes('2026-01-01')).rejects.toThrow(/404/);
  });

  it('throws AppError HTML_LAYOUT_CHANGED before since filter when no heading parses as a date (Item 7)', async () => {
    const noDateHtml = readFileSync(join(FIXTURES_DIR, 'no-date-headings.html'), 'utf-8');
    handle = mockFetch([
      { urlPattern: /platform\.claude\.com/, response: () => htmlResponse(noDateHtml) },
      { urlPattern: /support\.claude\.com/, response: () => htmlResponse(noDateHtml) },
    ]);

    for (const call of [
      () => fetchClaudeApiReleaseNotes('2026-01-01'),
      () => fetchAnthropicAppsReleaseNotes('2026-01-01'),
    ]) {
      let caught: unknown;
      try {
        await call();
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(AppError);
      expect((caught as AppError).code).toBe('HTML_LAYOUT_CHANGED');
    }
  });

  it('produces stable heading/content slugs on same-day entries regardless of sinceIso (Item 14)', async () => {
    const sameDayHtml = `<!doctype html><html><body><article>
      <div class="intercom-interblocks-subheading3"><h3 id="h_001">April 17, 2026</h3></div>
      <div class="intercom-interblocks-paragraph"><p><b>Claude Design</b></p><p>Launched Design workspace.</p></div>
      <div class="intercom-interblocks-subheading3"><h3 id="h_002">April 17, 2026</h3></div>
      <div class="intercom-interblocks-paragraph"><p><b>Claude Cowork</b></p><p>Added Cowork folders.</p></div>
      <div class="intercom-interblocks-subheading3"><h3 id="h_003">April 10, 2026</h3></div>
      <div class="intercom-interblocks-paragraph"><p>Earlier item.</p></div>
    </article></body></html>`;
    handle = mockFetch([
      { urlPattern: /support\.claude\.com/, response: () => htmlResponse(sameDayHtml) },
    ]);

    const full = await fetchAnthropicAppsReleaseNotes('2026-01-01');
    const narrow = await fetchAnthropicAppsReleaseNotes('2026-04-12');
    expect(narrow.map((i) => i.slug)).toEqual(full.slice(0, 2).map((i) => i.slug));
    expect(narrow[0].slug).toBe('2026-04-17-claude-design');
    expect(narrow[1].slug).toBe('2026-04-17-claude-cowork');
  });

  it('strips dangerous elements and attributes while serializing escaped text nodes safely (Items 15, FIX-2 Item 7, FIX-3 Item 1)', async () => {
    const dirty = [
      '<div>',
      '<script>alert(1)</script><style>body{}</style><iframe src="https://x.test"></iframe>',
      '<object data="https://x.test/obj"></object><embed src="https://x.test/emb">',
      '<meta http-equiv="refresh" content="0;url=https://evil.test"><meta name="description" content="ok">',
      '<link rel="stylesheet" href="https://evil.test/s.css"><base href="https://evil.test/">',
      '<svg><animate attributeName="href" to="javascript:alert(1)"/><set attributeName="onmouseover" to="evil()"/><circle r="5"/></svg>',
      '<img src="https://docs.example.test/a.png" srcset="https://evil.test/b.png 2x" style="background: url(https://evil.test/bg.png)">',
      '<p onclick="evil()" style="color: red">Keep <a href="javascript:alert(2)" onmouseover="bad()">js</a> <a href="data:text/html,<script>alert(3)</script>">data</a> <a href="vbscript:msgbox(4)">vbs</a> <a href="mailto:team@example.test">mail</a> <a href="/docs/overview">rel</a> and <a href="https://docs.example.test">safe</a></p>',
      '</div>',
    ].join('');
    const clean = sanitizeScrapedHtml(dirty);
    expect(clean).not.toMatch(/<script|<style|<iframe|<object|<embed|<link|<base|<animate|<set/i);
    expect(clean).not.toMatch(/http-equiv/i);
    expect(clean).not.toMatch(/\bsrcset\b|\bonclick\b|\bonmouseover\b/i);
    expect(clean).not.toMatch(/url\(/i);
    expect(clean).not.toMatch(/javascript:|data:|vbscript:/i);
    expect(clean).toContain('style="color: red"');
    expect(clean).toContain('Keep');
    expect(clean).toContain('mailto:team@example.test');
    expect(clean).toContain('/docs/overview');
    expect(clean).toContain('https://docs.example.test');

    // FIX-3 Item 1: escaped text like &lt;img ...&gt; must remain escaped, while real <script> and onclick are stripped.
    const escapedAndLive = sanitizeScrapedHtml(
      '<div>&lt;img src=x onerror=1&gt;<script>evil()</script><p onclick="bad()">ok</p></div>'
    );
    expect(escapedAndLive).toContain('&lt;img src=x onerror=1&gt;');
    expect(escapedAndLive).not.toMatch(/<img/i);
    expect(escapedAndLive).not.toMatch(/<script/i);
    expect(escapedAndLive).not.toMatch(/onclick/i);
    expect(escapedAndLive).toContain('<p>ok</p>');

    // FIX-4 Item 1: text with no '<' returns unchanged, while HTML keeps its entities.
    expect(sanitizeScrapedHtml('a && b')).toBe('a && b');
    expect(sanitizeScrapedHtml('<p>a &amp;&amp; b</p>')).toBe('<p>a &amp;&amp; b</p>');
  });

  it('escapes pendingHeading text containing <script> in renderSectionHtml (Part 4)', async () => {
    const xssHeadingHtml = `<!doctype html><html><body><article>
      <div class="intercom-interblocks-subheading3"><h3 id="h_xss">November 25, 2026</h3></div>
      <div class="intercom-interblocks-paragraph"><p><b>Heading with &lt;script&gt;alert(1)&lt;/script&gt; before list</b></p></div>
      <div class="intercom-interblocks-list"><ul><li>Safe list item</li></ul></div>
      <div class="intercom-interblocks-paragraph"><p><b>Inline &lt;script&gt;bad()&lt;/script&gt; title</b></p><p>Followed by details.</p></div>
      <div class="intercom-interblocks-paragraph"><p><b>Trailing &lt;script&gt;tail()&lt;/script&gt; title</b></p></div>
    </article></body></html>`;

    handle = mockFetch([
      { urlPattern: /support\.claude\.com\/en\/articles\/12138966/, response: () => htmlResponse(xssHeadingHtml) },
    ]);

    const items = await fetchAnthropicAppsReleaseNotes('2026-01-01');
    expect(items).toHaveLength(1);
    const body = items[0].body;
    expect(body).not.toMatch(/<script>/i);
    expect(body).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(body).toContain('&lt;script&gt;bad()&lt;/script&gt;');
    expect(body).toContain('&lt;script&gt;tail()&lt;/script&gt;');
    expect(body).toContain('Safe list item');
  });
});
