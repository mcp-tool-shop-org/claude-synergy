#!/usr/bin/env node
// Build training.jsonl + holdout.jsonl from the curated changelog-actions
// dataset entries.
//
// Citation resolver:
//   - **corpus-bound** entries are validated by DB lookup against the
//     `releases` table. The DB stores the canonical (product, version)
//     mapping for every release file on disk — including multi-package
//     monorepos (anthropic-sdk-typescript's sdk-/aws-sdk-/bedrock-sdk-
//     tracks, where input.version='0.72.0' resolves to sdk-0.72.0.md)
//     and scoped-npm packages (continue-dev @continuedev/config-yaml@1.38.0,
//     mcp-typescript-sdk @modelcontextprotocol/client@2.0.0-alpha.1).
//   - **external-* namespaces** (currently external-ghsa, external-cve)
//     skip the corpus lookup and instead require a valid http(s) source_url.
//     This exception is documented in SCHEMA.md and exists because some
//     security advisories (e.g. backpropagate GHSA-f65r-h4g3-3h9h) are
//     load-bearing training signal but reference products outside the
//     claude-synergy 37-tracked-products set.
//
// Split:
//   Stratified 80/20 by output.kind. Each kind gets at least 1 holdout
//   entry (Math.max(1, round(n * holdout_fraction))).
//
// Usage:
//   node scripts/build-dataset.mjs                              # approved+edited only (strict)
//   node scripts/build-dataset.mjs --include-pending            # also include pending (use during dev)
//   node scripts/build-dataset.mjs --holdout=0.2 --seed=42

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ENTRIES_DIR = join(REPO_ROOT, 'dataset', 'changelog-actions', 'v1', 'entries');
const OUT_DIR = join(REPO_ROOT, 'dataset', 'changelog-actions', 'v1');
const DB_PATH = join(REPO_ROOT, 'data', 'claude-synergy.db');

// External-citation namespaces. Entries whose change_id begins with one of
// these segments skip the corpus-DB lookup but must carry a real source_url.
const EXTERNAL_NAMESPACES = new Set(['external-ghsa', 'external-cve']);

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const arg = (name, def) => {
  const m = args.find((a) => a.startsWith(`--${name}=`));
  return m ? m.split('=')[1] : def;
};

const INCLUDE_PENDING = args.includes('--include-pending');
const HOLDOUT_FRACTION = parseFloat(arg('holdout', '0.2'));
const SEED = parseInt(arg('seed', '2026052403'), 10);

if (!(HOLDOUT_FRACTION > 0 && HOLDOUT_FRACTION < 1)) {
  console.error(`--holdout must be in (0, 1); got ${HOLDOUT_FRACTION}`);
  process.exit(2);
}

// ── Reproducible shuffle (mulberry32) ────────────────────────────────────────
function mulberry32(a) {
  return function () {
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

const rng = mulberry32(SEED);

// ── Load entries ─────────────────────────────────────────────────────────────
if (!existsSync(ENTRIES_DIR)) {
  console.error(`Entries dir not found: ${ENTRIES_DIR}`);
  process.exit(2);
}

const files = readdirSync(ENTRIES_DIR).filter((f) => f.endsWith('.json'));
const entries = files.map((f) => ({
  filename: f,
  data: JSON.parse(readFileSync(join(ENTRIES_DIR, f), 'utf-8')),
}));

console.log(`Loaded ${entries.length} entries from ${ENTRIES_DIR}`);

// ── Citation validation ──────────────────────────────────────────────────────
if (!existsSync(DB_PATH)) {
  console.error(`DB not found at ${DB_PATH}. Corpus citation validation requires the synced data/claude-synergy.db.`);
  console.error('Run `hk sync` or `node scripts/dogfood-sync.mjs` first.');
  process.exit(2);
}

const db = new Database(DB_PATH, { readonly: true });
const releaseExists = db.prepare('SELECT 1 FROM releases WHERE product = ? AND version = ?');

const validated = [];
const rejected = [];

for (const { filename, data } of entries) {
  const ci = data.input.change_id ?? '';
  const namespace = ci.split('/')[0];

  // External namespace path
  if (EXTERNAL_NAMESPACES.has(namespace)) {
    const url = data.input.source_url ?? '';
    if (!/^https?:\/\/.+/.test(url)) {
      rejected.push({
        filename,
        reason: `external citation (${namespace}) missing valid http(s) source_url: ${JSON.stringify(url)}`,
      });
      continue;
    }
    validated.push({ filename, data, citation_kind: 'external' });
    continue;
  }

  // Corpus-bound path — DB resolves multi-package + scoped-npm canonically
  const row = releaseExists.get(data.input.product, data.input.version);
  if (!row) {
    rejected.push({
      filename,
      reason: `corpus citation not resolved against releases table: ${data.input.product}@${data.input.version} (change_id=${ci})`,
    });
    continue;
  }
  validated.push({ filename, data, citation_kind: 'corpus' });
}

console.log(`Citations: ${validated.length} resolved, ${rejected.length} rejected`);
if (rejected.length > 0) {
  for (const r of rejected.slice(0, 10)) console.error('  REJECT:', r.filename, '—', r.reason);
  if (rejected.length > 10) console.error(`  ... ${rejected.length - 10} more`);
}

// ── Review-action filter ─────────────────────────────────────────────────────
const approvedStates = INCLUDE_PENDING
  ? new Set(['approved', 'edited', 'pending'])
  : new Set(['approved', 'edited']);

const eligible = validated.filter((v) => approvedStates.has(v.data.provenance?.review_action));
console.log(`Eligible after review-action filter: ${eligible.length} (allowed states: ${[...approvedStates].join(', ')})`);

if (eligible.length === 0) {
  console.error('No eligible entries. Pass --include-pending to include entries still under review.');
  db.close();
  process.exit(1);
}

// ── Stratified 80/20 split by kind ───────────────────────────────────────────
const byKind = {};
for (const e of eligible) {
  const k = e.data.output?.kind ?? 'unknown';
  (byKind[k] = byKind[k] || []).push(e);
}

const trainingEntries = [];
const holdoutEntries = [];
const splitStats = {};

for (const [kind, kindEntries] of Object.entries(byKind)) {
  const shuffled = shuffle(kindEntries, rng);
  // At least 1 holdout per class so per-class eval signal exists, even if tiny.
  const holdoutCount = Math.max(1, Math.round(shuffled.length * HOLDOUT_FRACTION));
  const holdout = shuffled.slice(0, holdoutCount);
  const training = shuffled.slice(holdoutCount);
  splitStats[kind] = {
    total: kindEntries.length,
    training: training.length,
    holdout: holdout.length,
  };
  trainingEntries.push(...training);
  holdoutEntries.push(...holdout);
}

console.log('\nStratified split by kind:');
console.log('  kind          total  train  holdout');
for (const [k, s] of Object.entries(splitStats)) {
  console.log(`  ${k.padEnd(13)} ${String(s.total).padStart(5)}  ${String(s.training).padStart(5)}  ${String(s.holdout).padStart(7)}`);
}

// ── JSONL chat-format conversion ─────────────────────────────────────────────
// Backpropagate/Qwen2.5-Instruct chat format. The system prompt is part of
// the dataset — changing it after training requires a new fine-tune.
const SYSTEM_PROMPT =
  "You synthesize one changelog entry into one structured action item. Output strict JSON with fields: kind (one of: breaking | deprecation | security | feature | fix | performance | docs | unknown), severity (one of: low | medium | high), subject, action_text (verb-first imperative, 1-3 sentences, names the affected surface in backticks, max 500 chars), deadline (YYYY-MM-DD if upstream-named, else null), tags. Use kind='unknown' when you cannot classify confidently. Never invent deadlines.";

function toChatJsonl(entry) {
  const inp = entry.data.input;
  const out = entry.data.output;
  const userMsg = [
    `Product: ${inp.product}`,
    `Version: ${inp.version}`,
    `Released: ${inp.released_at ?? 'undated'}`,
    `Kind hint: ${inp.kind_hint}`,
    `Change: ${inp.change_text}`,
    `Source: ${inp.source_url}`,
  ].join('\n');
  return {
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMsg },
      { role: 'assistant', content: JSON.stringify(out) },
    ],
  };
}

function writeJsonl(path, items) {
  // One JSON object per line, trailing newline. Standard JSONL.
  const content = items.map((i) => JSON.stringify(i)).join('\n') + '\n';
  writeFileSync(path, content, 'utf-8');
}

const trainingPath = join(OUT_DIR, 'training.jsonl');
const holdoutPath = join(OUT_DIR, 'holdout.jsonl');
const manifestPath = join(OUT_DIR, 'manifest.json');

writeJsonl(trainingPath, trainingEntries.map(toChatJsonl));
writeJsonl(holdoutPath, holdoutEntries.map(toChatJsonl));

// ── Manifest ─────────────────────────────────────────────────────────────────
const manifest = {
  built_at: new Date().toISOString(),
  build_seed: SEED,
  build_args: { include_pending: INCLUDE_PENDING, holdout_fraction: HOLDOUT_FRACTION },
  totals: {
    entries_on_disk: entries.length,
    citation_resolved: validated.length,
    citation_rejected: rejected.length,
    eligible_after_review_filter: eligible.length,
    training_size: trainingEntries.length,
    holdout_size: holdoutEntries.length,
  },
  citation_kinds: {
    corpus: validated.filter((v) => v.citation_kind === 'corpus').length,
    external: validated.filter((v) => v.citation_kind === 'external').length,
  },
  included_review_states: [...approvedStates],
  rejected_filenames: rejected.map((r) => ({ filename: r.filename, reason: r.reason })),
  split_by_kind: splitStats,
  system_prompt: SYSTEM_PROMPT,
};

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');

console.log(`\nWrote:`);
console.log(`  ${trainingPath} (${trainingEntries.length} entries)`);
console.log(`  ${holdoutPath} (${holdoutEntries.length} entries)`);
console.log(`  ${manifestPath}`);

if (INCLUDE_PENDING) {
  console.log(`\n⚠  Built with --include-pending. ${eligible.filter((e) => e.data.provenance.review_action === 'pending').length} entries are still under review.`);
  console.log('   For a production fine-tune, complete the A3 review pass (mark entries approved/edited/rejected) and rebuild without --include-pending.');
}

db.close();
