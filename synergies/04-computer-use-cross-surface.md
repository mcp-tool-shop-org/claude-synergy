---
name: computer-use-cross-surface
title: Computer Use across Code / API / Claude.ai / Cowork
products: [claude-code, claude-api, claude-chat, claude-cowork]
trigger: User needs browser/desktop automation and wants to choose the right surface for prototyping vs production
status: confirmed
last_validated: 2026-05-21
---

# Computer Use across Code / API / Claude.ai / Cowork

**Why it works:** Computer Use is one underlying capability with four delivery surfaces. Pick the surface that matches stage and access model: Code MCP for prototyping with full local control, API for production headless automation, Claude.ai Pro/Max for ad-hoc tasks with zero setup, Cowork for team workflows on shared screens.

**Workflow:**

1. **Prototype in Claude Code** via the `computer-use` MCP server — fast iteration, all the typical Code tooling (skills, hooks, memory) available alongside
2. **Test in Claude.ai (Pro/Max)** — no setup, single-turn or short multi-turn tasks; good for verifying the agent's perception of the screen is correct
3. **Graduate to Claude API** for production: use the `computer_20250124` tool with the `computer-use-2025-01-24` beta header. Headless, scalable, billed per-call
4. **Distribute via Cowork** for team workflows — Cowork added Computer Use research preview on 2026-03-23, enabling shared-screen team automation
5. The agent prompt and skill definitions can stay constant across surfaces; only the invocation path changes

**Evidence:**

- [Anthropic Apps release notes 2026-03-23](https://support.claude.com/en/articles/12138966-release-notes): "Computer use research preview in Cowork and Claude Code + Dispatch improvements... Give Claude access to computer use for Pro and Max plans"
- [Claude API release notes 2025-02-24](https://platform.claude.com/docs/en/release-notes/overview#february-24th-2025): `computer_20250124` updated tool with "hold_key, left_mouse_down, left_mouse_up, scroll, triple_click, wait" commands
- [computer-use MCP available in Code](https://code.claude.com/docs/en/agent-view) — see MCP servers list

**Caveats:**

- Computer Use carries real safety considerations — agents can take destructive actions; always start with read-only scope (`request_access` tier "read") and escalate
- Tier-"read" browsers and tier-"click" terminals/IDEs limit what computer-use can do inside them per the global computer-use protocol (see [user CLAUDE.md](C:/Users/mikey/.claude/CLAUDE.md) for the rule)
- Cost differs significantly across surfaces — Claude.ai is included in Pro/Max; API is per-call; Code MCP is included in the Code subscription
- Link-clicking via computer use is disallowed for safety; use the claude-in-chrome MCP for verified link navigation
