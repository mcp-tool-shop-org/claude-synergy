# claude-synergy datasets

Curated datasets derived from the claude-synergy corpus. v1 of the first dataset — **changelog-actions** — ships in this directory and is the training data for the `cs-actions` family of fine-tuned Ollama models.

## Why these exist

The claude-synergy corpus today is ~1,171 release files / 6,573 change bullets from 37 AI-dev-tool changelogs. Reading them is one thing; **turning them into actionable adjustments for a specific repo or workflow** is a separate skill: classify the entry, extract entities, judge severity, produce a concrete next-step action with a deadline if one is implied. That skill is well-bounded enough to specialize a small model on it — which is what the v1 fine-tune does.

The dataset is the artifact. The fine-tuned model is downstream of it. Re-tune to a newer base model later (Qwen 3.5 / Phi 5 / whatever ships) without touching the dataset.

## Datasets in this directory

| Dataset | Status | Purpose | Schema |
|---|---|---|---|
| [`changelog-actions/v1`](./changelog-actions/) | **301 entries on disk, all `review_action: pending`** (A1 hand-curated 30 + A2 parallel-subagent 250 + A2.5 security-oversample 21). Pending A3 spot-check + freeze. | Train a small model that converts one changelog entry → one structured action item | [v1 schema](./changelog-actions/SCHEMA.md) · [style spec](./changelog-actions/STYLE.md) · [training](./changelog-actions/v1/TRAINING.md) · [eval](./changelog-actions/v1/EVAL.md) |

### v1 distribution (snapshot)

| Dimension | Counts |
|---|---|
| **kind** | fix=97 (32%), feature=69 (23%), unknown=38 (13%), breaking=30 (10%), deprecation=26 (9%), security=21 (7%), docs=14 (5%), performance=6 (2%) |
| **severity** | low=179 (59%), medium=76 (25%), high=46 (15%) |
| **action_text length** | max=430 chars, all under 500 hard cap |
| **labelers** | 11 distinct (1 main-session × 51 entries + 10 parallel subagents × 25 each) |

**Known v1 properties (deliberate, documented):**

- **Product skew.** `claude-code` (80) + `cursor` (31) + `claude-agent-sdk-typescript` (28) = ~46% of entries — these are the most-active changelogs in the corpus and the most relevant to downstream consumers. Stratification is by `kind`, not by `product`.
- **Thin `performance` class (n=6).** 80/20 stratification yields ~5 train / 1 holdout. Per-class eval signal is weak but the kind is preserved per the locked taxonomy. Future versions can augment by sampling more deliberate-optimization entries.
- **A3c review pass complete (2026-05-25).** 299 approved, 2 edited (1 kind correction + 1 severity correction), 0 rejected. Cross-family judge run via Ollama `qwen3:8b` (free, local, different model family from the Opus 4.7 labelers per Theme E of the v1.3 study swarm) achieved 92.4% agreement (278/301) — all 23 disagreements reviewed by the human reviewer; 22 confirmed original, 1 confirmed judge. The build script can now run without `--include-pending`. Provenance trail per entry: `reviewer: human+qwen3-judge-a3c`.

**v2 candidates (follow-ons surfaced during A3c review):**

These are NOT v1 blockers. They are dataset-construction improvements to apply when building the v2 dataset:

1. **Filter zero-signal section-anchor entries at corpus-ingest time.** 7 entries in v1 have `change_text` that is literally a markdown section heading (e.g. `"Deprecation (#deprecation)"`, `"Deprecated features and settings"`) from the github-copilot and vscode-copilot-chat HTML scrapers. These correctly classify as `kind: unknown` per locked rule 8 (cannot classify confidently from change_text alone), but they're training noise — the model doesn't need 7 reinforcements of "when input is just a heading, output unknown." Suggested ingest-time filter: `change_text.length < 80 AND change_text matches /^[A-Z][a-z]+ \(#[a-z-]+\)$/`. See `scripts/sample-candidates.mjs` for the right hook point.
2. **Schema gap on internal/CI-tooling changes.** The 8-kind enum has no clean home for "internal repo-tooling change with no consumer-facing surface" (e.g. Conventional Commits `ci:` scope changes). v1 routes these to `docs` as the closest defensible fit, but `docs` is literally for documentation changes and the label semantically misleads. Two options for v2: (a) add `internal` as a 9th kind, or (b) widen rule 6 to "documentation-only OR no consumer-facing surface change" with an explicit example. Option (b) preserves the 8-enum cap but requires SCHEMA.md wording update + decision-tree clarification.

## Conventions

- **One folder per dataset, one folder per version.** Datasets are immutable once published — `v1` never changes after release; `v2` is a new folder.
- **`entries/` holds curation-rich JSON, one per entry.** Reviewable individually, diffable, source-attested. The training JSONL is derived from these via a build script.
- **`training.jsonl` + `holdout.jsonl` + `manifest.json` are derived artifacts.** Generated from `entries/` by [`scripts/build-dataset.mjs`](../scripts/build-dataset.mjs). Do not edit by hand — they regenerate. Run with `--include-pending` while review is in progress; drop the flag once entries are approved.
- **Every entry cites its source.** Corpus-bound entries cite a change row in `data/claude-synergy.db` (`(product, version)` resolves via the canonical DB mapping — handles multi-package and scoped-npm cases). External-advisory entries use the `external-ghsa/*` or `external-cve/*` namespace and must carry a valid http(s) `source_url`. See [SCHEMA.md](./changelog-actions/SCHEMA.md) for the full rule.

## License

Same as claude-synergy (MIT). Datasets are public-domain-friendly so they can be used as eval data, fine-tune data, or republished standalone.

## See also

- [v1.3 architectural lock](../) — the research-grounded design that produced these datasets
- [backpropagate](https://github.com/mcp-tool-shop-org/backpropagate) — the LoRA fine-tuning library these datasets feed into
- [study-swarm findings](../) for the changelog→action synthesizer — Theme A through E
