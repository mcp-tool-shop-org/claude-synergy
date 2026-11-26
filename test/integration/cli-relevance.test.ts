import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { ingestAll } from '../../src/ingest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const CLI = resolve(REPO_ROOT, 'src', 'cli.ts');
const TSX_CLI = resolve(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');

let temp: TempDb;
let extraDirs: string[] = [];

function makeDir(prefix = 'cs-cli-rel-'): string {
  const d = mkdtempSync(join(tmpdir(), prefix));
  extraDirs.push(d);
  return d;
}

function runCli(args: string[], envOverrides: Record<string, string> = {}) {
  const result = spawnSync(process.execPath, [TSX_CLI, CLI, ...args], {
    encoding: 'utf-8',
    timeout: 25_000,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: false,
    env: {
      ...process.env,
      HK_DEBUG: '',
      NO_COLOR: '1',
      CLAUDE_SYNERGY_NO_AUTO_SYNC: '1',
      CLAUDE_SYNERGY_NOW: '2026-11-26T12:00:00Z',
      ...envOverrides,
    },
  });
  return {
    code: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

beforeEach(() => {
  temp = createTempDb({ loadVec: false });
  extraDirs = [];
  const root = makeDir('cs-cli-corpus-');
  const prodDir = join(root, 'products', 'anthropic-sdk-typescript', 'releases');
  mkdirSync(prodDir, { recursive: true });
  writeFileSync(
    join(prodDir, 'sdk-0.100.0.md'),
    `---
product: anthropic-sdk-typescript
version: "sdk-v0.100.0"
released_at: "2026-06-01"
source_url: "https://example.invalid/0.100.0"
fetched_at: "2026-11-25"
---

- Added streaming helpers
`,
    'utf-8'
  );
  writeFileSync(
    join(prodDir, 'sdk-1.14.0.md'),
    `---
product: anthropic-sdk-typescript
version: "sdk-v1.14.0"
released_at: "2026-11-24"
source_url: "https://example.invalid/1.14.0"
fetched_at: "2026-11-25"
---

- Breaking change: dropped Node 18 support
- Added structured output helpers
`,
    'utf-8'
  );
  ingestAll(temp.db, join(root, 'products'));
  temp.db
    .prepare(
      `INSERT INTO markers (product, name, version, updated_at)
       VALUES ('anthropic-sdk-typescript', 'last_fetched_release_at', '2026-11-24', '2026-11-25T10:00:00Z')`
    )
    .run();
  temp.db.close();
});

afterEach(() => {
  temp.cleanup();
  while (extraDirs.length > 0) {
    rmSync(extraDirs.pop()!, { recursive: true, force: true });
  }
});

describe('hk relevance CLI integration', () => {
  it('outputs count-led text ending with freshness stamp, supporting --all and --no-stamp', () => {
    const ws = makeDir('cs-cli-ws-');
    writeFileSync(
      join(ws, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: {
          'node_modules/@anthropic-ai/sdk': { version: '0.100.0' },
          'node_modules/@anthropic-ai/claude-code': { version: '99.0.0' },
        },
      }),
      'utf-8'
    );

    const out = runCli(['relevance', ws, '--db', temp.path]);
    expect(out.code).toBe(0);
    const lines = out.stdout.trimEnd().split('\n');
    expect(lines[0]).toBe('1 product needing action');
    expect(out.stdout).toContain('anthropic-sdk-typescript');
    expect(out.stdout).toContain('breaking (1):');
    expect(out.stdout).toContain('dropped Node 18 support');
    expect(out.stdout).toContain('unknown: installed 99.0.0 is not in the mirror');
    expect(out.stdout).toContain('no action: not used (');
    expect(out.stdout).not.toContain('mcp-python-sdk');
    expect(lines[lines.length - 1]).toMatch(/^data as of: synced 2026-11-25/);

    const withAll = runCli(['relevance', ws, '--all', '--no-stamp', '--db', temp.path]);
    expect(withAll.code).toBe(0);
    expect(withAll.stdout).toContain('mcp-python-sdk');
    expect(withAll.stdout).not.toContain('data as of:');
  }, 30_000);

  it('supports hk relevance <dir> --json returning one object with data_as_of', () => {
    const ws = makeDir('cs-cli-ws-json-');
    writeFileSync(
      join(ws, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: {
          'node_modules/@anthropic-ai/sdk': { version: '1.14.0' },
        },
      }),
      'utf-8'
    );

    const out = runCli(['relevance', ws, '--json', '--db', temp.path]);
    expect(out.code).toBe(0);
    const parsed = JSON.parse(out.stdout);
    expect(parsed.action_needed_count).toBe(0);
    expect(parsed.up_to_date_count).toBe(1);
    expect(parsed.products[0].summary).toBe('no action: up to date');
    expect(parsed.data_as_of).toBeDefined();
    expect(parsed.data_as_of.synced_at).toBe('2026-11-25T10:00:00Z');
  }, 30_000);

  it('exits 1 with WORKSPACE_INVALID_DIR on missing workspace directory', () => {
    const missing = join(makeDir('cs-cli-miss-'), 'nope');
    const out = runCli(['relevance', missing, '--json', '--db', temp.path]);
    expect(out.code).toBe(1);
    const parsed = JSON.parse(out.stdout);
    expect(parsed.code).toBe('WORKSPACE_INVALID_DIR');
  }, 30_000);

  it('exits 1 with WORKSPACE_INVALID_DIR on UNC and device paths', () => {
    for (const unc of ['\\\\192.0.2.1\\share', '//192.0.2.1/share', '\\\\?\\UNC\\192.0.2.1\\share', '\\\\.\\device']) {
      const out = runCli(['relevance', unc, '--json', '--db', temp.path]);
      expect(out.code).toBe(1);
      const parsed = JSON.parse(out.stdout);
      expect(parsed.code).toBe('WORKSPACE_INVALID_DIR');
    }
  }, 30_000);
});
