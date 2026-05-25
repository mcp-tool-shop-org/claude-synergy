#!/usr/bin/env node
// Apply the A3c review decisions: flip review_action on every entry per
// the user-confirmed disposition of the qwen3 cross-family judge run.
//
// Decisions (locked 2026-05-25 from chat review):
//   - 278 entries agreed by qwen3 + user → review_action: 'approved'
//   - 7 cluster-1 entries (section-anchor "Deprecation"-only change_text) →
//     'approved' (qwen3 too literal; locked rule 8 applies)
//   - 9 cluster-2 entries (qwen3 quirks: verdict=disagree but no actual
//     classification change suggested) → 'approved'
//   - 6 cluster-3 keep-original → 'approved' (qwen3 false-triggered on
//     "breaking" word in change_text, or got rule application wrong)
//   - 1 cluster-3 flip → 'edited' + kind change (qwen3 was right per locked
//     rule 3)
//   - 1 user-override severity change → 'edited' + severity change (silent-
//     failure trigger applies)
//
// Final disposition: 299 approved, 2 edited, 0 rejected.
//
// Provenance: each entry's reviewer set to 'human+qwen3-judge-a3c' so the
// audit trail captures the cross-family review process.

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ENTRIES_DIR = join(REPO_ROOT, 'dataset', 'changelog-actions', 'v1', 'entries');

const REVIEWED_AT = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const REVIEWER = 'human+qwen3-judge-a3c';

// The 2 entries that actually change classification (review_action: edited)
// All other entries keep their classification (review_action: approved).
const EDITS = {
  'syn-anthropic-sdk-python-0.77.0-6.json': {
    kind: 'breaking', // was 'unknown'; locked rule 3: class removed = breaking
  },
  'syn-claude-code-2.1.105-17.json': {
    severity: 'high', // was 'medium'; silent-failure trigger #1 (visual corruption)
  },
};

const files = readdirSync(ENTRIES_DIR).filter((f) => f.endsWith('.json')).sort();

let approvedCount = 0;
let editedCount = 0;
const auditTrail = [];

for (const filename of files) {
  const path = join(ENTRIES_DIR, filename);
  const data = JSON.parse(readFileSync(path, 'utf-8'));

  // Apply any classification edit first
  const edit = EDITS[filename];
  let originalKind, originalSeverity;
  if (edit) {
    originalKind = data.output.kind;
    originalSeverity = data.output.severity;
    if (edit.kind) data.output.kind = edit.kind;
    if (edit.severity) data.output.severity = edit.severity;
  }

  // Flip review_action
  data.provenance.review_action = edit ? 'edited' : 'approved';
  data.provenance.reviewer = REVIEWER;
  data.provenance.reviewed_at = REVIEWED_AT;

  // Preserve canonical output key order. The build script and validator both
  // expect kind,severity,subject,action_text,deadline,tags. JSON.parse keeps
  // insertion order in V8, but a manual property reassignment can shuffle —
  // rebuild output explicitly to be safe.
  const out = data.output;
  data.output = {
    kind: out.kind,
    severity: out.severity,
    subject: out.subject,
    action_text: out.action_text,
    deadline: out.deadline,
    tags: out.tags,
  };

  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  if (edit) {
    editedCount++;
    auditTrail.push({
      filename,
      action: 'edited',
      changes: {
        ...(edit.kind ? { kind: { from: originalKind, to: edit.kind } } : {}),
        ...(edit.severity ? { severity: { from: originalSeverity, to: edit.severity } } : {}),
      },
    });
  } else {
    approvedCount++;
  }
}

console.log(`Applied A3c review to ${files.length} entries:`);
console.log(`  approved: ${approvedCount}`);
console.log(`  edited:   ${editedCount}`);
console.log(`  rejected: 0`);
console.log('');
console.log('Edits:');
for (const e of auditTrail) {
  console.log(`  ${e.filename}`);
  for (const [field, change] of Object.entries(e.changes)) {
    console.log(`    ${field}: ${change.from} → ${change.to}`);
  }
}
