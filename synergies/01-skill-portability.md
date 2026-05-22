---
name: skill-portability
title: Develop skills in Claude Code, deploy via Claude API
products: [claude-code, claude-api, claude-cowork]
trigger: User has built a working skill in `~/.claude/skills/<name>/` and wants to use it in a production agentic workload
status: confirmed
last_validated: 2026-05-21
---

# Develop skills in Claude Code, deploy via Claude API

**Why it works:** Skills are folders of instructions/scripts/resources with the same format across every Anthropic surface. Building locally in Code is the lowest-friction iteration path; the same folder graduates unchanged to Claude API and Cowork.

**Workflow:**

1. Create `~/.claude/skills/<name>/SKILL.md` with `name`, `description`, optional `tools` frontmatter
2. Iterate in Code — edit the file, invoke via `Skill` tool or natural context match, repeat
3. When stable, organize as a directory with SKILL.md + supporting scripts/resources
4. **Graduate to API:** `POST /v1/skills` with the bundle (requires `skills-2025-10-02` beta header). Returns a skill ID
5. Reference the skill ID in Messages API requests — Claude loads it on demand
6. **(Optional) Publish in Cowork:** submit to [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) or [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) for team distribution

**Evidence:**

- [Claude API release notes 2025-10-16](https://platform.claude.com/docs/en/release-notes/overview#october-16-2025): "Skills are organized folders of instructions, scripts, and resources that Claude loads dynamically to perform specialized tasks. Anthropic-managed Skills + Custom Skills via /v1/skills"
- [anthropics/skills](https://github.com/anthropics/skills) — official catalog (pptx, xlsx, docx, pdf)
- The local-format-and-API-format identity is the load-bearing fact; if Anthropic ever forks them, this synergy breaks

**Caveats:**

- Skills require the `code execution` tool enabled in the API request
- Cost: every API request loading a skill incurs token cost for its instructions — keep them lean
- Cowork plugin manifests may have additional fields beyond raw Code skills; check the repo before publishing
