#!/usr/bin/env node
// Mechanical-invariant validator for the changelog-actions dataset.
//
// Locks the structural invariants the v1 audit verified by hand, so any future
// labeler (human or subagent) gets a fast pass/fail signal instead of relying
// on a downstream verifier's hand-audit.
//
// Two output modes:
//   default: human-readable, one line per violation, summary at end.
//   --json:  structured envelope { ok, stats, errors:[{file, rule, severity, message}] }
//            (the envelope shape is committed and stable; downstream consumers
//             — CI, jq pipelines, future MCP wrapper — can rely on it.)
//
// Two scopes:
//   default:         validate entries/ only (per-entry + cross-entry rules)
//   --include-build: ALSO validate training.jsonl + holdout.jsonl if they exist
//                    (zero overlap, every line valid JSON, every assistant
//                     payload has the 6 expected keys in canonical order)
//
// Exit codes:
//   0 — all checks passed (or only warnings, without --strict)
//   1 — at least one error (or any warning with --strict)
//   2 — invocation error (bad arg, missing dirs)
//
// Usage:
//   node scripts/validate-dataset.mjs
//   node scripts/validate-dataset.mjs --json
//   node scripts/validate-dataset.mjs --include-build --strict

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ENTRIES_DIR = join(REPO_ROOT, 'dataset', 'changelog-actions', 'v1', 'entries');
const OUT_DIR = join(REPO_ROOT, 'dataset', 'changelog-actions', 'v1');
const DB_PATH = join(REPO_ROOT, 'data', 'claude-synergy.db');

// ── Closed enums + patterns (source of truth: SCHEMA.md + schema.v1.json) ────
const VALID_KINDS = new Set([
  'breaking', 'deprecation', 'security', 'feature', 'fix', 'performance', 'docs', 'unknown',
]);
const VALID_SEVERITIES = new Set(['low', 'medium', 'high']);
const VALID_REVIEW_ACTIONS = new Set(['approved', 'edited', 'rejected', 'pending']);
const VALID_FAITHFULNESS = new Set(['ok', 'missing-citation', 'citation-mismatch']);
const EXTERNAL_NAMESPACES = new Set(['external-ghsa', 'external-cve']);

// Non-imperative first words. STYLE.md says action_text must be verb-first; this
// is the mechanical proxy. The list comes straight from the verifier's spec
// (A/An/The/This/It/There/Note) plus STYLE.md's banned-opener phrases'
// first-word forms (If/When/You/We/Users) and discourse-marker openers
// (No/Yes/Maybe) that are not actionable imperatives.
const NON_IMPERATIVE_FIRST_WORDS = new Set([
  'A', 'An', 'The', 'This', 'That', 'These', 'Those', 'It', 'There', 'Note',
  'If', 'When', 'Whenever', 'Unless', 'You', 'Your', 'We', 'Users',
  'No', 'Yes', 'Maybe', 'Perhaps', 'Probably',
]);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HTTP_URL_RE = /^https?:\/\/\S+$/;
const PRODUCT_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const ID_RE = /^syn-[A-Za-z0-9._@-]+$/;
const TAG_RE = /^[a-z0-9][a-z0-9-]*$/;

// Canonical key order — the build script JSON.stringify's output.* in this order
// because that's the order on disk, and a labeler reordering keys creates
// JSONL diff noise without semantic gain.
const EXPECTED_OUTPUT_KEYS = ['kind', 'severity', 'subject', 'action_text', 'deadline', 'tags'];

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const STRICT = args.includes('--strict');
const INCLUDE_BUILD = args.includes('--include-build');
const VERBOSE = args.includes('--verbose');

// ── Collected errors ─────────────────────────────────────────────────────────
const errors = [];

function err(file, rule, message, severity = 'error') {
  errors.push({ file: basename(file), rule, severity, message });
}

// ── Per-entry validation ─────────────────────────────────────────────────────
function validateEntry(filename, data, releaseExistsStmt) {
  // Structural: required top-level fields
  for (const k of ['id', 'schema_version', 'input', 'output', 'provenance', 'quality']) {
    if (!(k in data)) {
      err(filename, 'missing-field', `top-level field missing: ${k}`);
    }
  }

  // id pattern + filename match
  if (!ID_RE.test(data.id ?? '')) {
    err(filename, 'id.pattern', `id ${JSON.stringify(data.id)} does not match ${ID_RE}`);
  }
  const fileStem = basename(filename).replace(/\.json$/, '');
  if (fileStem !== data.id) {
    err(filename, 'id.filename', `filename stem '${fileStem}' does not match id '${data.id}'`);
  }

  if (data.schema_version !== '1') {
    err(filename, 'schema_version', `schema_version must be "1"; got ${JSON.stringify(data.schema_version)}`);
  }

  // ── input ──
  const inp = data.input ?? {};
  for (const k of ['product', 'version', 'kind_hint', 'change_text', 'source_url', 'change_id']) {
    if (!inp[k] || typeof inp[k] !== 'string') {
      err(filename, 'input.required', `input.${k} missing or not a string`);
    }
  }
  if (inp.released_at !== null && inp.released_at !== undefined) {
    if (!ISO_DATE_RE.test(inp.released_at ?? '')) {
      err(filename, 'input.released_at', `must be YYYY-MM-DD or null; got ${JSON.stringify(inp.released_at)}`);
    }
  }
  if (typeof inp.source_url === 'string' && !HTTP_URL_RE.test(inp.source_url)) {
    err(filename, 'source_url', `not a valid http(s) URL: ${JSON.stringify(inp.source_url)}`);
  }
  // change_id namespace: corpus product slug OR external-{ghsa,cve}
  const changeIdNamespace = (inp.change_id ?? '').split('/')[0];
  if (changeIdNamespace.startsWith('external-')) {
    if (!EXTERNAL_NAMESPACES.has(changeIdNamespace)) {
      err(
        filename,
        'change_id.namespace',
        `unknown external namespace ${JSON.stringify(changeIdNamespace)}; allowed: ${[...EXTERNAL_NAMESPACES].join(', ')}`,
      );
    }
  } else if (!PRODUCT_SLUG_RE.test(changeIdNamespace)) {
    err(
      filename,
      'change_id.namespace',
      `change_id namespace ${JSON.stringify(changeIdNamespace)} matches neither product slug nor external-{ghsa,cve}`,
    );
  }

  // ── output ──
  const out = data.output ?? {};
  if (!VALID_KINDS.has(out.kind)) {
    err(filename, 'kind', `kind ${JSON.stringify(out.kind)} not in 8-enum (${[...VALID_KINDS].join(', ')})`);
  }
  if (!VALID_SEVERITIES.has(out.severity)) {
    err(filename, 'severity', `severity ${JSON.stringify(out.severity)} not in 3-enum (low, medium, high)`);
  }
  if (typeof out.subject !== 'string' || out.subject.length === 0) {
    err(filename, 'subject', 'output.subject must be non-empty string');
  } else if (out.subject.length > 200) {
    err(filename, 'subject', `length ${out.subject.length} chars (max 200)`);
  }
  if (typeof out.action_text !== 'string' || out.action_text.length === 0) {
    err(filename, 'action_text', 'output.action_text must be non-empty string');
  } else {
    if (out.action_text.length > 500) {
      err(filename, 'action_text.length', `${out.action_text.length} chars (max 500)`);
    }
    // Imperative-verb opener (mechanical proxy: first word not in non-verb stop list)
    const firstWord = out.action_text.trim().split(/\s+/)[0]?.replace(/[,.:;]$/, '');
    if (firstWord && NON_IMPERATIVE_FIRST_WORDS.has(firstWord)) {
      err(filename, 'action_text.opener', `not verb-first; opens with ${JSON.stringify(firstWord)}`);
    }
  }
  if (out.deadline !== null && out.deadline !== undefined) {
    if (!ISO_DATE_RE.test(out.deadline ?? '')) {
      err(filename, 'deadline', `must be YYYY-MM-DD or null; got ${JSON.stringify(out.deadline)}`);
    }
  }
  if (!Array.isArray(out.tags)) {
    err(filename, 'tags.type', `tags must be array; got ${typeof out.tags}`);
  } else {
    if (out.tags.length > 10) {
      err(filename, 'tags.count', `${out.tags.length} tags (max 10)`);
    }
    for (const t of out.tags) {
      if (typeof t !== 'string') {
        err(filename, 'tags.type', `tag ${JSON.stringify(t)} is not a string`);
      } else if (!TAG_RE.test(t)) {
        err(filename, 'tags.pattern', `tag ${JSON.stringify(t)} doesn't match ${TAG_RE}`);
      }
    }
  }

  // ── provenance ──
  const prov = data.provenance ?? {};
  if (!VALID_REVIEW_ACTIONS.has(prov.review_action)) {
    err(
      filename,
      'provenance.review_action',
      `${JSON.stringify(prov.review_action)} not in {approved, edited, rejected, pending}`,
    );
  }
  if (prov.labeled_at && !ISO_DATE_RE.test(prov.labeled_at)) {
    err(filename, 'provenance.labeled_at', `not ISO date: ${JSON.stringify(prov.labeled_at)}`);
  }

  // ── quality ──
  const qual = data.quality ?? {};
  if (!VALID_FAITHFULNESS.has(qual.faithfulness)) {
    err(
      filename,
      'quality.faithfulness',
      `${JSON.stringify(qual.faithfulness)} not in {ok, missing-citation, citation-mismatch}`,
    );
  }
  if (typeof qual.schema_valid !== 'boolean') {
    err(filename, 'quality.schema_valid', `must be boolean; got ${typeof qual.schema_valid}`);
  }

  // ── Citation resolution (DB-backed) ──
  if (releaseExistsStmt && !changeIdNamespace.startsWith('external-')) {
    if (inp.product && inp.version) {
      const row = releaseExistsStmt.get(inp.product, inp.version);
      if (!row) {
        err(filename, 'citation.unresolved', `corpus citation not in DB: ${inp.product}@${inp.version}`);
      }
    }
  } else if (changeIdNamespace.startsWith('external-')) {
    if (!HTTP_URL_RE.test(inp.source_url ?? '')) {
      err(
        filename,
        'citation.external_no_url',
        `external citation (${changeIdNamespace}) requires valid http(s) source_url`,
      );
    }
  }

  return { id: data.id, change_id: inp.change_id, product: inp.product, version: inp.version };
}

// ── Main ─────────────────────────────────────────────────────────────────────
if (!existsSync(ENTRIES_DIR)) {
  if (JSON_OUT) console.log(JSON.stringify({ ok: false, error: `entries dir not found: ${ENTRIES_DIR}` }));
  else console.error(`Entries dir not found: ${ENTRIES_DIR}`);
  process.exit(2);
}

const files = readdirSync(ENTRIES_DIR).filter((f) => f.endsWith('.json')).sort();

// DB (optional — citation resolution needs it, but per-entry shape rules don't)
let db = null;
let releaseExistsStmt = null;
if (existsSync(DB_PATH)) {
  db = new Database(DB_PATH, { readonly: true });
  releaseExistsStmt = db.prepare('SELECT 1 FROM releases WHERE product = ? AND version = ?');
} else {
  // Soft warning — citation checks will be skipped but shape rules still run.
  err('(setup)', 'db.missing', `DB not found at ${DB_PATH}; corpus citation resolution skipped`, 'warning');
}

// ── Per-entry pass ───────────────────────────────────────────────────────────
const idSeen = new Map(); // id → filename
const changeIdSeen = new Map(); // change_id → filename
const tupleSeen = new Map(); // (product, version, ordinal) → filename

for (const filename of files) {
  const path = join(ENTRIES_DIR, filename);
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf-8'));
  } catch (e) {
    err(filename, 'json.parse', `invalid JSON: ${e.message}`);
    continue;
  }
  const meta = validateEntry(filename, data, releaseExistsStmt);

  // Cross-entry: duplicate id
  if (meta.id && idSeen.has(meta.id)) {
    err(filename, 'duplicate.id', `id '${meta.id}' also in ${idSeen.get(meta.id)}`);
  } else if (meta.id) {
    idSeen.set(meta.id, filename);
  }

  // Cross-entry: duplicate change_id (warning — cross-SDK identical fixes are intentional)
  if (meta.change_id && changeIdSeen.has(meta.change_id)) {
    err(
      filename,
      'duplicate.change_id',
      `change_id '${meta.change_id}' also in ${changeIdSeen.get(meta.change_id)}`,
      'warning',
    );
  } else if (meta.change_id) {
    changeIdSeen.set(meta.change_id, filename);
  }

  // Cross-entry: duplicate (product, version, ordinal) tuple
  if (meta.change_id) {
    const tuple = meta.change_id; // change_id IS the (product, version, ordinal) tuple already
    if (tupleSeen.has(tuple)) {
      err(filename, 'duplicate.tuple', `(product, version, ordinal) tuple '${tuple}' also in ${tupleSeen.get(tuple)}`);
    } else {
      tupleSeen.set(tuple, filename);
    }
  }
}

// ── Build-output pass (optional) ─────────────────────────────────────────────
if (INCLUDE_BUILD) {
  const trainingPath = join(OUT_DIR, 'training.jsonl');
  const holdoutPath = join(OUT_DIR, 'holdout.jsonl');

  const validateJsonl = (path) => {
    const file = basename(path);
    if (!existsSync(path)) {
      err(file, 'build.missing', `${file} not found; run scripts/build-dataset.mjs first`, 'warning');
      return { userContents: new Set(), keyOrderings: new Set() };
    }
    const lines = readFileSync(path, 'utf-8').split('\n').filter((l) => l.length > 0);
    const userContents = new Set();
    const keyOrderings = new Set();
    for (let i = 0; i < lines.length; i++) {
      const lineFile = `${file}:${i + 1}`;
      let parsed;
      try {
        parsed = JSON.parse(lines[i]);
      } catch (e) {
        err(lineFile, 'jsonl.parse', `line ${i + 1} not valid JSON: ${e.message}`);
        continue;
      }
      const messages = parsed.messages;
      if (!Array.isArray(messages) || messages.length !== 3) {
        err(lineFile, 'jsonl.messages_shape', `expected messages: [system, user, assistant]; got ${messages?.length} messages`);
        continue;
      }
      const userMsg = messages[1]?.content;
      if (typeof userMsg === 'string') userContents.add(userMsg);

      const assistantMsg = messages[2]?.content;
      if (typeof assistantMsg !== 'string') {
        err(lineFile, 'jsonl.assistant_type', `assistant content not a string`);
        continue;
      }
      let payload;
      try {
        payload = JSON.parse(assistantMsg);
      } catch (e) {
        err(lineFile, 'jsonl.assistant_json', `assistant payload not valid JSON: ${e.message}`);
        continue;
      }
      const keys = Object.keys(payload);
      keyOrderings.add(keys.join(','));
      // 6-key shape
      const missing = EXPECTED_OUTPUT_KEYS.filter((k) => !(k in payload));
      const extra = keys.filter((k) => !EXPECTED_OUTPUT_KEYS.includes(k));
      if (missing.length || extra.length) {
        err(
          lineFile,
          'jsonl.assistant_keys',
          `keys missing=[${missing.join(',')}] extra=[${extra.join(',')}]; expected exactly ${EXPECTED_OUTPUT_KEYS.join(',')}`,
        );
      }
      // Canonical order
      if (keys.join(',') !== EXPECTED_OUTPUT_KEYS.join(',')) {
        err(
          lineFile,
          'jsonl.key_order',
          `keys [${keys.join(',')}] != canonical [${EXPECTED_OUTPUT_KEYS.join(',')}]`,
        );
      }
    }
    return { userContents, keyOrderings };
  };

  const train = validateJsonl(trainingPath);
  const holdout = validateJsonl(holdoutPath);

  // Train/holdout overlap (on user content — identical user prompt means identical entry)
  for (const userContent of holdout.userContents) {
    if (train.userContents.has(userContent)) {
      const head = userContent.split('\n').slice(0, 2).join(' | ');
      err('holdout.jsonl', 'overlap.train_holdout', `entry appears in both training and holdout: ${head}`);
    }
  }

  // Single key ordering across both files
  const allKeyOrderings = new Set([...train.keyOrderings, ...holdout.keyOrderings]);
  if (allKeyOrderings.size > 1) {
    err(
      'training+holdout.jsonl',
      'key_order.variance',
      `multiple key orderings observed across JSONL: [${[...allKeyOrderings].map((o) => `(${o})`).join(' / ')}]`,
    );
  }
}

if (db) db.close();

// ── Aggregate stats + output ─────────────────────────────────────────────────
const errorEvents = errors.filter((e) => e.severity === 'error');
const warningEvents = errors.filter((e) => e.severity === 'warning');
const failedFiles = new Set(errorEvents.map((e) => e.file));
const passed = files.length - failedFiles.size;

const ok = errorEvents.length === 0 && (!STRICT || warningEvents.length === 0);

const stats = {
  checked: files.length,
  passed,
  failed: failedFiles.size,
  errors: errorEvents.length,
  warnings: warningEvents.length,
};

if (JSON_OUT) {
  // Committed envelope shape: { ok, stats, errors:[{file, rule, severity, message}] }
  console.log(JSON.stringify({ ok, stats, errors }, null, 2));
} else {
  if (errors.length > 0) {
    for (const e of errors) {
      const tag = e.severity === 'error' ? 'ERROR' : 'WARN ';
      console.log(`[${tag}] ${e.file} — ${e.rule}: ${e.message}`);
    }
    console.log('');
  }
  console.log(`Validated ${stats.checked} entries (${stats.passed} pass, ${stats.failed} fail)`);
  console.log(`  ${stats.errors} errors, ${stats.warnings} warnings`);
  if (INCLUDE_BUILD) console.log('  (including build outputs: training.jsonl + holdout.jsonl)');
  console.log(`  ${ok ? 'OK' : 'FAIL'}`);
}

process.exit(ok ? 0 : 1);
