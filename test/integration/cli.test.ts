import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { FIXTURE_PRODUCTS_ROOT, seedSampleProducts } from '../helpers/seed-corpus.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '..', '..', 'src', 'cli.ts');

let temp: TempDb;
beforeEach(() => {
  temp = createTempDb();
  seedSampleProducts(temp.db);
  temp.db.close();
});
afterEach(() => {
  temp.cleanup();
});

function runCli(args: string[]) {
  const result = spawnSync('npx', ['tsx', CLI, ...args], {
    encoding: 'utf-8',
    timeout: 25_000,
    shell: process.platform === 'win32',
    env: { ...process.env, HK_DEBUG: '' },
  });
  return {
    code: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

describe('CLI — happy path', () => {
  it('hk --version exits 0 and prints version', () => {
    const out = runCli(['--version']);
    expect(out.code).toBe(0);
    expect(out.stdout).toMatch(/\d+\.\d+\.\d+/);
  }, 30_000);

  it('hk products --db <temp> lists products from the temp db', () => {
    const out = runCli(['products', '--db', temp.path]);
    expect(out.code).toBe(0);
    expect(out.stdout).toContain('test-cli');
    expect(out.stdout).toContain('test-sdk');
    expect(out.stdout).toContain('test-apps');
  }, 30_000);

  it('hk query "workflow" returns matching results', () => {
    const out = runCli(['query', 'workflow', '--db', temp.path, '--limit', '5']);
    expect(out.code).toBe(0);
    expect(out.stdout.toLowerCase()).toContain('workflow');
  }, 30_000);

  it('hk query parses positional + --limit option together (variadic regression)', () => {
    const out = runCli(['query', 'workflow', '--db', temp.path, '--limit', '2']);
    expect(out.code).toBe(0);
    // No "unknown option" or other commander error
    expect(out.stderr).not.toMatch(/error|unknown option/i);
  }, 30_000);

  it('hk latest --db <temp> returns recent releases', () => {
    const out = runCli(['latest', '--db', temp.path, '--limit', '5']);
    expect(out.code).toBe(0);
    expect(out.stdout).toMatch(/test-(cli|sdk|apps)/);
  }, 30_000);

  it('hk env-var ANTHROPIC_API_KEY returns mentions', () => {
    const out = runCli(['env-var', 'ANTHROPIC_API_KEY', '--db', temp.path]);
    expect(out.code).toBe(0);
    expect(out.stdout).toContain('ANTHROPIC_API_KEY');
  }, 30_000);

  it('hk top env_var returns counts', () => {
    const out = runCli(['top', 'env_var', '--db', temp.path]);
    expect(out.code).toBe(0);
    expect(out.stdout).toMatch(/\d+/);
  }, 30_000);

  it('hk init --db <new-path> creates a fresh DB', () => {
    const dir = mkdtempSync(join(tmpdir(), 'init-cli-'));
    try {
      const newDb = join(dir, 'fresh.db');
      const out = runCli(['init', '--db', newDb]);
      expect(out.code).toBe(0);
      expect(out.stdout).toContain('initialized');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }, 30_000);
});

describe('CLI — error paths', () => {
  it('hk ingest --products <missing> exits non-zero with helpful error', () => {
    const out = runCli(['ingest', '--db', temp.path, '--products', '/definitely/missing/dir']);
    expect(out.code).not.toBe(0);
    expect(out.stderr).toMatch(/not found/i);
  }, 30_000);

  it('hk fetch --product unknown-product exits non-zero with available list', () => {
    const out = runCli(['fetch', '--db', temp.path, '--product', 'not-a-real-product']);
    expect(out.code).not.toBe(0);
    // The error mentions either "unknown product" or lists available products
    const combined = out.stdout + out.stderr;
    expect(combined).toMatch(/unknown product|available/i);
  }, 30_000);
});

// ── Wave 1 new commands: hk diff / hk breaking + new flags ──────────────────
describe('CLI — hk diff command', () => {
  it('hk diff (no args) returns recent changes grouped by release', () => {
    const out = runCli(['diff', '--db', temp.path, '--since', '2026-01-01']);
    expect(out.code).toBe(0);
    // Output should mention at least one fixture product@version pair
    expect(out.stdout).toMatch(/test-(cli|sdk|apps)@/);
  }, 30_000);

  it('hk diff <product> filters to that product', () => {
    const out = runCli(['diff', 'test-cli', '--db', temp.path, '--since', '2026-01-01']);
    expect(out.code).toBe(0);
    // Should only mention test-cli, not test-sdk or test-apps
    expect(out.stdout).toContain('test-cli@');
    expect(out.stdout).not.toMatch(/test-sdk@/);
  }, 30_000);

  it('hk diff --since 7d (relative) parses without error', () => {
    const out = runCli(['diff', '--db', temp.path, '--since', '7d']);
    expect(out.code).toBe(0);
    expect(out.stderr).not.toMatch(/error|invalid/i);
  }, 30_000);

  it('hk diff --until 2026-02-01 filters out releases after that date', () => {
    const out = runCli([
      'diff',
      'test-cli',
      '--db',
      temp.path,
      '--since',
      '2026-01-01',
      '--until',
      '2026-02-01',
    ]);
    expect(out.code).toBe(0);
    // test-cli@1.1.0 (2026-03-10) should NOT appear; 1.0.0 (Jan) and 1.0.1 (Feb) should
    expect(out.stdout).not.toMatch(/test-cli@1\.1\.0/);
  }, 30_000);

  it('hk --json diff returns valid JSON shape', () => {
    const out = runCli(['--json', 'diff', '--db', temp.path, '--since', '2026-01-01']);
    expect(out.code).toBe(0);
    const data = JSON.parse(out.stdout.trim());
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('product');
      expect(data[0]).toHaveProperty('version');
      expect(data[0]).toHaveProperty('changes');
      expect(Array.isArray(data[0].changes)).toBe(true);
    }
  }, 30_000);

  it('hk diff with no matching window prints a (no changes) message', () => {
    const out = runCli([
      'diff',
      '--db',
      temp.path,
      '--since',
      '2026-01-01',
      '--until',
      '2026-01-02',
    ]);
    expect(out.code).toBe(0);
    expect(out.stdout.toLowerCase()).toMatch(/no changes|no changes in window/);
  }, 30_000);
});

describe('CLI — hk breaking command', () => {
  it('hk breaking returns the breaking-change rows from fixtures', () => {
    const out = runCli(['breaking', '--db', temp.path]);
    expect(out.code).toBe(0);
    // The test-cli@1.1.0 fixture has a "Breaking change: --old-flag is now removed entirely"
    expect(out.stdout.toLowerCase()).toMatch(/breaking|old-flag/);
  }, 30_000);

  it('hk breaking --product filters to that product', () => {
    const out = runCli(['breaking', '--db', temp.path, '--product', 'test-cli']);
    expect(out.code).toBe(0);
    if (!out.stdout.toLowerCase().includes('no breaking')) {
      expect(out.stdout).toContain('test-cli');
    }
  }, 30_000);

  it('hk breaking --since 30d --until 2026-05-01 accepts both filters', () => {
    const out = runCli([
      'breaking',
      '--db',
      temp.path,
      '--since',
      '2026-01-01',
      '--until',
      '2026-05-01',
    ]);
    expect(out.code).toBe(0);
    expect(out.stderr).not.toMatch(/error|invalid/i);
  }, 30_000);

  it('hk --json breaking returns a valid JSON array', () => {
    const out = runCli(['--json', 'breaking', '--db', temp.path]);
    expect(out.code).toBe(0);
    const data = JSON.parse(out.stdout.trim());
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('product');
      expect(data[0]).toHaveProperty('version');
      expect(data[0]).toHaveProperty('text');
    }
  }, 30_000);

  it('hk breaking with no matches prints a (no breaking changes) message', () => {
    const out = runCli([
      'breaking',
      '--db',
      temp.path,
      '--product',
      'test-sdk', // test-sdk fixtures have no "breaking" kind
    ]);
    expect(out.code).toBe(0);
    expect(out.stdout.toLowerCase()).toMatch(/no breaking|0 breaking/);
  }, 30_000);
});

describe('CLI — new --until flag on query/hybrid', () => {
  it('hk query --until 2026-02-01 filters out newer rows', () => {
    const out = runCli([
      'query',
      'workflow',
      '--db',
      temp.path,
      '--until',
      '2026-02-01',
      '--limit',
      '10',
    ]);
    expect(out.code).toBe(0);
    // test-cli@1.1.0 (released 2026-03-10) should NOT appear in the output
    expect(out.stdout).not.toMatch(/test-cli@1\.1\.0/);
  }, 30_000);

  it('hk query --since X --until Y window works', () => {
    const out = runCli([
      'query',
      'workflow',
      '--db',
      temp.path,
      '--since',
      '2026-02-01',
      '--until',
      '2026-03-31',
      '--limit',
      '10',
    ]);
    expect(out.code).toBe(0);
  }, 30_000);
});

describe('CLI — new --since flag on hk latest', () => {
  it('hk latest --since 2026-03-01 filters older releases out', () => {
    const out = runCli(['latest', '--db', temp.path, '--since', '2026-03-01', '--limit', '20']);
    expect(out.code).toBe(0);
    // test-cli@1.0.0 (2026-01-15) is older than 2026-03-01 → must not appear
    expect(out.stdout).not.toMatch(/test-cli@1\.0\.0/);
  }, 30_000);

  it('hk latest --since 7d parses relative dates', () => {
    const out = runCli(['latest', '--db', temp.path, '--since', '7d']);
    expect(out.code).toBe(0);
    expect(out.stderr).not.toMatch(/error|invalid/i);
  }, 30_000);
});
