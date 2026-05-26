---
title: cs-actions:v1 (fine-tuned synthesizer)
description: Fine-tuned changelog → action synthesizer derived from the claude-synergy corpus. Local Ollama deployment, eval numbers, known v1 limitations.
sidebar:
  order: 5
---

`cs-actions:v1` is a small fine-tuned model that converts **one changelog entry** into **one structured action item**: `{kind, severity, subject, action_text, deadline, tags}`. It ships as a separate artifact from the corpus (runs locally in Ollama, ~5 GB on disk q8_0) but is **built from** and **reproducible from** the [`dataset/changelog-actions/v1/`](https://github.com/mcp-tool-shop-org/claude-synergy/tree/main/dataset/changelog-actions/v1) directory in this repo.

The dataset is the artifact; the model is downstream. A future v2 can re-tune on a newer base without touching the dataset.

## What it does

Input — one change-bullet from the corpus:

```text
Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and cloud
provider credentials from subprocess environments before execution.
```

Output — one strict-JSON action item:

```json
{
  "kind": "security",
  "severity": "high",
  "subject": "subprocess env scrub flag",
  "action_text": "Set `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` in environments where subprocess invocations may inherit Anthropic or cloud provider credentials.",
  "deadline": null,
  "tags": ["claude-code", "env-var", "credentials"]
}
```

The 8-enum `kind` taxonomy is locked: `breaking | deprecation | security | feature | fix | performance | docs | unknown`. See [`SCHEMA.md`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/SCHEMA.md) for the field-by-field contract and [`STYLE.md`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/STYLE.md) for the writing rules `action_text` follows.

## Eval results (59-entry stratified holdout)

Three release-gate runs, all passed, zero parse errors across the holdout. Full per-entry verdicts in [`eval-report.v1.json`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/v1/eval-report.v1.json) — attached as a single-file download on the [`cs-actions-v1` GitHub Release](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1).

### Run 2 — release gate (qwen3:8b cross-family judge vs cs-actions:v1)

| Metric | qwen3:8b base | cs-actions:v1 | Delta |
|---|---|---|---|
| Kind agreement vs ground truth | 78.0% | **88.1%** | +10.1pp |
| Severity agreement vs ground truth | 52.5% | **79.7%** | +27.2pp |
| Macro-F1 (well-populated classes) | 0.801 | **0.854** | +0.053 |
| `qwen3-vs-cs-actions` kind agreement | — | 78.0% | — |

**Release pass criterion:** `qwen3-vs-cs-actions` ≥ `qwen3-vs-GT` (`0.780 ≥ 0.780`) — PASS ✓. The cross-family judge agrees with cs-actions:v1 at least as often as it agrees with ground truth, so the fine-tune isn't overfit to a within-family verifier.

### Run 3 — kind-hint ablation (rule-internalization vs prior-leaning)

| Variant | macro-F1 |
|---|---|
| A — with kind hint | **0.842** |
| B — hint omitted | 0.777 |
| Delta | 6.5 pts → zone 5-15pt (target) |

A small delta means the model uses the hint when present but doesn't collapse when it's missing. The target zone (5–15 pts) avoids two failure modes: a tiny delta (model ignores the hint, hint signal wasted) and a huge delta (model leans on the hint as a shortcut, behavior degrades on hint-free inputs).

### Diagnostic — line 58 (claude-code 2.1.7 MCP tool search auto mode)

| Verdict source | kind |
|---|---|
| Ground truth | `breaking` |
| qwen3:8b base | `performance` (keyword-anchored on "reduces context") |
| cs-actions:v1 | `breaking` ✓ |

cs-actions:v1 learned [locked rule 3 from the schema](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/SCHEMA.md): **a default-flip in agent-visible behavior is `breaking` even when the surface diff reads like a performance optimization**. The base model keyword-anchored on "reduces context" and missed the default change.

## Known v1 limitation — anti-`unknown` bias

`unknown` is the **only** class where cs-actions:v1 did worse than the qwen3:8b base.

| | qwen3:8b base | cs-actions:v1 |
|---|---|---|
| `unknown` F1 | 0.545 | **0.444** |
| Precision | 0.750 | **1.000** |
| Recall | 0.429 | **0.286** |

**What this means.** When cs-actions:v1 outputs `kind: "unknown"`, it's always right (precision 1.000). But it under-flags ambiguous inputs — it catches only 2 of 7 true-unknowns in the holdout (recall 0.286). The model commits to a specific kind rather than abstain.

**Why.** Inherited qwen-family classifier prior, not fully overridden by the LoRA despite the dataset's strong reinforcement of locked rule 8 ("use `unknown` when input is genuinely ambiguous"). The same anti-`unknown` signal was visible in the qwen3:8b A3c judge during dataset review.

**What to do.** Downstream consumers should treat a **lower-than-expected `kind: "unknown"` rate** as a signal that ambiguous inputs are being mis-categorized — route low-confidence outputs to human review. The v2 plan ([`dataset/README.md`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/README.md) v2 candidates 3 + 4) addresses this with unknown-class augmentation plus hint-randomization in training.

Two other documented v1 properties: a small inherited qwen-family bias signal (`qwen3-vs-cs-actions` = `qwen3-vs-GT` = 0.780 on n=59) and thin per-class signal for `docs` (n=3) and `performance` (n=1) holdout supports — macro-F1 0.842 is the better aggregate.

## Running it locally

`cs-actions:v1` is **not redistributable through this repo** — the q8_0 GGUF is ~5 GB and the merged bf16 safetensors checkpoint is ~15 GB. The dataset and the build pipeline are what's published; the model is rebuilt locally per the steps in [TRAINING.md](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/v1/TRAINING.md).

Once built and registered with Ollama on your machine, calling it looks like this:

```bash
ollama run cs-actions:v1
```

For programmatic use, **every caller must pass `format: "json"` per request** — this is enforced at the caller, not in the Modelfile (Ollama's `format=json` is a per-request `/api/generate` parameter, not a `PARAMETER` directive). Without it, ~5-10% of outputs carry stray markdown fences or prose preamble and break `JSON.parse` downstream.

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "cs-actions:v1",
  "prompt": "Added CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1 to strip Anthropic and cloud provider credentials from subprocess environments before execution.",
  "format": "json",
  "stream": false
}'
```

The deployment Modelfile ([`Modelfile.cs-actions-v1`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/v1/Modelfile.cs-actions-v1)) pins `temperature 0.0` (deterministic greedy sampling — same input → byte-identical output), `num_predict 320` (measured 35% headroom over the longest training output), and `repeat_penalty 1.0` (disabled — structured JSON has legitimate token repetition that would distort).

## Rebuilding it (4-stage manual pipeline)

The current `backpropagate` 1.4.0 GGUF-export path is broken for bnb-4bit checkpoints (double-PEFT-load `UnboundLocalError: active_adapters`). Until that's fixed, the build is a 4-stage manual chain documented in [TRAINING.md](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/v1/TRAINING.md):

1. **Train** — `PYTHONUTF8=1 python scripts/run-b1-training.py` produces `output/checkpoint-100/` (Qwen2.5-7B + LoRA rank-256 / all-linear, 100 steps QLoRA, ~78 min warm on RTX 5080 Laptop 16 GB VRAM). Final loss 0.077, token_accuracy 97.7%.
2. **Merge** — `PYTHONUTF8=1 HF_HOME=... python scripts/manual-merge.py` produces `output/merged-hf/` (15 GB bf16 safetensors, CPU-only — defensive against driver crash).
3. **Convert + name-fix** — `python E:/AI/llama.cpp-src/convert_hf_to_gguf.py output/merged-hf --outfile output/cs-actions-base.q8_0.gguf --outtype q8_0`, then `gguf-new-metadata --general-name cs-actions-base` (the convert script title-cases `merged-hf` → `"Merged Hf"` which Ollama rejects as an invalid model name).
4. **Ollama register** — `ollama create cs-actions-base -f Modelfile-cs-actions-base` then `ollama create cs-actions:v1 -f Modelfile.cs-actions-v1`.

**Total warm-build budget:** ~88 minutes. TRAINING.md captures the full venv setup, Python/torch/CUDA pins, the Windows `PYTHONUTF8=1` requirement (upstream `trl` cp1252 bug), and four `Ollama 0.24.0` / `backpropagate 1.4.0` pitfalls — including `FROM ./relative` parsing, missing `chat_template` auto-read, and the experimental safetensors importer's MLX-only Qwen2 routing.

## Pointers

- **Dataset overview** — [`dataset/README.md`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/README.md): distribution table, v1 properties, anti-`unknown` bias detail, full v2 candidates list (5 items).
- **Schema + style** — [`SCHEMA.md`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/SCHEMA.md) (8-enum `kind` taxonomy + locked rules) and [`STYLE.md`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/STYLE.md) (`action_text` rules).
- **Reproducibility** — [`TRAINING.md`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/v1/TRAINING.md) (full build pipeline) and [`EVAL.md`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/v1/EVAL.md) (three-run release-gate contract).
- **Eval results** — [`eval-report.v1.json`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/v1/eval-report.v1.json) (per-entry verdicts + confusion matrices for all three runs); also attached as a single-file download on the [`cs-actions-v1` GitHub Release](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1).
- **Modelfiles** — [`Modelfile-cs-actions-base`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/v1/Modelfile-cs-actions-base) (base GGUF wrapper, locks tokenizer + chat template) and [`Modelfile.cs-actions-v1`](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/dataset/changelog-actions/v1/Modelfile.cs-actions-v1) (deployment config: temperature, num_predict, system prompt).
