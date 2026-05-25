#!/usr/bin/env node
// Three-run eval harness for cs-actions:v1 per dataset/changelog-actions/v1/EVAL.md.
//
//   Run 1: qwen3:8b vs ground truth on holdout (zero-shot floor)
//   Run 2: qwen3:8b vs cs-actions:v1 on holdout (release pass criterion)
//   Run 3: kind_hint ablation — Run 2 with and without `Kind hint: <real>`
//
// Pre-training: only Run 1 executes (cs-actions:v1 doesn't exist yet). Runs 2/3
// code paths are reviewable in source and activate once `--model=cs-actions:v1`
// is passed against an Ollama-registered fine-tune.
//
// Output schema (committed shape — downstream consumers can rely on it):
//   { ran_at, holdout_path, run_1?: {...}, run_2?: {...}, run_3?: {...} }
//
// Per-run payload includes overall_kind_agreement, macro_f1_well_populated,
// per_class precision/recall/F1, confusion_matrix, verdicts[], errors[].
//
// Pass criterion (Run 2): qwen3_vs_cs_actions_agreement >= qwen3_vs_ground_truth_agreement.
// Pass criterion is on KIND only; other fields are diagnostics.
//
// Usage:
//   node scripts/eval-cs-actions.mjs --run=1                              # pre-training Run 1
//   node scripts/eval-cs-actions.mjs --run=2 --model=cs-actions:v1        # post-training Run 2
//   node scripts/eval-cs-actions.mjs --run=3 --model=cs-actions:v1        # post-training Run 3
//   node scripts/eval-cs-actions.mjs --all --model=cs-actions:v1          # all three, merged
//   node scripts/eval-cs-actions.mjs --run=1 --limit=5                    # smoke test

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const HOLDOUT_PATH = join(REPO_ROOT, 'dataset', 'changelog-actions', 'v1', 'holdout.jsonl');
const OUT_DIR = join(REPO_ROOT, 'dataset', 'changelog-actions', 'v1');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const JUDGE_MODEL = 'qwen3:8b';            // same cross-family judge used in A3c
const DEFAULT_FINE_TUNE_MODEL = 'cs-actions:v1';

const VALID_KINDS = ['breaking', 'deprecation', 'security', 'feature', 'fix', 'performance', 'docs', 'unknown'];
const VALID_KINDS_SET = new Set(VALID_KINDS);

// Classes with enough holdout entries (n >= 4) to compute meaningful per-class F1.
// performance (n=1) and docs (n=3) are reported separately as thin-class diagnostics
// per EVAL.md's "Per-class signal warning" subsection.
const WELL_POPULATED_CLASSES = ['fix', 'feature', 'unknown', 'breaking', 'deprecation', 'security'];

// Locked SYSTEM prompt — byte-identical to:
//   - dataset/changelog-actions/v1/manifest.json `system_prompt`
//   - dataset/changelog-actions/v1/Modelfile.cs-actions-v1 SYSTEM directive
//   - scripts/build-dataset.mjs SYSTEM_PROMPT constant
// Any drift breaks the dataset contract.
const SYSTEM_PROMPT =
  "You synthesize one changelog entry into one structured action item. Output strict JSON with fields: kind (one of: breaking | deprecation | security | feature | fix | performance | docs | unknown), severity (one of: low | medium | high), subject, action_text (verb-first imperative, 1-3 sentences, names the affected surface in backticks, max 500 chars), deadline (YYYY-MM-DD if upstream-named, else null), tags. Use kind='unknown' when you cannot classify confidently. Never invent deadlines.";

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const argVal = (name, def) => {
  const m = args.find((a) => a.startsWith(`--${name}=`));
  return m ? m.split('=')[1] : def;
};
const RUN = argVal('run', null);                       // '1' | '2' | '3' | null (use --all)
const RUN_ALL = args.includes('--all');
const MODEL = argVal('model', DEFAULT_FINE_TUNE_MODEL);
const LIMIT = parseInt(argVal('limit', '0'), 10);
const VERBOSE = args.includes('--verbose');

if (!RUN && !RUN_ALL) {
  console.error('Usage: node scripts/eval-cs-actions.mjs --run=1 | --run=2 | --run=3 | --all');
  console.error('       optional: --model=<ollama-name> --limit=<N> --verbose');
  process.exit(2);
}

// ── Load holdout ─────────────────────────────────────────────────────────────
const allLines = readFileSync(HOLDOUT_PATH, 'utf-8').split('\n').filter((l) => l.length > 0);
const allHoldout = allLines.map((l, i) => {
  const obj = JSON.parse(l);
  return {
    line: i + 1,
    user_prompt: obj.messages[1].content,
    ground_truth: JSON.parse(obj.messages[2].content),
  };
});
const holdout = LIMIT > 0 ? allHoldout.slice(0, LIMIT) : allHoldout;
console.error(`Loaded ${holdout.length}/${allHoldout.length} holdout entries from ${HOLDOUT_PATH}`);

// ── Inference helper ─────────────────────────────────────────────────────────
//
// Passes SYSTEM_PROMPT as the per-request `system` parameter. For qwen3:8b this
// is the only source. For cs-actions:v1 the Modelfile SYSTEM is byte-identical
// so the override is a no-op — but explicit is better than implicit, and
// passing it consistently makes the eval reproducible against any Ollama model.
async function infer(model, userPrompt) {
  const resp = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      stream: false,
      format: 'json',
      think: false, // disables qwen3's CoT for speed (no-op for non-thinking models)
      options: { temperature: 0.0, num_predict: 320 },
    }),
  });
  if (!resp.ok) {
    throw new Error(`Ollama ${model} returned ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  }
  const data = await resp.json();
  let raw = (data.response ?? '').trim();
  // qwen3 occasionally wraps JSON in markdown fences despite format=json
  if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { __parse_error: true, raw: raw.slice(0, 300), error: e.message };
  }
}

// ── Confusion matrix + per-class stats ───────────────────────────────────────
//
// Matrix shape: matrix[actual_kind][predicted_kind] = count.
function emptyMatrix() {
  const m = {};
  for (const k of VALID_KINDS) m[k] = {};
  return m;
}

function recordPrediction(matrix, predicted, actual) {
  if (!matrix[actual]) matrix[actual] = {};
  matrix[actual][predicted] = (matrix[actual][predicted] || 0) + 1;
}

function computeStats(matrix, total) {
  const stats = { per_class: {}, overall_agreement: 0, macro_f1_well_populated: 0, thin_class_diagnostics: {} };
  let tp_total = 0;

  for (const cls of VALID_KINDS) {
    const tp = matrix[cls]?.[cls] || 0;
    const fn = Object.entries(matrix[cls] || {}).filter(([k]) => k !== cls).reduce((s, [, v]) => s + v, 0);
    const fp = Object.entries(matrix).filter(([k]) => k !== cls).reduce((s, [, row]) => s + (row[cls] || 0), 0);
    const support = tp + fn;
    const precision = (tp + fp) ? tp / (tp + fp) : 0;
    const recall = support ? tp / support : 0;
    const f1 = (precision + recall) ? (2 * precision * recall) / (precision + recall) : 0;
    stats.per_class[cls] = { tp, fp, fn, support, precision: round3(precision), recall: round3(recall), f1: round3(f1) };
    tp_total += tp;
  }
  stats.overall_agreement = total ? round3(tp_total / total) : 0;

  // Macro-F1 over well-populated classes only (per EVAL.md "Per-class signal warning")
  const wellPopF1s = WELL_POPULATED_CLASSES.map((c) => stats.per_class[c]?.f1 || 0);
  stats.macro_f1_well_populated = round3(wellPopF1s.reduce((a, b) => a + b, 0) / wellPopF1s.length);

  // Thin-class diagnostics — kept separate so a single macro-F1 number doesn't
  // bury performance (n=1) / docs (n=3) noise.
  for (const c of ['performance', 'docs']) {
    stats.thin_class_diagnostics[c] = stats.per_class[c];
  }
  return stats;
}

const round3 = (x) => Math.round(x * 1000) / 1000;

// ── Severity diagnostics (reported, not gating) ──────────────────────────────
//
// Normalizes case + whitespace on both sides before comparing — format=json
// doesn't enforce enum membership, so a model could emit "Low" or "low " and
// silently miss against "low". Same defense applied to kind comparisons via
// VALID_KINDS_SET.has() upstream (out-of-enum gets rejected as an error,
// not silently miscompared).
function normLow(s) {
  return (typeof s === 'string' ? s : '').toLowerCase().trim();
}

function severityAgreement(verdicts, key1, key2) {
  let match = 0;
  let total = 0;
  for (const v of verdicts) {
    const a = normLow(v[key1]);
    const b = normLow(v[key2]);
    if (a && b) {
      total++;
      if (a === b) match++;
    }
  }
  return total ? round3(match / total) : null;
}

// ── Run 1: qwen3 vs ground truth ─────────────────────────────────────────────
async function run1() {
  console.error(`\n=== Run 1: ${JUDGE_MODEL} vs ground truth (zero-shot floor) ===`);
  const t0 = Date.now();
  const matrix = emptyMatrix();
  const errors = [];
  const verdicts = [];

  for (let i = 0; i < holdout.length; i++) {
    const entry = holdout[i];
    let predicted;
    try {
      predicted = await infer(JUDGE_MODEL, entry.user_prompt);
    } catch (e) {
      errors.push({ line: entry.line, error: e.message });
      continue;
    }
    if (predicted.__parse_error) {
      errors.push({ line: entry.line, error: 'json_parse_error', raw: predicted.raw });
      continue;
    }
    const predKind = predicted.kind;
    const actKind = entry.ground_truth.kind;
    if (!VALID_KINDS_SET.has(predKind)) {
      errors.push({ line: entry.line, error: `predicted kind out of enum: ${JSON.stringify(predKind)}` });
      continue;
    }
    recordPrediction(matrix, predKind, actKind);
    const match = predKind === actKind;
    verdicts.push({
      line: entry.line,
      ground_truth_kind: actKind,
      predicted_kind: predKind,
      kind_match: match,
      ground_truth_severity: entry.ground_truth.severity,
      predicted_severity: predicted.severity,
    });
    if (VERBOSE || !match || i % 10 === 0) {
      const flag = match ? 'OK ' : 'XX ';
      console.error(`  [${i + 1}/${holdout.length}] ${((Date.now() - t0) / 1000).toFixed(0)}s ${flag} gt=${actKind.padEnd(11)} pred=${predKind}`);
    }
  }

  const stats = computeStats(matrix, verdicts.length);
  const sevAgreement = severityAgreement(verdicts, 'ground_truth_severity', 'predicted_severity');

  console.error('\n--- Run 1 summary ---');
  console.error(`  Overall kind agreement:                ${(100 * stats.overall_agreement).toFixed(1)}% (${verdicts.filter((v) => v.kind_match).length}/${verdicts.length})`);
  console.error(`  Macro-F1 (6 well-populated classes):   ${stats.macro_f1_well_populated.toFixed(3)}`);
  console.error(`  Severity diagnostic agreement:         ${sevAgreement !== null ? (100 * sevAgreement).toFixed(1) + '%' : 'n/a'}`);
  console.error(`  Errors (parse/oom/oor):                ${errors.length}`);
  console.error(`  Elapsed:                                ${((Date.now() - t0) / 1000).toFixed(0)}s`);

  console.error('\n  Per-class kind F1:');
  for (const cls of VALID_KINDS) {
    const s = stats.per_class[cls];
    const note = WELL_POPULATED_CLASSES.includes(cls) ? '' : '  (thin)';
    console.error(`    ${cls.padEnd(13)} f1=${s.f1.toFixed(3)} p=${s.precision.toFixed(3)} r=${s.recall.toFixed(3)} support=${s.support}${note}`);
  }

  console.error('\n  Confusion matrix (rows=ground truth, cols=predicted):');
  console.error('    ' + 'gt\\pred'.padEnd(13) + VALID_KINDS.map((k) => k.slice(0, 9).padStart(9)).join(' '));
  for (const actCls of VALID_KINDS) {
    process.stderr.write('    ' + actCls.padEnd(13));
    for (const predCls of VALID_KINDS) {
      const n = matrix[actCls]?.[predCls] || 0;
      process.stderr.write((n === 0 ? '·' : String(n)).padStart(9) + ' ');
    }
    console.error('');
  }

  return {
    run: 1,
    description: 'qwen3:8b vs ground truth on holdout (zero-shot floor)',
    model: JUDGE_MODEL,
    holdout_size: verdicts.length,
    elapsed_seconds: round3((Date.now() - t0) / 1000),
    overall_kind_agreement: stats.overall_agreement,
    macro_f1_well_populated: stats.macro_f1_well_populated,
    severity_diagnostic_agreement: sevAgreement,
    per_class: stats.per_class,
    thin_class_diagnostics: stats.thin_class_diagnostics,
    confusion_matrix: matrix,
    verdicts,
    errors,
  };
}

// ── Run 2: qwen3 vs cs-actions ───────────────────────────────────────────────
//
// Serial inference (not Promise.all) per entry. Ollama defaults to
// OLLAMA_MAX_LOADED_MODELS=1 on Windows; concurrent calls to two different
// models force unload+reload thrashing, blowing per-entry time from ~1.4s
// to 5-30s. Serial pays ~2x wall-clock but is robust regardless of MAX_LOADED
// setting. Both models are pre-warmed at run start to amortize initial load.
async function run2(modelName) {
  console.error(`\n=== Run 2: ${JUDGE_MODEL} vs ${modelName} (release pass criterion) ===`);
  const maxLoaded = process.env.OLLAMA_MAX_LOADED_MODELS;
  if (maxLoaded === '1' || (maxLoaded === undefined && process.platform === 'win32')) {
    console.error(`  Note: OLLAMA_MAX_LOADED_MODELS=${maxLoaded ?? '(unset, Windows default = 1)'}.`);
    console.error(`  Using serial inference (~2x wall-clock vs parallel). To enable concurrent calls,`);
    console.error(`  set OLLAMA_MAX_LOADED_MODELS=2 before invoking — both models (qwen3:8b + ${modelName})`);
    console.error(`  are ~5GB quantized, comfortable for 16GB VRAM.`);
  }

  // Pre-warm both models with a tiny inference so the first real entry isn't
  // paying a cold-load. Each model becomes resident; serial calls below
  // then alternate without unload/reload thrashing (assuming MAX_LOADED >= 2,
  // or paying the swap cost predictably if =1).
  console.error('  Pre-warming both models...');
  try {
    await infer(JUDGE_MODEL, 'Product: x\nVersion: 1\nReleased: 2026-01-01\nKind hint: added\nChange: warmup\nSource: x');
    await infer(modelName, 'Product: x\nVersion: 1\nReleased: 2026-01-01\nKind hint: added\nChange: warmup\nSource: x');
  } catch (e) {
    console.error(`  Pre-warm failed (will continue, but timing may include cold-load): ${e.message}`);
  }

  const t0 = Date.now();
  const qwen3Matrix = emptyMatrix();
  const csMatrix = emptyMatrix();
  const errors = [];
  const verdicts = [];

  for (let i = 0; i < holdout.length; i++) {
    const entry = holdout[i];
    try {
      // Serial, not Promise.all — see comment at function top
      const qwen3Pred = await infer(JUDGE_MODEL, entry.user_prompt);
      const csPred = await infer(modelName, entry.user_prompt);
      if (qwen3Pred.__parse_error || csPred.__parse_error) {
        errors.push({ line: entry.line, error: 'parse_error', qwen3: qwen3Pred, cs: csPred });
        continue;
      }
      if (!VALID_KINDS_SET.has(qwen3Pred.kind) || !VALID_KINDS_SET.has(csPred.kind)) {
        errors.push({ line: entry.line, error: 'kind_out_of_enum', qwen3_kind: qwen3Pred.kind, cs_kind: csPred.kind });
        continue;
      }
      const actKind = entry.ground_truth.kind;
      recordPrediction(qwen3Matrix, qwen3Pred.kind, actKind);
      recordPrediction(csMatrix, csPred.kind, actKind);
      verdicts.push({
        line: entry.line,
        ground_truth_kind: actKind,
        qwen3_kind: qwen3Pred.kind,
        cs_actions_kind: csPred.kind,
        qwen3_matches_gt: qwen3Pred.kind === actKind,
        cs_matches_gt: csPred.kind === actKind,
        qwen3_matches_cs: qwen3Pred.kind === csPred.kind,
        ground_truth_severity: entry.ground_truth.severity,
        qwen3_severity: qwen3Pred.severity,
        cs_severity: csPred.severity,
      });
    } catch (e) {
      errors.push({ line: entry.line, error: e.message });
    }
    if (VERBOSE || i % 10 === 0) {
      console.error(`  [${i + 1}/${holdout.length}] ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
  }

  const qwen3Stats = computeStats(qwen3Matrix, verdicts.length);
  const csStats = computeStats(csMatrix, verdicts.length);
  const qwen3VsGt = qwen3Stats.overall_agreement;
  const csVsGt = csStats.overall_agreement;
  const qwen3VsCs = verdicts.length ? round3(verdicts.filter((v) => v.qwen3_matches_cs).length / verdicts.length) : 0;
  const releasePass = qwen3VsCs >= qwen3VsGt;

  // Severity rollups — diagnostic only, not gating per EVAL.md
  const qwen3VsGtSeverity = severityAgreement(verdicts, 'qwen3_severity', 'ground_truth_severity');
  const csVsGtSeverity = severityAgreement(verdicts, 'cs_severity', 'ground_truth_severity');
  const qwen3VsCsSeverity = severityAgreement(verdicts, 'qwen3_severity', 'cs_severity');

  console.error('\n--- Run 2 summary ---');
  console.error(`  qwen3-vs-GT kind agreement:             ${(100 * qwen3VsGt).toFixed(1)}%`);
  console.error(`  cs-actions-vs-GT kind agreement:        ${(100 * csVsGt).toFixed(1)}%  (diagnostic)`);
  console.error(`  qwen3-vs-cs-actions kind agreement:     ${(100 * qwen3VsCs).toFixed(1)}%`);
  console.error(`  Release pass (qwen3-vs-cs ≥ qwen3-vs-GT): ${releasePass ? 'PASS ✓' : 'FAIL ✗'}`);
  console.error('');
  console.error(`  Severity diagnostics (not gating):`);
  console.error(`    qwen3-vs-GT severity:                 ${qwen3VsGtSeverity !== null ? (100 * qwen3VsGtSeverity).toFixed(1) + '%' : 'n/a'}`);
  console.error(`    cs-actions-vs-GT severity:            ${csVsGtSeverity !== null ? (100 * csVsGtSeverity).toFixed(1) + '%' : 'n/a'}`);
  console.error(`    qwen3-vs-cs-actions severity:         ${qwen3VsCsSeverity !== null ? (100 * qwen3VsCsSeverity).toFixed(1) + '%' : 'n/a'}`);
  console.error(`  Errors: ${errors.length} | Elapsed: ${((Date.now() - t0) / 1000).toFixed(0)}s`);

  return {
    run: 2,
    description: 'qwen3:8b vs cs-actions on holdout (release pass criterion)',
    judge_model: JUDGE_MODEL,
    fine_tune_model: modelName,
    holdout_size: verdicts.length,
    elapsed_seconds: round3((Date.now() - t0) / 1000),
    qwen3_vs_ground_truth_agreement: qwen3VsGt,
    cs_actions_vs_ground_truth_agreement: csVsGt,
    qwen3_vs_cs_actions_agreement: qwen3VsCs,
    release_pass: releasePass,
    qwen3_macro_f1_well_populated: qwen3Stats.macro_f1_well_populated,
    cs_actions_macro_f1_well_populated: csStats.macro_f1_well_populated,
    qwen3_per_class: qwen3Stats.per_class,
    cs_actions_per_class: csStats.per_class,
    cs_actions_thin_class_diagnostics: csStats.thin_class_diagnostics,
    qwen3_vs_ground_truth_severity_agreement: qwen3VsGtSeverity,
    cs_actions_vs_ground_truth_severity_agreement: csVsGtSeverity,
    qwen3_vs_cs_actions_severity_agreement: qwen3VsCsSeverity,
    verdicts,
    errors,
  };
}

// ── Run 3: kind_hint ablation ────────────────────────────────────────────────
async function run3(modelName) {
  console.error(`\n=== Run 3: kind_hint ablation on ${modelName} ===`);
  const t0 = Date.now();

  async function runVariant(label, transform) {
    console.error(`\n  Variant ${label}`);
    const matrix = emptyMatrix();
    let parseErrors = 0;
    let used = 0;
    for (let i = 0; i < holdout.length; i++) {
      const entry = holdout[i];
      const promptUsed = transform(entry.user_prompt);
      try {
        const out = await infer(modelName, promptUsed);
        if (out.__parse_error || !VALID_KINDS_SET.has(out.kind)) {
          parseErrors++;
          continue;
        }
        recordPrediction(matrix, out.kind, entry.ground_truth.kind);
        used++;
      } catch {
        parseErrors++;
      }
    }
    return { stats: computeStats(matrix, used), used, parseErrors, matrix };
  }

  const variantA = await runVariant('A — with Kind hint (default)', (p) => p);
  const variantB = await runVariant('B — Kind hint: omitted', (p) =>
    p.replace(/^Kind hint: .*$/m, 'Kind hint: omitted'),
  );

  const f1Delta = variantA.stats.macro_f1_well_populated - variantB.stats.macro_f1_well_populated;
  const f1DeltaPts = round3(f1Delta * 100);

  let zone, action;
  if (f1DeltaPts > 15) {
    zone = '>15pt';
    action = 'v2 hint-randomization (does NOT block v1 ship)';
  } else if (f1DeltaPts >= 5) {
    zone = '5-15pt';
    action = 'ship v1; consider hint-randomization for v2';
  } else {
    zone = '<5pt';
    action = 'rules fully internalized; v1 is robust';
  }

  console.error('\n--- Run 3 summary ---');
  console.error(`  Variant A (with hint)        macro-F1: ${variantA.stats.macro_f1_well_populated.toFixed(3)}  (n=${variantA.used}, errors=${variantA.parseErrors})`);
  console.error(`  Variant B (hint omitted)     macro-F1: ${variantB.stats.macro_f1_well_populated.toFixed(3)}  (n=${variantB.used}, errors=${variantB.parseErrors})`);
  console.error(`  F1 delta (A - B):            ${f1DeltaPts.toFixed(1)} pts → zone ${zone}`);
  console.error(`  Action: ${action}`);
  console.error(`  Caveat: thresholds (15/5) are pre-data heuristics — revise for v2 once cross-run variance is measured.`);
  console.error(`  Elapsed: ${((Date.now() - t0) / 1000).toFixed(0)}s`);

  return {
    run: 3,
    description: 'kind_hint ablation on cs-actions',
    fine_tune_model: modelName,
    holdout_size: holdout.length,
    elapsed_seconds: round3((Date.now() - t0) / 1000),
    variant_a_with_hint: {
      macro_f1_well_populated: variantA.stats.macro_f1_well_populated,
      per_class: variantA.stats.per_class,
      used: variantA.used,
      parse_errors: variantA.parseErrors,
    },
    variant_b_hint_omitted: {
      macro_f1_well_populated: variantB.stats.macro_f1_well_populated,
      per_class: variantB.stats.per_class,
      used: variantB.used,
      parse_errors: variantB.parseErrors,
    },
    f1_delta_pts: f1DeltaPts,
    zone,
    action,
    threshold_caveat: 'pre-data heuristics; revise after v1 cross-run variance is measured',
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const out = {
    ran_at: new Date().toISOString(),
    holdout_path: HOLDOUT_PATH,
    holdout_size_loaded: holdout.length,
    holdout_size_full: allHoldout.length,
  };

  if (RUN === '1' || RUN_ALL) {
    out.run_1 = await run1();
  }
  if ((RUN === '2' || RUN_ALL) && MODEL !== JUDGE_MODEL) {
    out.run_2 = await run2(MODEL);
  }
  if ((RUN === '3' || RUN_ALL) && MODEL !== JUDGE_MODEL) {
    out.run_3 = await run3(MODEL);
  }

  // Pre-training filename (Run 1 only): eval-report-run1.json
  // Full eval filename: eval-report.v1.json
  const isPreTraining = RUN === '1' && !RUN_ALL;
  const reportPath = join(OUT_DIR, isPreTraining ? 'eval-report-run1.json' : 'eval-report.v1.json');
  writeFileSync(reportPath, JSON.stringify(out, null, 2), 'utf-8');
  console.error(`\nWrote ${reportPath}`);
}

await main();
