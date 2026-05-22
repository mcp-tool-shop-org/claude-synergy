// Tests for src/fetch-playwright.ts. Playwright is loaded via DYNAMIC import,
// so we mock the module before each `await import('../../src/fetch-playwright.js')`.
// This pattern is documented in vitest's "Mocking dynamic imports" notes — the
// key is calling `vi.doMock` BEFORE the dynamic import resolves, and using
// `vi.resetModules()` between tests so each one gets a fresh load.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { makePlaywrightMock, type MockedRawEntry } from '../helpers/playwright-mock.js';

beforeEach(() => {
  vi.resetModules();
});
afterEach(() => {
  vi.restoreAllMocks();
});

const sample = (overrides: Partial<MockedRawEntry> = {}): MockedRawEntry => ({
  title: '2.3.9 May 16, 2026',
  id: '239-may-16-2026',
  date: '2026-05-16T00:00:00.000Z',
  body: '<p>Body</p>',
  ...overrides,
});

describe('fetchWindsurfWithPlaywright — happy path', () => {
  it('returns HtmlItem[] from mocked browser', async () => {
    const { module, calls } = makePlaywrightMock({
      entries: [
        sample({ title: 'Recent', id: 'r', date: '2026-05-01T00:00:00.000Z' }),
        sample({ title: 'Older', id: 'o', date: '2026-01-01T00:00:00.000Z' }),
      ],
    });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    const items = await fetchWindsurfWithPlaywright('2026-04-01T00:00:00Z');
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Recent');
    expect(items[0].link).toContain('#r');
    expect(items[0].slug).toMatch(/^2026-05-01-/);
    expect(calls.launch).toBe(1);
    expect(calls.close).toBe(1);
  });

  it('passes waitUntil:networkidle to page.goto', async () => {
    const { module, calls } = makePlaywrightMock({ entries: [] });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    await fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z');
    expect(calls.goto.length).toBe(1);
    expect(calls.goto[0].url).toContain('windsurf.com/changelog');
    expect(calls.goto[0].options.waitUntil).toBe('networkidle');
  });

  it('waits for a heading selector before evaluating', async () => {
    const { module, calls } = makePlaywrightMock({ entries: [] });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    await fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z');
    expect(calls.waitForSelector.length).toBe(1);
    expect(calls.waitForSelector[0].selector).toMatch(/h1\[id\]/);
  });

  it('sets the custom claude-synergy user agent', async () => {
    const { module } = makePlaywrightMock({ entries: [] });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    await fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z');
    const browser = await module.chromium.launch.mock.results[0].value;
    expect(browser.newContext).toHaveBeenCalledWith(
      expect.objectContaining({ userAgent: expect.stringContaining('claude-synergy') })
    );
  });
});

describe('fetchWindsurfWithPlaywright — filtering', () => {
  it('skips entries with no date', async () => {
    const { module } = makePlaywrightMock({
      entries: [
        sample({ title: 'Dated', id: 'd', date: '2026-05-01T00:00:00.000Z' }),
        sample({ title: 'Undated', id: 'u', date: null }),
      ],
    });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    const items = await fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z');
    expect(items.map((i) => i.title)).toEqual(['Dated']);
  });

  it('drops entries on or before sinceIso', async () => {
    const { module } = makePlaywrightMock({
      entries: [
        sample({ title: 'after', id: 'a', date: '2026-05-01T00:00:00.000Z' }),
        sample({ title: 'equal', id: 'e', date: '2026-04-01T00:00:00.000Z' }),
        sample({ title: 'before', id: 'b', date: '2026-03-01T00:00:00.000Z' }),
      ],
    });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    const items = await fetchWindsurfWithPlaywright('2026-04-01T00:00:00.000Z');
    expect(items.map((i) => i.title)).toEqual(['after']);
  });
});

describe('fetchWindsurfWithPlaywright — error paths', () => {
  it('throws a clear actionable error when playwright is not installed', async () => {
    vi.doMock('playwright', () => {
      throw new Error('Cannot find module \'playwright\'');
    });
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    await expect(fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z')).rejects.toThrow(
      /playwright is not installed.*npx playwright install/
    );
  });

  it('always calls browser.close even when page.evaluate throws', async () => {
    const { module, calls } = makePlaywrightMock({
      evaluateError: new Error('eval boom'),
    });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    await expect(fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z')).rejects.toThrow(/eval boom/);
    expect(calls.close).toBe(1);
  });

  it('calls browser.close when waitForSelector times out', async () => {
    const { module, calls } = makePlaywrightMock({
      waitSelectorError: new Error('Timeout 30000ms exceeded'),
    });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    await expect(fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z')).rejects.toThrow(/Timeout/);
    expect(calls.close).toBe(1);
  });

  it('respects a custom timeoutMs option', async () => {
    const { module, calls } = makePlaywrightMock({ entries: [] });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    await fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z', { timeoutMs: 5000 });
    expect(calls.goto[0].options.timeout).toBe(5000);
    expect(calls.waitForSelector[0].options.timeout).toBe(5000);
  });

  it('defaults timeoutMs to 30_000 when not provided', async () => {
    const { module, calls } = makePlaywrightMock({ entries: [] });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    await fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z');
    expect(calls.goto[0].options.timeout).toBe(30_000);
  });
});

describe('fetchWindsurfWithPlaywright — lifecycle invariants', () => {
  it('launches headless and tears down browser + context + page exactly once', async () => {
    const { module, calls } = makePlaywrightMock({ entries: [sample()] });
    vi.doMock('playwright', () => module);
    const { fetchWindsurfWithPlaywright } = await import('../../src/fetch-playwright.js');
    await fetchWindsurfWithPlaywright('2025-01-01T00:00:00Z');
    expect(calls.launch).toBe(1);
    expect(calls.newContext).toBe(1);
    expect(calls.newPage).toBe(1);
    expect(calls.evaluate).toBe(1);
    expect(calls.close).toBe(1);
    expect(module.chromium.launch).toHaveBeenCalledWith({ headless: true });
  });
});
