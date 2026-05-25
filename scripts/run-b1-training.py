#!/usr/bin/env python
# Phase B1: fine-tune Qwen2.5-7B-Instruct LoRA on cs-actions v1 training set.
#
# Invoked by scripts/run-b1.sh (the bash wrapper that also handles export +
# Ollama registration). This script does ONLY the training step.
#
# Environment: requires the E:/AI/backpropagate-venv Python 3.12 venv with
# backpropagate==1.4.0 and torch==2.11.0+cu128. Run via:
#   /e/AI/backpropagate-venv/Scripts/python scripts/run-b1-training.py
#
# Output: ./output/lora/ — LoRA adapter weights.

import sys
import time

from backpropagate import Trainer

START = time.time()
print(f"=== B1 training started ===", flush=True)
print(f"Python: {sys.version}", flush=True)

# Instantiate trainer — does not load model weights yet.
print("Instantiating Trainer for Qwen/Qwen2.5-7B-Instruct...", flush=True)
trainer = Trainer("Qwen/Qwen2.5-7B-Instruct")
print(f"Trainer instantiated at +{int(time.time()-START)}s", flush=True)

# Train. backpropagate.Trainer.train() downloads the base model on first run
# (cached in HF_HOME=C:\vLLM\cache — Qwen2.5-7B-Instruct already cached per
# pre-flight, so no download time). Default LoRA preset is rank-256 / all-linear
# (Biderman 2024 + Thinking Machines 2025 finding).
print("Starting trainer.train() — steps=100...", flush=True)
trainer.train(
    "dataset/changelog-actions/v1/training.jsonl",
    steps=100,
)
print(f"=== B1 training complete at +{int(time.time()-START)}s ===", flush=True)
