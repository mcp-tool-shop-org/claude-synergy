// Mock factory for the optional `playwright` dependency. Pass into vi.doMock:
//
//   vi.doMock('playwright', () => makePlaywrightMock({ entries: [...] }));
//
// Captures lifecycle calls (launch, newContext, newPage, goto, evaluate, close)
// on the returned `calls` object so tests can assert on what happened.
//
// The HTML parser inside src/fetch-playwright.ts runs inside `page.evaluate`;
// the mock substitutes a canned array for the evaluate result so tests don't
// need a real DOM.

import { vi } from 'vitest';

export interface MockedRawEntry {
  title: string;
  id: string;
  /** Already-ISO 8601 string OR null when undateable. */
  date: string | null;
  body: string;
}

export interface PlaywrightMockCalls {
  launch: number;
  newContext: number;
  newPage: number;
  goto: Array<{ url: string; options?: any }>;
  waitForSelector: Array<{ selector: string; options?: any }>;
  evaluate: number;
  close: number;
}

export interface PlaywrightMockOptions {
  /** Entries that `page.evaluate` will return when called. */
  entries?: MockedRawEntry[];
  /** When set, `page.goto` rejects with this error. */
  gotoError?: Error;
  /** When set, `page.evaluate` rejects with this error (still expects close). */
  evaluateError?: Error;
  /** When set, `page.waitForSelector` rejects with this error. */
  waitSelectorError?: Error;
}

export interface PlaywrightMockResult {
  module: { chromium: { launch: ReturnType<typeof vi.fn> } };
  calls: PlaywrightMockCalls;
}

export function makePlaywrightMock(opts: PlaywrightMockOptions = {}): PlaywrightMockResult {
  const calls: PlaywrightMockCalls = {
    launch: 0,
    newContext: 0,
    newPage: 0,
    goto: [],
    waitForSelector: [],
    evaluate: 0,
    close: 0,
  };

  const page = {
    goto: vi.fn(async (url: string, options?: any) => {
      calls.goto.push({ url, options });
      if (opts.gotoError) throw opts.gotoError;
    }),
    waitForSelector: vi.fn(async (selector: string, options?: any) => {
      calls.waitForSelector.push({ selector, options });
      if (opts.waitSelectorError) throw opts.waitSelectorError;
    }),
    evaluate: vi.fn(async () => {
      calls.evaluate++;
      if (opts.evaluateError) throw opts.evaluateError;
      return opts.entries ?? [];
    }),
  };

  const context = {
    newPage: vi.fn(async () => {
      calls.newPage++;
      return page;
    }),
  };

  const browser = {
    newContext: vi.fn(async () => {
      calls.newContext++;
      return context;
    }),
    close: vi.fn(async () => {
      calls.close++;
    }),
  };

  const chromium = {
    launch: vi.fn(async () => {
      calls.launch++;
      return browser;
    }),
  };

  return { module: { chromium }, calls };
}
