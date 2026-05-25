#!/usr/bin/env python
"""
Manual LoRA → merged-HF export — bypasses backpropagate 1.4.0's broken
GGUF export path (UnboundLocalError in active_adapters during merge_and_unload
when the model was loaded with bnb 4-bit + the adapter applied twice).

This script does a clean single-pass merge:
  1. Load base Qwen2.5-7B-Instruct in bf16 on CPU (no 4-bit, no GPU — avoids
     both the double-PEFT bug AND the nvlddmkm driver crash risk that hit
     us at training end).
  2. Apply LoRA adapter from output/checkpoint-100 once via PeftModel.
  3. Call merge_and_unload() on the clean state.
  4. Save merged model + tokenizer + chat template to output/merged-hf/.

Output (output/merged-hf/) is then consumed by:
  ollama create cs-actions-base --experimental --quantize q4_K_M \\
      -f Modelfile-cs-actions-base

Ollama handles GGUF conversion + q4_K_M quantization internally, eliminating
the need for llama.cpp's convert_hf_to_gguf script (which backpropagate
expects but does not bundle).

Requires PYTHONUTF8=1 on Windows for the same trl-imports-without-encoding
bug that bit training (defensive — this script's path may not import trl,
but the cost is zero and the workaround is the same).
"""

from __future__ import annotations

import os
import shutil
import sys
import time
from pathlib import Path

# Defensive against any Windows cp1252 issue in dependent libraries.
os.environ.setdefault("PYTHONUTF8", "1")

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

# Anchor on the script's location (claude-synergy/scripts/manual-merge.py),
# so paths resolve correctly regardless of the CWD from which we are invoked.
PROJECT_ROOT = Path(__file__).resolve().parent.parent

BASE_MODEL = "Qwen/Qwen2.5-7B-Instruct"
ADAPTER_DIR = PROJECT_ROOT / "output" / "checkpoint-100"
OUTPUT_DIR = PROJECT_ROOT / "output" / "merged-hf"


def fail(msg: str) -> None:
    print(f"[FATAL] {msg}", file=sys.stderr)
    sys.exit(1)


def main() -> None:
    start = time.time()

    if not ADAPTER_DIR.exists():
        fail(f"Adapter directory not found: {ADAPTER_DIR.resolve()}")
    if not (ADAPTER_DIR / "adapter_config.json").exists():
        fail(f"adapter_config.json missing in {ADAPTER_DIR.resolve()}")
    if not (ADAPTER_DIR / "adapter_model.safetensors").exists():
        fail(f"adapter_model.safetensors missing in {ADAPTER_DIR.resolve()}")

    if OUTPUT_DIR.exists():
        print(f"Output {OUTPUT_DIR} exists — removing for clean re-merge...", flush=True)
        shutil.rmtree(OUTPUT_DIR)

    print(f"=== Manual merge started at +0s ===", flush=True)
    print(f"Base:    {BASE_MODEL}", flush=True)
    print(f"Adapter: {ADAPTER_DIR.resolve()}", flush=True)
    print(f"Output:  {OUTPUT_DIR.resolve()}", flush=True)
    print(flush=True)

    # Step 1: Load base in bf16 on CPU. CPU keeps us off the GPU entirely
    # (driver-stability insurance after the BSOD at training end) and the
    # merge is a one-shot matrix op — bf16 CPU is fast enough.
    print(f"[+{int(time.time()-start)}s] Loading base in bf16 on CPU (no GPU)...", flush=True)
    model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        torch_dtype=torch.bfloat16,
        device_map="cpu",
        low_cpu_mem_usage=True,
    )
    tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
    print(f"[+{int(time.time()-start)}s] Base loaded ({sum(p.numel() for p in model.parameters()) / 1e9:.2f}B params).", flush=True)

    # Step 2: Apply LoRA adapter once on the clean model.
    print(f"[+{int(time.time()-start)}s] Loading LoRA adapter...", flush=True)
    model = PeftModel.from_pretrained(model, str(ADAPTER_DIR))
    print(f"[+{int(time.time()-start)}s] Adapter applied.", flush=True)

    # Step 3: Merge adapter into base on the clean single-PEFT state.
    print(f"[+{int(time.time()-start)}s] Merging adapter into base (this is the step backprop crashed on)...", flush=True)
    model = model.merge_and_unload()
    print(f"[+{int(time.time()-start)}s] Merge complete.", flush=True)

    # Step 4: Save merged model + tokenizer in HF safetensors format.
    print(f"[+{int(time.time()-start)}s] Saving merged model to {OUTPUT_DIR}...", flush=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(
        str(OUTPUT_DIR),
        safe_serialization=True,
        max_shard_size="5GB",
    )
    tokenizer.save_pretrained(str(OUTPUT_DIR))

    # Copy the chat template from the training checkpoint — captures the
    # exact tokenizer state used during SFT, in case the base tokenizer's
    # default template drifted vs what training expected.
    chat_template_src = ADAPTER_DIR / "chat_template.jinja"
    if chat_template_src.exists():
        shutil.copy2(chat_template_src, OUTPUT_DIR / "chat_template.jinja")
        print(f"[+{int(time.time()-start)}s] Chat template copied from checkpoint.", flush=True)

    # Report final disk footprint.
    total_bytes = sum(f.stat().st_size for f in OUTPUT_DIR.rglob("*") if f.is_file())
    print(flush=True)
    print(f"=== Manual merge complete at +{int(time.time()-start)}s ===", flush=True)
    print(f"Merged model: {OUTPUT_DIR.resolve()} ({total_bytes / 1e9:.2f} GB)", flush=True)
    print(flush=True)
    print("Next step:", flush=True)
    print("  ollama create cs-actions-base --experimental --quantize q4_K_M \\", flush=True)
    print("      -f dataset/changelog-actions/v1/Modelfile-cs-actions-base", flush=True)


if __name__ == "__main__":
    main()
