import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument } from 'yaml';
import { evaluateSyncPrStaleness, STALE_SYNC_COMMENT_MARKER } from '../../scripts/check-stale-sync-pr.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const SCRIPT_PATH = resolve(REPO_ROOT, 'scripts/check-stale-sync-pr.mjs');
const SYNC_YML_PATH = resolve(REPO_ROOT, '.github/workflows/sync.yml');

describe('evaluateSyncPrStaleness (Part 6b)', () => {
  it('treats age 2 days and 3 days as not stale, and age 4 days as stale (threshold 3)', () => {
    const today = '2026-11-26';

    const twoDays = evaluateSyncPrStaleness({
      createdAt: '2026-11-24T12:05:00Z',
      today,
      maxDays: 3,
    });
    expect(twoDays).toEqual({
      stale: false,
      ageDays: 2,
      maxDays: 3,
      createdDate: '2026-11-24',
      todayDate: '2026-11-26',
      title: 'Daily sync 2026-11-26',
    });

    const threeDays = evaluateSyncPrStaleness({
      createdAt: '2026-11-23T12:05:00Z',
      today,
      maxDays: 3,
    });
    expect(threeDays).toEqual({
      stale: false,
      ageDays: 3,
      maxDays: 3,
      createdDate: '2026-11-23',
      todayDate: '2026-11-26',
      title: 'Daily sync 2026-11-26',
    });

    const fourDays = evaluateSyncPrStaleness({
      createdAt: '2026-11-22T12:05:00Z',
      today,
      maxDays: 3,
    });
    expect(fourDays).toEqual({
      stale: true,
      ageDays: 4,
      maxDays: 3,
      createdDate: '2026-11-22',
      todayDate: '2026-11-26',
      title: 'Daily sync (open since 2026-11-22, refreshed 2026-11-26)',
    });
  });

  it('CLI outputs staleness JSON at 2, 3, and 4 days', () => {
    for (const [createdAt, expectedStale, expectedAge] of [
      ['2026-11-24T00:00:00Z', false, 2],
      ['2026-11-23T00:00:00Z', false, 3],
      ['2026-11-22T00:00:00Z', true, 4],
    ] as const) {
      const stdout = execFileSync(
        process.execPath,
        [SCRIPT_PATH, '--created-at', createdAt, '--today', '2026-11-26', '--max-days', '3'],
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }
      );
      const parsed = JSON.parse(stdout);
      expect(parsed.stale).toBe(expectedStale);
      expect(parsed.ageDays).toBe(expectedAge);
    }
  });

  it('rejects invalid dates and negative thresholds', () => {
    expect(() => evaluateSyncPrStaleness({ createdAt: 'not-a-date', today: '2026-11-26' })).toThrow();
    expect(() => evaluateSyncPrStaleness({ createdAt: '2026-02-30', today: '2026-11-26' })).toThrow();
    expect(() =>
      evaluateSyncPrStaleness({ createdAt: '2026-11-24', today: '2026-11-26', maxDays: -1 })
    ).toThrow();
  });
});

describe('.github/workflows/sync.yml validation', () => {
  it('parses cleanly as YAML and preserves workflow invariants alongside STALE_SYNC_PR_DAYS', () => {
    const raw = readFileSync(SYNC_YML_PATH, 'utf-8');
    const doc = parseDocument(raw);
    expect(doc.errors).toEqual([]);
    expect(doc.warnings).toEqual([]);

    const data = doc.toJS() as Record<string, any>;
    expect(data.name).toBe('Daily sync');
    expect(data.permissions).toEqual({ contents: 'read' });
    expect(data.concurrency).toEqual({
      group: '${{ github.workflow }}-${{ github.ref }}',
      'cancel-in-progress': false,
    });
    expect(data.jobs.sync['timeout-minutes']).toBe(60);
    expect(data.jobs.sync.env).toEqual({
      CLAUDE_SYNERGY_DB: 'data/claude-synergy.db',
    });
    expect(data.jobs.sync.permissions).toEqual({
      contents: 'write',
      'pull-requests': 'write',
      actions: 'write',
    });

    const summaryStep = (data.jobs.sync.steps as Array<Record<string, any>>).find(
      (s) => s.name === 'Refresh top-level summaries'
    );
    expect(summaryStep?.run).toContain('--no-stamp products > PRODUCTS.txt');
    expect(summaryStep?.run).toContain('--no-stamp latest --limit 50 > LATEST.txt');

    const prStep = (data.jobs.sync.steps as Array<Record<string, any>>).find(
      (s) => s.name === 'Open or refresh the sync pull request'
    );
    expect(prStep).toBeDefined();
    expect(prStep?.env?.STALE_SYNC_PR_DAYS).toBe('3');
    expect(prStep?.run).toContain('check-stale-sync-pr.mjs');
    expect(prStep?.run).toContain('sync-stale');
    expect(prStep?.run).toContain(STALE_SYNC_COMMENT_MARKER);
    expect(prStep?.run).toContain('--method PATCH');
    expect(prStep?.run).toContain('exit 1');
  });
});
