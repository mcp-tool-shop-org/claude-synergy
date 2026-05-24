# claude-synergy datasets

Curated datasets derived from the claude-synergy corpus. v1 of the first dataset — **changelog-actions** — ships in this directory and is the training data for the `cs-actions` family of fine-tuned Ollama models.

## Why these exist

The claude-synergy corpus today is ~1,171 release files / 6,573 change bullets from 37 AI-dev-tool changelogs. Reading them is one thing; **turning them into actionable adjustments for a specific repo or workflow** is a separate skill: classify the entry, extract entities, judge severity, produce a concrete next-step action with a deadline if one is implied. That skill is well-bounded enough to specialize a small model on it — which is what the v1 fine-tune does.

The dataset is the artifact. The fine-tuned model is downstream of it. Re-tune to a newer base model later (Qwen 3.5 / Phi 5 / whatever ships) without touching the dataset.

## Datasets in this directory

| Dataset | Status | Purpose | Schema |
|---|---|---|---|
| [`changelog-actions/v1`](./changelog-actions/) | Building (Phase A1 — 30 seed entries) | Train a small model that converts one changelog entry → one structured action item | [v1 schema](./changelog-actions/SCHEMA.md) |

## Conventions

- **One folder per dataset, one folder per version.** Datasets are immutable once published — `v1` never changes after release; `v2` is a new folder.
- **`entries/` holds curation-rich JSON, one per entry.** Reviewable individually, diffable, source-attested. The training JSONL is derived from these via a build script.
- **`training.jsonl` + `holdout.jsonl` are derived artifacts.** Generated from `entries/` by `scripts/build-dataset.mjs`. Do not edit by hand — they regenerate.
- **Every entry cites its source `change_id`.** Faithfulness is the load-bearing primitive (per the v1.3 study swarm). Entries without a valid citation against the source corpus fail the build.

## License

Same as claude-synergy (MIT). Datasets are public-domain-friendly so they can be used as eval data, fine-tune data, or republished standalone.

## See also

- [v1.3 architectural lock](../) — the research-grounded design that produced these datasets
- [backpropagate](https://github.com/mcp-tool-shop-org/backpropagate) — the LoRA fine-tuning library these datasets feed into
- [study-swarm findings](../) for the changelog→action synthesizer — Theme A through E
