# anthropics/skills — activity log (2026-01-01 → 2026-05-21)

Source: `gh api "repos/anthropics/skills/commits?since=2026-01-01T00:00:00Z&until=2026-05-21T23:59:59Z&per_page=100" --paginate`. 19 commits total in window. The catalog's top-level reshuffle to `skills/` predates the window (2025-12-01, commit `ef74077`), so most skills were already present at the window start; in-window activity is dominated by the **claude-api** skill (added 2026-03-04, then iterated heavily for Managed Agents).

## 2026-05-19
- Modified: claude-api — **Managed Agents self-hosted sandboxes** added; `config:{type:"self_hosted"}` for tool execution on customer infra via outbound-polling worker. Also adds mid-session `sessions.update()` agent override, and large MCP tool-output offload to sandbox files (>100K tokens). New `shared/managed-agents-self-hosted-sandboxes.md`. (commit `690f15c`, PR #1164)

## 2026-05-17
- Modified: claude-api — fix model config shape in managed-agents API reference; `model` accepts `{id, speed}`, not `{type: "model_config", id, speed}`. (commit `6a5bb06`, PR #1145)

## 2026-05-09
- Modified: README.md (commit `f458cee`, PR #1094)

## 2026-05-06
- Modified: claude-api — **Managed Agents outcomes, multiagent, and webhooks** added. (commit `d211d43`, PR #1096)

## 2026-05-03
- Modified: claude-api — drop non-existent `purpose` field from Files API examples (TS + curl). (commit `d230a6d`, PR #1081)

## 2026-04-23
- Modified: claude-api — **Managed Agents memory stores** (public beta under `managed-agents-2026-04-01`) — object model `memstore_/mem_/memver_`, attach via `resources[]` at session-create, FUSE mount at `/mnt/memory/<store>/`, host-side CRUD, `content_sha256` preconditions, versions/redact. New `shared/managed-agents-memory.md`. (commit `5128e18`, PR #1014)

## 2026-04-20
- Modified: claude-api — fill in Apache 2.0 copyright notice in `claude-api/LICENSE.txt` (replace `[yyyy] [name of copyright owner]` placeholder). (commit `b9e19e6`, PR #990)

## 2026-04-16
- Modified: claude-api — add `shared/model-migration.md`; refresh model references, managed-agents docs, and description across all language guides. (commit `2c7ec5e`, PR #956)

## 2026-04-13
- Modified: claude-api — fix SKILL.md YAML rendering (`0f7c287`, PR #898)

## 2026-04-09
- Modified: claude-api — add proper front-matter (name/description/license) to SKILL.md. (commit `12ab35c`, PR #897)

## 2026-04-08
- Modified: claude-api — initial **Managed Agents guidance** added to skill; replace OPUS_ID and other placeholders with concrete model strings. (commit `ca1e7dc`, PR #891)

## 2026-03-25
- Modified: claude-api — auto-sync chore (commit `98669c1`, PR #730)

## 2026-03-22
- Modified: claude-api — auto-sync chore (commit `887114f`, PR #729)

## 2026-03-06
- Modified: skill-creator — `improve_description.py` drops ANTHROPIC_API_KEY dependency; now calls `claude -p` as a subprocess instead of the Anthropic SDK. Strips `CLAUDECODE` env var to allow nesting inside a Claude Code session. Over-1024-char retry is now a fresh single-turn call. Drops stale "extended thinking" reference from SKILL.md. (commit `b0cbd3d`, PR #547)

## 2026-03-04
- **Added: claude-api** — Documentation skill for building applications with the Claude API and Agent SDK. Covers Python, TypeScript, Java, Go, Ruby, C#, PHP, and cURL with language-specific guides for Messages API basics, streaming, error handling, tool use (tool runner + manual agentic loop), structured outputs, adaptive thinking, batches, Files API, Agent SDK patterns (Py/TS), model catalog and selection. (commit `7029232`, PR #515)

## 2026-02-25
- Modified: docx + skill-creator — export latest skills (chore). Pulls in skill-creator agents (analyzer/comparator/grader), eval-viewer scripts, references (output-patterns, schemas, workflows), and various scripts (aggregate_benchmark, generate_report, improve_description, init_skill, package_skill, run_eval, run_loop, utils). (commit `3d59511`, PR #465)

## 2026-02-06
- Modified: skill-creator — add `compatibility` optional field to SKILL.md frontmatter spec + validation in `quick_validate.py`. Rename "hyphen-case" → "kebab-case" in init_skill.py and quick_validate.py. Increase max skill name length 40 → 64 characters. Make scripts executable (chmod +x) for accept_changes.py, comment.py, extract_form_structure.py, add_slide.py, thumbnail.py, recalc.py. (commit `1ed29a0`, PR #350)

## 2026-02-04
- Modified: pptx — delete legacy `html2pptx.tgz` dependency. (commit `a5bcdd7`, PR #331)
- Modified: docx, xlsx, pdf, pptx — **document skills mega-update**:
  - **docx**: add commenting + track-changes support; reorganize OOXML tooling into a shared `office/` module.
  - **pptx**: streamline SKILL.md, add slide-editing and pptxgenjs guides, bundle `html2pptx` as a tgz; reorganize OOXML tooling into shared `office/` module.
  - **xlsx**: move `recalc` script into `scripts/`, expand it; add shared `office/` module for OOXML pack/unpack/validate.
  - **pdf**: improve form-filling workflow with new form-structure extraction script + updated field-info extraction.
  (commit `4e6907a`, PR #330)

## Window summary

- **19 commits** in the 2026-01-01 → 2026-05-21 window
- **1 new skill added in window**: `claude-api` (2026-03-04). Note: the document-skills `office/` shared-tooling refactor on 2026-02-04 is functionally a meaningful capability upgrade (commenting + track-changes + slide-editing guide).
- **0 skills removed.**
- **claude-api** received 12 of the 19 commits — building out the Managed Agents subsystem incrementally (initial guidance Apr 8 → mid-session updates + self-hosted sandboxes May 19, with memory stores, multiagent + webhooks, model-migration, and outcomes shipped between).
- The four document skills (`docx`, `pdf`, `pptx`, `xlsx`) collectively received just one substantive commit on 2026-02-04, after which they've been stable in the window.
