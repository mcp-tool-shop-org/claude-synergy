import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  FIRST_USE_SYNC_TIMEOUT_MS,
  FirstUseSyncCoordinator,
  formatFirstUseNotice,
  hasAnyReleases,
  isAutoSyncDisabled,
  printStoreResolutionOnce,
  resetStoreNoticeForTests,
  resolveStorePaths,
  runFirstUseSync,
} from '../../src/store.js';
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
    const rUnrelated = resolveStorePaths({ cwd: unrelatedCwd, env: { HOME: tempHome } });
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
});
