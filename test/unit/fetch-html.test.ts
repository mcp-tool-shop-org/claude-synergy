// Unit tests for src/fetch-html.ts — HTML-scrape fetchers (Tier 4b).

import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  fetchGithubCopilotBlog,
  fetchWindsurfChangelog,
  fetchVscodeUpdates,
  fetchHtmlReleases,
} from '../../src/fetch-html.js';
import { mockFetch, type FetchMockHandle } from '../helpers/fetch-mock.js';

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
      { urlPattern: /label\/copilot/, response: () => htmlResponse('<html><body></body></html>') },
    ]);
    const items = await fetchHtmlReleases('github-copilot-blog', '2026-01-01');
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
});
