---
name: universal-skill-md-format
title: One SKILL.md file, three agent surfaces (Claude Code + Cursor + Codex)
products: [claude-code, cursor, codex]
trigger: User has a skill in `~/.claude/skills/<name>/` and wants it discoverable across multiple agents on the same machine
status: confirmed
last_validated: 2026-05-21
---

# One SKILL.md file, three agent surfaces

**Why it works:** Cursor explicitly treats Agent Skills as an open standard. Per [cursor.com/docs/context/skills](https://cursor.com/docs/context/skills), Cursor scans these directories at startup:

- `.cursor/skills/` (project)
- `~/.cursor/skills/` (user)
- `.agents/skills/` + `~/.agents/skills/` (generic agent format)
- **`.claude/skills/` + `~/.claude/skills/`** ← reads Claude Code skills directly
- **`.codex/skills/` + `~/.codex/skills/`** ← reads OpenAI Codex skills directly

Same SKILL.md + YAML frontmatter format. No duplication, no symlinking, no per-product config.

**Workflow:**

1. Author your skill once at `~/.claude/skills/<name>/SKILL.md` with proper frontmatter:
   ```yaml
   ---
   name: my-skill
   description: When to invoke this skill
   ---
   # My Skill
   ...
   ```
2. Start Cursor — it picks up the skill automatically. Same for Codex if installed.
3. Updates to the SKILL.md file are reflected in all three agents on next session.

**Evidence:**

- [Cursor Agent Skills docs](https://cursor.com/docs/context/skills) — direct quote: "Agent Skills is an open standard for extending AI agents with specialized capabilities."
- [Cursor blog: agent best practices](https://cursor.com/blog/agent-best-practices) — distinguishes Skills (capability packs) from Rules (always-on context) from Agents (entry points)
- [Anthropic Skills launch (2025-10-16)](https://platform.claude.com/docs/en/release-notes/overview#october-16-2025) — original definition

**Caveats:**

- **Use portable tools.** Bash + python + node are universally available; Claude-Code-specific tool names (`mcp__ccd_*`, `Skill` tool dispatcher) won't run in Cursor.
- **Format compatibility is one-way today.** Cursor reads Claude/Codex skills, but Claude Code doesn't yet read `~/.cursor/skills/`. If you want true bidirectional portability, author in `~/.claude/skills/` as the canonical home.
- **Frontmatter conventions differ slightly.** Anthropic's `description` field is rendered prose; Cursor's `name` + `description` are picked up the same way. Test in both surfaces before relying on advanced fields.
