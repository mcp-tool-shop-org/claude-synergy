# Synergies

Cross-product workflows that emerge from combining multiple Anthropic surfaces. Each entry describes a composition pattern, the trigger that makes it the right answer, and the changelog evidence that enables it.

The Synergy section is what makes this a product rather than a mirror. Any single changelog tells you what one product does; a synergy tells you what becomes *possible* when you compose two or three together.

## Seed entries (2026-05-21)

| # | Synergy | Products | Trigger |
|---|---------|----------|---------|
| 01 | [Skill portability](01-skill-portability.md) | Code + API + Cowork | Built a skill in Code, want to use it in a production agent |
| 02 | [MCP server portability](02-mcp-server-portability.md) | Code + API + Cowork + Claude.ai | Built an MCP server for Code, want to reuse it everywhere |
| 03 | [Claude Design ↔ Code bundle handoff](03-design-to-code-bundle.md) | Design + Code | Visual mockup needs to become a working app |
| 04 | [Computer Use cross-surface](04-computer-use-cross-surface.md) | Code + API + Claude.ai (Pro/Max) + Cowork | Browser/desktop automation, prototype → production |
| 05 | [Local Ollama as cost-shifting partner](05-ollama-cost-shifting.md) | Code + ollama-intern-mcp | Bulk analysis without burning Claude tokens |
| 06 | [Agent SDK graduation path](06-agent-sdk-graduation.md) | Code + Agent SDK | Prototype in CLI, deploy as standalone SDK app |
| 07 | [/code-review in GitHub Actions](07-code-review-in-ci.md) | Code + claude-code-action | Automated PR review reusing local skills/hooks |
| 08 | [Universal SKILL.md format](08-universal-skill-md-format.md) | Code + Cursor + Codex | One skill author, three agents read it |
| 09 | [MCP across seven surfaces](09-mcp-across-seven-surfaces.md) | Code + Cursor + Continue + Copilot + Windsurf + Cody + API | One MCP server binary, every agent surface |
| 10 | [Anthropic BYOK across surfaces](10-anthropic-byok-across-surfaces.md) | Code + Cursor + Continue + Aider + Copilot + Cody + API | One API key, unified billing across editors |
| 11 | [Claude Code orchestrates Aider](11-claude-code-orchestrates-aider.md) | Code + Aider | Cost-shift heavy edits to cheap model while Claude plans |
| 12 | [MCP config format gotcha](12-mcp-config-format-gotcha.md) | Code + Cursor + Continue + Copilot + Windsurf + Cody | Bridging configs between Copilot (`servers`) and everyone else (`mcpServers`) |

## Future entries (TBD)

- Prompt caching across surfaces (auto-caching since 2026-02-19; `cache_miss_reason` beta 2026-05-13)
- Memory tool across surfaces (API memory beta 2025-09-29; Claude.ai Memory free tier 2026-03-02; Code auto-memory)
- Compaction patterns (server-side API 2026-02-05; client-side Code compaction)
- Self-hosted Managed Agents sandboxes + local LLM intern (2026-05-19 + ollama-intern)
- MCP tunnels for private-network MCP servers (Research Preview 2026-05-19)
- `/goal` + Workflow tool composition (2.1.139 + 2.1.147)
- `ant` CLI ↔ Claude API ↔ Claude Code triangulation
- Plugin marketplace ↔ Cowork team rollout
- Vertical marketplaces (legal, life-sciences, healthcare, financial-services) ↔ Code project setup

## Schema mapping

Each synergy maps to the planned DB shape:

```sql
synergies          (id, name, title, trigger, status, last_validated)
synergy_products   (synergy_id, product_name)         -- many-to-many
synergy_steps      (synergy_id, ordinal, text)
synergy_evidence   (synergy_id, source_url, quote, source_kind)
```

Markdown files are the source of truth; parser populates DB tables. See [../schema.sql](../schema.sql) for current schema (which will be extended to include synergies in Tier 2).
