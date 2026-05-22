// Integration tests for CLI --json output mode.
// Verifies that key commands produce valid, parseable JSON without ANSI codes.

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';

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
    env: { ...process.env, HK_DEBUG: '', NO_COLOR: '1' },
  });
  return {
    code: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

/** Parse JSON from stdout, stripping any BOM or trailing whitespace. */
function parseJson(stdout: string): unknown {
  const trimmed = stdout.trim();
  return JSON.parse(trimmed);
}

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\x1B\[[0-9;]*[A-Za-z]/;

describe('CLI --json output mode', () => {
  it('hk query "workflow" --json returns valid JSON array with expected fields', () => {
    // --json is a global option on the parent program; with enablePositionalOptions()
    // it must appear before the subcommand name.
    const out = runCli(['--json', 'query', 'workflow', '--db', temp.path, '--limit', '5']);
    expect(out.code).toBe(0);

    const data = parseJson(out.stdout) as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Each result should have the canonical fields
    for (const item of data) {
      expect(item).toHaveProperty('product');
      expect(item).toHaveProperty('version');
      expect(item).toHaveProperty('kind');
      expect(item).toHaveProperty('text');
    }

    // No ANSI escape codes in the JSON output
    expect(ANSI_RE.test(out.stdout)).toBe(false);
  }, 30_000);

  it('hk latest --json returns valid JSON array of releases', () => {
    const out = runCli(['--json', 'latest', '--db', temp.path, '--limit', '5']);
    expect(out.code).toBe(0);

    const data = parseJson(out.stdout) as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    for (const item of data) {
      expect(item).toHaveProperty('product');
      expect(item).toHaveProperty('version');
      expect(item).toHaveProperty('released_at');
      expect(item).toHaveProperty('change_count');
      expect(typeof item.change_count).toBe('number');
    }

    expect(ANSI_RE.test(out.stdout)).toBe(false);
  }, 30_000);

  it('hk products --json returns valid JSON array of products', () => {
    const out = runCli(['--json', 'products', '--db', temp.path]);
    expect(out.code).toBe(0);

    const data = parseJson(out.stdout) as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Should include the fixture products
    const names = data.map((p: any) => p.name);
    expect(names).toContain('test-cli');
    expect(names).toContain('test-sdk');

    for (const item of data) {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('release_count');
    }

    expect(ANSI_RE.test(out.stdout)).toBe(false);
  }, 30_000);

  it('hk top env_var --json returns valid JSON array of entity frequencies', () => {
    const out = runCli(['--json', 'top', 'env_var', '--db', temp.path, '--limit', '5']);
    expect(out.code).toBe(0);

    const data = parseJson(out.stdout) as any[];
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    for (const item of data) {
      expect(item).toHaveProperty('value');
      expect(item).toHaveProperty('count');
      expect(typeof item.count).toBe('number');
    }

    expect(ANSI_RE.test(out.stdout)).toBe(false);
  }, 30_000);

  it('hk env-var ANTHROPIC_API_KEY --json returns valid JSON array', () => {
    const out = runCli(['--json', 'env-var', 'ANTHROPIC_API_KEY', '--db', temp.path]);
    expect(out.code).toBe(0);

    const data = parseJson(out.stdout) as any[];
    expect(Array.isArray(data)).toBe(true);

    if (data.length > 0) {
      for (const item of data) {
        expect(item).toHaveProperty('product');
        expect(item).toHaveProperty('version');
        expect(item).toHaveProperty('kind');
        expect(item).toHaveProperty('text');
      }
    }

    expect(ANSI_RE.test(out.stdout)).toBe(false);
  }, 30_000);
});
