---
name: design-to-code-bundle
title: Claude Design canvas → Claude Code bundle handoff
products: [claude-design, claude-code]
trigger: User has a visual mockup or design iteration in Claude Design and wants to turn it into a working app
status: confirmed
last_validated: 2026-05-21
---

# Claude Design canvas → Claude Code bundle handoff

**Why it works:** Claude Design (research preview launched 2026-04-17 at [claude.ai/design](https://claude.ai/design)) is purpose-built for visual iteration on a multi-file canvas — designers, marketers, anyone iterating on look-and-feel. Claude Code is purpose-built for codebase work — wiring, logic, tests, deploys. The handoff bundle bridges them: design exports a `.zip` with HTML + assets + structure that Code can consume natively.

**Workflow:**

1. **Start in Design** at claude.ai/design — open a project, drop in HTML/screenshots/brand assets, iterate on the canvas with chat-on-the-left
2. Iterate visually until shape is right (Design is Opus 4.7-powered specifically for this)
3. **Export bundle** — Design produces a `.zip` containing standalone HTML + assets, or PDF/PPTX/Canva for non-code surfaces
4. **Open bundle in Claude Code** — drop the `.zip` into a working directory, unzip, point Code at it
5. Code takes over: wire up backend, add tests, deploy. Design's HTML is the spec
6. **(Reverse direction)** Generate HTML/components in Code, paste/load into Design for visual iteration when stuck on design intent

**Evidence:**

- [Claude Design skill description](C:/Users/mikey/.claude/skills/claude-design/SKILL.md): "exports to standalone HTML / PDF / PPTX / Canva / .zip, hands off to Claude Code via a packaged bundle"
- [Anthropic Apps release notes 2026-04-17](https://support.claude.com/en/articles/12138966-release-notes): "Claude Design, a new Anthropic Labs product for visual collaboration including designs, prototypes, slides, and one-pagers"
- Powered by Opus 4.7 specifically for visual iteration

**Caveats:**

- Design is a research preview; not on the Free tier (Pro / Max / Team / Enterprise only)
- Design is independently metered (weekly · Claude Design line in usage panel) — separate from API/Code limits
- The bundle is a snapshot; round-trip iteration (Design → Code → Design) requires manual re-import
