import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { mockGhApi, release } from '../helpers/mock-gh-api.js';

let temp: TempDb;
let productsRoot: string;

beforeEach(() => {
  temp = createTempDb();
  productsRoot = mkdtempSync(join(tmpdir(), 'sync-int-'));
  vi.resetModules();
});
afterEach(() => {
  temp.cleanup();
  rmSync(productsRoot, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('integration/sync — fetch → write files → marker', () => {
  it('first run pulls all releases, second run pulls 0 (idempotent)', async () => {
    mockGhApi([
      release('v0.2.0'),
      release('v0.2.1', { published_at: '2026-04-15T10:00:00Z', body: '- two' }),
    ]);
    const { fetchAll } = await import('../../src/fetch.js');
    const first = await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    expect(first[0].fetched).toBe(2);
    expect(
      existsSync(join(productsRoot, 'claude-agent-sdk-python', 'releases', '0.2.0.md')),
      'release 0.2.0 should be written to disk'
    ).toBe(true);
    expect(
      existsSync(join(productsRoot, 'claude-agent-sdk-python', 'releases', '0.2.1.md')),
      'release 0.2.1 should be written to disk'
    ).toBe(true);

    // Second run — same input, same files exist; the since-marker advanced past
    // the latest release so the API returns 0 candidates and `latest` stays null.
    const second = await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    expect(second[0].fetched).toBe(0);
    // Marker in DB should still reflect the latest release from run 1
    const marker = temp.db
      .prepare(`SELECT version FROM markers WHERE product='claude-agent-sdk-python'`)
      .get() as { version: string };
    expect(marker.version).toMatch(/2026-04-15/);
  });

  it('writes marker per (product, name) after a successful fetch', async () => {
    mockGhApi([release('v0.2.0')]);
    const { fetchAll } = await import('../../src/fetch.js');
    await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });

    const rows = temp.db.prepare(`SELECT * FROM markers`).all() as any[];
    expect(rows.length).toBe(1);
    expect(rows[0].product).toBe('claude-agent-sdk-python');
    expect(rows[0].name).toBe('last_fetched_release_at');
    expect(rows[0].version).toMatch(/2026-04-01/);
  });

  it('--since override pre-dating the marker re-pulls (but idempotent files still skip)', async () => {
    mockGhApi([release('v0.2.0')]);
    const { fetchAll } = await import('../../src/fetch.js');
    await fetchAll(temp.db, productsRoot, { product: 'claude-agent-sdk-python' });
    const second = await fetchAll(temp.db, productsRoot, {
      product: 'claude-agent-sdk-python',
      sinceOverride: '2025-01-01',
    });
    // The file already exists, so no new writes; marker advances regardless
    expect(second[0].fetched).toBe(0);
  });
});
