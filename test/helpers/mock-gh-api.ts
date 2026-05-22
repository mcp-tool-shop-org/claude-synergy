/**
 * Shared mock for the `gh api` subprocess call used by src/fetch.ts.
 *
 * src/fetch.ts uses execFileSync('gh', ['api', ...]) to fetch GitHub releases.
 * These helpers replace the child_process module with a mock that returns
 * controlled JSON, allowing tests to exercise fetch logic without network.
 *
 * Three flavors cover the test suite's needs:
 *
 * - mockGhApi(releases)        — returns `releases` on first page, `[]` after
 * - mockGhApiPages(pageArrays) — returns each array per page, `[]` after last
 * - mockGhApiTag(tag)          — builds a single-release array from a tag name
 */

import { vi } from 'vitest';

/** A minimal GitHub release shape — only the fields src/fetch.ts reads. */
export interface MockRelease {
  tag_name: string;
  published_at: string;
  name: string;
  body: string;
  html_url: string;
}

/**
 * Mock `gh api` to return `releases` on the first call (page 1) and `[]`
 * on subsequent calls so the pagination loop terminates.
 *
 * Must be called BEFORE `vi.importActual` / dynamic `import()` of src/fetch.ts.
 */
export function mockGhApi(releases: MockRelease[]) {
  let callCount = 0;
  const respond = () => {
    callCount += 1;
    return callCount === 1
      ? Buffer.from(JSON.stringify(releases), 'utf-8').toString('utf-8')
      : '[]';
  };
  vi.doMock('node:child_process', () => ({
    execFileSync: vi.fn(respond),
    execSync: vi.fn(respond),
  }));
}

/**
 * Mock `gh api` with explicit per-page arrays.  After all pages are exhausted
 * the mock returns `[]`.
 */
export function mockGhApiPages(pages: MockRelease[][]) {
  let callCount = 0;
  const respond = () => {
    const page = pages[callCount] ?? [];
    callCount += 1;
    return JSON.stringify(page);
  };
  vi.doMock('node:child_process', () => ({
    execFileSync: vi.fn(respond),
    execSync: vi.fn(respond),
  }));
  return { get callCount() { return callCount; } };
}

/**
 * Mock `gh api` to return a single release built from a tag name.
 * Useful for sanitize-filename tests that only need one release per test.
 */
export function mockGhApiTag(tag: string) {
  let callCount = 0;
  vi.doMock('node:child_process', () => ({
    execFileSync: vi.fn(() => {
      callCount += 1;
      return callCount === 1
        ? JSON.stringify([
            {
              tag_name: tag,
              published_at: '2026-05-01T10:00:00Z',
              name: `Release ${tag}`,
              body: '- test',
              html_url: `https://github.com/anthropics/claude-agent-sdk-python/releases/tag/${encodeURIComponent(tag)}`,
            },
          ])
        : '[]';
    }),
    execSync: vi.fn(() => '[]'),
  }));
}

/**
 * Build a minimal MockRelease from just a tag + optional overrides.
 * Reduces boilerplate when the test only cares about the tag name.
 */
export function release(
  tag: string,
  overrides: Partial<MockRelease> = {}
): MockRelease {
  return {
    tag_name: tag,
    published_at: '2026-04-01T10:00:00Z',
    name: 'r',
    body: '- one',
    html_url: 'u',
    ...overrides,
  };
}
