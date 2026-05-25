# cs-actions:v1 training reproducibility

This file pins what's required to re-derive the v1 LoRA adapter from this dataset on a fresh machine. Sibling to [EVAL.md](./EVAL.md) (which covers the post-training eval contract).

## Environment

| Component | Version |
|---|---|
| Python | 3.12 (3.12.10 verified; 3.10–3.12 should work; **3.13 untested**, 3.14 broken — Unsloth's `@torch.compile` is not supported on 3.14+) |
| backpropagate | 1.4.0 (the v1 reference; v1.2.0+ should also work — earlier versions untested) |
| torch | 2.11.0+cu128 (the cu128 wheel index does not yet carry 2.12.0; pin to 2.11.0+cu128 explicitly to avoid CPU fallback during resolution) |
| CUDA driver | 12.8+ on host (verified on 5080 with driver 592.27 / CUDA 13.0; `torch.cuda.is_available()` returns True) |
| Base model | `Qwen/Qwen2.5-7B-Instruct` (~14 GB; downloaded automatically from HF on first `Trainer.train()` if not cached) |
| HF cache | `HF_HOME` env var if set, else `~/.cache/huggingface/hub/`. Pre-populate to skip the 14 GB download. |

## Setup (clean machine)

```bash
# 1. Create isolated venv
uv venv --python 3.12 /path/to/backpropagate-venv

# 2. Install CUDA torch FIRST from the pytorch.org index (avoids CPU fallback
#    when backpropagate's resolver later picks default-PyPI torch)
uv pip install --python /path/to/backpropagate-venv \
    "torch==2.11.0+cu128" --index-url https://download.pytorch.org/whl/cu128

# 3. Install backpropagate (resolves transitively: unsloth, transformers, peft, trl, accelerate, ...)
uv pip install --python /path/to/backpropagate-venv "backpropagate==1.4.0"

# 4. Verify CUDA + Trainer imports
/path/to/backpropagate-venv/Scripts/python -c \
    "import torch; print('cuda:', torch.cuda.is_available()); from backpropagate import Trainer; Trainer('Qwen/Qwen2.5-7B-Instruct'); print('Trainer OK')"
```

## Training command

```python
# scripts/run-b1-training.py — included in this repo
from backpropagate import Trainer
trainer = Trainer("Qwen/Qwen2.5-7B-Instruct")
trainer.train("dataset/changelog-actions/v1/training.jsonl", steps=100)
```

Output: `./output/lora/` (LoRA adapter weights).

## ⚠ Windows reproducibility caveat — `PYTHONUTF8=1` required

**On Windows hosts, `PYTHONUTF8=1` must be set before invoking `Trainer.train()`.**

Without it, `trl`'s `chat_template_utils.py` reads `deepseekv3.jinja` via `Path.read_text()` without specifying an encoding — defaulting to the locale codec (cp1252 on Windows), which can't decode the UTF-8 bytes in the Jinja template. The training run fails with:

```
UnicodeDecodeError: 'charmap' codec can't decode byte 0x81 in position 932
  → trl/chat_template_utils.py:314
  → trl/trainer/sft_trainer.py:50 import fails
  → backpropagate.Trainer.train() raises ModelLoadError
```

This is an upstream `trl` bug exposed by `backpropagate` on Windows. Three layers it could be fixed at:

1. **`trl` upstream** — `read_text(encoding='utf-8')`. The real fix.
2. **`backpropagate`** — set `PYTHONUTF8=1` inside `Trainer.__init__()` before importing trl, OR document in handbook/troubleshooting.
3. **Invocation** — `PYTHONUTF8=1 python scripts/run-b1-training.py`. The current v1 workaround.

Not required on Linux/macOS (locale defaults are typically UTF-8). **The reproducibility claim from this dataset's `manifest.build_seed` is byte-identical from seed + data on Linux; on Windows it additionally requires `PYTHONUTF8=1` in the environment.**

## ⚠ Known platform issue — RTX 50-series NVIDIA driver crash on training teardown

**On RTX 50-series GPUs (Windows, driver 592.27), `nvlddmkm.sys` may crash with BSOD 0x1E (KMODE_EXCEPTION_NOT_HANDLED) immediately after `trainer.train()` returns.** Observed on the v1 build run: checkpoint saved cleanly at step 100, then the driver faulted during the Python process's GPU-memory release path. Event 14 from `nvlddmkm` fires ~20 seconds after the last training write; minidump shows a near-null pointer dereference at offset 0x28 (classic uninit-pointer signature).

The crash does NOT corrupt the saved checkpoint — `output/checkpoint-100/` survived intact (1.29 GB `adapter_model.safetensors`, full LoRA), so v1 was completable from the post-crash state without retraining. But it cost a reboot mid-pipeline and could destabilize a multi-run training campaign.

**Suspected trigger** (NOT root-cause-verified): bitsandbytes 4-bit (nf4) quantization + non-flash-attention fallback path on RTX 50-series. The training log noted `Padding-free training is enabled, but the attention implementation is not set to a supported flash attention variant. ... Using other implementations may lead to unexpected behavior.` That combination — bnb-4bit + SDPA-instead-of-flash-attn + sustained 100% GPU util — is known-stressful on this hardware generation and may be exercising a latent NVIDIA driver bug.

**v2 platform investigation deferred** (NOT a v1 blocker):
- Does the crash reproduce on every B1-style training, or only first-time-after-cold-driver?
- Does forcing `attn_implementation="flash_attention_2"` (requires `flash-attn` install) avoid it?
- Does newer NVIDIA driver (>592.27) fix the kernel-mode fault?
- Does WSL2 or native Linux on the same hardware sidestep it entirely?
- Should v2 default to bf16 LoRA (no bnb-4bit) when VRAM allows, to take bitsandbytes out of the failure surface?

The eval pipeline (post-training) uses Ollama's llama.cpp runner instead of bitsandbytes-via-PyTorch and has not exhibited the same crash signature, but the same hardware-generation risk applies. Save intermediate eval state if running long sweeps.

## Full pipeline (training → Ollama-deployable model)

**The originally-documented `backprop export --format gguf --ollama` path is BROKEN in backpropagate 1.4.0** — see "Why this isn't the backprop one-liner" below. The v1 ship pipeline is a 4-step manual chain:

```bash
# Stage A: Merge LoRA adapter into base model (CPU bf16, no GPU = avoids
# the nvlddmkm crash risk; ~3-5 min). Produces ~15 GB merged HF safetensors.
PYTHONUTF8=1 HF_HOME="C:/vLLM/cache" \
    /e/AI/backpropagate-venv/Scripts/python.exe -u scripts/manual-merge.py

# Stage B: Convert merged HF → GGUF via llama.cpp's convert script.
# Requires a llama.cpp clone (the standalone convert_hf_to_gguf.py is now a
# shim that imports from llama.cpp's source-tree `conversion/` package).
#   git clone --depth 1 https://github.com/ggml-org/llama.cpp.git /e/AI/llama.cpp-src
#   uv pip install --python /e/AI/backpropagate-venv gguf sentencepiece
cd /e/AI/llama.cpp-src && PYTHONUTF8=1 \
    /e/AI/backpropagate-venv/Scripts/python.exe -u convert_hf_to_gguf.py \
    /e/AI/claude-synergy/output/merged-hf \
    --outfile /e/AI/claude-synergy/output/cs-actions-base.q8_0.gguf \
    --outtype q8_0

# Stage B': Fix the GGUF's embedded general.name — the convert script
# title-cases the directory name into "Merged Hf" (with a space) which
# Ollama rejects as "invalid model name". Rewrite with a clean name:
/e/AI/backpropagate-venv/Scripts/gguf-new-metadata.exe \
    /e/AI/claude-synergy/output/cs-actions-base.q8_0.gguf \
    /e/AI/claude-synergy/output/cs-actions-base.q8_0.fixed.gguf \
    --general-name "cs-actions-base"
mv /e/AI/claude-synergy/output/cs-actions-base.q8_0.fixed.gguf \
   /e/AI/claude-synergy/output/cs-actions-base.q8_0.gguf

# Stage C: Register cs-actions-base in Ollama (loads GGUF + TEMPLATE block).
# NOTE: ollama 0.24.0 mis-parses `./relative` FROM paths as model-name
# references — Modelfile uses an ABSOLUTE path. Adjust for your local clone.
cd /e/AI/claude-synergy && ollama create cs-actions-base \
    -f dataset/changelog-actions/v1/Modelfile-cs-actions-base

# Stage D: Layer deployment config (temperature, system prompt, num_predict)
# to produce the final cs-actions:v1.
ollama create cs-actions:v1 \
    -f dataset/changelog-actions/v1/Modelfile.cs-actions-v1
```

See [Modelfile-cs-actions-base](./Modelfile-cs-actions-base) for the chat-TEMPLATE detail (Ollama 0.24.0 does NOT auto-read the GGUF's embedded `tokenizer.chat_template` — must be explicit), and [Modelfile.cs-actions-v1](./Modelfile.cs-actions-v1) for the deployment parameters. Once `cs-actions:v1` exists in Ollama, [EVAL.md](./EVAL.md) describes the three release-gate eval runs.

### Why this isn't the backprop one-liner

The `backprop export --format gguf --ollama` path documented in earlier drafts hits **two compounding bugs in backpropagate 1.4.0**:

1. **`UnboundLocalError: active_adapters`** in `backpropagate/export.py:1297` — when loading from a bnb-4bit training checkpoint, `Trainer.__init__` applies the adapter once and `export_gguf` applies it again ("You are trying to modify a model with PEFT for a second time"), leaving `merge_and_unload()` in an inconsistent state where its `active_adapters` local var is never assigned.
2. **Missing `llama.cpp/convert_hf_to_gguf` bundling** — even if (1) were fixed, the manual fallback path in `export_gguf` line 1312 calls llama.cpp's convert script which backprop does not bundle. End user gets "convert script not found" downstream.

Adjacent issues exercised by the same path: `ollama create --experimental --quantize q4_K_M` on the same safetensors output produces a model that fails at runtime with `mlx runner failed: unsupported architecture: Qwen2ForCausalLM` (Ollama 0.24.0 selects an MLX runner for `--experimental` imports even on Windows where MLX doesn't exist).

The 4-step manual chain above sidesteps all of these. Once backprop 1.5.0+ ships fixes (TBD), the chain can collapse back to `backprop export --ollama` — but the Ollama-side manual GGUF import will likely remain the cleaner Windows path regardless.

## Wall-clock budget on this rig (RTX 5080 Laptop, 16 GB VRAM)

Used as a sanity reference for future re-tunes, not a guarantee:

| Stage | Estimate (measured on v1 build) |
|---|---|
| HF model load (first time) | ~14 GB download / ~30 s if cached |
| Trainer init + model load to GPU | ~60 s |
| Training: 100 steps on 242 examples, QLoRA Qwen2.5-7B | ~78 min (4.7s avg/step measured) |
| Stage A — manual-merge.py (CPU bf16) | ~3:15 (load 2s + adapter 9s + merge 18s + 4-shard save 168s) |
| Stage B — convert_hf_to_gguf.py → q8_0 | ~4:30 (8.1 GB sequential write at ~30 MB/s) |
| Stage B' — gguf-new-metadata name fix | ~1:30 (8.1 GB sequential rewrite at ~95 MB/s) |
| Stage C — ollama create cs-actions-base | ~30 s (copies blob, parses GGUF, writes manifest) |
| Stage D — ollama create cs-actions:v1 | ~5 s (manifest-only) |

Total measured v1 build (warm, cached base, no driver crash): training ~78 min + post-training pipeline ~10 min = **~88 min**. Add ~30 min if HF cache cold. Add ~30 min reboot + recovery if `nvlddmkm` crashes (see Known platform issue above).

## When to re-train (and stay on v1 vs go to v2)

- **Re-train v1 from scratch** if you want a byte-identical reproduction (seed locks split + LoRA initialization deterministic per `backpropagate` defaults).
- **Re-tune v1 with different hyperparameters** (steps, LoRA rank, etc.) and ship as `cs-actions:v1.1`. The dataset is unchanged.
- **Cut a v2 dataset** for any of: schema changes (new `kind` enum value), new training data (more entries, especially OOD-flagged + hint-randomized per [EVAL.md](./EVAL.md) Run 3 zone), or quality bar raise (re-review existing entries). v2 dataset → v2 fine-tune is a coupled bump.
