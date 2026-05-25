# claude-synergy datasets

Curated datasets derived from the claude-synergy corpus. v1 of the first dataset — **changelog-actions** — ships in this directory and is the training data for the `cs-actions` family of fine-tuned Ollama models.

## Why these exist

The claude-synergy corpus today is ~1,171 release files / 6,573 change bullets from 37 AI-dev-tool changelogs. Reading them is one thing; **turning them into actionable adjustments for a specific repo or workflow** is a separate skill: classify the entry, extract entities, judge severity, produce a concrete next-step action with a deadline if one is implied. That skill is well-bounded enough to specialize a small model on it — which is what the v1 fine-tune does.

The dataset is the artifact. The fine-tuned model is downstream of it. Re-tune to a newer base model later (Qwen 3.5 / Phi 5 / whatever ships) without touching the dataset.

## Datasets in this directory

| Dataset | Status | Purpose | Schema |
|---|---|---|---|
| [`changelog-actions/v1`](./changelog-actions/) | **301 entries on disk, all `review_action: pending`** (A1 hand-curated 30 + A2 parallel-subagent 250 + A2.5 security-oversample 21). Pending A3 spot-check + freeze. | Train a small model that converts one changelog entry → one structured action item | [v1 schema](./changelog-actions/SCHEMA.md) · [style spec](./changelog-actions/STYLE.md) |

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
- **All entries are `pending`** until the A3 review pass marks them `approved` / `edited` / `rejected`. The build script runs with `--include-pending` during dev; production fine-tunes should drop the flag once review completes.

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
