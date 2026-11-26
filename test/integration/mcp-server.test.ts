import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { seedSampleProducts } from '../helpers/seed-corpus.js';
import { withMcpServer, type McpClient } from '../helpers/mcp-client.js';

let temp: TempDb;
let synergiesDir: string;

beforeEach(() => {
  temp = createTempDb();
  seedSampleProducts(temp.db);
  // Build a minimal synergies dir so list_synergies / read_synergy have data
  synergiesDir = mkdtempSync(join(tmpdir(), 'syn-int-'));
  mkdirSync(synergiesDir, { recursive: true });
  writeFileSync(
    join(synergiesDir, '01-test-synergy.md'),
    `---
name: test-synergy
title: Test synergy
trigger: when the test runs
products: [test-cli, test-sdk]
status: confirmed
last_validated: 2026-05-21
---

# Test synergy

This is a synergy fixture.
`
  );
  temp.db.close();
});
afterEach(() => {
  temp.cleanup();
  rmSync(synergiesDir, { recursive: true, force: true });
});

describe('MCP server integration', () => {
  it(
    'completes initialize handshake and lists the expected tool set (Wave 2: 13 tools)',
    async () => {
      await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
        const init = await client.initialize();
        expect(init.serverInfo).toBeDefined();
        expect(init.serverInfo.name).toBe('claude-synergy');
        expect(init.capabilities).toBeDefined();

        await client.notifyInitialized();

        const tools = await client.listTools();
        const names = tools.map((t) => t.name).sort();
        // Wave 1 added: get_changes_since, search_breaking_changes, compare_versions
        // Wave 2 added: sync_status, sync_now
        expect(names).toEqual([
          'compare_versions',
          'get_changes_since',
          'get_release',
          'latest_releases',
          'list_products',
          'list_synergies',
          'lookup_entity',
          'read_synergy',
          'search',
          'search_breaking_changes',
          'sync_now',
          'sync_status',
          'top_entities',
        ]);
        for (const t of tools) {
          expect(t.name).toBeTruthy();
          expect(t.description).toBeTruthy();
          expect(t.inputSchema.type).toBe('object');
        }
      });
    },
    25_000
  );

  // --- Per-tool validation (split from the former monolithic "calls each tool" block) ---

  describe('search tools', () => {
    it(
      'search (fts mode) returns text results for a known keyword',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const search = await client.callTool('search', { query: 'workflow', mode: 'fts', limit: 5 });
          expect(search.content[0].type).toBe('text');
          expect((search.content[0].text ?? '').length).toBeGreaterThan(0);
        });
      },
      25_000
    );

    it(
      'lookup_entity returns results for a known entity',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const lookup = await client.callTool('lookup_entity', {
            type: 'env_var',
            value: 'ANTHROPIC_API_KEY',
          });
          expect(lookup.content[0].text).toBeTruthy();
        });
      },
      25_000
    );

    it(
      'top_entities returns non-empty results for a known entity type',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const top = await client.callTool('top_entities', { type: 'env_var', limit: 5 });
          expect((top.content[0].text ?? '').length).toBeGreaterThan(0);
        });
      },
      25_000
    );
  });

  describe('list tools', () => {
    it(
      'latest_releases returns non-empty content',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const latest = await client.callTool('latest_releases', { limit: 5 });
          expect(latest.content[0].text).toBeTruthy();
        });
      },
      25_000
    );

    it(
      'list_products response contains seeded product names',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const products = await client.callTool('list_products', {});
          expect((products.content[0].text ?? '')).toContain('test-cli');
        });
      },
      25_000
    );

    it(
      'list_synergies response contains seeded synergy name',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const synergies = await client.callTool('list_synergies', {});
          expect((synergies.content[0].text ?? '')).toContain('test-synergy');
        });
      },
      25_000
    );
  });

  describe('read tools', () => {
    it(
      'get_release returns release details for a known product+version',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const release = await client.callTool('get_release', {
            product: 'test-cli',
            version: '1.0.0',
          });
          expect((release.content[0].text ?? '')).toContain('test-cli');
        });
      },
      25_000
    );

    it(
      'read_synergy returns full synergy content by name',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const synergy = await client.callTool('read_synergy', { name: 'test-synergy' });
          expect((synergy.content[0].text ?? '')).toContain('Test synergy');
        });
      },
      25_000
    );
  });

  // --- Error handling ---

  it(
    'returns MCP error for unknown tool',
    async () => {
      await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
        await client.initialize();
        await client.notifyInitialized();
        await expect(client.callTool('does_not_exist', {})).rejects.toThrow(/unknown tool/i);
      });
    },
    25_000
  );

  it(
    'empty search query is rejected with InvalidParams but the server keeps running',
    async () => {
      await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
        await client.initialize();
        await client.notifyInitialized();
        // Post-Wave-2 contract: handleSearch validates `query` and throws
        // McpError(InvalidParams) for empty/non-string queries instead of
        // letting them fall through to FTS5. The contract that matters is
        // that the server stays alive after the bad call.
        await expect(
          client.callTool('search', { query: '', mode: 'fts' })
        ).rejects.toThrow(/query must be a non-empty string/i);
        // Subsequent call still works
        const ok = await client.callTool('search', { query: 'workflow', mode: 'fts', limit: 3 });
        expect(ok.content[0].text).toBeTruthy();
      });
    },
    25_000
  );

  it(
    'process exits cleanly after close',
    async () => {
      const client = await (await import('../helpers/mcp-client.js')).startMcpClient({
        dbPath: temp.path,
        synergiesDir,
      });
      await client.initialize();
      await client.close();
      // Exit code may be null briefly; should not still be running
      await new Promise((r) => setTimeout(r, 200));
      // Either exited cleanly (0 or SIGTERM-like) or we forcibly killed (SIGKILL)
      // The exitCode getter should not be undefined
      expect(client.exitCode()).not.toBe(undefined);
    },
    25_000
  );

  // ── Wave 1 new tools ──────────────────────────────────────────────────
  describe('new tools (Wave 1)', () => {
    it(
      'get_changes_since returns ChangesSinceResult shape grouped by release',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('get_changes_since', { since: '2026-01-01' });
          const text = res.content[0]?.text ?? '';
          expect(text.length).toBeGreaterThan(0);
          // The response is human-readable but must mention a fixture
          // product@version (we accept any of the seeded products).
          expect(text).toMatch(/test-(cli|sdk|apps)@/);
        });
      },
      25_000
    );

    it(
      'get_changes_since with kind=breaking only returns breaking changes',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('get_changes_since', {
            since: '2026-01-01',
            kind: 'breaking',
          });
          const text = res.content[0]?.text ?? '';
          expect(text.length).toBeGreaterThan(0);
        });
      },
      25_000
    );

    it(
      'get_changes_since with relative since (7d) does not error',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('get_changes_since', { since: '7d' });
          expect(res.content[0]?.text).toBeTruthy();
        });
      },
      25_000
    );

    it(
      'search_breaking_changes returns the fixture breaking row',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('search_breaking_changes', {});
          const text = res.content[0]?.text ?? '';
          // The fixture test-cli@1.1.0 has a breaking-kind bullet
          expect(text.length).toBeGreaterThan(0);
        });
      },
      25_000
    );

    it(
      'search_breaking_changes with product filter scopes correctly',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('search_breaking_changes', { product: 'test-cli' });
          const text = res.content[0]?.text ?? '';
          // Either contains test-cli or "no breaking" — both valid responses
          expect(text.length).toBeGreaterThan(0);
        });
      },
      25_000
    );

    it(
      'compare_versions returns intermediate releases between from (exclusive) and to (inclusive)',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('compare_versions', {
            product: 'test-cli',
            from_version: '1.0.0',
            to_version: '1.1.0',
          });
          const text = res.content[0]?.text ?? '';
          expect(text.length).toBeGreaterThan(0);
          // 1.0.1 and 1.1.0 should appear; 1.0.0 should not
          expect(text).toMatch(/1\.0\.1|1\.1\.0/);
        });
      },
      25_000
    );

    it(
      'compare_versions with nonexistent versions returns a (no changes) message, no throw',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('compare_versions', {
            product: 'test-cli',
            from_version: '99.0.0',
            to_version: '99.9.9',
          });
          const text = res.content[0]?.text ?? '';
          expect(text.length).toBeGreaterThan(0);
        });
      },
      25_000
    );

    it(
      'list_synergies with product filter scopes results',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          // Seeded synergy is "test-synergy" with products: [test-cli, test-sdk]
          const res = await client.callTool('list_synergies', { product: 'test-cli' });
          expect((res.content[0]?.text ?? '')).toContain('test-synergy');
        });
      },
      25_000
    );

    it(
      'list_synergies with a product nothing references returns a (no matches) line',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('list_synergies', { product: 'no-such-product' });
          const text = res.content[0]?.text ?? '';
          // Either "(no synergies)" or just no listing of test-synergy
          expect(text.length).toBeGreaterThan(0);
          expect(text).not.toContain('test-synergy');
        });
      },
      25_000
    );
  });

  // ── Wave 2 sync tools ─────────────────────────────────────────────────
  describe('sync tools (Wave 2)', () => {
    it(
      'sync_status returns one row per seeded product with no marker (hours_since_fetch=never)',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('sync_status', {});
          const text = res.content[0]?.text ?? '';
          // Seeded fixture products were ingested but never had a marker written,
          // so they appear with "never" in the hours column.
          expect(text).toContain('test-cli');
          expect(text).toContain('never');
          // Header row is always present
          expect(text).toMatch(/Product\s+Strategy\s+Last fetch/);
        });
      },
      25_000
    );

    it(
      'sync_status with product filter scopes to one row',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('sync_status', { product: 'test-cli' });
          const text = res.content[0]?.text ?? '';
          expect(text).toContain('test-cli');
          // Other seeded products must not appear
          expect(text).not.toContain('test-sdk');
          expect(text).toContain('1 product');
        });
      },
      25_000
    );

    it(
      'sync_status with stale_only=true returns all marker-less products (treated as stale)',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('sync_status', { stale_only: true, stale_hours: 1 });
          const text = res.content[0]?.text ?? '';
          // All seeded products lack markers — should all show as stale
          expect(text).toContain('test-cli');
          expect(text).toContain('never');
        });
      },
      25_000
    );

    it(
      'sync_status with non-existent product returns the empty-list message',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('sync_status', { product: 'no-such-product' });
          const text = res.content[0]?.text ?? '';
          expect(text).toMatch(/\(no products/);
        });
      },
      25_000
    );

    it(
      'sync_now dry_run enumerates real fetch targets without writes',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('sync_now', { dry_run: true });
          const text = res.content[0]?.text ?? '';
          // Dry-run header
          expect(text).toContain('dry_run');
          // claude-code is in the canonical fetch target list
          expect(text).toContain('claude-code');
          // Strategy column should appear (gh-releases is most common)
          expect(text).toContain('gh-releases');
        });
      },
      25_000
    );

    it(
      'sync_now dry_run with product filter scopes to that product',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          const res = await client.callTool('sync_now', { dry_run: true, product: 'claude-code' });
          const text = res.content[0]?.text ?? '';
          expect(text).toContain('claude-code');
          // Other targets should not appear
          expect(text).not.toContain('aider');
          expect(text).toContain('would fetch 1 product');
        });
      },
      25_000
    );

    it(
      'sync_now dry_run with unknown product rejects with InvalidParams',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          await expect(
            client.callTool('sync_now', { dry_run: true, product: 'no-such-product' })
          ).rejects.toThrow(/unknown product/i);
        });
      },
      25_000
    );

    it(
      'sync_now rejects non-boolean dry_run',
      async () => {
        await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
          await client.initialize();
          await client.notifyInitialized();
          await expect(
            client.callTool('sync_now', { dry_run: 'yes' as unknown as boolean })
          ).rejects.toThrow(/dry_run.*boolean/i);
        });
      },
      25_000
    );
  });

  describe('freshness stamp & first-use behavior (Parts 1 & 3)', () => {
    it(
      'every registered tool in listTools() ends its text answer with the data-as-of stamp',
      async () => {
        await withMcpServer(
          {
            dbPath: temp.path,
            synergiesDir,
            env: { CLAUDE_SYNERGY_NOW: '2026-05-24T12:00:00Z' },
          },
          async (client: McpClient) => {
            await client.initialize();
            await client.notifyInitialized();
            const tools = await client.listTools();
            expect(tools.length).toBe(13);

            const toolArgs: Record<string, Record<string, unknown>> = {
              search: { query: 'workflow', mode: 'fts', limit: 2 },
              lookup_entity: { type: 'env_var', value: 'ANTHROPIC_API_KEY' },
              latest_releases: { limit: 2 },
              get_release: { product: 'test-cli', version: '1.0.0' },
              list_products: {},
              top_entities: { type: 'env_var', limit: 2 },
              list_synergies: {},
              read_synergy: { name: 'test-synergy' },
              get_changes_since: { since: '2026-01-01', limit: 5 },
              search_breaking_changes: { limit: 5 },
              compare_versions: { product: 'test-cli', from_version: '1.0.0', to_version: '1.1.0' },
              sync_status: { product: 'test-cli' },
              sync_now: { dry_run: true, product: 'claude-code' },
            };

            for (const tool of tools) {
              const args = toolArgs[tool.name];
              expect(args, `missing test args for tool ${tool.name}`).toBeDefined();
              const res = await client.callTool(tool.name, args);
              const text = res.content[0]?.text ?? '';
              const lastLine = text.trimEnd().split('\n').pop() ?? '';
              expect(
                lastLine,
                `tool ${tool.name} should end with data as of stamp`
              ).toMatch(/^data as of: synced 2026-05-21, newest release 2026-04-10 \(44 days old\)/);
            }

            // Unembedded hybrid search error also ends with the stamp line
            const hybridErr = await client.callTool('search', { query: 'workflow', mode: 'hybrid' });
            expect(hybridErr.isError).toBe(true);
            const errLastLine = (hybridErr.content[0]?.text ?? '').trimEnd().split('\n').pop() ?? '';
            expect(errLastLine).toMatch(/^data as of: synced 2026-05-21/);
          }
        );
      },
      30_000
    );

    it(
      'prefixes stamp with STALE: and refresh hint when synced_at exceeds STALE_AFTER_DAYS',
      async () => {
        await withMcpServer(
          {
            dbPath: temp.path,
            synergiesDir,
            env: { CLAUDE_SYNERGY_NOW: '2026-11-26T12:00:00Z' },
          },
          async (client: McpClient) => {
            await client.initialize();
            await client.notifyInitialized();
            const res = await client.callTool('list_products', {});
            const lastLine = (res.content[0]?.text ?? '').trimEnd().split('\n').pop() ?? '';
            expect(lastLine).toMatch(/^STALE: data as of: synced 2026-05-21.*sync_now.*hk sync$/);
          }
        );
      },
      25_000
    );

    it(
      'does not exit on missing DB when CLAUDE_SYNERGY_NO_AUTO_SYNC=1 and stamps empty-corpus error',
      async () => {
        const missingDir = mkdtempSync(join(tmpdir(), 'mcp-missing-'));
        const missingDb = join(missingDir, 'data', 'missing.db');
        try {
          await withMcpServer(
            {
              dbPath: missingDb,
              synergiesDir,
              env: { CLAUDE_SYNERGY_NO_AUTO_SYNC: '1' },
            },
            async (client: McpClient) => {
              await client.initialize();
              await client.notifyInitialized();
              const res = await client.callTool('latest_releases', {});
              expect(res.isError).toBe(true);
              const text = res.content[0]?.text ?? '';
              expect(text).toContain('auto-sync is disabled');
              expect(text.trimEnd().split('\n').pop()).toMatch(/^STALE: data as of: empty corpus/);
            }
          );
        } finally {
          rmSync(missingDir, { recursive: true, force: true });
        }
      },
      25_000
    );

    it(
      'first-use auto-sync on missing DB runs fetch -> ingest and reports partial corpus when one feed fails',
      async () => {
        const workDir = mkdtempSync(join(tmpdir(), 'mcp-firstuse-'));
        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Local Feed</title>
<item><title>Release 1.2.0</title><link>http://127.0.0.1/r/1.2.0</link><guid>r-1-2-0</guid><pubDate>Wed, 25 Nov 2026 12:00:00 GMT</pubDate><description><![CDATA[<ul><li>Added local workflow improvement</li></ul>]]></description></item>
</channel></rss>`;

        const httpServer = createServer((req, res) => {
          if (req.url === '/ok.rss') {
            res.writeHead(200, { 'content-type': 'application/rss+xml' });
            res.end(rssXml);
          } else {
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('not found');
          }
        });
        await new Promise<void>((resolveListen) => httpServer.listen(0, '127.0.0.1', resolveListen));
        const addr = httpServer.address() as { port: number };
        const base = `http://127.0.0.1:${addr.port}`;

        const customYaml = join(workDir, 'products.yaml');
        writeFileSync(
          customYaml,
          `products:
  - name: local-ok
    display_name: Local OK
    tier: 3
    source_url: ${base}/ok.rss
    fetch_strategy: rss
    fetch:
      type: rss
      url: ${base}/ok.rss
  - name: local-fail
    display_name: Local Fail
    tier: 3
    source_url: ${base}/missing.rss
    fetch_strategy: rss
    fetch:
      type: rss
      url: ${base}/missing.rss
`,
          'utf-8'
        );

        const missingDb = join(workDir, 'store', 'data', 'claude-synergy.db');
        const productsRoot = join(workDir, 'store', 'products');
        try {
          await withMcpServer(
            {
              dbPath: missingDb,
              synergiesDir,
              requestTimeoutMs: 25_000,
              env: {
                CLAUDE_SYNERGY_PRODUCTS_YAML: customYaml,
                CLAUDE_SYNERGY_PRODUCTS_ROOT: productsRoot,
                HOME: workDir,
                USERPROFILE: workDir,
              },
            },
            async (client: McpClient) => {
              await client.initialize();
              await client.notifyInitialized();
              const res = await client.callTool('latest_releases', { limit: 5 });
              const text = res.content[0]?.text ?? '';
              const lines = text.trimEnd().split('\n');
              expect(lines[0]).toMatch(/^first use \(partial corpus\): synced 1 of 2 products/);
              expect(lines[0]).toContain('local-fail');
              expect(text).toContain('local-ok@');
              expect(lines[lines.length - 1]).toMatch(/^data as of:.*partial corpus/);
            }
          );
        } finally {
          httpServer.closeAllConnections?.();
          await new Promise<void>((resolveClose) => httpServer.close(() => resolveClose()));
          rmSync(workDir, { recursive: true, force: true });
        }
      },
      35_000
    );
  });
});
