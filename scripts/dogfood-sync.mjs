#!/usr/bin/env node
// Dogfood the v1.2 sync_now + sync_status MCP tools.
//
// Spawns the built claude-synergy-mcp server, calls sync_now (full pipeline:
// fetch → ingest → embed), then calls sync_status to confirm fresh state.
//
// Run with:  node scripts/dogfood-sync.mjs
import { spawn } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const MCP_BIN = join(REPO_ROOT, 'dist', 'mcp-server.js');
const DB_PATH = join(REPO_ROOT, 'data', 'claude-synergy.db');

const REQUEST_TIMEOUT_MS = 15 * 60 * 1000; // 15 min — sync_now can run long

const child = spawn('node', [MCP_BIN], {
  env: {
    ...process.env,
    CLAUDE_SYNERGY_DB: DB_PATH,
    CLAUDE_SYNERGY_PRODUCTS_ROOT: join(REPO_ROOT, 'products'),
  },
  stdio: ['pipe', 'pipe', 'pipe'],
});

let buf = '';
const pending = new Map();
let nextId = 1;

child.stdout.setEncoding('utf-8');
child.stdout.on('data', (chunk) => {
  buf += chunk;
  let idx;
  while ((idx = buf.indexOf('\n')) !== -1) {
    const line = buf.slice(0, idx).trim();
    buf = buf.slice(idx + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    if (msg.id != null && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    }
  }
});

child.stderr.setEncoding('utf-8');
child.stderr.on('data', (chunk) => process.stderr.write(`[server] ${chunk}`));

function request(method, params = {}) {
  const id = nextId++;
  const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`request timed out (${method}, ${REQUEST_TIMEOUT_MS / 1000}s)`));
    }, REQUEST_TIMEOUT_MS);
    pending.set(id, {
      resolve: (v) => { clearTimeout(timer); resolve(v); },
      reject: (e) => { clearTimeout(timer); reject(e); },
    });
    child.stdin.write(payload);
  });
}

function notify(method, params = {}) {
  const payload = JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n';
  child.stdin.write(payload);
}

const t0 = Date.now();
try {
  console.log('=== handshake ===');
  const init = await request('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'dogfood-sync', version: '1.0.0' },
  });
  console.log(`server: ${init.serverInfo.name} v${init.serverInfo.version}`);
  notify('notifications/initialized');

  console.log('\n=== sync_status (pre-sync) ===');
  const preStatus = await request('tools/call', { name: 'sync_status', arguments: {} });
  console.log(preStatus.content[0].text);

  console.log('\n=== sync_now (full pipeline) ===');
  const sync = await request('tools/call', {
    name: 'sync_now',
    arguments: { timeout_ms: 600000 },
  });
  console.log(sync.content[0].text);

  console.log('\n=== sync_status (post-sync) ===');
  const postStatus = await request('tools/call', {
    name: 'sync_status',
    arguments: { stale_only: true, stale_hours: 24 },
  });
  console.log(postStatus.content[0].text);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✓ dogfood run complete in ${elapsed}s`);
} catch (e) {
  console.error('\n✗ dogfood run FAILED:', e.message);
  process.exitCode = 1;
} finally {
  child.stdin.end();
  await new Promise((r) => child.on('exit', r));
}
