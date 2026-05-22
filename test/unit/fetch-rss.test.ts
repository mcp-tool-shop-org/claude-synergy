// Unit tests for src/fetch-rss.ts — RSS 2.0 feed parser used by Cursor + Cody Enterprise.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { fetchRssReleases } from '../../src/fetch-rss.js';
import { mockFetch, type FetchMockHandle } from '../helpers/fetch-mock.js';

let handle: FetchMockHandle | undefined;
afterEach(() => {
  handle?.restore();
  handle = undefined;
  vi.restoreAllMocks();
});

function rssResponse(items: Array<{ title?: string; link?: string; guid?: string; pubDate?: string; content?: string }>): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>Test Feed</title>
  <link>https://example.test</link>
  <description>Test</description>
${items
  .map(
    (it) => `  <item>
    ${it.title != null ? `<title>${it.title}</title>` : ''}
    ${it.link != null ? `<link>${it.link}</link>` : ''}
    ${it.guid != null ? `<guid>${it.guid}</guid>` : ''}
    ${it.pubDate != null ? `<pubDate>${it.pubDate}</pubDate>` : ''}
    ${it.content != null ? `<content:encoded><![CDATA[${it.content}]]></content:encoded>` : ''}
  </item>`
  )
  .join('\n')}
</channel>
</rss>`;
  return new Response(xml, { status: 200, headers: { 'content-type': 'application/rss+xml' } });
}

describe('fetchRssReleases — basic parsing', () => {
  it('parses a single item with all fields', async () => {
    handle = mockFetch([
      {
        urlPattern: /example\.test/,
        response: () =>
          rssResponse([
            {
              title: 'Cursor 3.5',
              link: 'https://cursor.com/changelog/05-20-26',
              guid: 'https://cursor.com/changelog/05-20-26',
              pubDate: 'Wed, 20 May 2026 12:00:00 GMT',
              content: '<p>This release brings automations to the Agents Window.</p>',
            },
          ]),
      },
    ]);

    const items = await fetchRssReleases('https://example.test/rss.xml', '2026-01-01');
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Cursor 3.5');
    expect(items[0].link).toBe('https://cursor.com/changelog/05-20-26');
    expect(items[0].pubDate.split('T')[0]).toBe('2026-05-20');
    expect(items[0].body).toMatch(/automations to the Agents Window/);
  });

  it('returns multiple items in feed order', async () => {
    handle = mockFetch([
      {
        urlPattern: /example\.test/,
        response: () =>
          rssResponse([
            { title: 'Three', link: 'https://t/3', guid: 'g3', pubDate: 'Wed, 20 May 2026 12:00:00 GMT', content: 'c3' },
            { title: 'Two', link: 'https://t/2', guid: 'g2', pubDate: 'Tue, 19 May 2026 12:00:00 GMT', content: 'c2' },
            { title: 'One', link: 'https://t/1', guid: 'g1', pubDate: 'Mon, 18 May 2026 12:00:00 GMT', content: 'c1' },
          ]),
      },
    ]);
    const items = await fetchRssReleases('https://example.test/rss.xml', '2026-01-01');
    expect(items.map((i) => i.title)).toEqual(['Three', 'Two', 'One']);
  });

  it('falls back to <description> when <content:encoded> is absent', async () => {
    const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel><item>
  <title>Plain</title>
  <link>https://t/p</link>
  <guid>gp</guid>
  <pubDate>Wed, 20 May 2026 12:00:00 GMT</pubDate>
  <description>Short summary only</description>
</item></channel></rss>`;
    handle = mockFetch([
      { urlPattern: /example/, response: () => new Response(xml, { status: 200 }) },
    ]);
    const items = await fetchRssReleases('https://example.test/rss.xml', '2026-01-01');
    expect(items[0].body).toBe('Short summary only');
  });
});

describe('fetchRssReleases — filtering', () => {
  it('filters items at or before sinceIso', async () => {
    handle = mockFetch([
      {
        urlPattern: /example/,
        response: () =>
          rssResponse([
            { title: 'After', link: 'https://t/a', guid: 'ga', pubDate: 'Tue, 02 May 2026 12:00:00 GMT', content: 'a' },
            { title: 'Before', link: 'https://t/b', guid: 'gb', pubDate: 'Sun, 01 Mar 2026 12:00:00 GMT', content: 'b' },
          ]),
      },
    ]);
    const items = await fetchRssReleases('https://example.test/rss.xml', '2026-04-01T00:00:00Z');
    expect(items.map((i) => i.title)).toEqual(['After']);
  });

  it('applies titleFilter regex when provided', async () => {
    handle = mockFetch([
      {
        urlPattern: /example/,
        response: () =>
          rssResponse([
            { title: 'Cody admin permissions', link: 'https://s/1', guid: 'g1', pubDate: 'Wed, 20 May 2026 12:00:00 GMT', content: 'c1' },
            { title: 'Unrelated platform update', link: 'https://s/2', guid: 'g2', pubDate: 'Wed, 20 May 2026 12:00:00 GMT', content: 'c2' },
            { title: 'Sourcegraph search', link: 'https://s/3', guid: 'g3', pubDate: 'Wed, 20 May 2026 12:00:00 GMT', content: 'c3' },
          ]),
      },
    ]);
    const items = await fetchRssReleases(
      'https://example.test/rss.xml',
      '2026-01-01',
      /cody|sourcegraph/i
    );
    expect(items.map((i) => i.title).sort()).toEqual(['Cody admin permissions', 'Sourcegraph search']);
  });

  it('skips items with unparseable pubDate (no throw)', async () => {
    handle = mockFetch([
      {
        urlPattern: /example/,
        response: () =>
          rssResponse([
            { title: 'Bad date', link: 'https://t/b', guid: 'gb', pubDate: 'not a date', content: 'b' },
            { title: 'Good date', link: 'https://t/g', guid: 'gg', pubDate: 'Wed, 20 May 2026 12:00:00 GMT', content: 'g' },
          ]),
      },
    ]);
    const items = await fetchRssReleases('https://example.test/rss.xml', '2026-01-01');
    expect(items.map((i) => i.title)).toEqual(['Good date']);
  });
});

describe('fetchRssReleases — slug generation', () => {
  it('derives slug from final URL path segment when path-safe', async () => {
    handle = mockFetch([
      {
        urlPattern: /example/,
        response: () =>
          rssResponse([
            {
              title: 'Improvements',
              link: 'https://cursor.com/changelog/05-20-26',
              guid: 'https://cursor.com/changelog/05-20-26',
              pubDate: 'Wed, 20 May 2026 12:00:00 GMT',
              content: 'c',
            },
          ]),
      },
    ]);
    const items = await fetchRssReleases('https://example.test/rss.xml', '2026-01-01');
    expect(items[0].slug).toBe('05-20-26');
  });

  it('falls back to date + title slug when guid has no clean path tail', async () => {
    handle = mockFetch([
      {
        urlPattern: /example/,
        response: () =>
          rssResponse([
            {
              title: 'A Great Feature',
              link: 'https://example.com/?id=42',
              guid: 'https://example.com/?id=42',
              pubDate: 'Wed, 20 May 2026 12:00:00 GMT',
              content: 'c',
            },
          ]),
      },
    ]);
    const items = await fetchRssReleases('https://example.test/rss.xml', '2026-01-01');
    expect(items[0].slug).toBe('2026-05-20-a-great-feature');
  });
});

describe('fetchRssReleases — error paths', () => {
  it('throws on non-200 response', async () => {
    handle = mockFetch([
      { urlPattern: /example/, response: () => new Response('not found', { status: 404 }) },
    ]);
    await expect(fetchRssReleases('https://example.test/rss.xml', '2026-01-01')).rejects.toThrow(/404/);
  });

  it('returns empty array on empty <channel>', async () => {
    handle = mockFetch([
      {
        urlPattern: /example/,
        response: () =>
          new Response(
            `<?xml version="1.0"?><rss version="2.0"><channel><title>Empty</title></channel></rss>`,
            { status: 200 }
          ),
      },
    ]);
    const items = await fetchRssReleases('https://example.test/rss.xml', '2026-01-01');
    expect(items).toEqual([]);
  });
});
