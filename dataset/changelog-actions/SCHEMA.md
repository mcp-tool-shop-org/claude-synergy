# changelog-actions dataset — schema

Two schemas: one for curation (rich, in `entries/`), one for training (JSONL, derived for backpropagate).

## Curation schema (one JSON per file in `entries/`)

```jsonc
{
  "id": "syn-claude-code-2.1.147-3",        // <product>-<version>-<change_ordinal>
  "schema_version": "1",                    // bump for breaking schema changes

  "input": {
    "product": "claude-code",
    "version": "2.1.147",
    "released_at": "2026-05-21",            // YYYY-MM-DD or null if undated
    "kind_hint": "added",                   // raw kind from changelog parser (added|fixed|breaking|deprecated|...)
    "change_text": "Added experimental Workflows tool gated by CLAUDE_CODE_WORKFLOWS=1 env var",
    "source_url": "https://github.com/anthropics/claude-code/releases/tag/v2.1.147",
    "change_id": "claude-code/2.1.147/3"    // load-bearing: must exist in source corpus
  },

  "output": {
    "kind": "feature",                      // one of: breaking | deprecation | security | feature | fix | performance | docs | unknown
    "severity": "low",                      // one of: low | medium | high
    "subject": "CLAUDE_CODE_WORKFLOWS env var",
    "action_text": "Try the new experimental Workflows tool by setting CLAUDE_CODE_WORKFLOWS=1 in your hooks env. Docs land ~2026-05-28; do not use in production until then.",
    "deadline": null,                       // ISO date if upstream named one (e.g. retirement deadline); else null
    "tags": ["env-var", "experimental"]    // free-form, used for entity-style indexing
  },

  "provenance": {
    "labeler": "opus-4.7-this-session",     // model or human ID that produced the output
    "labeled_at": "2026-05-24",
    "reviewer": "human",                    // null if unreviewed
    "reviewed_at": "2026-05-24",
    "review_action": "approved"             // approved | edited | rejected
  },

  "quality": {
    "faithfulness": "ok",                   // ok | missing-citation | citation-mismatch
    "schema_valid": true,
    "human_grade": null                     // optional 1-5 human quality score
  }
}
```

### Field rules (load-bearing)

- **`output.kind` is closed enum, 8 values.** Originally capped at Miller-7±2 from the first v1.3 study swarm; revised to 8 by the Phase A1 swarm (Keep-a-Changelog + Conventional Commits + maintenance-theory + small-N ML training dynamics all require separating `fix` from `feature`). The Miller-7 cap is for human working-memory recall, not fine-tune training. Adding further values requires a v2 dataset.
- **`output.kind = "unknown"` is first-class** and rewarded over fabricated certainty. Pair with low `human_grade` and route to human review when scaling.
- **`output.severity` is orthogonal to `output.kind`.** A `performance` regression can be high severity; a `security` advisory can be low.
- **`output.deadline` only set when upstream named one.** Never inferred from text; never fabricated. If upstream said "retiring 2026-06-15," use that. Otherwise null.
- **`input.change_id` must resolve to a real citation.** The dataset build script validates this in one of two paths:
  - **Corpus-bound** (default): `(input.product, input.version)` must match a row in the `releases` table of `data/claude-synergy.db`. The DB stores the canonical (product, version) → release-file mapping, including the resolution for multi-package monorepos (`anthropic-sdk-typescript@0.72.0` → `sdk-0.72.0.md`, etc.) and scoped npm packages (`continue-dev@'@continuedev/config-yaml@1.38.0'` → `continuedev-config-yaml-1.38.0.md`). Naive `<product>/releases/<version>.md` lookup is NOT sufficient — go through the DB.
  - **External-namespace exception**: change_ids beginning with `external-ghsa/` or `external-cve/` skip the corpus lookup. Those entries instead require `input.source_url` to be a valid http(s) URL pointing to the published advisory. This exists so high-signal external advisories (e.g. `backpropagate` GHSA-f65r-h4g3-3h9h — the author's own ecosystem) can train the model on the auth-bypass / inert-security-flag pattern even when the affected product isn't in claude-synergy's 37-tracked-products set.
  - Adding a new external namespace requires updating `EXTERNAL_NAMESPACES` in `scripts/build-dataset.mjs`.
- **`provenance.review_action = "approved"` is required for an entry to land in `training.jsonl`.** `"rejected"` entries stay in `entries/` as negative-space documentation but are excluded from training.

### Kind decision rules (mechanical — apply in order)

These rules were locked by the Phase A1 study swarm. Apply the first matching rule:

1. **CVE-class / GHSA-eligible / credential leak / known exploit** → `security`
2. **Compile-time deprecation warning OR old form kept this version OR deprecation alias retained** → `deprecation`
3. **Old form removed in this version (no grace period in this release)** → `breaking`
4. **Bugfix restoring spec'd behavior OR recovering from regression (OOM, crash, RSS unbounded, silent corruption)** → `fix`
5. **Deliberate optimization (caching added, algorithm swapped, runtime sped up by design)** → `performance`
6. **Documentation-only / log-format change / release-notes-only** → `docs`
7. **New capability that consumers can opt into (additive)** → `feature`
8. **Cannot be classified confidently from the change_text alone (vague release notes, "stability improvements")** → `unknown` (FIRST-CLASS — do not fabricate certainty)

### Severity decision rules (mechanical — first matching trigger wins)

Locked by the Phase A1 swarm (grounded in CVSS, Kubernetes priority taxonomy, Google SRE on-call, Bugcrowd VRT, Venturini TOSEM 2023, Brito ICSE 2018):

**HIGH** — any one of:
- Silent failure mode (no error raised; wrong result returned)
- Data loss, data corruption, or credential/key leakage
- Scope escape (failure reaches resources outside the documented surface — subprocess env, global state, other tenants)
- Named removal deadline within 30 days OR removed-without-warning in this version
- Build-broken or runtime-crash for the default-config user

**MEDIUM** — any one of:
- Visible failure mode (error raised, command not found) with no in-version named replacement
- Performance/memory regression worth pulling
- Breaking change affecting non-default but documented configuration
- Deprecation with named replacement AND deadline >30 days

**LOW** — any one of:
- Compile-time / lint-time warning only (no runtime impact)
- Rename or move with named replacement in same version
- Cosmetic UI, docs-only, log-format change
- Opt-in feature addition (consumers who don't use it are unaffected)

**Self-checks** for the curator:
- If HIGH, can you name the specific trigger from the enumerated list? If reaching, downgrade to MEDIUM.
- If MEDIUM, is there a named replacement in the entry text? If yes, consider LOW (per Brito 2018: named replacement cuts recovery cost).
- "Most users won't hit it" is NOT a downgrade signal (per Venturini 2023: ~12% of dependents hit any given breaking change, but the ones that do are stranded).

## Training schema (derived JSONL)

For backpropagate's `Trainer.train()`. Qwen2.5 chat format:

```jsonl
{"messages": [
  {"role": "system", "content": "You synthesize one changelog entry into one structured action item. Output strict JSON matching the schema. Use 'unknown' for kind when you cannot classify confidently. Never invent deadlines."},
  {"role": "user", "content": "Product: claude-code\nVersion: 2.1.147\nReleased: 2026-05-21\nKind hint: added\nChange: Added experimental Workflows tool gated by CLAUDE_CODE_WORKFLOWS=1 env var\nSource: https://github.com/anthropics/claude-code/releases/tag/v2.1.147"},
  {"role": "assistant", "content": "{\"kind\":\"feature\",\"severity\":\"low\",\"subject\":\"CLAUDE_CODE_WORKFLOWS env var\",\"action_text\":\"Try the new experimental Workflows tool by setting CLAUDE_CODE_WORKFLOWS=1 in your hooks env. Docs land ~2026-05-28; do not use in production until then.\",\"deadline\":null,\"tags\":[\"env-var\",\"experimental\"]}"}
]}
```

The derived JSONL is regenerated by `scripts/build-dataset.mjs` from approved entries in `entries/`. Don't hand-edit.

## Splits

- **`training.jsonl`** — approved entries minus the holdout. Used by `backpropagate` for training.
- **`holdout.jsonl`** — 10–20% of approved entries reserved as eval set. Stratified across `kind` values so eval covers all classes. Used to compare fine-tunes vs zero-shot baselines.
- **`rejected/` (subdirectory)** — entries explicitly marked `review_action: "rejected"`, kept as negative-space documentation. Excluded from both training and holdout.

## Versioning

- `v1` is the initial dataset. Target ~200–500 approved entries.
- A new version (`v2`) is created when: schema changes; significant size increase warrants a new fine-tune; or quality bar raises (e.g. all entries re-reviewed by a domain expert).
- Old versions are not deleted — `v1/` stays so v1 fine-tunes remain reproducible.

## License

MIT, same as claude-synergy. Entries are derived from public changelogs (each linked via `input.source_url`); the synthesis layer is original work licensed permissively.
