import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readdirSync, existsSync, chmodSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import {
  FIRST_USE_COOLDOWN_MS,
  FIRST_USE_PARTIAL_META_KEY,
  FIRST_USE_SYNC_TIMEOUT_MS,
  FirstUseSyncCoordinator,
  clearPartialSyncState,
  formatFirstUseNotice,
  formatPartialNote,
  hasAnyReleases,
  isAutoSyncDisabled,
  needsAutoSync,
  printStoreResolutionOnce,
  readPartialSyncState,
  resetStoreNoticeForTests,
  resolveStorePaths,
  runFirstUseSync,
  writePartialSyncState,
} from '../../src/store.js';
import { AppError } from '../../src/errors.js';
import { formatFreshnessStamp, getCorpusFreshness } from '../../src/query.js';
import { createTempDb } from '../helpers/temp-db.js';
import { openDb, initSchema } from '../../src/db.js';
import type { FetchAllResult } from '../../src/fetch.js';

const tempDirs: string[] = [];
function makeTmpDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

beforeEach(() => {
  resetStoreNoticeForTests();
});

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

describe('resolveStorePaths (4-rule precedence)', () => {
  it('Rule 1: CLAUDE_SYNERGY_DB env overrides explicit arg and cwd', () => {
    const dir = makeTmpDir('store-r1-');
    const cwd = join(dir, 'repo');
    mkdirSync(join(cwd, 'data'), { recursive: true });
    writeFileSync(join(cwd, 'data', 'claude-synergy.db'), '');

    const res = resolveStorePaths({
      explicitDb: join(dir, 'arg.db'),
      cwd,
      homeDir: join(dir, 'home'),
      env: { CLAUDE_SYNERGY_DB: join(dir, 'env-store', 'data', 'custom.db') },
    });
    expect(res.rule).toBe('env:CLAUDE_SYNERGY_DB');
    expect(res.dbPath).toBe(resolve(dir, 'env-store', 'data', 'custom.db'));
    expect(res.productsRoot).toBe(resolve(dir, 'env-store', 'products'));
  });

  it('Rule 2: explicit --db / argv beats existing cwd/data/claude-synergy.db', () => {
    const dir = makeTmpDir('store-r2-');
    const cwd = join(dir, 'repo');
    mkdirSync(join(cwd, 'data'), { recursive: true });
    writeFileSync(join(cwd, 'data', 'claude-synergy.db'), '');

    const res = resolveStorePaths({
      explicitDb: join(dir, 'explicit', 'my.db'),
      cwd,
      homeDir: join(dir, 'home'),
      env: {},
    });
    expect(res.rule).toBe('explicit-arg');
    expect(res.dbPath).toBe(resolve(dir, 'explicit', 'my.db'));
    expect(res.productsRoot).toBe(resolve(dir, 'explicit', 'products'));
  });

  it('Rule 3: uses <cwd>/data/claude-synergy.db only when that file already exists', () => {
    const dir = makeTmpDir('store-r3-');
    const cwd = join(dir, 'repo');
    mkdirSync(join(cwd, 'data'), { recursive: true });
    const cloneDb = join(cwd, 'data', 'claude-synergy.db');
    writeFileSync(cloneDb, '');

    const res = resolveStorePaths({
      cwd,
      homeDir: join(dir, 'home'),
      env: {},
    });
    expect(res.rule).toBe('cwd-existing');
    expect(res.dbPath).toBe(cloneDb);
    expect(res.productsRoot).toBe(join(cwd, 'products'));
  });

  it('Rule 4: falls back to <home>/.claude-synergy when cwd DB does not exist', () => {
    const dir = makeTmpDir('store-r4-');
    const cwd = join(dir, 'empty-cwd');
    const home = join(dir, 'home');
    mkdirSync(cwd, { recursive: true });

    const res = resolveStorePaths({
      cwd,
      homeDir: home,
      env: {},
    });
    expect(res.rule).toBe('user-home-default');
    expect(res.dbPath).toBe(join(home, '.claude-synergy', 'data', 'claude-synergy.db'));
    expect(res.productsRoot).toBe(join(home, '.claude-synergy', 'products'));

    // Item 13: resolveStorePaths relies on os.homedir() directly rather than env.HOME mismatch.
    const osHome = homedir();
    const homedirRes = resolveStorePaths({
      cwd,
      env: { HOME: '/ignored-override-home', USERPROFILE: '/ignored-override-profile' },
    });
    expect(homedirRes.dbPath).toBe(join(osHome, '.claude-synergy', 'data', 'claude-synergy.db'));
    expect(homedirRes.productsRoot).toBe(join(osHome, '.claude-synergy', 'products'));
  });

  it('CLAUDE_SYNERGY_PRODUCTS_ROOT overrides derived products root', () => {
    const dir = makeTmpDir('store-prod-');
    const res = resolveStorePaths({
      cwd: dir,
      homeDir: join(dir, 'home'),
      env: { CLAUDE_SYNERGY_PRODUCTS_ROOT: join(dir, 'custom-products') },
    });
    expect(res.productsRoot).toBe(resolve(dir, 'custom-products'));

    const explicitRes = resolveStorePaths({
      cwd: dir,
      env: {},
      explicitProductsRoot: join(dir, 'explicit-products'),
    });
    expect(explicitRes.productsRoot).toBe(resolve(dir, 'explicit-products'));
  });

  it('prints the resolved DB path and rule once per process', () => {
    const dir = makeTmpDir('store-print-');
    const res = resolveStorePaths({ cwd: dir, homeDir: join(dir, 'home'), env: {} });
    const lines: string[] = [];
    expect(printStoreResolutionOnce(res, (s) => lines.push(s))).toBe(true);
    expect(printStoreResolutionOnce(res, (s) => lines.push(s))).toBe(false);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain(res.dbPath);
    expect(lines[0]).toContain('user-home-default');
  });
});

describe('runFirstUseSync & FirstUseSyncCoordinator', () => {
  it('syncs on missing DB and empty DB using mocked fetchers, without embedding', async () => {
    const dir = makeTmpDir('first-use-');
    const dbPath = join(dir, 'data', 'claude-synergy.db');
    const productsRoot = join(dir, 'products');

    const mockFetchRunner = async (_db: any, root: string): Promise<FetchAllResult> => {
      const relDir = join(root, 'test-prod', 'releases');
      mkdirSync(relDir, { recursive: true });
      writeFileSync(
        join(relDir, '1.0.0.md'),
        `---\nproduct: test-prod\nversion: "1.0.0"\nreleased_at: "2026-11-25"\nfetched_at: "2026-11-26"\n---\n\n- Added feature alpha\n`,
        'utf-8'
      );
      const arr: any = [
        { product: 'test-prod', fetched: 1, newSince: '2026-01-01', latest: '2026-11-25', errors: [] },
      ];
      arr.summary = { total: 1, succeeded: 1, failed: 0, skipped: 0, newChanges: 1, errors: [] };
      return arr;
    };

    const { db, report } = await runFirstUseSync({
      dbPath,
      productsRoot,
      fetchRunner: mockFetchRunner,
      now: new Date('2026-11-26T12:00:00Z'),
    });

    try {
      expect(report.total).toBe(1);
      expect(report.succeeded).toBe(1);
      expect(report.partial).toBe(false);
      expect(report.ingestedReleases).toBe(1);
      expect(hasAnyReleases(db)).toBe(true);
      const notice = formatFirstUseNotice(report, db, { now: new Date('2026-11-26T12:00:00Z') });
      expect(notice).toMatch(/^first use: synced 1 of 1 products into .*data as of:/);
      // Verify no chunks table populated (no embed on first-use sync)
      const chunks = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='chunks'`).get();
      expect(chunks).toBeUndefined();
    } finally {
      db.close();
    }

    // Empty initialized DB (0 releases) also triggers first-use sync
    const emptyPath = join(dir, 'empty.db');
    const emptyDb = openDb(emptyPath, { loadVec: false });
    initSchema(emptyDb);
    expect(hasAnyReleases(emptyDb)).toBe(false);
    const res2 = await runFirstUseSync({
      dbPath: emptyPath,
      productsRoot,
      db: emptyDb,
      fetchRunner: mockFetchRunner,
    });
    try {
      expect(hasAnyReleases(res2.db)).toBe(true);
      expect(res2.report.succeeded).toBe(1);
    } finally {
      res2.db.close();
    }
  });

  it('reports partial sync with skipped list when a mocked fetcher fails', async () => {
    const dir = makeTmpDir('partial-use-');
    const dbPath = join(dir, 'data', 'claude-synergy.db');
    const productsRoot = join(dir, 'products');

    const mockFetchRunner = async (_db: any, root: string): Promise<FetchAllResult> => {
      const relDir = join(root, 'ok-prod', 'releases');
      mkdirSync(relDir, { recursive: true });
      writeFileSync(
        join(relDir, '1.0.0.md'),
        `---\nproduct: ok-prod\nversion: "1.0.0"\nreleased_at: "2026-11-25"\nfetched_at: "2026-11-26"\n---\n\n- Added ok item\n`,
        'utf-8'
      );
      const arr: any = [
        { product: 'ok-prod', fetched: 1, newSince: '2026-01-01', latest: '2026-11-25', errors: [] },
        { product: 'windsurf', fetched: 0, newSince: '2026-01-01', latest: null, errors: ['fetch failed: playwright is not installed'] },
      ];
      arr.summary = {
        total: 2,
        succeeded: 1,
        failed: 1,
        skipped: 0,
        newChanges: 1,
        errors: [{ product: 'windsurf', error: 'fetch failed: playwright is not installed' }],
      };
      return arr;
    };

    const { db, report } = await runFirstUseSync({
      dbPath,
      productsRoot,
      fetchRunner: mockFetchRunner,
    });
    try {
      expect(report.partial).toBe(true);
      expect(report.succeeded).toBe(1);
      expect(report.total).toBe(2);
      expect(report.skipped).toEqual([
        { product: 'windsurf', reason: 'fetch failed: playwright is not installed' },
      ]);
      const notice = formatFirstUseNotice(report, db, { now: new Date('2026-11-26T12:00:00Z') });
      expect(notice).toContain('first use (partial corpus): synced 1 of 2 products');
      expect(notice).toContain('skipped: windsurf');
    } finally {
      db.close();
    }
  });

  it('respects CLAUDE_SYNERGY_NO_AUTO_SYNC=1 opt-out', () => {
    expect(isAutoSyncDisabled({ CLAUDE_SYNERGY_NO_AUTO_SYNC: '1' })).toBe(true);
    expect(isAutoSyncDisabled({ CLAUDE_SYNERGY_NO_AUTO_SYNC: 'true' })).toBe(true);
    expect(isAutoSyncDisabled({ CLAUDE_SYNERGY_NO_AUTO_SYNC: '0' })).toBe(false);
    expect(isAutoSyncDisabled({})).toBe(false);
    expect(FIRST_USE_SYNC_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it('concurrent first calls run only one sync and expose active lock state', async () => {
    const dir = makeTmpDir('concurrent-use-');
    const dbPath = join(dir, 'data', 'claude-synergy.db');
    const productsRoot = join(dir, 'products');
    const coord = new FirstUseSyncCoordinator();

    let fetchCalls = 0;
    let inFlightObserved = false;

    const slowFetch = async (_db: any, root: string): Promise<FetchAllResult> => {
      fetchCalls++;
      inFlightObserved = coord.isSyncInProgress();
      await new Promise((r) => setTimeout(r, 40));
      mkdirSync(join(root, 'p1', 'releases'), { recursive: true });
      writeFileSync(
        join(root, 'p1', 'releases', '1.0.0.md'),
        `---\nproduct: p1\nversion: "1.0.0"\nreleased_at: "2026-11-25"\nfetched_at: "2026-11-26"\n---\n\n- Added one\n`,
        'utf-8'
      );
      const arr: any = [{ product: 'p1', fetched: 1, newSince: '2026-01-01', latest: '2026-11-25', errors: [] }];
      arr.summary = { total: 1, succeeded: 1, failed: 0, skipped: 0, newChanges: 1, errors: [] };
      return arr;
    };

    const [a, b] = await Promise.all([
      coord.ensureSynced({ dbPath, productsRoot, fetchRunner: slowFetch }),
      coord.ensureSynced({ dbPath, productsRoot, fetchRunner: slowFetch }),
    ]);

    try {
      expect(fetchCalls).toBe(1);
      expect(inFlightObserved).toBe(true);
      expect(coord.isSyncInProgress()).toBe(false);
      expect(a.performedByThisCall !== b.performedByThisCall).toBe(true);
    } finally {
      a.db.close();
    }
  });

  it('two-cwd replay: clone cwd uses clone DB; unrelated cwd uses temp HOME and writes nothing under cwd', async () => {
    const root = makeTmpDir('two-cwd-');
    const tempHome = join(root, 'home');
    const cloneCwd = join(root, 'clone-dir');
    const unrelatedCwd = join(root, 'unrelated-dir');
    mkdirSync(join(cloneCwd, 'data'), { recursive: true });
    mkdirSync(tempHome, { recursive: true });
    mkdirSync(unrelatedCwd, { recursive: true });

    // Seed clone DB
    const cloneDbPath = join(cloneCwd, 'data', 'claude-synergy.db');
    const cloneDb = openDb(cloneDbPath, { loadVec: false });
    initSchema(cloneDb);
    cloneDb.close();

    // (i) clone cwd
    const rClone = resolveStorePaths({ cwd: cloneCwd, env: { HOME: tempHome } });
    expect(rClone.rule).toBe('cwd-existing');
    expect(rClone.dbPath).toBe(cloneDbPath);

    // (ii) unrelated cwd — check entries before and after first-use sync
    const beforeCwdEntries = readdirSync(unrelatedCwd);
    const rUnrelated = resolveStorePaths({ cwd: unrelatedCwd, homeDir: tempHome, env: {} });
    expect(rUnrelated.rule).toBe('user-home-default');
    expect(rUnrelated.dbPath).toBe(join(tempHome, '.claude-synergy', 'data', 'claude-synergy.db'));

    const { db } = await runFirstUseSync({
      dbPath: rUnrelated.dbPath,
      productsRoot: rUnrelated.productsRoot,
      fetchRunner: async () => {
        const arr: any = [];
        arr.summary = { total: 0, succeeded: 0, failed: 0, skipped: 0, newChanges: 0, errors: [] };
        return arr;
      },
    });
    db.close();

    const afterCwdEntries = readdirSync(unrelatedCwd);
    expect(afterCwdEntries).toEqual(beforeCwdEntries);
    expect(existsSync(rUnrelated.dbPath)).toBe(true);
  });

  it('handles uninitialized DB in hasAnyReleases, fetchRunner throw, and coordinator state helpers', async () => {
    const uninit = createTempDb({ loadVec: false, init: false });
    try {
      expect(hasAnyReleases(null)).toBe(false);
      expect(hasAnyReleases(uninit.db)).toBe(false);
    } finally {
      uninit.cleanup();
    }

    const dir = makeTmpDir('store-err-');
    const dbPath = join(dir, 'data', 'claude-synergy.db');
    const productsRoot = join(dir, 'products');
    const { db, report } = await runFirstUseSync({
      dbPath,
      productsRoot,
      fetchRunner: async () => {
        throw new Error('network down');
      },
    });
    try {
      expect(report.partial).toBe(true);
      expect(report.skipped).toEqual([{ product: 'fetch', reason: 'network down' }]);
    } finally {
      db.close();
    }

    const coord = new FirstUseSyncCoordinator();
    coord.setManualSyncActive(true);
    expect(coord.isSyncInProgress()).toBe(true);
    coord.setManualSyncActive(false);
    expect(coord.isSyncInProgress()).toBe(false);

    const partialRes = await coord.ensureSynced({
      dbPath: join(dir, 'data', 'partial.db'),
      productsRoot,
      fetchRunner: async () => {
        const arr: any = [
          { product: 'ok', fetched: 0, newSince: '2026-01-01', latest: null, errors: [] },
          { product: 'bad', fetched: 0, newSince: '2026-01-01', latest: null, errors: ['timeout'] },
        ];
        arr.summary = { total: 2, succeeded: 1, failed: 1, skipped: 0, newChanges: 0, errors: [] };
        return arr;
      },
    });
    partialRes.db.close();
    expect(coord.getPartialNote()).toContain('partial corpus: synced 1 of 2 products');
    coord.clearPartialNote();
    expect(coord.getPartialNote()).toBeNull();
  });

  it('persists first_use_partial across DB opens, surfaces in stamp, and clears on clean full sync (Item 3)', async () => {
    const dir = makeTmpDir('store-partial-meta-');
    const dbPath = join(dir, 'data', 'claude-synergy.db');
    const productsRoot = join(dir, 'products');

    const res1 = await runFirstUseSync({
      dbPath,
      productsRoot,
      fetchRunner: async (_db: any, root: string): Promise<FetchAllResult> => {
        const relDir = join(root, 'p-ok', 'releases');
        mkdirSync(relDir, { recursive: true });
        writeFileSync(
          join(relDir, '1.0.0.md'),
          `---\nproduct: p-ok\nversion: "1.0.0"\nreleased_at: "2026-11-25"\nfetched_at: "2026-11-26"\n---\n\n- ok bullet\n`,
          'utf-8'
        );
        const arr: any = [
          { product: 'p-ok', fetched: 1, newSince: '2026-01-01', latest: '2026-11-25', errors: [] },
          { product: 'p-skip', fetched: 0, newSince: '2026-01-01', latest: null, errors: ['timeout'] },
        ];
        arr.summary = { total: 2, succeeded: 1, failed: 1, skipped: 0, newChanges: 1, errors: [] };
        return arr;
      },
    });
    res1.db.close();

    // Fresh DB connection sees persisted first_use_partial in schema_meta & stamp & needsAutoSync.
    const reopened = openDb(dbPath, { loadVec: false });
    try {
      const persisted = readPartialSyncState(reopened);
      expect(persisted?.succeeded).toBe(1);
      expect(persisted?.total).toBe(2);
      expect(persisted?.skipped).toEqual([{ product: 'p-skip', reason: 'timeout' }]);
      expect(needsAutoSync(reopened)).toBe(true);
      expect(formatFreshnessStamp(getCorpusFreshness(reopened))).toContain('p-skip (timeout)');
      expect(FIRST_USE_PARTIAL_META_KEY).toBe('first_use_partial');
    } finally {
      reopened.close();
    }

    // Re-running first-use sync where all products succeed clears first_use_partial.
    const coord = new FirstUseSyncCoordinator();
    const res2 = await coord.ensureSynced({
      dbPath,
      productsRoot,
      fetchRunner: async (): Promise<FetchAllResult> => {
        const arr: any = [
          { product: 'p-ok', fetched: 0, newSince: '2026-11-25', latest: null, errors: [] },
          { product: 'p-skip', fetched: 0, newSince: '2026-01-01', latest: null, errors: [] },
        ];
        arr.summary = { total: 2, succeeded: 2, failed: 0, skipped: 0, newChanges: 0, errors: [] };
        return arr;
      },
    });
    try {
      expect(res2.performedByThisCall).toBe(true);
      expect(readPartialSyncState(res2.db)).toBeNull();
      expect(needsAutoSync(res2.db)).toBe(false);
      writePartialSyncState(res2.db!, { succeeded: 1, total: 2, skipped: [] });
      expect(readPartialSyncState(res2.db)).not.toBeNull();
      clearPartialSyncState(res2.db);
      expect(readPartialSyncState(res2.db)).toBeNull();
    } finally {
      res2.db?.close();
    }
  });

  it('cools down in-process for 10 minutes after failed or empty first-use attempt using fixed clock (Item 5)', async () => {
    const dir = makeTmpDir('store-cooldown-');
    const dbPath = join(dir, 'data', 'claude-synergy.db');
    const productsRoot = join(dir, 'products');
    const coord = new FirstUseSyncCoordinator();
    let fetchCalls = 0;

    const t0 = new Date('2026-11-26T12:00:00Z');
    const failFetch = async (): Promise<FetchAllResult> => {
      fetchCalls++;
      const arr: any = [
        { product: 'p1', fetched: 0, newSince: '2026-01-01', latest: null, errors: ['offline'] },
      ];
      arr.summary = { total: 1, succeeded: 0, failed: 1, skipped: 0, newChanges: 0, errors: [] };
      return arr;
    };

    const r1 = await coord.ensureSynced({ dbPath, productsRoot, fetchRunner: failFetch, now: t0 });
    r1.db?.close();
    expect(fetchCalls).toBe(1);
    expect(FIRST_USE_COOLDOWN_MS).toBe(600_000);

    // 5 minutes later -> still cooling down, does not invoke fetchRunner again
    const t5m = new Date(t0.getTime() + 5 * 60 * 1000);
    const r2 = await coord.ensureSynced({ dbPath, productsRoot, fetchRunner: failFetch, now: t5m });
    expect(r2.cooledDown).toBe(true);
    expect(r2.performedByThisCall).toBe(false);
    expect(fetchCalls).toBe(1);

    // 11 minutes later -> cooldown expired, retries fetchRunner
    const t11m = new Date(t0.getTime() + 11 * 60 * 1000);
    const r3 = await coord.ensureSynced({ dbPath, productsRoot, fetchRunner: failFetch, now: t11m });
    r3.db?.close();
    expect(r3.cooledDown).toBe(false);
    expect(r3.performedByThisCall).toBe(true);
    expect(fetchCalls).toBe(2);
  });

  it('cuts off a slow fake gh subprocess on PATH at the timeout bound and marks first-use partial (Item 2)', async () => {
    const dir = makeTmpDir('slow-gh-');
    const binDir = join(dir, 'bin');
    mkdirSync(binDir, { recursive: true });

    if (process.platform === 'win32') {
      const csc = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';
      const src = join(binDir, 'gh.cs');
      const exe = join(binDir, 'gh.exe');
      writeFileSync(src, 'class P { static void Main() { System.Threading.Thread.Sleep(10000); } }\n', 'utf-8');
      execFileSync(csc, ['/nologo', `/out:${exe}`, src], { stdio: 'ignore', timeout: 15_000 });
    } else {
      const shPath = join(binDir, 'gh');
      writeFileSync(shPath, `#!/usr/bin/env node\nsetTimeout(() => {}, 10000);\n`, 'utf-8');
      chmodSync(shPath, 0o755);
    }

    const dbPath = join(dir, 'data', 'claude-synergy.db');
    const productsRoot = join(dir, 'products');
    const prevPath = process.env.PATH ?? '';
    process.env.PATH = `${binDir}${delimiter}${prevPath}`;
    const startMs = Date.now();
    try {
      const { fetchAll } = await import('../../src/fetch.js');
      const { db, report } = await runFirstUseSync({
        dbPath,
        productsRoot,
        timeoutMs: 350,
        fetchRunner: (database, root, opts) =>
          fetchAll(database, root, { ...opts, product: 'claude-code' }),
      });
      const elapsedMs = Date.now() - startMs;
      try {
        expect(elapsedMs).toBeLessThan(4_000);
        expect(report.partial).toBe(true);
        expect(report.succeeded).toBe(0);
        expect(report.skipped[0].product).toBe('claude-code');
        expect(report.skipped[0].reason).toMatch(/timed out|aborted|killed/i);
        const notice = formatFirstUseNotice(report, db, { now: new Date('2026-11-26T12:00:00Z') });
        expect(notice).toMatch(/^first use \(partial corpus\): synced 0 of 1 products/);
        expect(notice).toContain('claude-code');
      } finally {
        db.close();
      }
    } finally {
      process.env.PATH = prevPath;
    }
  }, 20_000);

  it('coordinates runManualSync locks, cooldown resets, malformed partial meta, empty results, and AppError propagation', async () => {
    const dir = makeTmpDir('store-coord-');
    const dbPath = join(dir, 'data', 'claude-synergy.db');
    const productsRoot = join(dir, 'products');
    mkdirSync(join(dir, 'data'), { recursive: true });
    mkdirSync(productsRoot, { recursive: true });

    const badMetaDb = openDb(dbPath, { loadVec: false });
    initSchema(badMetaDb);
    badMetaDb
      .prepare(`INSERT OR REPLACE INTO schema_meta (key, value) VALUES (?, ?)`)
      .run(FIRST_USE_PARTIAL_META_KEY, '{broken');
    expect(readPartialSyncState(badMetaDb)).toBeNull();
    badMetaDb
      .prepare(`INSERT OR REPLACE INTO schema_meta (key, value) VALUES (?, ?)`)
      .run(FIRST_USE_PARTIAL_META_KEY, '{"foo":1}');
    expect(readPartialSyncState(badMetaDb)).toBeNull();
    badMetaDb.close();

    expect(formatPartialNote({ succeeded: 1, total: 2, skipped: [] })).toBe(
      'partial corpus: synced 1 of 2 products'
    );

    const coord = new FirstUseSyncCoordinator();
    const emptyFetch = async (): Promise<FetchAllResult> => {
      const arr: any = [];
      arr.summary = { total: 0, succeeded: 0, failed: 0, skipped: 0, newChanges: 0, errors: [] };
      return arr;
    };
    const rEmpty = await coord.ensureSynced({
      dbPath,
      productsRoot,
      fetchRunner: emptyFetch,
      now: new Date('2026-11-26T10:00:00Z'),
    });
    rEmpty.db?.close();
    expect(coord.isCoolingDown(new Date('2026-11-26T10:01:00Z'))).toBe(true);
    coord.resetCooldown();
    expect(coord.isCoolingDown(new Date('2026-11-26T10:01:00Z'))).toBe(false);

    const errDb = openDb(dbPath, { loadVec: false });
    try {
      await expect(
        coord.ensureSynced({
          db: errDb,
          dbPath,
          productsRoot,
          fetchRunner: async () => {
            throw new AppError({
              code: 'MODEL_FAMILIES_CONFIG_ERROR',
              message: 'bad yaml',
              remediation: 'fix yaml',
            });
          },
          now: new Date('2026-11-26T10:02:00Z'),
        })
      ).rejects.toMatchObject({ code: 'MODEL_FAMILIES_CONFIG_ERROR' });
    } finally {
      errDb.close();
    }
    expect(coord.isCoolingDown(new Date('2026-11-26T10:03:00Z'))).toBe(true);
    coord.resetCooldown();

    let releaseManual!: () => void;
    const manualPromise = coord.runManualSync(async () => {
      await new Promise<void>((r) => {
        releaseManual = r;
      });
      return 'manual-done';
    });
    const waiter = coord.ensureSynced({ dbPath, productsRoot });
    releaseManual();
    expect(await manualPromise).toBe('manual-done');
    const waited = await waiter;
    waited.db?.close();
    expect(waited.waitedForManualSync).toBe(true);
    expect(waited.performedByThisCall).toBe(false);
  });
});
