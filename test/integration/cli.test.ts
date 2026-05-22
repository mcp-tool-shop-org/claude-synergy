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
