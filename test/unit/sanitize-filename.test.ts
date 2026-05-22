// T-01: sanitizeFilename() has zero direct test coverage.
//
// sanitizeFilename() is not exported from src/fetch.ts (it is the sole
// path-traversal defense for filenames derived from untrusted input).
// We exercise it through the public fetchAll() surface by mocking the gh CLI
// to return pathological tag names and verifying the resulting filenames on disk
// do NOT contain traversal sequences, null bytes, or Windows-reserved chars.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';

let temp: TempDb;
let productsRoot: string;

beforeEach(() => {
  temp = createTempDb();
  productsRoot = mkdtempSync(join(tmpdir(), 'sanitize-fn-'));
  vi.resetModules();
});
afterEach(() => {
  temp.cleanup();
  rmSync(productsRoot, { recursive: true, force: true });
  vi.restoreAllMocks();
});

/**
 * Helper: mock gh CLI to return one release with the given tag_name.
 * Returns the tag after fetchAll runs so we can inspect the filesystem.
 */
function mockGhWithTag(tag: string) {
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

/** Get all .md filenames in the releases dir for a product */
function releasedFiles(product: string): string[] {
  const dir = join(productsRoot, product, 'releases');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.md'));
}

/** Assert no file in the product releases dir contains traversal or forbidden chars */
function assertAllFilesSafe(product: string) {
  const files = releasedFiles(product);
  for (const f of files) {
    expect(f).not.toContain('..');
    expect(f).not.toContain('/');
    expect(f).not.toContain('\\');
    expect(f).not.toContain('\x00');
    expect(f).not.toContain('<');
    expect(f).not.toContain('>');
    expect(f).not.toContain(':');
    expect(f).not.toContain('"');
    expect(f).not.toContain('|');
    expect(f).not.toContain('?');
    expect(f).not.toContain('*');
  }
}

describe('sanitizeFilename — path traversal defense (via fetchAll)', () => {
  it('normal semver tag passes through safely', async () => {
    mockGhWithTag('v1.2.3');
    const { fetchAll } = await import('../../src/fetch.js');
    const stats = await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    expect(stats[0].fetched).toBe(1);
    assertAllFilesSafe('claude-agent-sdk-python');
    expect(releasedFiles('claude-agent-sdk-python')).toContain('1.2.3.md');
  });

  it('../ traversal in tag name is neutralized (forward slash)', async () => {
    mockGhWithTag('../../etc/passwd');
    const { fetchAll } = await import('../../src/fetch.js');
    const stats = await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    // Either written safely or rejected outright — must not write to ../../
    assertAllFilesSafe('claude-agent-sdk-python');
    // If it was written (sanitized), confirm no traversal
    const files = releasedFiles('claude-agent-sdk-python');
    for (const f of files) {
      expect(f).not.toMatch(/\.\./);
      expect(f).not.toContain('/');
    }
  });

  it('..\\traversal (backslash) in tag name is neutralized', async () => {
    mockGhWithTag('..\\..\\windows\\system32\\evil');
    const { fetchAll } = await import('../../src/fetch.js');
    const stats = await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    assertAllFilesSafe('claude-agent-sdk-python');
    const files = releasedFiles('claude-agent-sdk-python');
    for (const f of files) {
      expect(f).not.toMatch(/\.\./);
      expect(f).not.toContain('\\');
    }
  });

  it('null bytes in tag name are stripped', async () => {
    mockGhWithTag('v1.0.0\x00malicious');
    const { fetchAll } = await import('../../src/fetch.js');
    await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    assertAllFilesSafe('claude-agent-sdk-python');
    const files = releasedFiles('claude-agent-sdk-python');
    for (const f of files) {
      expect(f).not.toContain('\x00');
    }
  });

  it('very long tag name is truncated to safe length', async () => {
    const longTag = 'v' + 'a'.repeat(250) + '.0';
    mockGhWithTag(longTag);
    const { fetchAll } = await import('../../src/fetch.js');
    await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    const files = releasedFiles('claude-agent-sdk-python');
    // Filename (without .md extension) should be <= 100 chars (the sanitize limit)
    for (const f of files) {
      expect(f.length).toBeLessThanOrEqual(104); // 100 + ".md"
    }
  });

  it('Windows-reserved characters (<>:"|?*) are sanitized', async () => {
    mockGhWithTag('v1.0.0<script>|"test"?*');
    const { fetchAll } = await import('../../src/fetch.js');
    await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    assertAllFilesSafe('claude-agent-sdk-python');
  });

  it('leading dots are stripped (hidden file attack)', async () => {
    mockGhWithTag('.hidden-release');
    const { fetchAll } = await import('../../src/fetch.js');
    await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    const files = releasedFiles('claude-agent-sdk-python');
    for (const f of files) {
      // Filename should not start with a dot (after v-strip)
      expect(f.startsWith('.')).toBe(false);
    }
  });

  it('embedded .. sequences are replaced', async () => {
    mockGhWithTag('v1..2..3');
    const { fetchAll } = await import('../../src/fetch.js');
    await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    assertAllFilesSafe('claude-agent-sdk-python');
  });

  it('unicode characters pass through without breaking safety', async () => {
    mockGhWithTag('v1.0.0-日本語リリース');
    const { fetchAll } = await import('../../src/fetch.js');
    await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    assertAllFilesSafe('claude-agent-sdk-python');
    expect(releasedFiles('claude-agent-sdk-python').length).toBeGreaterThanOrEqual(1);
  });

  it('@scope/pkg@version multiPackage tag produces safe filename', async () => {
    mockGhWithTag('@evil/../../../etc/passwd@1.0.0');
    const { fetchAll } = await import('../../src/fetch.js');
    await fetchAll(temp.db, productsRoot, { product: 'anthropic-sdk-typescript' });
    assertAllFilesSafe('anthropic-sdk-typescript');
  });
});
