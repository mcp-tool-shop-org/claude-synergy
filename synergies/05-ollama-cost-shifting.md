---
name: ollama-cost-shifting
title: Local Ollama as cost-shifting compute partner
products: [claude-code, ollama-intern-mcp]
trigger: User has bulk analysis to run (repo scans, summarization, fixture generation) and wants to conserve Claude tokens for judgment
status: confirmed
last_validated: 2026-05-21
---

# Local Ollama as cost-shifting compute partner

**Why it works:** Claude is premium reasoning + judgment, priced accordingly. Local Ollama (running on Mike's 5080 / M5 Max) is effectively free compute, capable enough for bulk text tasks. The synergy is splitting the work: Claude orchestrates and decides, Ollama executes the long-tail.

This is a Mike-specific synergy (not an Anthropic-product synergy) because the bridge tool is Mike's own [`ollama-intern-mcp`](F:/AI/ollama-intern-mcp) — but the *pattern* generalizes to any locally-hosted small model.

**Workflow:**

1. Claude Code session needs bulk work done (analyze 50 files, summarize a 100k-line log, generate test fixtures)
2. Claude invokes `ollama-intern-mcp` tools via MCP — `ollama_extract`, `ollama_batch`, `ollama_pack` etc. (28 primitive tools, frozen v1.0.2)
3. Ollama (8B, 12B, 70B depending on task) does the heavy lift locally — no API tokens consumed
4. Returns structured output to Claude
5. Claude reviews, integrates findings, makes the judgment call
6. **(Optional) Hermes integration** — for longer-context summarization workloads, ollama-intern-mcp can route to a Hermes model with extended context

**Evidence:**

- [ollama-intern-mcp skill description](C:/Users/mikey/.claude/skills/ollama-intern/SKILL.md): "28 frozen primitive tools (15 atoms + 3 briefs + 3 packs + 7 artifact tools) for delegating bulk analysis to a local Ollama model. Hermes integration, incident pack, change pack, repo pack, delegate to 8B"
- [Self-hosted sandboxes for Claude Managed Agents (2026-05-19)](https://platform.claude.com/docs/en/release-notes/overview#may-19-2026) — same pattern at the API layer; Anthropic now supports self-hosted execution sandboxes for Managed Agents
- TranslateGemma 12B local pattern proven for translation workloads ([global CLAUDE.md translation rule](C:/Users/mikey/.claude/CLAUDE.md))

**Caveats:**

- Local model quality is the floor — don't delegate judgment-grade tasks to 8B and expect Claude-quality output
- Cold-load latency for Ollama models can dwarf the work itself for small jobs; warm the model before batch dispatch
- Cross-rig setup matters — M5 Max has 128GB unified memory (TRELLIS.2 1024³ capable), 5080 has 16GB VRAM; task routing should respect rig capability
- When this graduates to API Managed Agents (per the 2026-05-19 self-hosted sandbox launch), the *same architectural pattern* applies — Anthropic-orchestrated agent, self-hosted execution
