---
name: agent-sdk-graduation
title: Prototype in Claude Code, graduate to standalone Agent SDK app
products: [claude-code, claude-agent-sdk-python, claude-agent-sdk-typescript]
trigger: User has a working agentic workflow in Claude Code CLI and wants to ship it as a standalone product or backend service
status: confirmed
last_validated: 2026-05-21
---

# Prototype in Claude Code, graduate to standalone Agent SDK app

**Why it works:** Claude Code IS an Agent SDK app — it's built on `claude-agent-sdk-typescript` (v0.3.147 = parity with Code 2.1.147). The agent behavior you prototype in the CLI is byte-identical to what you'd ship via the SDK, because they share the same bundled binary. Graduation is mostly packaging + UI choice, not re-engineering.

**Workflow:**

1. **Prototype in Claude Code CLI.** Build skills, hooks, MCP servers, tune prompts. Use Code's full ergonomics (memory, agents view, /goal, transcript).
2. **Identify what's stable.** Pin to a known-good Claude Code CLI version (the SDK release notes show which CLI version each SDK release bundles)
3. **Pick the SDK** — `claude-agent-sdk-python` for Python/data-heavy/Ollama-adjacent shops, `claude-agent-sdk-typescript` for web/Bun/Node deployments
4. **Translate session config to SDK options.** Skills directory, MCP server config, permission rules, hooks — all the same shape, just declared in code instead of `~/.claude/`
5. **Add the UI layer** the CLI didn't need: HTTP API, web UI, scheduled jobs, queue workers, etc.
6. **Optional: self-hosted sandbox.** For production agent workloads, run via [Claude Managed Agents with a self-hosted sandbox](https://platform.claude.com/docs/en/managed-agents/self-hosted-sandboxes) (2026-05-19) instead of Anthropic-hosted

**Evidence:**

- [claude-agent-sdk-typescript v0.3.147 release](https://github.com/anthropics/claude-agent-sdk-typescript/releases/tag/v0.3.147): "Updated to parity with Claude Code v2.1.147"
- [claude-agent-sdk-python releases](https://github.com/anthropics/claude-agent-sdk-python/releases) — bundled CLI version visible in each release body
- [Claude Managed Agents launch (2026-04-08)](https://platform.claude.com/docs/en/release-notes/overview#april-8-2026): "fully managed agent harness for running Claude as an autonomous agent with secure sandboxing, built-in tools, and server-sent event streaming"

**Caveats:**

- 🚨 **Breaking change to audit before graduation:** [claude-agent-sdk-python v0.2.82 (2026-05-15)](https://github.com/anthropics/claude-agent-sdk-python/releases/tag/v0.2.82) replaced `TodoWrite` with `TaskCreate`/`TaskUpdate`/`TaskGet`/`TaskList` in headless+SDK mode. Anything wrapping the event stream and parsing `TodoWrite` is broken. See [URGENT_FINDINGS.md](../URGENT_FINDINGS.md).
- MCP server connect is non-blocking by default since v0.2.82 — mark `alwaysLoad: true` for servers required in turn 1, or set `MCP_CONNECTION_NONBLOCKING=0` to revert
- SDK release cadence is high (often daily); pin to a specific version, don't track latest in production
- The TypeScript SDK has multiple sub-packages tagged differently (`sdk-vX.Y.Z`, `vertex-sdk-vX.Y.Z`, `bedrock-sdk-vX.Y.Z`) — pick the right one for your deployment target
