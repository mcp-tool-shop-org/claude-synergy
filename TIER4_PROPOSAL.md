# Tier 4 — Extension beyond Anthropic

**Status:** proposed, awaiting implementation decision
**Research date:** 2026-05-21
**Method:** 6-agent study-swarm covering 7 tools + MCP ecosystem

---

## Executive findings

| Tool | Best source | Tier | Claude support | MCP support | Notes |
|---|---|---|---|---|---|
| **Aider** | `raw.githubusercontent.com/Aider-AI/aider/main/HISTORY.md` | 2 (raw markdown) | BYOK 4.5/4.6 full lineup, 3.7 with `--thinking-tokens` | No native client; third-party `aider-mcp-server` makes Aider AN MCP server | Active. Self-tracks AI authorship % per release. |
| **Continue.dev** | `changelog.continue.dev` + `gh api continuedev/continue/releases` | 2 (dual) | First-party Anthropic with prompt caching | Full stdio/SSE/HTTP. Agent mode only. **Accepts Claude Desktop's MCP JSON byte-identically.** | Active. Three parallel platform tracks (VS Code/JetBrains/CLI). |
| **Cursor** | `cursor.com/changelog/rss.xml` (verified 200) | **3-RSS** (new tier) | BYOK in Settings → Models | stdio MCP. **Loads `~/.claude/skills/`, `.claude/skills/`, `~/.codex/skills/` directly** — Anthropic-compatible skill format. | Active. Closed source. |
| **GitHub Copilot** | `github.blog/changelog/label/copilot/` | 3 (HTML, no RSS for label) | 7 Claude models (Haiku 4.5, Sonnet 4.5/4.6, Opus 4.5/4.6/4.7) | Full stdio + HTTP across VS Code, JetBrains, Xcode, CLI, github.com cloud agent | Active. Wins on multi-surface coverage. |
| **VS Code Copilot Chat** | `code.visualstudio.com/updates/v1_NNN` + monthly github.blog roll-ups | 3 (HTML monthly) | Same as Copilot. BYOK via "Custom Endpoint" provider. | Same as Copilot. **MCP config uses `"servers"` key, not `"mcpServers"`.** | `microsoft/vscode-copilot-chat` archived 2026-05-20 — don't use that as a source. |
| **Sourcegraph Cody** | `sourcegraph.com/changelog/featured.rss` | 3-RSS | Enterprise only — Free/Pro DEPRECATED 2025-07-23 | Yes since 2024-11 | **Free/Pro sunset, Enterprise active at $59/user/mo.** Indie users migrated to Amp/Windsurf/Claude Code. |
| **Windsurf** | `windsurf.com/changelog` (HTML, no RSS) | 3 (HTML scrape) | Full Claude lineup; no BYOK documented | First-class stdio/HTTP/SSE. MCP Marketplace in Cascade panel. **100-tool cap per session.** | **Acquired by Cognition AI 2025-07-14 for ~$250M** after OpenAI deal collapsed + Google reverse-acqui-hired CEO. Cascade IDE now plugs into Devin (autonomous cloud agent). |
| **modelcontextprotocol/\*** (15 SDK repos) | `gh api repos/modelcontextprotocol/<repo>/releases` | 1 (drop-in) | (universal — defines the protocol) | n/a | Python/TS/Go/Java/C#/Kotlin/Ruby/Swift/Rust/PHP SDKs + spec + inspector + registry + mcpb + conformance. Spec rev every 4-6 months. |
| **MCP public registries** | Smithery / Glama / mcp.so / PulseMCP / official Registry | 4 (catalog API) | n/a | Source-of-truth for available servers | Glama: 23,968 servers. Growth: 200-300/week. Bigger than all 4 Anthropic plugin marketplaces combined. |

---

## URGENT findings to fold into URGENT_FINDINGS.md

### A1. Sourcegraph Cody Free/Pro retired 2025-07-23

> Sourcegraph announced 2025-06-25 that Cody Free, Cody Pro, and Cody-in-Enterprise-Starter sunset 2025-07-23. New signups stopped 2025-06-25. **Cody Enterprise ($59/user/mo) remains.** Migration target: Sourcegraph's Amp (or third-party Cursor/Claude Code).

**Action:** any skill / memory / synergy that recommends Cody Free or Pro for individual developers is wrong. Cody only makes sense as the enterprise option now.

### A2. Windsurf acquired by Cognition AI 2025-07-14

> After OpenAI's deal collapsed (blocked by Microsoft, April 2025) and Google's $2.4B reverse-acqui-hire of CEO Varun Mohan + Douglas Chen + core R&D, Cognition acquired the remaining IP/product/brand/team (~210 people, $82M ARR) for ~$250M. Cascade IDE now integrates with Cognition's autonomous Devin agent for handoff workflows.

**Action:** "Codeium" / "Windsurf" positioning has changed materially. If memory frames it as standalone, update.

### A3. `microsoft/vscode-copilot-chat` GH repo archived 2026-05-20

> Releases now ship via the editor (`code.visualstudio.com/updates/`). The repo is read-only; latest tag v0.43.0 (2026-04-07).

**Action:** don't use that GH releases feed as a sync source.

### A4. MCP config key difference between Copilot and everyone else

> Copilot uses `"servers"` as the top-level key in `.vscode/mcp.json` / `mcp.json`. Claude Code, Cursor, Continue, Windsurf, Cody all use `"mcpServers"`. Value shape is identical (`{command, args, env}` for stdio; `{url}` for HTTP).

**Action:** when documenting cross-product MCP setup, name the wrapper-key gotcha explicitly.

---

## Synergies to seed in `synergies/`

### 08. Universal SKILL.md format (Code + Cursor + Codex)

**Products:** claude-code, cursor, codex
**Trigger:** User has a skill in `~/.claude/skills/<name>/` and wants it discoverable across multiple agents on the same machine.
**Evidence:** [cursor.com/docs/context/skills](https://cursor.com/docs/context/skills) — Cursor explicitly scans `~/.claude/skills/`, `.claude/skills/`, `~/.codex/skills/`, `.codex/skills/` in addition to its own `.cursor/skills/`. "Agent Skills is an open standard for extending AI agents with specialized capabilities."
**Workflow:** author `SKILL.md` with proper YAML frontmatter in `~/.claude/skills/<name>/`. No further config needed — Cursor and Codex find it automatically.
**Caveat:** the skill must use a portable execution model (bash + python + node tools are universally available; Claude-Code-specific tool names like `mcp__ccd_*` won't run elsewhere).

### 09. Universal MCP server portability across 7 agent surfaces

**Products:** claude-code, cursor, continue, copilot, windsurf, cody-enterprise, anthropic-api (via Managed Agents MCP connector)
**Trigger:** User built an MCP server and wants it available in every IDE/agent surface they use.
**Workflow:**
1. Build the MCP server (stdio or HTTP/SSE)
2. Register in each client's config:
   - Claude Code / Cursor / Continue / Windsurf / Cody Enterprise: `mcpServers` wrapper
   - GitHub Copilot (VS Code / JetBrains / CLI / cloud): `servers` wrapper
   - Claude API: pass via MCP connector beta header
3. Value shape (`{command, args, env}` for stdio, `{url, headers}` for HTTP) is identical across all.

**Caveats:**
- **Cursor**: 40-80 tool cap (varies by source); curate carefully
- **Windsurf**: 100-tool cap per session
- **Continue**: MCP only works in Agent mode (not Chat/Edit)
- **Copilot**: top-level key is `servers` not `mcpServers`
- **Claude API**: requires beta header + may need MCP tunnels for private servers

### 10. Anthropic BYOK across editors (unified billing)

**Products:** claude-code, cursor, continue, aider, copilot, cody-enterprise, anthropic-api
**Trigger:** User on Claude Max / API tier wants to use Claude across multiple editors with unified billing.
**Workflow:**
1. Set `ANTHROPIC_API_KEY` from console.anthropic.com
2. Wire into each surface:
   - Claude Code: native; uses subscription OR API key
   - Cursor: Settings → Models → API Keys → Anthropic
   - Continue: `.continue/config.yaml` with `provider: anthropic`
   - Aider: `aider --model anthropic/<model>` with env var
   - Copilot: VS Code Chat "Custom Endpoint" provider (Insiders); points at `https://api.anthropic.com/v1/messages`
   - Cody Enterprise: BYO key in admin settings (or route via Cody Gateway / Bedrock / Vertex)
3. All billing rolls to one Anthropic account; prompt caching applies across surfaces that support it.
**Caveat:** Windsurf doesn't document a BYOK path — routes through their gateway with credit pricing.

### 11. Claude Code orchestrates Aider for cost-shifted edits

**Products:** claude-code, aider, aider-mcp-server
**Trigger:** User wants Claude's reasoning quality but cheaper actual edits.
**Workflow:**
1. Install [`disler/aider-mcp-server`](https://github.com/disler/aider-mcp-server) as an MCP server in Claude Code
2. Configure Aider to use a cheaper model (Gemini 2.5 Flash, DeepSeek, GPT-5-mini)
3. Claude Code drafts the plan + decisions; delegates "go edit these N files to spec" calls to Aider via MCP
4. Aider applies diffs with its commit-per-edit discipline; Claude reviews

### 12. Anthropic skills ↔ Continue Hub parallel registries

**Products:** anthropic-skills, continue-hub
**Trigger:** Team uses both Claude Code and Continue.dev; wants prompts/rules reusable across both.
**Workflow:** treat Continue Hub blocks (assistants, rules, prompts, models, mcpServers, docs, data) as one registry, Anthropic Skills as the other. Manual sync via copy-conversion is the current state — no native bridge.
**Caveat:** semantic mismatch — Hub assumes a hosted registry; Anthropic Skills are filesystem-local SKILL.md. The translation isn't always clean.

---

## Implementation plan

### Phase 4a — high-leverage immediate additions (this slice)

1. **Add 15 MCP SDK repos** to `src/fetch.ts` TARGETS array — drop-in Tier 1 (gh api). Products: `mcp-python-sdk`, `mcp-typescript-sdk`, `mcp-go-sdk`, `mcp-java-sdk`, `mcp-csharp-sdk`, `mcp-kotlin-sdk`, `mcp-ruby-sdk`, `mcp-swift-sdk`, `mcp-rust-sdk`, `mcp-php-sdk`, `mcp-spec`, `mcp-inspector`, `mcp-registry`, `mcp-mcpb`, `mcp-conformance`.

2. **Add RSS fetcher** as a new strategy in `src/fetch.ts` (alongside `gh-releases`). Cover Cursor + Cody Enterprise. New helper: `parseRssFeed(url) → ReleaseEntry[]`.

3. **Add Aider** with Tier 2 `git-changelog` strategy fetching `raw.githubusercontent.com/Aider-AI/aider/main/HISTORY.md` + diff parsing.

4. **Add Continue.dev** via dual sources — `changelog.continue.dev` HTML scrape + `gh api continuedev/continue/releases` for granular tags.

5. **Seed synergies 08-12** as files in `synergies/`.

6. **Update URGENT_FINDINGS.md** with items A1-A4.

### Phase 4b — broader catalog (next slice)

7. Add GitHub Copilot via `github.blog/changelog/label/copilot/` HTML scrape (slug-dated entries).
8. Add VS Code Copilot Chat via `code.visualstudio.com/updates/v1_NNN` monthly HTML.
9. Add Windsurf via `windsurf.com/changelog` HTML scrape.
10. Add MCP registries as Tier 4 catalogs (Smithery, Glama, official Registry, GitHub MCP Registry).

### Phase 4c — agent-facing extensions

11. Expose MCP registry queries via the MCP server (`find_mcp_server` tool).
12. Make adding new products YAML-driven (`products.yaml` config file) — adding a new tool stops requiring code edits to `fetch.ts`.

---

## Scope summary

| Surface | Added products | Notes |
|---|---|---|
| Existing (Anthropic) | 14 | 706 releases on disk |
| **Phase 4a** | +15 MCP SDKs +4 IDE tools (Cursor, Aider, Continue, Cody) = +19 | RSS fetcher + git-changelog strategy required |
| **Phase 4b** | +3 IDE/agent tools (Copilot, VS Code Chat, Windsurf) +4 MCP registries = +7 | HTML scrape per source |
| **Phase 4c** | infrastructure: YAML config, MCP registry tool | no new sources |

Total at Phase 4b completion: **40 products** vs current 14.

The Anthropic-side corpus (706 files) is a small fraction of what the field publishes. MCP SDK release notes alone will likely add 200-300 files. Cursor's RSS, Continue's tracks, and Cody's RSS each add 50-100. MCP registry catalogs are tens of thousands of entries (catalog mode, not per-release).

---

## Out of scope (intentional)

- **Codex (OpenAI's coding agent)** — directory compatibility noted (Cursor loads `~/.codex/skills/`) but no per-tool research. Add later if Codex usage grows.
- **Tabnine, Pieces, Replit Agent, AWS Q Developer** — niche or vendor-locked. Re-evaluate annually.
- **Generic LSP / non-AI editor changelogs** — out of scope; this is an AI-tool mirror.
- **Self-hosted model serving (vLLM, Ollama, llama.cpp release notes)** — adjacent but separate concern; could be a Tier 5 add later.
