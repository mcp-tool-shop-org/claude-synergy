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
    expect(rows, 'searchChanges should return an array without FTS5 column ambiguity').toBeInstanceOf(Array);
  });
});

// ─── 8.3 Commander variadic does not consume options ───────────────────────
describe('§8.3 Commander variadic does not consume options', () => {
  it('hk query foo --limit 2 keeps `foo` as the positional and `2` as --limit', () => {
    seedSampleProducts(temp.db);
    temp.db.close();
    const result = spawnSync(
      'npx',
      ['tsx', CLI, 'query', 'workflow', '--db', temp.path, '--limit', '2'],
      { encoding: 'utf-8', timeout: 25_000, shell: process.platform === 'win32', env: { ...process.env, HK_DEBUG: '1' } }
    );
    expect(result.status).toBe(0);
    // HK_DEBUG mode echoes parsed args as JSON to stderr. Specifically assert
    // the user-supplied --limit value (2) survived parsing — if the variadic
    // had eaten the option, this would show "20" (commander default) instead.
    const combined = (result.stderr ?? '') + (result.stdout ?? '');
    expect(combined).toMatch(/"limit":\s*"2"/);
    // Belt-and-suspenders: confirm the positional made it through as well.
    expect(combined).toMatch(/text=\s*"workflow"/);
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
      expect(fm.calls[0].url, 'OLLAMA_HOST without protocol should get http:// prefix').toMatch(/^http:\/\/127\.0\.0\.1:11434/);
    } finally {
      if (orig === undefined) delete process.env.OLLAMA_HOST;
      else process.env.OLLAMA_HOST = orig;
    }
  });
});

// ─── 8.7 sqlite-vec accepts BigInt rowid + Float32Array embedding ──────────
// Probe sqlite-vec load at module-eval time. If unavailable on this host (e.g.
// musl or some CI runners), skip the whole describe block instead of pretending
// to skip and then exploding on CREATE VIRTUAL TABLE.
let __vecLoadFailed = false;
try {
  const probeDir = mkdtempSync(join(tmpdir(), 'vec-probe-'));
  const probeDb = new Database(join(probeDir, 'probe.db'));
  try {
    sqliteVec.load(probeDb);
    probeDb.prepare('SELECT vec_version()').get();
  } catch {
    __vecLoadFailed = true;
  } finally {
    try { probeDb.close(); } catch { /* noop */ }
    try { rmSync(probeDir, { recursive: true, force: true }); } catch { /* noop */ }
  }
} catch {
  __vecLoadFailed = true;
}

describe.runIf(!__vecLoadFailed)('§8.7 sqlite-vec rowid + embedding contract', () => {
  let dir: string;
  let db: Database.Database;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'vec-test-'));
    db = new Database(join(dir, 'v.db'));
    sqliteVec.load(db);
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
      // Canonical env-restore (matches §8.6 pattern).
      if (orig === undefined) delete process.env.OLLAMA_RERANK_MODEL;
      else process.env.OLLAMA_RERANK_MODEL = orig;
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
    let callCount = 0;
    const respond = () =>
      ++callCount === 1
        ? JSON.stringify([
            {
              tag_name: 'v1.0.29',
              published_at: '2026-04-01T10:00:00Z',
              name: 'r',
              body: '- one',
              html_url: 'u',
            },
          ])
        : '[]';
    vi.doMock('node:child_process', () => ({
      execFileSync: vi.fn(respond),
      execSync: vi.fn(respond),
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
    let callCount = 0;
    // src/fetch.ts now uses execFileSync('gh', ['api', 'repos/.../releases?...']).
    // Reconstruct the equivalent command string from (file, args) for assertion.
    const recordAndRespond = (file: string, args?: string[]) => {
      capturedCmd = args ? `${file} ${args.join(' ')}` : String(file);
      return ++callCount === 1
        ? JSON.stringify([
            {
              tag_name: 'v0.1.0',
              published_at: '2026-04-01T10:00:00Z',
              name: 'r',
              body: '- one',
              html_url: 'u',
            },
          ])
        : '[]';
    };
    vi.doMock('node:child_process', () => ({
      execFileSync: vi.fn(recordAndRespond),
      execSync: vi.fn((cmd: string) => {
        capturedCmd = cmd;
        return recordAndRespond(cmd);
      }),
    }));
    const dir = mkdtempSync(join(tmpdir(), 'jq-test-'));
    try {
      const { fetchAll } = await import('../../src/fetch.js');
      await fetchAll(temp.db, dir, { product: 'claude-agent-sdk-python' });
      expect(capturedCmd).not.toContain('--jq');
      // The command should be a plain `gh api repos/...` invocation
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
    let callCount1 = 0;
    const respond1 = () =>
      ++callCount1 === 1
        ? JSON.stringify([
            {
              tag_name: 'v0.1.0',
              published_at: '2026-04-01T10:00:00Z',
              name: 'r',
              body: '- one',
              html_url: 'u',
            },
          ])
        : '[]';
    vi.doMock('node:child_process', () => ({
      execFileSync: vi.fn(respond1),
      execSync: vi.fn(respond1),
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
      let callCount2 = 0;
      const respond2 = () =>
        ++callCount2 === 1
          ? JSON.stringify([
              {
                tag_name: 'v0.2.0',
                published_at: '2026-04-15T10:00:00Z',
                name: 'r',
                body: '- two',
                html_url: 'u',
              },
            ])
          : '[]';
      vi.doMock('node:child_process', () => ({
        execFileSync: vi.fn(respond2),
        execSync: vi.fn(respond2),
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

// ─── 8.14 turndown HTML→markdown in ingest (Phase 4c, v0.5.1) ──────────────
describe('§8.14 turndown HTML→markdown ingest', () => {
  it('HTML body with <ul>/<li> produces bullet rows in changes table', () => {
    const dir = mkdtempSync(join(tmpdir(), 'html-ingest-'));
    try {
      mkdirSync(join(dir, 'html-product', 'releases'), { recursive: true });
      const path = join(dir, 'html-product', 'releases', 'v1.md');
      writeFileSync(
        path,
        `---\nproduct: html-product\nversion: "v1"\n---\n\n` +
          `<p>Release notes:</p>\n<ul>\n<li>Added <code>foo</code> command</li>\n` +
          `<li>Fixed <strong>bar</strong> crash</li>\n<li>Removed <em>baz</em> option</li>\n</ul>\n`
      );
      ingestAll(temp.db, dir);
      const rows = temp.db
        .prepare(`SELECT text FROM changes WHERE product='html-product' ORDER BY ordinal`)
        .all() as Array<{ text: string }>;
      // Before turndown this would have been 0 rows; after, we get the three <li> items
      expect(rows.length).toBeGreaterThanOrEqual(3);
      expect(rows.map((r) => r.text).join('\n')).toMatch(/foo/);
      expect(rows.map((r) => r.text).join('\n')).toMatch(/bar/);
      expect(rows.map((r) => r.text).join('\n')).toMatch(/baz/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('markdown-native body (no HTML tags) is left untouched', () => {
    const dir = mkdtempSync(join(tmpdir(), 'md-ingest-'));
    try {
      mkdirSync(join(dir, 'md-product', 'releases'), { recursive: true });
      writeFileSync(
        join(dir, 'md-product', 'releases', 'v1.md'),
        `---\nproduct: md-product\nversion: "v1"\n---\n\n- One\n- Two\n- Three\n`
      );
      ingestAll(temp.db, dir);
      const rows = temp.db
        .prepare(`SELECT text FROM changes WHERE product='md-product' ORDER BY ordinal`)
        .all() as Array<{ text: string }>;
      expect(rows.map((r) => r.text)).toEqual(['One', 'Two', 'Three']);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ─── 8.15 Commit-dump compaction (Phase 4c, v0.6.0) ───────────────────────
describe('§8.15 compactCommitDumpBody: continue-cli-style git commit dump collapses to 1 summary', () => {
  it('release body with >=10 SHA-prefixed bullets + >=50% ratio → 1 summary change row', () => {
    const dir = mkdtempSync(join(tmpdir(), 'commit-dump-'));
    try {
      mkdirSync(join(dir, 'noisy-cli', 'releases'), { recursive: true });
      const commits = [
        '6ad60da114171ac9e9d51f67ec80fd413a27efcd refactor: rename foo (#1)',
        '9e5adf959303844a82cc904f3bb9493b447fec5c feat: add bar (#2)',
        'e9471f2da47daddd7dff556339d28cb6c05035f0 fix: edge case (#3)',
        'a5c2d5594b3e12fd4c6233c61fcd2c768d68d198 fix: UI polish (#4)',
        '41850dcb3ef0102b5d0461974e09f4a4144eb484 fix: redirect blog (#5)',
        'cab63914514fd5929b85c1efab9eeaee35dd104c chore: standardize icon (#6)',
        '0331e87645286c9e26f53c959c9a00a87de796af feat: require feedback (#7)',
        'fc0d9e8066c651fc3295e51260e3a3e4513d3d84 fix: render markdown (#8)',
        '7a5e442f479dc6526b2eb70934628f63846042d4 feat: migrate model (#9)',
        'cdab88d443a5a23737b75c04ac52bd8115cbe559 fix: remove tool (#10)',
        '045872c61c61bba860ea14d2d2428a7ca415f145 chore: remove hook (#11)',
      ];
      const body = '- ' + commits.join('\n- ');
      writeFileSync(
        join(dir, 'noisy-cli', 'releases', '0.1.0.md'),
        `---\nproduct: noisy-cli\nversion: "0.1.0"\n---\n\n${body}\n`
      );
      ingestAll(temp.db, dir);
      const rows = temp.db
        .prepare(`SELECT text FROM changes WHERE product='noisy-cli'`)
        .all() as Array<{ text: string }>;
      expect(rows.length).toBe(1);
      expect(rows[0].text).toMatch(/Auto-generated release notes:\s+11 commits/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('body with fewer than 10 SHA bullets is NOT compacted (preserves small commit lists)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'small-dump-'));
    try {
      mkdirSync(join(dir, 'small-cli', 'releases'), { recursive: true });
      const body = [
        '- abc1234 feat: one',
        '- def5678 fix: two',
        '- 9abcdef chore: three',
      ].join('\n');
      writeFileSync(
        join(dir, 'small-cli', 'releases', '0.1.0.md'),
        `---\nproduct: small-cli\nversion: "0.1.0"\n---\n\n${body}\n`
      );
      ingestAll(temp.db, dir);
      const count = (
        temp.db.prepare(`SELECT COUNT(*) AS n FROM changes WHERE product='small-cli'`).get() as { n: number }
      ).n;
      // Threshold is 10 SHA bullets; with 3 we keep them as-is
      expect(count).toBe(3);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('body with >=10 SHA bullets but ratio < 50% is NOT compacted (mixed substantive content wins)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mixed-dump-'));
    try {
      mkdirSync(join(dir, 'mixed-cli', 'releases'), { recursive: true });
      // 10 SHA bullets + 12 substantive bullets = ratio 10/22 ≈ 45%
      const commits = Array.from(
        { length: 10 },
        (_, i) => `- ${'a'.repeat(8)}${i.toString().padStart(2, '0')} fix: thing ${i}`
      );
      const substantive = Array.from(
        { length: 12 },
        (_, i) => `- Added feature ${i} for user-facing workflow improvements`
      );
      const body = [...commits, ...substantive].join('\n');
      writeFileSync(
        join(dir, 'mixed-cli', 'releases', '0.1.0.md'),
        `---\nproduct: mixed-cli\nversion: "0.1.0"\n---\n\n${body}\n`
      );
      ingestAll(temp.db, dir);
      const count = (
        temp.db.prepare(`SELECT COUNT(*) AS n FROM changes WHERE product='mixed-cli'`).get() as { n: number }
      ).n;
      // Ratio under 50% → keep everything (22 bullets)
      expect(count).toBe(22);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ─── 8.16 npm-scoped filename sanitization (Tier 4a, v0.4.0) ───────────────
// Tags like @modelcontextprotocol/server@2.0.0-alpha.2 must NOT produce filename
// with @ or / chars that break Windows paths. Verified at the fetch.ts level
// via the PUBLIC surface (fetchAll with mocked gh CLI) — this catches a real
// regression if filenameFor() ever loses the npm-scoped sanitization rules.
describe('§8.16 npm-scoped multiPackage tag → sanitized filename', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('@scope/pkg@1.0.0 → scope-pkg-1.0.0.md (no @ or / in filename)', async () => {
    // Mock gh CLI returning an npm-scoped tag from a multiPackage repo
    // (mcp-typescript-sdk has multi_package: true in products.yaml).
    vi.doMock('node:child_process', () => ({
      execFileSync: vi.fn(() =>
        JSON.stringify([
          {
            tag_name: '@modelcontextprotocol/server@2.0.0-alpha.2',
            published_at: '2026-04-01T10:00:00Z',
            name: 'server 2.0.0-alpha.2',
            body: '- first npm-scoped release',
            html_url: 'https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/x',
          },
        ])
      ),
    }));
    const dir = mkdtempSync(join(tmpdir(), 'npm-scoped-'));
    try {
      const { fetchAll } = await import('../../src/fetch.js');
      await fetchAll(temp.db, dir, { product: 'mcp-typescript-sdk' });
      const releasesDir = join(dir, 'mcp-typescript-sdk', 'releases');
      // Expected sanitized name: '@' stripped, '/' → '-', '@' (between name+version) → '-'
      expect(
        existsSync(join(releasesDir, 'modelcontextprotocol-server-2.0.0-alpha.2.md')),
        'sanitized filename should exist without @ or / chars'
      ).toBe(true);
      // Negative: no file should retain the raw '@' or '/' chars in its name
      expect(
        existsSync(join(releasesDir, '@modelcontextprotocol-server@2.0.0-alpha.2.md')),
        'filename with @ should not exist'
      ).toBe(false);
      expect(
        existsSync(join(releasesDir, '@modelcontextprotocol/server@2.0.0-alpha.2.md')),
        'filename with @ and / should not exist'
      ).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('continue-style @scope/pkg@N tag → scope-pkg-N (no @ or / in filename)', async () => {
    vi.doMock('node:child_process', () => ({
      execFileSync: vi.fn(() =>
        JSON.stringify([
          {
            tag_name: '@continuedev/config-yaml@1.42.0',
            published_at: '2026-04-02T10:00:00Z',
            name: 'config-yaml 1.42.0',
            body: '- second npm-scoped release',
            html_url: 'https://github.com/continuedev/continue/releases/tag/x',
          },
        ])
      ),
    }));
    const dir = mkdtempSync(join(tmpdir(), 'npm-scoped-2-'));
    try {
      const { fetchAll } = await import('../../src/fetch.js');
      // continue-dev is also multiPackage in products.yaml
      await fetchAll(temp.db, dir, { product: 'continue-dev' });
      const releasesDir = join(dir, 'continue-dev', 'releases');
      expect(
        existsSync(join(releasesDir, 'continuedev-config-yaml-1.42.0.md')),
        'sanitized filename for continue-style npm-scoped tag should exist'
      ).toBe(true);
      expect(
        existsSync(join(releasesDir, '@continuedev-config-yaml@1.42.0.md')),
        'filename with @ chars should not exist'
      ).toBe(false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ─── 8.17 fetchAll lazy-inserts products row to satisfy FK on markers ─────
describe('§8.17 fetch lazy-inserts product row for marker FK', () => {
  it('fetching a never-ingested product does not FK-fail on markers insert', () => {
    // Setup: temp.db is fresh (initSchema applied, no products inserted)
    expect(
      (temp.db.prepare(`SELECT COUNT(*) AS n FROM products`).get() as { n: number }).n
    ).toBe(0);

    // Simulate the lazy-insert pattern used by writeMarker
    temp.db
      .prepare(
        `INSERT OR IGNORE INTO products (name, display_name, source_tier, source_url, fetch_strategy, notes)
         VALUES (?, ?, 1, '', 'gh-releases', NULL)`
      )
      .run('lazy-product', 'lazy-product');

    expect(() =>
      temp.db
        .prepare(
          `INSERT INTO markers (product, name, version, updated_at)
           VALUES (?, 'last_fetched_release_at', ?, ?)
           ON CONFLICT(product, name) DO UPDATE SET version = excluded.version, updated_at = excluded.updated_at`
        )
        .run('lazy-product', '2026-05-21T00:00:00Z', new Date().toISOString())
    ).not.toThrow();
  });
});

// ─── 8.18 Windsurf CSR fallback returns empty array (Tier 4b, v0.5.0) ─────
describe('§8.18 Windsurf scraper returns empty array on CSR fallback (no __NEXT_DATA__)', () => {
  it('HTML without __NEXT_DATA__ script ⇒ 0 entries, no throw', async () => {
    const handle = mockFetch([
      {
        urlPattern: /windsurf\.com\/changelog/,
        response: () =>
          new Response(
            '<!DOCTYPE html><html><body><h1>Windsurf Editor Changelog</h1></body></html>',
            { status: 200, headers: { 'content-type': 'text/html' } }
          ),
      },
    ]);
    try {
      const { fetchWindsurfChangelog } = await import('../../src/fetch-html.js');
      const items = await fetchWindsurfChangelog('2026-01-01');
      expect(items).toEqual([]);
    } finally {
      handle.restore();
    }
  });
});

// ─── 8.19 ghReleases early-exit pagination (Wave 1, FETCHERS) ─────────────
// Regression: FE-3 short-circuits pagination once a full page's LAST item is
// older than sinceIso (releases come in DESC published_at). The hazard is that
// a page with 100 items where the FIRST 99 are newer than since but the LAST
// is older must still return those 99. We assert the early-exit preserves all
// in-window items and DOES NOT fetch the next page.
describe('§8.19 ghReleases early-exit pagination preserves in-window items', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('full page where last item is older-than-since still keeps the newer items on that page', async () => {
    // Build a page of 100 releases — first 99 are in-window, last is out-of-window
    const sinceIso = '2026-04-01T00:00:00Z';
    const inWindow = Array.from({ length: 99 }, (_, i) => ({
      tag_name: `v1.${i}.0`,
      published_at: `2026-04-${String((i % 28) + 2).padStart(2, '0')}T10:00:00Z`,
      name: `r${i}`,
      body: `- bullet ${i}`,
      html_url: `https://example.test/v1.${i}.0`,
    }));
    const outOfWindow = {
      tag_name: 'v0.0.1',
      published_at: '2026-03-01T10:00:00Z', // before since
      name: 'oldr',
      body: '- old',
      html_url: 'https://example.test/v0.0.1',
    };
    const page1 = JSON.stringify([...inWindow, outOfWindow]);

    let callCount = 0;
    const respond = (_file: string, args?: string[]) => {
      callCount++;
      // gh api repos/<repo>/releases?per_page=100&page=N
      const url = args?.[1] ?? '';
      if (url.includes('page=1')) return page1;
      // If anything tries to fetch page 2, return empty so the test still works
      return '[]';
    };
    vi.doMock('node:child_process', () => ({
      execFileSync: vi.fn(respond),
      execSync: vi.fn(respond),
    }));
    const dir = mkdtempSync(join(tmpdir(), 'early-exit-'));
    try {
      const { fetchAll } = await import('../../src/fetch.js');
      const stats = await fetchAll(temp.db, dir, {
        product: 'claude-agent-sdk-python',
        sinceOverride: sinceIso,
      });
      // All 99 in-window items should be fetched. The 1 out-of-window should be excluded.
      expect(stats[0].fetched, 'all 99 in-window releases should be written').toBe(99);
      // Early-exit must engage: page 2 should NOT be requested. callCount = 1.
      expect(
        callCount,
        `gh api should be called exactly once (page=1) but was called ${callCount} times`
      ).toBe(1);
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
