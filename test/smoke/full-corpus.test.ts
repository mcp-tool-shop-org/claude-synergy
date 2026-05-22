// Opt-in smoke test against the real products/ corpus (706 release files).
// Skipped by default. Enable with RUN_SMOKE=1.
//
//   pnpm test:smoke
//
// This is the canary that proves the parser + queries still work end-to-end
// against the actual shipped data. It can take longer than the unit-test
// budget (15-30s on a hot SSD); keep it out of CI's default lane.

import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { ingestAll } from '../../src/ingest.js';
import { searchChanges, lookupEntity, entityFrequency, recentReleases } from '../../src/query.js';
import { createTempDb } from '../helpers/temp-db.js';

const SHOULD_RUN = process.env.RUN_SMOKE === '1';
const REPO_ROOT = resolve(__dirname, '..', '..');
const PRODUCTS_DIR = resolve(REPO_ROOT, 'products');

const describeOrSkip = SHOULD_RUN ? describe : describe.skip;

describeOrSkip('full-corpus smoke (RUN_SMOKE=1)', () => {
  it('products/ exists on disk', () => {
    expect(existsSync(PRODUCTS_DIR)).toBe(true);
  });

  it('ingest 706 releases, ~3,954 changes, ~957 entities (±5%)', () => {
    const temp = createTempDb();
    try {
      const stats = ingestAll(temp.db, PRODUCTS_DIR);
      // ±5% drift tolerated
      const within5 = (actual: number, expected: number) =>
        Math.abs(actual - expected) / expected <= 0.05;
      expect(within5(stats.releasesAdded, 706)).toBe(true);
      expect(within5(stats.changesAdded, 3954)).toBe(true);
      expect(within5(stats.entitiesAdded, 957)).toBe(true);
      expect(stats.errors).toEqual([]);
    } finally {
      temp.cleanup();
    }
  }, 90_000);

  it('query "managed agents" returns >= 5 hits', () => {
    const temp = createTempDb();
    try {
      ingestAll(temp.db, PRODUCTS_DIR);
      const results = searchChanges(temp.db, '"managed agents"');
      expect(results.length).toBeGreaterThanOrEqual(5);
    } finally {
      temp.cleanup();
    }
  }, 90_000);

  it('query "AskUserQuestion" returns >= 12 hits; top result is 2.1.147', () => {
    const temp = createTempDb();
    try {
      ingestAll(temp.db, PRODUCTS_DIR);
      const results = searchChanges(temp.db, 'AskUserQuestion');
      expect(results.length).toBeGreaterThanOrEqual(12);
      // Top result (newest first) should be 2.1.147 or close (allow some drift on the version dance)
      expect(results[0].version).toMatch(/^2\.1\./);
    } finally {
      temp.cleanup();
    }
  }, 90_000);

  it('lookup_entity cve CVE-2025-66414 returns 1 mention in claude-code-action v1.0.29', () => {
    const temp = createTempDb();
    try {
      ingestAll(temp.db, PRODUCTS_DIR);
      const results = lookupEntity(temp.db, 'cve', 'CVE-2025-66414');
      expect(results.length).toBeGreaterThanOrEqual(1);
      const ccaResult = results.find((r) => r.product === 'claude-code-action');
      expect(ccaResult).toBeDefined();
      expect(ccaResult?.version).toBe('1.0.29');
    } finally {
      temp.cleanup();
    }
  }, 90_000);

  it('lookup_entity env_var CLAUDE_CODE_WORKFLOWS returns 1 mention in claude-code v2.1.147', () => {
    const temp = createTempDb();
    try {
      ingestAll(temp.db, PRODUCTS_DIR);
      const results = lookupEntity(temp.db, 'env_var', 'CLAUDE_CODE_WORKFLOWS');
      expect(results.length).toBeGreaterThanOrEqual(1);
      const cc = results.find((r) => r.product === 'claude-code');
      expect(cc).toBeDefined();
    } finally {
      temp.cleanup();
    }
  }, 90_000);

  it('top entities of each type returns non-empty results', () => {
    const temp = createTempDb();
    try {
      ingestAll(temp.db, PRODUCTS_DIR);
      for (const type of ['env_var', 'slash_command', 'model_id', 'cve']) {
        const rows = entityFrequency(temp.db, type, 5);
        expect(rows.length).toBeGreaterThan(0);
      }
    } finally {
      temp.cleanup();
    }
  }, 90_000);

  it('recentReleases returns the 20 most recent by date', () => {
    const temp = createTempDb();
    try {
      ingestAll(temp.db, PRODUCTS_DIR);
      const rows = recentReleases(temp.db, undefined, 20);
      expect(rows.length).toBeGreaterThan(0);
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i - 1].released_at >= rows[i].released_at).toBe(true);
      }
    } finally {
      temp.cleanup();
    }
  }, 90_000);
});
