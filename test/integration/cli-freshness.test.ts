import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';
import { initSchema, openDb } from '../../src/db.js';
import { ingestAll } from '../../src/ingest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const CLI = resolve(REPO_ROOT, 'src', 'cli.ts');
const TSX_CLI = resolve(REPO_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');

let temp: TempDb;
const extraDirs: string[] = [];

function makeDir(prefix: string): string {
  const d = mkdtempSync(join(tmpdir(), prefix));
  extraDirs.push(d);
  return d;
}

beforeEach(() => {
  temp = createTempDb({ loadVec: false });
  seedSampleProducts(temp.db);
  temp.db
    .prepare(
      `INSERT INTO markers (product, name, version, updated_at)
       VALUES ('test-cli', 'last_fetched_release_at', '2026-04-10', '2026-05-21T10:00:00Z')`
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

function runCli(args: string[], opts: { cwd?: string; env?: Record<string, string | undefined> } = {}) {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    HK_DEBUG: '',
    NO_COLOR: '1',
    ...(opts.env ?? {}),
  };
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete env[k];
  }
  const result = spawnSync(process.execPath, [TSX_CLI, CLI, ...args], {
    encoding: 'utf-8',
    timeout: 25_000,
    cwd: opts.cwd,
    shell: false,
    env,
  });
  const cleanStderr = (result.stderr ?? '')
    .split(/\r?\n/)
    .filter((line) => !/^npm warn /i.test(line))
    .join('\n');
  return {
    code: result.status,
    stdout: result.stdout ?? '',
    stderr: cleanStderr,
  };
}

function runCliAsync(
  args: string[],
  opts: { cwd?: string; env?: Record<string, string | undefined>; timeoutMs?: number } = {}
): Promise<{ code: number | null; stdout: string; stderr: string }> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    HK_DEBUG: '',
    NO_COLOR: '1',
    ...(opts.env ?? {}),
  };
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete env[k];
  }
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [TSX_CLI, CLI, ...args], {
      cwd: opts.cwd,
      shell: false,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf-8');
    child.stderr.setEncoding('utf-8');
    child.stdout.on('data', (c) => { stdout += c; });
    child.stderr.on('data', (c) => { stderr += c; });
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      rejectPromise(new Error(`runCliAsync timed out after ${opts.timeoutMs ?? 25_000}ms`));
    }, opts.timeoutMs ?? 25_000);
    child.on('close', (code) => {
      clearTimeout(timer);
      const cleanStderr = stderr
        .split(/\r?\n/)
        .filter((line) => !/^npm warn /i.test(line))
        .join('\n');
      resolvePromise({ code, stdout, stderr: cleanStderr });
    });
  });
}

describe('CLI freshness stamps & --json shapes (Part 1)', () => {
  it('appends data-as-of stamp and STALE prefix in text mode', () => {
    const freshOut = runCli(['latest', '--db', temp.path, '--limit', '2'], {
      env: { CLAUDE_SYNERGY_NOW: '2026-05-24T12:00:00Z' },
    });
    expect(freshOut.code).toBe(0);
    const freshLast = freshOut.stdout.trimEnd().split(/\r?\n/).pop() ?? '';
    expect(freshLast).toMatch(/^data as of: synced 2026-05-21, newest release 2026-04-10 \(44 days old\)$/);

    const staleOut = runCli(['query', 'workflow', '--db', temp.path, '--limit', '2'], {
      env: { CLAUDE_SYNERGY_NOW: '2026-11-26T12:00:00Z' },
    });
    expect(staleOut.code).toBe(0);
    const staleLast = staleOut.stdout.trimEnd().split(/\r?\n/).pop() ?? '';
    expect(staleLast).toMatch(/^STALE: data as of: synced 2026-05-21/);
  }, 30_000);

  it('array-shaped --json commands keep stdout array unchanged and emit {"data_as_of": ...} on stderr', () => {
    const cases: string[][] = [
      ['--json', 'query', 'workflow', '--db', temp.path, '--limit', '2'],
      ['--json', 'latest', '--db', temp.path, '--limit', '2'],
      ['--json', 'products', '--db', temp.path],
      ['--json', 'top', 'env_var', '--db', temp.path, '--limit', '2'],
      ['--json', 'env-var', 'ANTHROPIC_API_KEY', '--db', temp.path],
      ['--json', 'diff', '--db', temp.path, '--since', '2026-01-01'],
      ['--json', 'breaking', '--db', temp.path],
    ];
    for (const args of cases) {
      const out = runCli(args, { env: { CLAUDE_SYNERGY_NOW: '2026-05-24T12:00:00Z' } });
      expect(out.code, `args: ${args.join(' ')} stderr: ${out.stderr}`).toBe(0);
      const parsedStdout = JSON.parse(out.stdout.trim());
      expect(Array.isArray(parsedStdout)).toBe(true);

      const stderrJsonLine = out.stderr
        .split(/\r?\n/)
        .find((l) => l.trim().startsWith('{"data_as_of"'));
      expect(stderrJsonLine, `missing stderr data_as_of JSON line for ${args[1]}`).toBeDefined();
      const meta = JSON.parse(stderrJsonLine!);
      expect(meta.data_as_of).toHaveProperty('synced_at', '2026-05-21T10:00:00Z');
      expect(meta.data_as_of).toHaveProperty('newest_release', '2026-04-10');
    }
  }, 60_000);

  it('object-shaped --json commands (init, ingest --reextract, seed-markers) add top-level data_as_of', () => {
    const dir = makeDir('cli-obj-');
    const newDb = join(dir, 'obj.db');

    const initOut = runCli(['--json', 'init', '--db', newDb]);
    expect(initOut.code).toBe(0);
    const initObj = JSON.parse(initOut.stdout.trim());
    expect(initObj).toHaveProperty('initialized', true);
    expect(initObj).toHaveProperty('data_as_of');
    expect(initObj.data_as_of.stale).toBe(true);

    const seedOut = runCli(['--json', 'seed-markers', '--db', temp.path]);
    expect(seedOut.code).toBe(0);
    const seedObj = JSON.parse(seedOut.stdout.trim());
    expect(Array.isArray(seedObj.markers)).toBe(true);
    expect(seedObj).toHaveProperty('data_as_of');
    expect(seedObj.data_as_of.synced_at).toBe('2026-05-21T10:00:00Z');

    const reextractOut = runCli(['--json', 'ingest', '--db', temp.path, '--reextract']);
    expect(reextractOut.code).toBe(0);
    const reextractObj = JSON.parse(reextractOut.stdout.trim());
    expect(reextractObj).toHaveProperty('reextract');
    expect(reextractObj.reextract.changesScanned).toBeGreaterThan(0);
    expect(reextractObj).toHaveProperty('data_as_of');
  }, 45_000);
});

describe('CLI first-use sync, opt-out, and two-cwd replay (Part 3)', () => {
  it('opt-out CLAUDE_SYNERGY_NO_AUTO_SYNC=1 writes nothing and reports empty corpus', () => {
    const root = makeDir('cli-optout-');
    const home = join(root, 'home');
    const cwd = join(root, 'empty-cwd');
    mkdirSync(home, { recursive: true });
    mkdirSync(cwd, { recursive: true });

    const out = runCli(['latest'], {
      cwd,
      env: {
        CLAUDE_SYNERGY_DB: undefined,
        CLAUDE_SYNERGY_NO_AUTO_SYNC: '1',
        HOME: home,
        USERPROFILE: home,
      },
    });
    expect(out.code).toBe(0);
    expect(out.stdout).toContain('empty corpus');
    expect(out.stdout.trimEnd().split(/\r?\n/).pop()).toMatch(/^STALE: data as of: empty corpus/);
    expect(readdirSync(cwd)).toEqual([]);
    expect(existsSync(join(home, '.claude-synergy', 'data', 'claude-synergy.db'))).toBe(false);
  }, 30_000);

  it('two-cwd CLI replay: clone cwd uses clone DB; unrelated cwd uses per-user store and leaves cwd clean', async () => {
    const root = makeDir('cli-replay-');
    const home = join(root, 'home');
    const cloneDir = join(root, 'clone');
    const unrelatedDir = join(root, 'unrelated');
    mkdirSync(join(cloneDir, 'data'), { recursive: true });
    mkdirSync(home, { recursive: true });
    mkdirSync(unrelatedDir, { recursive: true });

    // Seed clone DB under cloneDir/data/claude-synergy.db
    const cloneDbPath = join(cloneDir, 'data', 'claude-synergy.db');
    const cdb = createTempDb({ loadVec: false });
    seedSampleProducts(cdb.db);
    await cdb.db.backup(cloneDbPath);
    cdb.cleanup();

    // (i) clone cwd with no CLAUDE_SYNERGY_DB env
    const outClone = runCli(['latest', '--limit', '2'], {
      cwd: cloneDir,
      env: {
        CLAUDE_SYNERGY_DB: undefined,
        CLAUDE_SYNERGY_NO_AUTO_SYNC: undefined,
        HOME: home,
        USERPROFILE: home,
      },
    });
    expect(outClone.code).toBe(0);
    expect(outClone.stderr).toContain('rule: cwd-existing');
    expect(outClone.stdout).toContain('test-');

    // (ii) unrelated cwd with local loopback RSS server for first-use sync
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Replay Feed</title>
<item><title>Replay 2.0.0</title><link>http://127.0.0.1/2.0.0</link><guid>replay-2-0-0</guid><pubDate>Wed, 25 Nov 2026 12:00:00 GMT</pubDate><description><![CDATA[<ul><li>Added replay feature</li></ul>]]></description></item>
</channel></rss>`;
    const srv = createServer((_, res) => {
      res.writeHead(200, { 'content-type': 'application/rss+xml' });
      res.end(rssXml);
    });
    await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r));
    const port = (srv.address() as { port: number }).port;
    const replayYaml = join(root, 'products.yaml');
    writeFileSync(
      replayYaml,
      `products:\n  - name: replay-tool\n    display_name: Replay Tool\n    tier: 3\n    source_url: http://127.0.0.1:${port}/feed.rss\n    fetch_strategy: rss\n    fetch:\n      type: rss\n      url: http://127.0.0.1:${port}/feed.rss\n`,
      'utf-8'
    );

    const beforeUnrelated = readdirSync(unrelatedDir);
    try {
      const outUnrelated = await runCliAsync(['latest', '--limit', '2'], {
        cwd: unrelatedDir,
        env: {
          CLAUDE_SYNERGY_DB: undefined,
          CLAUDE_SYNERGY_NO_AUTO_SYNC: undefined,
          CLAUDE_SYNERGY_PRODUCTS_YAML: replayYaml,
          HOME: home,
          USERPROFILE: home,
        },
      });
      expect(outUnrelated.code).toBe(0);
      expect(outUnrelated.stderr).toContain('rule: user-home-default');
      expect(outUnrelated.stderr).toContain('first use: synced 1 of 1 products');
      expect(outUnrelated.stdout).toContain('replay-tool@');
      expect(readdirSync(unrelatedDir)).toEqual(beforeUnrelated);
      expect(existsSync(join(home, '.claude-synergy', 'data', 'claude-synergy.db'))).toBe(true);
    } finally {
      srv.closeAllConnections?.();
      await new Promise<void>((r) => srv.close(() => r()));
    }
  }, 45_000);
});

describe('CLI FIX-1 regressions (Items 1, 8, 10)', () => {
  it('Item 1: relative CLAUDE_SYNERGY_DB=data/claude-synergy.db writes into clone dir, never HOME', async () => {
    const root = makeDir('cli-rel-db-');
    const cloneDir = join(root, 'repo');
    const fakeHome = join(root, 'home');
    mkdirSync(cloneDir, { recursive: true });
    mkdirSync(fakeHome, { recursive: true });

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Local</title>
<item><title>Release 3.0.0</title><link>http://127.0.0.1/3.0.0</link><guid>rel-3-0-0</guid><pubDate>Thu, 26 Nov 2026 08:00:00 GMT</pubDate><description><![CDATA[<ul><li>Added rel-db check</li></ul>]]></description></item>
</channel></rss>`;
    const srv = createServer((_, res) => {
      res.writeHead(200, { 'content-type': 'application/rss+xml' });
      res.end(rssXml);
    });
    await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r));
    const port = (srv.address() as { port: number }).port;
    const prodYaml = join(root, 'products.yaml');
    writeFileSync(
      prodYaml,
      `products:\n  - name: rel-tool\n    display_name: Rel Tool\n    tier: 3\n    source_url: http://127.0.0.1:${port}/feed.rss\n    fetch_strategy: rss\n    fetch:\n      type: rss\n      url: http://127.0.0.1:${port}/feed.rss\n`,
      'utf-8'
    );

    try {
      const out = await runCliAsync(['sync', '--skip-embed'], {
        cwd: cloneDir,
        env: {
          CLAUDE_SYNERGY_DB: 'data/claude-synergy.db',
          CLAUDE_SYNERGY_PRODUCTS_YAML: prodYaml,
          HOME: fakeHome,
          USERPROFILE: fakeHome,
        },
      });
      expect(out.code, out.stderr).toBe(0);
      expect(out.stderr).toContain('rule: env:CLAUDE_SYNERGY_DB');
      expect(existsSync(join(cloneDir, 'data', 'claude-synergy.db'))).toBe(true);
      expect(existsSync(join(cloneDir, 'products', 'rel-tool', 'releases'))).toBe(true);
      expect(readdirSync(fakeHome)).toEqual([]);
    } finally {
      srv.closeAllConnections?.();
      await new Promise<void>((r) => srv.close(() => r()));
    }
  }, 35_000);

  it('Item 8: hk --help succeeds with broken model-families.yaml and hk ingest formats MODEL_FAMILIES_CONFIG_ERROR without stack', () => {
    const dir = makeDir('cli-bad-mf-');
    const badYaml = join(dir, 'bad-families.yaml');
    writeFileSync(badYaml, 'families: [unclosed\n  bad: :\n', 'utf-8');

    const helpOut = runCli(['--help'], {
      env: { CLAUDE_SYNERGY_MODEL_FAMILIES: badYaml },
    });
    expect(helpOut.code).toBe(0);
    expect(helpOut.stdout).toContain('Usage: hk');

    // Ingest against a directory with a release file triggers lazy extraction -> formatted error.
    const prodDir = join(dir, 'products', 'p1', 'releases');
    mkdirSync(prodDir, { recursive: true });
    writeFileSync(
      join(prodDir, '1.0.0.md'),
      `---\nproduct: p1\nversion: "1.0.0"\nreleased_at: "2026-11-25"\nfetched_at: "2026-11-26"\n---\n\n- Added claude-opus-4-7\n`,
      'utf-8'
    );
    const dbPath = join(dir, 'data', 'test.db');
    const ingestOut = runCli(['ingest', '--db', dbPath, '--products', join(dir, 'products')], {
      env: { CLAUDE_SYNERGY_MODEL_FAMILIES: badYaml },
    });
    expect(ingestOut.code).not.toBe(0);
    expect(ingestOut.stderr).toContain('[MODEL_FAMILIES_CONFIG_ERROR]');
    expect(ingestOut.stderr).not.toMatch(/^\s+at\s+/m);
  }, 30_000);

  it('Item 10: --no-stamp makes products and latest identical across two clock days', () => {
    const pDay1 = runCli(['--no-stamp', 'products', '--db', temp.path], {
      env: { CLAUDE_SYNERGY_NOW: '2026-05-24T12:00:00Z' },
    });
    const pDay2 = runCli(['--no-stamp', 'products', '--db', temp.path], {
      env: { CLAUDE_SYNERGY_NOW: '2026-07-01T12:00:00Z' },
    });
    expect(pDay1.code).toBe(0);
    expect(pDay2.code).toBe(0);
    expect(pDay1.stdout).toBe(pDay2.stdout);
    expect(pDay1.stdout).not.toContain('data as of:');
    expect(pDay1.stdout).not.toContain('STALE:');

    const lDay1 = runCli(['--no-stamp', 'latest', '--limit', '50', '--db', temp.path], {
      env: { CLAUDE_SYNERGY_NOW: '2026-05-24T12:00:00Z' },
    });
    const lDay2 = runCli(['--no-stamp', 'latest', '--limit', '50', '--db', temp.path], {
      env: { CLAUDE_SYNERGY_NOW: '2026-07-01T12:00:00Z' },
    });
    expect(lDay1.code).toBe(0);
    expect(lDay2.code).toBe(0);
    expect(lDay1.stdout).toBe(lDay2.stdout);
    expect(lDay1.stdout).not.toContain('data as of:');
  }, 35_000);

  it('FIX-2 Item 1: two CLI query processes honour persisted first_use_partial cooldown then auto-sync after expiry', async () => {
    const dir = makeDir('cli-partial-cd-');
    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Cooldown Feed</title>
<item><title>Release 2.0.0</title><link>http://127.0.0.1/2.0.0</link><guid>cd-2</guid><pubDate>Wed, 25 Nov 2026 12:00:00 GMT</pubDate><description><![CDATA[- Added persisted cooldown item]]></description></item>
</channel></rss>`;
    let hits = 0;
    const srv = createServer((req, res) => {
      hits++;
      if (req.url === '/ok.rss') {
        res.writeHead(200, { 'content-type': 'application/rss+xml' });
        res.end(rssXml);
      } else {
        res.writeHead(404);
        res.end('not found');
      }
    });
    await new Promise<void>((r) => srv.listen(0, '127.0.0.1', r));
    const port = (srv.address() as { port: number }).port;
    const base = `http://127.0.0.1:${port}`;
    const customYaml = join(dir, 'products.yaml');
    writeFileSync(
      customYaml,
      `products:
  - name: cd-ok
    display_name: Cooldown OK
    tier: 3
    source_url: ${base}/ok.rss
    fetch_strategy: rss
    fetch:
      type: rss
      url: ${base}/ok.rss
  - name: cd-bad
    display_name: Cooldown Bad
    tier: 3
    source_url: ${base}/missing.rss
    fetch_strategy: rss
    fetch:
      type: rss
      url: ${base}/missing.rss
`,
      'utf-8'
    );

    try {
      const dbPath = join(dir, 'store', 'data', 'claude-synergy.db');
      const productsRoot = join(dir, 'store', 'products');
      const relDir = join(productsRoot, 'cd-ok', 'releases');
      mkdirSync(relDir, { recursive: true });
      writeFileSync(
        join(relDir, '1.0.0.md'),
        `---\nproduct: cd-ok\nversion: "1.0.0"\nreleased_at: "2026-11-24"\nfetched_at: "2026-11-26"\n---\n\n- Baseline release\n`,
        'utf-8'
      );

      // Seed DB with 1 release + a fresh first_use_partial marker recorded at 10:00:00Z.
      const db = openDb(dbPath, { loadVec: false });
      initSchema(db);
      ingestAll(db, productsRoot);
      db.prepare(`INSERT OR REPLACE INTO schema_meta (key, value) VALUES (?, ?)`).run(
        'first_use_partial',
        JSON.stringify({
          succeeded: 1,
          total: 2,
          skipped: [{ product: 'cd-bad', reason: 'HTTP 404' }],
          recorded_at: '2026-11-26T10:00:00.000Z',
        })
      );
      db.close();

      const sharedEnv = {
        CLAUDE_SYNERGY_DB: dbPath,
        CLAUDE_SYNERGY_PRODUCTS_YAML: customYaml,
        CLAUDE_SYNERGY_PRODUCTS_ROOT: productsRoot,
        HOME: dir,
        USERPROFILE: dir,
      };

      // Two separate CLI processes within 10m -> zero fetches, partial stamp still shown.
      for (const clockIso of ['2026-11-26T10:02:00Z', '2026-11-26T10:05:00Z']) {
        const res = await runCliAsync(['latest'], {
          cwd: dir,
          env: { ...sharedEnv, CLAUDE_SYNERGY_NOW: clockIso },
        });
        expect(res.code).toBe(0);
        expect(res.stdout).toContain('partial corpus: synced 1 of 2 products');
        expect(hits).toBe(0);
      }

      // Third CLI process after 10m cooldown expiry -> runs one auto-sync.
      const resAfter = await runCliAsync(['latest'], {
        cwd: dir,
        env: { ...sharedEnv, CLAUDE_SYNERGY_NOW: '2026-11-26T10:11:00Z' },
      });
      expect(resAfter.code).toBe(0);
      expect(hits).toBeGreaterThanOrEqual(2);
      expect(resAfter.stderr).toContain('first use (partial corpus)');
    } finally {
      srv.closeAllConnections?.();
      await new Promise<void>((r) => srv.close(() => r()));
    }
  }, 45_000);
});
