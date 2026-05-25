#!/usr/bin/env node
// Cross-family LLM-as-judge for changelog-actions dataset entries.
//
// Calls Ollama qwen3:8b (different model family from Opus 4.7, which produced
// the original labels) and asks it to verdict each entry's classification
// against the locked rules. Conservative default: agree when uncertain, only
// flag clear rule-based disagreements.
//
// Theme E (the v1.3 study swarm finding from Zheng et al. NeurIPS 2023) said
// same-family judges inflate their own outputs by 10-15pp. qwen3 vs Opus
// satisfies the cross-family requirement.
//
// Output: dataset/changelog-actions/v1/judge-report.json
//
// Usage:
//   node scripts/judge-dataset.mjs                # judge all 301
//   node scripts/judge-dataset.mjs --limit=5      # judge first 5 (test)
//   node scripts/judge-dataset.mjs --verbose      # log every entry's verdict

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ENTRIES_DIR = join(REPO_ROOT, 'dataset', 'changelog-actions', 'v1', 'entries');
const REPORT_PATH = join(REPO_ROOT, 'dataset', 'changelog-actions', 'v1', 'judge-report.json');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'qwen3:8b';

const args = process.argv.slice(2);
const LIMIT = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? '0', 10);
const VERBOSE = args.includes('--verbose');

// Locked decision rules — abbreviated for the judge prompt. Verbatim from
// SCHEMA.md so the judge applies the same canon as the original labelers.
const RULES = `
KIND DECISION RULES (apply in order, first match wins):
1. CVE-class / GHSA-eligible / credential leak / known exploit / explicit "Security:" prefix → security
2. Compile-time deprecation warning OR old form kept this version OR deprecation alias retained → deprecation
3. Old form removed in this version (no grace period in this release) → breaking
4. Bugfix restoring spec'd behavior OR recovering from regression (OOM, crash, RSS unbounded, silent corruption) → fix
5. Deliberate optimization (caching added, algorithm swapped, runtime sped up by design) → performance
6. Documentation-only / log-format change / release-notes-only / README list update → docs
7. New capability that consumers can opt into (additive) → feature
8. Cannot be classified confidently from change_text alone → unknown (FIRST-CLASS — never fabricate certainty)

SEVERITY RULES (first matching trigger wins):
- HIGH: silent-failure mode / data-loss / credential-leak / scope-escape (failure crosses documented boundary) / named deadline within 30 days / build-broken or runtime-crash for default-config user
- MEDIUM: visible-failure mode + no in-version named replacement / perf-or-memory regression / breaking in non-default-but-documented config / deprecation with deadline >30 days
- LOW: compile-time-only / rename with named replacement / cosmetic UI / docs-only / opt-in feature addition
`;

function buildPrompt(entry) {
  const inp = entry.input;
  const out = entry.output;
  return `You are an independent dataset reviewer. The following changelog entry was classified by another model. Apply the LOCKED RULES below and decide whether the proposed kind and severity are correct.

${RULES}

CHANGELOG ENTRY:
Product: ${inp.product}
Version: ${inp.version}
Released: ${inp.released_at ?? 'undated'}
Kind hint (from upstream): ${inp.kind_hint}
Change text: ${inp.change_text}

PROPOSED CLASSIFICATION:
kind: ${out.kind}
severity: ${out.severity}
subject: ${out.subject}

OUTPUT FORMAT (strict JSON only — no prose, no markdown):
{
  "verdict": "agree" | "disagree" | "unsure",
  "kind_check": "ok" | "wrong",
  "suggested_kind": "<one of the 8 enum values, only if kind_check is wrong>",
  "severity_check": "ok" | "wrong",
  "suggested_severity": "<low | medium | high, only if severity_check is wrong>",
  "rationale": "<one sentence pointing to the specific rule number or trigger>"
}

CONSERVATIVE DISAGREEMENT POLICY:
- Default to "agree" when uncertain. Only disagree when you have a clear rule-based reason citing a specific decision rule above.
- If both kind_check and severity_check are "ok" → verdict MUST be "agree".
- If either is "wrong" → verdict MUST be "disagree".
- Use "unsure" only when the change_text is too vague to apply any rule confidently — in that case, agreeing with "kind: unknown" is correct, disagreeing means you'd pick something other than "unknown".`;
}

async function judgeEntry(entry) {
  const prompt = buildPrompt(entry);
  const resp = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      format: 'json',
      think: false, // qwen3 has built-in CoT; disabling cuts per-entry time ~5x
      options: { temperature: 0.1, num_predict: 300 },
    }),
  });
  if (!resp.ok) throw new Error(`Ollama returned ${resp.status}: ${await resp.text()}`);
  const data = await resp.json();
  if (typeof data.response !== 'string') throw new Error('No response field from Ollama');
  // qwen3 sometimes wraps JSON in markdown fences even with format:json; strip if present.
  let raw = data.response.trim();
  if (raw.startsWith('```')) raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Judge returned invalid JSON: ${raw.slice(0, 300)}`);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const files = readdirSync(ENTRIES_DIR).filter((f) => f.endsWith('.json')).sort();
const targetFiles = LIMIT > 0 ? files.slice(0, LIMIT) : files;

console.error(`Judging ${targetFiles.length} entries with ${MODEL} via ${OLLAMA_URL}`);
console.error(`(Conservative-disagreement policy; default to agree on uncertainty)`);
console.error('');

const verdicts = [];
const errorRecords = [];
let agreeCount = 0;
let disagreeCount = 0;
let unsureCount = 0;
const t0 = Date.now();

for (let i = 0; i < targetFiles.length; i++) {
  const filename = targetFiles[i];
  const entry = JSON.parse(readFileSync(join(ENTRIES_DIR, filename), 'utf-8'));
  try {
    const result = await judgeEntry(entry);
    const verdict = {
      filename,
      verdict: result.verdict,
      original: { kind: entry.output.kind, severity: entry.output.severity },
      suggested: {},
      kind_check: result.kind_check,
      severity_check: result.severity_check,
      rationale: result.rationale,
    };
    if (result.kind_check === 'wrong') verdict.suggested.kind = result.suggested_kind;
    if (result.severity_check === 'wrong') verdict.suggested.severity = result.suggested_severity;
    verdicts.push(verdict);
    if (result.verdict === 'agree') agreeCount++;
    else if (result.verdict === 'disagree') disagreeCount++;
    else unsureCount++;
    if (VERBOSE || i % 25 === 0 || result.verdict !== 'agree') {
      const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
      const dashes = result.verdict === 'agree' ? '' : ` (${entry.output.kind}/${entry.output.severity} → ${result.suggested_kind ?? entry.output.kind}/${result.suggested_severity ?? entry.output.severity})`;
      console.error(`  [${i + 1}/${targetFiles.length}] ${elapsed}s — ${filename} → ${result.verdict}${dashes}`);
    }
  } catch (e) {
    errorRecords.push({ filename, error: e.message });
    console.error(`  ERROR on ${filename}: ${e.message}`);
  }
}

const report = {
  judge_model: MODEL,
  judged_at: new Date().toISOString(),
  total: targetFiles.length,
  agree: agreeCount,
  disagree: disagreeCount,
  unsure: unsureCount,
  errors: errorRecords.length,
  elapsed_seconds: parseFloat(((Date.now() - t0) / 1000).toFixed(1)),
  verdicts,
  errors_detail: errorRecords,
};

writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');

console.error('');
console.error('Summary:');
console.error(`  total:    ${report.total}`);
console.error(`  agree:    ${report.agree} (${((100 * report.agree) / report.total).toFixed(1)}%)`);
console.error(`  disagree: ${report.disagree} (${((100 * report.disagree) / report.total).toFixed(1)}%)`);
console.error(`  unsure:   ${report.unsure} (${((100 * report.unsure) / report.total).toFixed(1)}%)`);
console.error(`  errors:   ${report.errors}`);
console.error(`  elapsed:  ${report.elapsed_seconds.toFixed(0)}s (${(report.elapsed_seconds / report.total).toFixed(1)}s/entry)`);
console.error('');
console.error(`Wrote ${REPORT_PATH}`);
