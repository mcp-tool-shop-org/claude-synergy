---
name: claude-code-orchestrates-aider
title: Claude Code orchestrates Aider for cost-shifted edits
products: [claude-code, aider]
trigger: User wants Claude's reasoning quality but cheaper actual edits (e.g. for repetitive refactors)
status: confirmed
last_validated: 2026-05-21
---

# Claude Code orchestrates Aider for cost-shifted edits

**Why it works:** [Aider](https://aider.chat) doesn't have a native MCP client, but [`disler/aider-mcp-server`](https://github.com/disler/aider-mcp-server) inverts the relationship: it wraps Aider AS an MCP server that Claude Code (or any MCP host) can call. Claude Code becomes the planner; Aider becomes the executor running cheaper models (Gemini 2.5 Flash, DeepSeek, GPT-5-mini, etc.) for the bulk of the edits.

**Workflow:**

1. Install Aider locally: `pip install aider-chat`
2. Install the MCP wrapper: `git clone https://github.com/disler/aider-mcp-server`
3. Register in Claude Code's `.mcp.json`:
   ```json
   {
     "mcpServers": {
       "aider": {
         "command": "python",
         "args": ["/path/to/aider-mcp-server/server.py"],
         "env": {
           "AIDER_MODEL": "gemini/gemini-2.5-flash",
           "GEMINI_API_KEY": "..."
         }
       }
     }
   }
   ```
4. In Claude Code: draft the architectural plan, decide what files need editing, then call the Aider MCP tool with: "go apply X transformation to these N files." Aider does the actual diff work with the cheaper model + its commit-per-edit discipline.

**Why pay Claude for code Aider can do:** Claude excels at planning, judgment, and ambiguous decisions. Aider excels at mechanical diff application with git-commit hygiene. Cost-shifting heavy edit work to a small model saves an order of magnitude on token spend for repetitive refactors.

**Evidence:**

- [disler/aider-mcp-server](https://github.com/disler/aider-mcp-server) — third-party wrapper
- [Aider Anthropic docs](https://aider.chat/docs/llms/anthropic.html) — confirms Aider supports any LiteLLM-compatible model
- [Aider HISTORY.md](https://raw.githubusercontent.com/Aider-AI/aider/main/HISTORY.md) — main-branch entry confirms Claude 4.5/4.6 + Gemini 2.5 + DeepSeek + GPT-5.1-5.4 support

**Variants:**

- **Aider thinking-tokens for hard refactors:** `aider --model anthropic/claude-sonnet-4-5 --thinking-tokens 32k` runs Aider WITH Claude as the model — useful when extended thinking matters for the edit decision. Use sparingly (expensive).
- **Conventions handoff:** Have Claude write `CONVENTIONS.md`, then `aider --read CONVENTIONS.md --message-file plan.md` to execute against a real repo with atomic commits per change.

**Caveats:**

- **The MCP wrapper is third-party.** Not maintained by Anthropic or Aider's primary maintainer. If reliability matters, pin to a known-good commit.
- **Aider rewrites files in place.** Make sure git is clean before invoking; rely on Aider's per-edit commit discipline for rollback.
- **Model selection matters.** Cheaper models (Flash, DeepSeek) work for mechanical edits but struggle with novel patterns. If Claude rejects Aider's output, fall back to running Aider with Sonnet directly.
