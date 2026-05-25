# cs-actions:v1 evaluation spec

The model and the verifier ship as one artifact. This file pins the eval contract that determines whether a trained `cs-actions:v1` passes the release gate.

## Primary inference config

| Parameter | Value | Source |
|---|---|---|
| Model | `cs-actions:v1` (Ollama) | Built via [Modelfile.cs-actions-v1](./Modelfile.cs-actions-v1) on top of `cs-actions-base` |
| `temperature` | `0.0` | Locked in Modelfile |
| `num_predict` | `320` | Locked in Modelfile (measured ceiling: 237 tokens p100 + 35% headroom) |
| `format` | `"json"` | **Per-request — set by the caller, NOT inheritable from Modelfile.** Every call to `/api/generate` or `/api/chat` must include this. |
| Single sample | yes | No N=3 sampling; cross-family verifier handles tie-breaking, not internal randomness |

## Eval set

[`holdout.jsonl`](./holdout.jsonl) — 59 entries, stratified across all 8 kinds. Reproducibly derived from the 301-entry corpus via `scripts/build-dataset.mjs` at `build_seed: 2026052403` (captured in [manifest.json](./manifest.json)).

Per-kind holdout sizes:
- fix=19, feature=14, unknown=7, breaking=6, deprecation=5, security=4, docs=3, performance=1

Per-class signal is thin for `performance` (n=1) and `docs` (n=3); strong for `fix` / `feature` / `unknown`.

## Three eval runs (all required for release)

### Run 1 — Zero-shot floor: qwen3:8b vs ground truth on holdout

What it measures: how well the cross-family judge (qwen3:8b) classifies the holdout *without* any fine-tuned model in the loop. This is the baseline accuracy a generic 8B local model gets on the locked rules.

Mechanism: `scripts/judge-dataset.mjs` adapted to read holdout entries' input fields, feed qwen3:8b, compare its output to the entries' canonical `output.kind` + `output.severity`.

Result: a per-class confusion matrix + overall accuracy. **This is the floor the fine-tune must clear.**

### Run 2 — Release pass criterion: qwen3:8b vs cs-actions:v1 on holdout

What it measures: agreement between the cross-family verifier and the fine-tuned model on the *same* holdout entries. If qwen3 disagrees with cs-actions:v1 more often than it disagreed with the ground-truth labels (Run 1), the fine-tune is *worse* than zero-shot — release fails.

Mechanism: for each holdout entry, feed both qwen3:8b (with prompt-only) and cs-actions:v1 (the fine-tune). Compare both outputs. Report:
- Agreement rate between the two models
- Per-class precision/recall of cs-actions:v1 vs ground truth
- Per-class precision/recall of qwen3:8b vs ground truth (same as Run 1, recomputed for sanity)

**Release pass criterion:** `(qwen3-vs-cs-actions agreement) ≥ (qwen3-vs-ground-truth agreement)`.

This is the cleanest framing of "fine-tune is at least as classifiable as the original labels." If the fine-tune produces labels qwen3 disagrees with *more* than it disagrees with ground truth, the fine-tune learned the wrong thing.

#### Note on the 92.4% baseline

The 92.4% agreement we measured during A3c was qwen3:8b vs Opus 4.7 labelers on the **301-entry training corpus**. That number is **not** the release threshold — different surface (training vs holdout) and different generators (Opus labelers vs cs-actions:v1 fine-tune). Run 1 establishes the actual holdout baseline; Run 2's pass criterion is relative to Run 1, not to the 92.4%.

### Run 3 — kind_hint ablation: rule-internalization vs prior-leaning

What it measures: how much of the fine-tune's accuracy comes from learning the locked rules vs leaning on the upstream `kind_hint` as a shortcut.

Mechanism: run Run 2 twice on the same 59 holdout entries:
- **Variant A:** standard inference with `Kind hint: <real value>` in the user prompt
- **Variant B:** same inference with `Kind hint: omitted` (literal string)

Report per-class F1 for both variants. The decision tree:

| F1 delta (A − B) | Interpretation | Action |
|---|---|---|
| `> 15 pts` | Fine-tune leans heavily on `kind_hint` as a shortcut. The locked rules are not fully internalized. | **v2 should hint-randomize** — train a fraction of entries with `kind_hint: omitted` or scrambled so the model becomes robust to upstream parser changes. |
| `5–15 pts` | Mixed — model uses the hint as a useful prior but also applies rules. Acceptable for v1. | Ship v1 unchanged; consider hint-randomization for v2 if downstream consumers report hint-driven errors. |
| `< 5 pts` | Rules fully internalized; hint is decoration not load-bearing. | Strongest result — v1 is robust. |

#### Why this matters

The naive-passthrough check showed `kind_hint` is a **74% correct prior** on clean-mappable hints (`fixed→fix`, `added→feature`, etc.) — accurate enough that a model could shortcut to high accuracy by trusting the hint. The locked rules earn their keep on the 26% where the prior is wrong (e.g. `fixed→security` for CVE-class fixes — the coordinated cross-SDK debug-log redactions) and on the 153 entries with ambiguous hints (`changed`, `improved`) where passthrough is impossible. The ablation tells us whether the trained model captured both behaviors or just the prior.

## Failure-mode triage

If any of the three runs fail the release criterion, the diagnosis tree:

| Failure | Likely cause | Next move |
|---|---|---|
| Run 1 accuracy < 60% on a class | Locked rules genuinely ambiguous for that class | Re-spec the rules for that class, OR augment v2 with more examples |
| Run 2 fails (cs-actions vs qwen3 < zero-shot) | Fine-tune learned wrong patterns (overfit, label noise, schema drift) | Re-run training with adjusted LoRA rank / fewer steps; check `training.jsonl` for systematic mislabels via Run 1 disagreements |
| Run 3 F1 delta > 15 pts | Model is a hint-shortcutter | v2 hint-randomization (described above); does NOT block v1 ship — document the limitation in release notes |
| Sample-size variance dominates `performance` / `docs` classes | Holdout too small (1 / 3 entries) | Accept the noise; per-class signal is thin by design at n=301 |

## Eval implementation notes

- `scripts/judge-dataset.mjs` already supports the qwen3:8b inference for Run 1 — adapt to read holdout entries (currently reads `entries/`).
- A new `scripts/eval-cs-actions.mjs` will run Runs 2 and 3 against the fine-tune once it exists in Ollama. Should emit a JSON eval-report alongside `judge-report.json` and `manifest.json` so the release artifact is reproducible end-to-end.
- All three eval runs should use the same `build_seed` for holdout selection so reruns are byte-identical.

## Release artifact

When cs-actions:v1 ships, the artifact bundle is:
- `cs-actions:v1` in Ollama (or pushed to Ollama Library)
- `Modelfile.cs-actions-v1` (this directory)
- `EVAL.md` (this file)
- `eval-report.v1.json` (the three eval-run outputs)
- `manifest.json` (training data provenance)
- `training.jsonl` + `holdout.jsonl` + `judge-report.json` (the training-data lineage)

Anyone reproducing the model can re-derive the train/holdout split (build seed in manifest), re-run the eval (this spec), and verify the release-pass criteria held.
