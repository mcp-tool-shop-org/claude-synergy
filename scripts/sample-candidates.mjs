#!/usr/bin/env node
// Sample candidate changelog entries for the changelog-actions dataset.
//
// Strategy: stratify across product + kind_hint so the seed set covers the
// distribution the fine-tune needs to learn. Outputs JSON to stdout (or a
// file with --out) for the labeling step.
//
// Usage:
//   node scripts/sample-candidates.mjs --count 30 [--out path] [--seed N]

import Database from 'better-sqlite3';
import { writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.CLAUDE_SYNERGY_DB ?? join(__dirname, '..', 'data', 'claude-synergy.db');

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const COUNT = parseInt(getArg('count', '30'), 10);
const OUT = getArg('out', null);
const SEED = parseInt(getArg('seed', String(Date.now())), 10);

// Deterministic-ish shuffle via mulberry32 from a seed.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const db = new Database(DB_PATH, { readonly: true });
const rng = mulberry32(SEED);

// Pull all change rows joined with release metadata. The corpus is small
// enough (~6,573 rows) that loading everything is fine.
const all = db
  .prepare(
    `SELECT c.product, c.version, c.ordinal, c.kind, c.text AS change_text,
            r.released_at, r.source_url
     FROM changes c
     JOIN releases r ON r.product = c.product AND r.version = c.version`,
  )
  .all();

// Build stratification keys: product family + kind_hint.
// We don't want 30 entries all from claude-code; force breadth.
const PRODUCT_FAMILY = (p) => {
  if (p === 'claude-code' || p === 'claude-code-action' || p === 'claude-code-security-review') return 'claude-code-family';
  if (p.startsWith('anthropic-sdk-') || p.startsWith('claude-agent-sdk-')) return 'anthropic-sdk-family';
  if (p === 'anthropic-cli' || p === 'claude-api' || p === 'anthropic-apps') return 'anthropic-app-family';
  if (p.startsWith('mcp-') && p.endsWith('-sdk')) return 'mcp-sdk-family';
  if (p.startsWith('mcp-') || p === 'mcp-conformance' || p === 'mcp-inspector' || p === 'mcp-registry' || p === 'mcp-spec' || p === 'mcp-mcpb') return 'mcp-infra-family';
  if (p === 'cursor' || p === 'aider' || p === 'continue-dev' || p === 'continue-cli' || p === 'cody-enterprise') return 'third-party-ide-family';
  if (p === 'github-copilot' || p === 'vscode-copilot-chat' || p === 'windsurf') return 'third-party-other-family';
  return 'other-family';
};

// Group by (family, kind), then sample evenly across cells.
const cells = new Map();
for (const r of all) {
  const fam = PRODUCT_FAMILY(r.product);
  const key = `${fam}|${r.kind ?? 'unknown'}`;
  if (!cells.has(key)) cells.set(key, []);
  cells.get(key).push(r);
}

const cellKeys = shuffle([...cells.keys()], rng);
const perCell = Math.max(1, Math.ceil(COUNT / cellKeys.length));
const selected = [];

// Round-robin: take up to perCell from each cell (shuffled inside the cell)
// until we hit COUNT or run out of candidates.
for (const key of cellKeys) {
  const pool = shuffle(cells.get(key), rng);
  for (let i = 0; i < perCell && selected.length < COUNT; i++) {
    if (pool[i]) selected.push(pool[i]);
  }
  if (selected.length >= COUNT) break;
}

// If we still don't have COUNT (small dataset), top up by random sampling
// across everything we haven't picked yet.
if (selected.length < COUNT) {
  const used = new Set(selected.map((r) => `${r.product}/${r.version}/${r.ordinal}`));
  const remaining = shuffle(
    all.filter((r) => !used.has(`${r.product}/${r.version}/${r.ordinal}`)),
    rng,
  );
  for (const r of remaining) {
    if (selected.length >= COUNT) break;
    selected.push(r);
  }
}

// Shape into the curation-input format
const candidates = selected.slice(0, COUNT).map((r) => ({
  id: `syn-${r.product}-${r.version}-${r.ordinal}`,
  product: r.product,
  version: r.version,
  released_at: r.released_at ?? null,
  kind_hint: r.kind ?? 'unknown',
  change_text: r.change_text,
  source_url: r.source_url ?? '',
  change_id: `${r.product}/${r.version}/${r.ordinal}`,
}));

const payload = {
  seed: SEED,
  count: candidates.length,
  generated_at: new Date().toISOString(),
  family_distribution: candidates.reduce((acc, c) => {
    const fam = PRODUCT_FAMILY(c.product);
    acc[fam] = (acc[fam] ?? 0) + 1;
    return acc;
  }, {}),
  kind_distribution: candidates.reduce((acc, c) => {
    acc[c.kind_hint] = (acc[c.kind_hint] ?? 0) + 1;
    return acc;
  }, {}),
  candidates,
};

const out = JSON.stringify(payload, null, 2);
if (OUT) {
  writeFileSync(OUT, out, 'utf-8');
  console.error(`Wrote ${candidates.length} candidates to ${OUT} (seed=${SEED})`);
  console.error('Family distribution:', payload.family_distribution);
  console.error('Kind distribution:', payload.kind_distribution);
} else {
  console.log(out);
}

db.close();
