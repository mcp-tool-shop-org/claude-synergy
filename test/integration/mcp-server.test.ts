import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
    'completes initialize handshake and lists exactly 8 tools',
    async () => {
      await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
        const init = await client.initialize();
        expect(init.serverInfo).toBeDefined();
        expect(init.serverInfo.name).toBe('claude-synergy');
        expect(init.capabilities).toBeDefined();

        await client.notifyInitialized();

        const tools = await client.listTools();
        const names = tools.map((t) => t.name).sort();
        expect(names).toEqual([
          'get_release',
          'latest_releases',
          'list_products',
          'list_synergies',
          'lookup_entity',
          'read_synergy',
          'search',
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

  it(
    'calls each tool successfully with valid args',
    async () => {
      await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
        await client.initialize();
        await client.notifyInitialized();

        // search — use fts mode so no Ollama embedding is needed
        const search = await client.callTool('search', { query: 'workflow', mode: 'fts', limit: 5 });
        expect(search.content[0].type).toBe('text');
        expect((search.content[0].text ?? '').length).toBeGreaterThan(0);

        // lookup_entity
        const lookup = await client.callTool('lookup_entity', {
          type: 'env_var',
          value: 'ANTHROPIC_API_KEY',
        });
        expect(lookup.content[0].text).toBeTruthy();

        // latest_releases
        const latest = await client.callTool('latest_releases', { limit: 5 });
        expect(latest.content[0].text).toBeTruthy();

        // get_release
        const release = await client.callTool('get_release', {
          product: 'test-cli',
          version: '1.0.0',
        });
        expect((release.content[0].text ?? '')).toContain('test-cli');

        // list_products
        const products = await client.callTool('list_products', {});
        expect((products.content[0].text ?? '')).toContain('test-cli');

        // top_entities
        const top = await client.callTool('top_entities', { type: 'env_var', limit: 5 });
        expect((top.content[0].text ?? '').length).toBeGreaterThan(0);

        // list_synergies
        const synergies = await client.callTool('list_synergies', {});
        expect((synergies.content[0].text ?? '')).toContain('test-synergy');

        // read_synergy
        const synergy = await client.callTool('read_synergy', { name: 'test-synergy' });
        expect((synergy.content[0].text ?? '')).toContain('Test synergy');
      });
    },
    25_000
  );

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
    'empty search query surfaces an FTS5 syntax error per-call but server keeps running',
    async () => {
      await withMcpServer({ dbPath: temp.path, synergiesDir }, async (client: McpClient) => {
        await client.initialize();
        await client.notifyInitialized();
        // Current behavior: empty query throws an FTS5 syntax error.
        // The contract that matters is the server stays alive after the bad call.
        await expect(
          client.callTool('search', { query: '', mode: 'fts' })
        ).rejects.toThrow(/fts5: syntax error/);
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
      // Exit code may be null brie