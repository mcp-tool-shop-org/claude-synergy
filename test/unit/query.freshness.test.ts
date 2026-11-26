import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  STALE_AFTER_DAYS,
  getCorpusFreshness,
  formatFreshnessStamp,
  formatManualFeedWarning,
  utcDaysSince,
} from '../../src/query.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';

let temp: TempDb;

beforeEach(() => {
  temp = createTempDb({ loadVec: false });
});

afterEach(() => {
  delete process.env.CLAUDE_SYNERGY_NOW;
  temp.cleanup();
});

describe('utcDaysSince', () => {
  it('computes exact UTC day difference (52 days from 2026-10-05 to 2026-11-26)', () => {
    const now = new Date('2026-11-26T12:00:00Z');
    expect(utcDaysSince('2026-10-05', now)).toBe(52);
    expect(utcDaysSince('2026-10-06T23:59:59Z', now)).toBe(51);
  });

  it('clamps future dates to 0 and returns null for invalid/empty inputs', () => {
    const now = new Date('2026-11-26T12:00:00Z');
    expect(utcDaysSince('2026-12-01', now)).toBe(0);
    expect(utcDaysSince(null, now)).toBeNull();
    expect(utcDaysSince('not-a-date', now)).toBeNull();
  });
});

describe('getCorpusFreshness & formatFreshnessStamp', () => {
  it('exposes STALE_AFTER_DAYS = 7', () => {
    expect(STALE_AFTER_DAYS).toBe(7);
  });

  it('handles null or empty DB as stale with empty-corpus stamp', () => {
    const fromNull = getCorpusFreshness(null, { now: new Date('2026-11-26T00:00:00Z') });
    expect(fromNull.synced_at).toBeNull();
    expect(fromNull.newest_release).toBeNull();
    expect(fromNull.stale).toBe(true);
    expect(formatFreshnessStamp(fromNull)).toMatch(/^STALE: data as of: empty corpus.*sync_now.*hk sync/);

    const fromEmpty = getCorpusFreshness(temp.db, { now: new Date('2026-11-26T00:00:00Z') });
    expect(fromEmpty.stale).toBe(true);
    expect(formatFreshnessStamp(fromEmpty)).toMatch(/^STALE:/);
  });

  it('returns non-stale stamp within STALE_AFTER_DAYS and STALE beyond it', () => {
    seedSampleProducts(temp.db);
    // Fixture releases have fetched_at = 2026-05-21 and max released_at = 2026-04-10.
    const freshClock = new Date('2026-05-28T12:00:00Z'); // 7 days after 2026-05-21
    const fresh = getCorpusFreshness(temp.db, { now: freshClock });
    expect(fresh.synced_at).toBe('2026-05-21');
    expect(fresh.newest_release).toBe('2026-04-10');
    expect(fresh.synced_age_days).toBe(7);
    expect(fresh.age_days).toBe(48);
    expect(fresh.stale).toBe(false);
    const freshLine = formatFreshnessStamp(fresh);
    expect(freshLine).toBe('data as of: synced 2026-05-21, newest release 2026-04-10 (48 days old)');
    expect(freshLine.startsWith('STALE:')).toBe(false);

    const staleClock = new Date('2026-05-29T00:00:00Z'); // 8 days after 2026-05-21
    const stale = getCorpusFreshness(temp.db, { now: staleClock });
    expect(stale.synced_age_days).toBe(8);
    expect(stale.stale).toBe(true);
    const staleLine = formatFreshnessStamp(stale);
    expect(staleLine).toMatch(/^STALE: data as of: synced 2026-05-21, newest release 2026-04-10 \(49 days old\) — refresh with sync_now or hk sync$/);
  });

  it('supports injectable clock function and CLAUDE_SYNERGY_NOW env', () => {
    seedSampleProducts(temp.db);
    const fnRes = getCorpusFreshness(temp.db, { now: () => new Date('2026-05-22T00:00:00Z') });
    expect(fnRes.stale).toBe(false);

    process.env.CLAUDE_SYNERGY_NOW = '2026-06-10T00:00:00Z';
    const envRes = getCorpusFreshness(temp.db);
    expect(envRes.stale).toBe(true);
    expect(envRes.synced_age_days).toBe(20);
  });

  it('includes per-product synced_at, newest_release, and fetch_strategy when product is scoped', () => {
    seedSampleProducts(temp.db);
    temp.db
      .prepare(`UPDATE products SET fetch_strategy = 'manual' WHERE name = 'test-apps'`)
      .run();

    const scoped = getCorpusFreshness(temp.db, {
      product: 'test-apps',
      now: new Date('2026-05-24T00:00:00Z'),
    });
    expect(scoped.product).toEqual({
      product: 'test-apps',
      synced_at: '2026-05-21',
      newest_release: '2026-04-10',
      fetch_strategy: 'manual',
    });
    const stamp = formatFreshnessStamp(scoped);
    expect(stamp).toContain('test-apps: synced 2026-05-21, newest release 2026-04-10 (manual, MANUAL FEED');

    const warn = formatManualFeedWarning('test-apps', '2026-04-10', new Date('2026-05-24T00:00:00Z'));
    expect(warn).toBe('MANUAL FEED (test-apps): last updated 2026-04-10, 44 days old, not refreshed by sync');
  });

  it('handles default clock, non-ISO date strings, partial notes, and uninitialized DB fallback', () => {
    seedSampleProducts(temp.db);
    delete process.env.CLAUDE_SYNERGY_NOW;
    const defaultClockRes = getCorpusFreshness(temp.db);
    expect(defaultClockRes.synced_at).toBe('2026-05-21');

    expect(utcDaysSince('November 23, 2026', new Date('2026-11-26T12:00:00Z'))).toBe(3);

    const noReleaseStamp = formatFreshnessStamp(
      {
        synced_at: 'November 23, 2026',
        newest_release: null,
        age_days: null,
        synced_age_days: 3,
        stale: false,
        stale_after_days: 7,
      },
      { partialNote: 'partial corpus: synced 1 of 2 products' }
    );
    expect(noReleaseStamp).toBe(
      'data as of: synced 2026-11-23, newest release none; partial corpus: synced 1 of 2 products'
    );

    const uninit = createTempDb({ loadVec: false, init: false });
    try {
      const uninitRes = getCorpusFreshness(uninit.db, {
        product: 'claude-api',
        now: new Date('2026-11-26T12:00:00Z'),
      });
      expect(uninitRes.stale).toBe(true);
      expect(uninitRes.product?.fetch_strategy).toBe('html-scrape');
    } finally {
      uninit.cleanup();
    }
  });
});
