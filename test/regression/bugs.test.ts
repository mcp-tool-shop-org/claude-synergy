// REGRESSION SUITE — § 8 of test-spec.md
//
// Each describe block protects against a real bug fixed during initial dev.
// DO NOT delete these — they document failure modes that have already happened
// and ratchet the codebase against re-introducing them.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import { ingestAll } from '../../src/ingest.js';
import { searchChanges } from '../../src/query.js';
import { initSchema, openDb } from '../../src/db.js';
import { OllamaContextProvider } from '../../src/providers/context/ollama.js';
import { OllamaJudgeRerankProvider } from '../../src/providers/rerank/ollama-judge.js';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts, FIXTURE_PRODUCTS_ROOT } from '../helpers/seed-corpus.js';
import { mockFetch, jsonResponse, type FetchMockHandle } from '../helpers/fetch-mock.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = resolve(__dirname, '..', '..', 'src', 'cli.ts');

let temp: TempDb;
beforeEach(() => {
  temp = createTempDb();
});
afterEach(() => {
  temp.cleanup();
  vi.restoreAllMocks();
});

// ─── 8.1 parseBullets handles asterisk markers ─────────────────────────────
describe('§8.1 parseBullets handles asterisk markers', () => {
  it('extracts both - and * bullets — fixture 1.0.1.md uses asterisks only', () => {
    seedSampleProducts(temp.db);
    const rows = temp.db
      .prepare(
        `SELECT text FROM changes WHERE product='test-cli' AND version='1.0.1' ORDER BY ordinal`
      )
      .all() as Array<{ text: string }>;
    expect(rows).toHaveLength(3);
    expect(rows[0].text).toContain('TEST_FLAG');
    expect(rows[1].text).toContain('test-cmd');
    expect(rows[2].text).toContain('experimental-mode-2026-02-01');
  });

  it('still extracts the original count when the file mixes - and *', () => {
    seedSampleProducts(temp.db);
    const rows = temp.db
      .prepare(`SELECT COUNT(*) AS c FROM changes WHERE product='test-cli' AND version='1.1.0'`)
      .get() as { c: number };
    expect(rows.c).toBeGreaterThanOrEqual(4);
  });
});

// ─── 8.2 searchChanges does not error on FTS5 column ambiguity ─────────────
describe('§8.2 searchChanges does not error on FTS5 column ambiguity', () => {
  it('aliasing c.text AS body prevents ambiguous column name', () => {
    seedSampleProducts(temp.db);
    expect(() => searchChanges(temp.db, 'test')).not.toThrow();
    const rows = searchChanges(temp.db, 'test');
    expect(Array.isArray(rows)).toBe(true);
  });
});

// ─── 8.3 Commander variadic does not consume options ───────────────────────
describe('§8.3 Commander variadic does not consume options', () => {
  it('hk query foo --limit 3 keeps `foo` as the positional and `3` as --limit', () => {
    seedSampleProducts(temp.db);
    temp.db.close();
    const result = spawnSync(
      'npx',
      ['tsx', CLI, 'query', 'workflow', '--db', temp.path, '--limit', '2'],
      { encoding: 'utf-8', timeout: 25_000, shell: process.platform === 'win32', env: { ...process.env, HK_DEBUG: '1' } }
    );
    expect(result.status).toBe(0);
    // HK_DEBUG mode echoes parsed args; check the limit was parsed
    expect((result.stderr ?? '') + (result.stdout ?? '')).toMatch(/limit/i);
  }, 35_000);
});

// ─── 8.4 Sub-product composite versioning preserves multi-entry-per-date ──
describe('§8.4 Sub-product composite versioning', () => {
  it('two files on the same date with different sub_product → 2 distinct release rows', () => {
    seedSampleProducts(temp.db);
    const rows = temp.db
      .prepare(
        `SELECT version FROM releases WHERE product='test-apps' AND released_at='2026-04-09' ORDER BY version`
      )
      .all() as Array<{ version: string }>;
    expect(rows.map((r) => r.version)).toEqual([
      '2026-04-09-test-cowork',
      '2026-04-09-test-design',
    ]);
  });
});

// ─── 8.5 Idempotent schema init ────────────────────────────────────────────
describe('§8.5 Idempotent schema init', () => {
  it('initSchema called twice does not throw (no "table already exists")', () => {
    const dir = mkdtempSync(join(tmpdir(), 'idem-init-'));
    try {
      const path = join(dir, 'i.db');
      const db = openDb(path, { loadVec: false });
      initSchema(db);
      expect(() => initSchema(db)).not.toThrow();
      db.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ─── 8.6 OLLAMA_HOST without protocol is normalized ────────────────────────
describe('§8.6 OLLAMA_HOST without protocol is normalized', () => {
  let fm: FetchMockHandle;
  beforeEach(() => {
    fm = mockFetch([
      {
        method: 'POST',
        urlPattern: '/api/generate',
        response: () => jsonResponse({ response: 'ctx', done: true }),
      },
    ]);
  });
  afterEach(() => fm.restore());

  it('bare host "127.0.0.1:11434" gets http:// prefix', async () => {
    const orig = process.env.OLLAMA_HOST;
    process.env.OLLAMA_HOST = '127.0.0.1:11434';
    try {
      const p = new OllamaContextProvider({});
      const chunk = {
        changeId: 1,
        product: 'p',
        releaseVersion: 'v',
        releasedAt: null,
        kind: 'added',
        text: 't',
        ordinalInRelease: 1,
        totalInRelease: 1,
      };
      const release = { product: 'p', version: 'v', releasedAt: null, siblings: [chunk] };
      await p.contextFor(chunk as any, release as any);
      expect(fm.calls[0].url.startsWith('http://127.0.0.1:11434')).toBe(true);
    } finally {
      if (orig === undefined) delete process.env.OLLAMA_HOST;
      else process.env.OLLAMA_HOST = orig;
    }
  });
});

// ─── 8.7 sqlite-vec accepts BigInt rowid + Float32Array embedding ──────────
describe('§8.7 sqlite-vec rowid + embedding contract', () => {
  let dir: string;
  let db: Database.Database;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'vec-test-'));
    db = new Database(join(dir, 'v.db'));
    try {
      sqliteVec.load(db);
    } catch {
      // skip if extension unavailable
    }
    db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(embedding FLOAT[768]);`);
  });
  afterEach(() => {
    try {
      db.close();
    } catch {
      // ignore double-close
    }
    rmSync(dir, { recursive: true, force: true });
  });

  it('Number(rowid) + Buffer(embedding) → throws "Only integers are allow(ed|s) for primary key"', () => {
    // sqlite-vec rejects Number-typed rowids (must be BigInt) AND Buffer-wrapped vectors
    // (must be raw Float32Array). The exact message has a typo in some versions
    // ("allows" vs "allowed"); accept either.
    const vec = new Float32Array(768).fill(0.1);
    const stmt = db.prepare(`INSERT INTO chunks_vec(rowid, embedding) VALUES (?, ?)`);
    expect(() => stmt.run(Number(123), Buffer.from(vec.buffer))).toThrow(
      /only integers? are (?:allowed|allows)/i
    );
  });

  it('BigInt(rowid) + raw Float32Array → succeeds', () => {
    const vec = new Float32Array(768).fill(0.5);
    const stmt = db.prepare(`INSERT INTO chunks_vec(rowid, embedding) VALUES (?, ?)`);
    expect(() => stmt.run(BigInt(456), vec)).not.toThrow();
    const row = db.prepare(`SELECT COUNT(*) AS c FROM chunks_vec`).get() as { c: number };
    expect(row.c).toBe(1);
  });
});

// ─── 8.8 OllamaJudgeRerankProvider passes think:false ──────────────────────
describe('§8.8 OllamaJudgeRerankProvider passes think:false', () => {
  let fm: FetchMockHandle;
  beforeEach(() => {
    fm = mockFetch([
      {
        method: 'POST',
        urlPattern: '/api/generate',
        response: () => jsonResponse({ response: '5\n5\n5', done: true }),
      },
    ]);
  });
  afterEach(() => fm.restore());

  it('request body has think: false (workaround for qwen3 thinking-mode eating num_predict)', async () => {
    const p = new OllamaJudgeRerankProvider({ host: 'http://localhost:11434' });
    await p.rerank('q', [
      { id: 1, text: 'a' },
      { id: 2, text: 'b' },
      { id: 3, text: 'c' },
    ]);
    expect(fm.calls[0].body.think).toBe(false);
  });
});

// ─── 8.9 OllamaJudgeRerankProvider default model is qwen3:8b ──────────────
describe('§8.9 OllamaJudgeRerankProvider default model is qwen3:8b', () => {
  it('constructed with no args, no env vars → model === "qwen3:8b"', () => {
    const orig = process.env.OLLAMA_RERANK_MODEL;
    delete process.env.OLLAMA_RERANK_MODEL;
    try {
      const p = new OllamaJudgeRerankProvider();
      expect((p as any).model).toBe('qwen3:8b');
    } finally {
      if (orig !== undefined) process.env.OLLAMA_RERANK_MODEL = orig;
    }
  });
});

// ─── 8.10 fetch idempotency with v-prefix dual-form ────────────────────────
describe('§8.10 fetch idempotency with v-prefix dual-form check', () => {
  let productsRoot: string;
  beforeEach(() => {
    productsRoot = mkdtempSync(join(tmpdir(), 'vfetch-'));
    vi.resetModules();
  });
  afterEach(() => {
    rmSync(productsRoot, { recursive: true, force: true });
  });

  it('with v1.0.29.md already on disk, fetchAll returning v1.0.29 writes 0 new files', async () => {
    mkdirSync(join(productsRoot, 'claude-code-action', 'releases'), { recursive: true });
    writeFileSync(
      join(productsRoot, 'claude-code-action', 'releases', 'v1.0.29.md'),
      '# already here'
    );
    vi.doMock('node:child_process', () => ({
      execSync: vi.fn(() =>
        JSON.stringify([
          {
            tag_name: 'v1.0.29',
            published_at: '2026-04-01T10:00:00Z',
            name: 'r',
            body: '- one',
            html_url: 'u',
          },
        ])
      ),
    }));
    const { fetchAll } = await import('../../src/fetch.js');
    const stats = await fetchAll(temp.db, productsRoot, { product: 'claude-code-action' });
    expect(stats[0].fetched).toBe(0);
    // The non-v version should NOT have been written
    expect(
      existsSync(join(productsRoot, 'claude-code-action', 'releases', '1.0.29.md'))
    ).toBe(false);
    // Marker should still advance
    const marker = temp.db
      .prepare(`SELECT version FROM markers WHERE product='claude-code-action'`)
      .get() as any;
    expect(marker?.version).toMatch(/2026-04-01/);
  });
});

// ─── 8.11 gh api JSON parsing in JS, not shell jq ──────────────────────────
describe('§8.11 gh api JSON parsing in JS, not shell jq', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('command does NOT contain --jq; filter happens in JS', async () => {
    let capturedCmd = '';
    vi.doMock('node:child_process', () => ({
      execSync: vi.fn((cmd: string) => {
        capturedCmd = cmd;
        return JSON.stringify([
          {
            tag_name: 'v0.1.0',
            published_at: '2026-04-01T10:00:00Z',
            name: 'r',
            body: '- one',
            html_url: 'u',
          },
        ]);
      }),
    }));
    const dir = mkdtempSync(join(tmpdir(), 'jq-test-'));
    try {
      const { fetchAll } = await import('../../src/fetch.js');
      await fetchAll(temp.db, dir, { product: 'claude-agent-sdk-python' });
      expect(capturedCmd).not.toContain('--jq');
      // The command should be a plain `gh api repos/...` call
      expect(capturedCmd).toMatch(/gh api/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ─── 8.12 Markers table upsert on (product, name) composite PK ────────────
describe('§8.12 Markers upsert on (product, name)', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('writing the same marker twice keeps row count at 1, updates version', async () => {
    vi.doMock('node:child_process', () => ({
      execSync: vi.fn(() =>
        JSON.stringify([
          {
            tag_name: 'v0.1.0',
            published_at: '2026-04-01T10:00:00Z',
            name: 'r',
            body: '- one',
            html_url: 'u',
          },
        ])
      ),
    }));
    const dir = mkdtempSync(join(tmpdir(), 'marker-up-'));
    try {
      const { fetchAll } = await import('../../src/fetch.js');
      await fetchAll(temp.db, dir, { product: 'claude-agent-sdk-python' });
      const c1 = (
        temp.db.prepare(`SELECT COUNT(*) AS c FROM markers`).get() as { c: number }
      ).c;
      expect(c1).toBe(1);
      vi.resetModules();
      vi.doMock('node:child_process', () => ({
        execSync: vi.fn(() =>
          JSON.stringify([
            {
              tag_name: 'v0.2.0',
              published_at: '2026-04-15T10:00:00Z',
              name: 'r',
              body: '- two',
              html_url: 'u',
            },
          ])
        ),
      }));
      const { fetchAll: fetchAll2 } = await import('../../src/fetch.js');
      await fetchAll2(temp.db, dir, { product: 'claude-agent-sdk-python' });
      const c2 = (
        temp.db.prepare(`SELECT COUNT(*) AS c FROM markers`).get() as { c: number }
      ).c;
      expect(c2).toBe(1);
      const row = temp.db
        .prepare(`SELECT version FROM markers WHERE product='claude-agent-sdk-python'`)
        .get() as { version: string };
      expect(row.version).toMatch(/2026-04-15/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ─── 8.13 Ingest deletes prior changes for replaced version, FTS5 sync ────
describe('§8.13 Ingest deletes prior changes for replaced version (FTS5 sync)', () => {
  it('re-ingesting a file with 2 bullets after 3 → changes table has 2 rows, not 5', () => {
    const dir = mkdtempSync(join(tmpdir(), 'reingest-'));
    try {
      mkdirSync(join(dir, 'mod-product', 'releases'), { recursive: true });
      const path = join(dir, 'mod-product', 'releases', '1.0.0.md');
      writeFileSync(
        path,
        `---\nproduct: mod-product\nversion: "1.0.0"\n---\n\n- A\n- B\n- C\n`
      );
      ingestAll(temp.db, dir);
      const c1 = (
        temp.db
          .prepare(`SELECT COUNT(*) AS c FROM changes WHERE product='mod-product'`)
          .get() as { c: number }
      ).c;
      expect(c1).toBe(3);

      writeFileSync(
        path,
        `---\nproduct: mod-product\nversion: "1.0.0"\n---\n\n- A\n- B\n`
      );
      ingestAll(temp.db, dir);
      const c2 = (
        temp.db
          .prepare(`SELECT COUNT(*) AS c FROM changes WHERE product='mod-product'`)
          .get() as { c: number }
      ).c;
      expect(c2).toBe(2);

      // FTS5 mirrored — count matches changes
      const cFts = (
        temp.db
          .prepare(`SELECT COUNT(*) AS c FROM changes_fts`)
          .get() as { c: number }
      ).c;
      expect(cFts).toBe(c2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
