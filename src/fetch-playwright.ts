// Playwright-based fetcher for client-rendered changelogs.
//
// Used by Windsurf's changelog (windsurf.com/changelog), which is a fully
// client-rendered Next.js app — its static HTML carries NO entries. The cheerio
// path in fetch-html.ts returns [] for it. This module renders the page in
// headless Chromium and extracts entries from the live DOM.
//
// Playwright + Chromium is an OPTIONAL dependency (~280MB browser). The fetcher
// uses dynamic import; if `playwright` isn't installed, the function throws a
// clear actionable error rather than crashing at module load.

import type { HtmlItem } from './fetch-html.js';

/**
 * Fetch Windsurf's changelog by rendering the page in headless Chromium and
 * extracting entries from the DOM. Returns the same `HtmlItem` shape as the
 * other HTML scrapers so the rest of the pipeline doesn't need to care.
 *
 * Setup (run once on the host that performs the fetch):
 *   pnpm add -D playwright
 *   npx playwright install chromium
 *
 * @param sinceIso ISO 8601 timestamp; entries on or before are dropped
 * @param opts.timeoutMs page-load timeout (default 30s)
 */
export async function fetchWindsurfWithPlaywright(
  sinceIso: string,
  opts: { timeoutMs?: number } = {}
): Promise<HtmlItem[]> {
  let chromium: any;
  try {
    ({ chromium } = await import('playwright'));
  } catch (e: any) {
    throw new Error(
      `[fetch-playwright] playwright is not installed. To enable Windsurf coverage, ` +
        `run: pnpm add -D playwright && npx playwright install chromium`
    );
  }

  const timeoutMs = opts.timeoutMs ?? 30_000;
  const url = 'https://windsurf.com/changelog';

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent: 'claude-synergy/0.1.0 (+https://github.com/mcp-tool-shop-org/claude-synergy)',
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: timeoutMs });

    // Wait for at least one entry heading to render. If nothing renders we'll
    // time out cleanly with a useful error.
    await page.waitForSelector('h1[id], h2[id], h3[id]', { timeout: timeoutMs });

    const rawEntries = await page.evaluate(() => {
      // Inside browser context — we have access to DOM
      const entries: Array<{ title: string; id: string; date: string | null; body: string }> = [];

      // Windsurf layout (verified May 2026):
      //   <div class="mx-auto my-5 flex w-full max-w-5xl flex-col">  // entry wrapper
      //     <header>2.3.9 May 16, 2026</header>                       // version + date
      //     <article><div class="prose ..."><h1 id="...">Title</h1>...body...</div></article>
      //   </div>
      // Date is human-formatted ("May 16, 2026") in the header sibling.

      // Use H1[id] elements as anchors and walk up to the entry wrapper to find date.
      const headings = Array.from(document.querySelectorAll('h1[id]')) as HTMLElement[];

      for (let i = 0; i < headings.length; i++) {
        const head = headings[i];
        const id = head.id;
        const title = head.textContent?.trim() ?? '';
        if (!title || !id) continue;

        // Walk up to find a wrapper that contains a header with a date string.
        let date: string | null = null;
        let wrapper: Element | null = head;
        for (let depth = 0; depth < 6 && wrapper; depth++) {
          // Look for the date pattern in this wrapper's text (limit to first 200 chars
          // to avoid matching dates in body content of OTHER entries)
          const sample = (wrapper.textContent ?? '').slice(0, 200);
          const m = sample.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i);
          if (m) {
            const d = new Date(m[0]);
            if (!Number.isNaN(d.getTime())) {
              date = d.toISOString();
              break;
            }
          }
          wrapper = wrapper.parentElement;
        }

        // Body: collect HTML of siblings until the next entry heading
        const bodyParts: string[] = [];
        let next: Element | null = head.nextElementSibling;
        const nextHead = headings[i + 1];
        while (next && next !== nextHead) {
          if (next instanceof HTMLElement && next.matches('h1[id]')) break;
          bodyParts.push(next.outerHTML);
          next = next.nextElementSibling;
        }

        entries.push({
          title,
          id,
          date,
          body: bodyParts.join('\n').trim(),
        });
      }
      return entries;
    });

    // Filter + map to HtmlItem
    const items: HtmlItem[] = [];
    for (const e of rawEntries) {
      const pubDate = e.date ?? null;
      if (!pubDate) continue; // skip entries we can't date
      if (pubDate <= sinceIso) continue;
      items.push({
        slug: `${pubDate.split('T')[0]}-${e.id}`,
        title: e.title,
        pubDate,
        link: `${url}#${e.id}`,
        body: e.body,
      });
    }

    return items;
  } finally {
    await browser.close();
  }
}
