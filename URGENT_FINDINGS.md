# Urgent findings — updated 2026-05-21 (post-extended-swarm)

Updated after two study-swarm waves filled 706 release files + 17 skill entries + 6 catalog/activity files across 18 Anthropic product sources. Items ranked by urgency.

---

## 🔴 IMMEDIATE — Tools may be broken or exposed right now

### 1. Cross-SDK API-key leak in debug logs (HARDENING WAVE 2026-05-07 → 2026-05-11)

Coordinated security hardening shipped as "Chore" releases across the SDK family (not formally tagged as CVE, but treat as one):

- **anthropic-sdk-typescript** sdk-v0.95.1 (2026-05-07) — `redact api-key headers in debug logs`
- **anthropic-cli** v1.7.1 (2026-05-09) — same fix
- **anthropic-sdk-go** v1.42.0 (2026-05-11) — same fix
- **anthropic-sdk-java** v2.31.0 (2026-05-?) — same fix

**Impact:** anyone using debug-level logging on pre-fix versions of these SDKs/CLIs may have leaked `x-api-key` headers into log sinks (CI logs, observability platforms, local debug output).

**Unverified — audit if in use:** Python SDK and Ruby SDK do not have an explicit "redact api-key" release note in the window. Either silently patched or different code path. **Audit grep your `anthropic` Python/Ruby integrations for debug-level HTTP logging.**

**Action:** upgrade to the post-fix version on each SDK in use. Rotate API keys if you have evidence of logs from before the upgrade date being exposed to people outside your org or shipped to third-party observability.

### 2. GHSA-9h52-p55h-vw2f / CVE-2025-66416 — MCP DNS rebinding protection disabled

- **Fixed in `claude-agent-sdk-python` v0.2.82 (2026-05-15)** by bumping `mcp` floor to `>=1.23.0`. Previously the floor was `>=1.19.0`, and earlier MCP versions disabled DNS rebinding protection by default.

**Impact:** any Python project using `claude-agent-sdk` with `mcp < 1.23.0` had DNS rebinding protection disabled — exploitable in some configurations.

**Action:** ensure `pip list` shows `mcp >= 1.23.0` in any Python Agent SDK consumer. Upgrade if not.

### 3. TodoWrite → Task tools — CROSS-SDK breaking change

Same breaking change shipped in parallel in both Agent SDKs:

- **`claude-agent-sdk-python` v0.2.82 (2026-05-15)**
- **`claude-agent-sdk-typescript` v0.3.142 (2026-05-14)** — pre-announced as deprecation in v0.2.136 (2026-05-08)

> Headless and SDK sessions now use Task tools (`TaskCreate` / `TaskUpdate` / `TaskGet` / `TaskList`) instead of `TodoWrite`. Tool consumers should accumulate by task ID instead of replacing a snapshot list.

**Action:** grep `role-os`, `ollama-intern-mcp`, `swarm-control-plane`, and any other SDK-consuming tool for `TodoWrite` / `todo_write` / `todos:` in stream-parsing paths. Switch from "replace snapshot" to "accumulate by task ID."

### 4. MCP nonblocking connect default — CROSS-SDK breaking change

Same v0.2.82 / v0.3.142 releases. TS v0.3.142 also removed the v2 session API entirely.

> MCP servers now connect in the background by default; sessions start immediately and slow servers report `status: "pending"` in `init` until ready.

**Escape hatches:** `MCP_CONNECTION_NONBLOCKING=0` (revert), or per-server `alwaysLoad: true` in `.mcp.json`.

### 5. claude-code-action CVE-2025-66414 (HIGH severity)

- **Fixed in `claude-code-action` v1.0.29 (2026-01-08)**

Anyone SHA-pinned or version-pinned to v1.0.28 or earlier is exposed.

**Action:** if any of your repos use `anthropics/claude-code-action` in `.github/workflows/`, verify the pinned version is ≥ v1.0.29. The `v1` moving tag should be safe.

### 6. /simplify removed, replaced by /code-review with different semantics

- **Claude Code 2.1.147 (2026-05-21)**

> Renamed `/simplify` to `/code-review`. It now reports correctness bugs at a chosen effort level. The old cleanup-and-fix behavior has been removed.

**Action:** grep `~/.claude/`, `E:/AI/` memory tree, all skill files for `/simplify`. Rename to `/code-review` and rewrite prose that assumed cleanup-and-fix semantics.

---

## 🟡 DEADLINE — Act before 2026-06-15

### 7. Sonnet 4 + Opus 4 retiring 2026-06-15 (25 days from today)

- **Deprecation announced 2026-04-14**

Retiring: `claude-sonnet-4-20250514` → migrate to `claude-sonnet-4-6-20250929`; `claude-opus-4-20250514` → migrate to `claude-opus-4-7`.

**Action:** grep for the deprecated model IDs in all tooling. Migrate before 2026-06-15 or requests start erroring.

---

## 🟢 CONTEXT — Recent shifts affecting tools

### 8. GO-2026-4514 — jsonparser transitive vuln (anthropic-sdk-go)

Fixed in **anthropic-sdk-go v1.28.0** (bumped `buger/jsonparser` to v1.1.2 + Go toolchain to go1.25.8 for stdlib vulns).

**Action:** if anthropic-sdk-go is in use, ensure version is ≥ v1.28.0.

### 9. anthropic-sdk-php v0.5.0 (2026-01-30) — only explicit BREAKING

> camelCase property naming + `omittable` flag replaced with `null`. Also added `BaseResponse` and idempotency-header support.

PHP SDK is pre-1.0 throughout the window; expect more breaking changes. Also: v0.17.0 → v0.17.1 enum parsing regression caused unconditional failure (reverted next business day) — avoid pinning to v0.17.0.

### 10. anthropic-sdk-go v1.39.0 (2026-05-04) — default HTTP timeout change

Default HTTP client now ships a 10-minute timeout (was zero/none). Behavioral change for long-running callers that relied on the zero default — may now time out unexpectedly.

### 11. AskUserQuestion auto-mode fix INVALIDATES the testing-os ratchet

- **Claude Code 2.1.147 (2026-05-21)** — fixed; the doctrine ratchet about "AskUserQuestion answers NOT recognized by auto-mode" is no longer load-bearing.

### 12. Claude Code 2.1.113 (2026-04-18) — CLI now spawns native binary

Architectural shift from bundled JS to per-platform native binary. Affects custom path-to-claude assumptions.

### 13. claude-code-action v1.0.77 (2026-03-23) — env scrub default

`CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` auto-enabled when `allowed_non_write_users` is configured. Strips Anthropic API keys + cloud creds + GHA OIDC + OTEL tokens from subprocess environments. Mitigates prompt-injection-driven exfiltration.

### 14. New `xhigh` effort level (Opus 4.7, 2026-04-17)

New tier beyond `high`/`max`. `EffortLevel` type exported from `claude-agent-sdk-python` package root.

### 15. MCP tunnels Research Preview (Claude API 2026-05-19)

Anthropic-hosted Managed Agents can now reach private-network MCP servers.

### 16. Output format migration across all SDKs (~2026-01-29)

`output_format` parameter moved to `output_config.format` when Structured Outputs went GA. Affected:
- anthropic-sdk-python v0.77.0+ (with v0.77.1 hotfix)
- anthropic-sdk-typescript sdk-v0.72.0+
- anthropic-sdk-go v1.20.0+
- anthropic-sdk-java v2.12.0+
- anthropic-sdk-ruby v1.17.0+
- anthropic-sdk-csharp Anthropic-v12.3.0+
- (and likely PHP, though not explicit in release notes)

### 17. Past model retirements (check for stale references)

- **Opus 3** retired 2026-01-05
- **Sonnet 3.7 + Haiku 3.5** retired 2026-02-19
- **Haiku 3** retired 2026-04-20
- **1M context beta** (`context-1m-2025-08-07`) retired for Sonnet 4.5/4 on 2026-04-30

### 18. `max_thinking_tokens` deprecated (claude-agent-sdk-python v0.1.36, 2026-02-13)

Migrate to `ThinkingConfig` types + `effort` field.

### 19. mcp >=1.19.0 floor (claude-agent-sdk-python v0.1.70, 2026-04-28)

Older `mcp` silently dropped `CallToolResult` from SDK MCP tool handlers. Later bumped again to `>=1.23.0` in v0.2.82 (item #2).

---

## Sources fully audited (706 release files + 17 skill entries + 6 catalogs)

### Per-version release sources (15 products)

| Product | Files | Date range |
|---------|-------|------------|
| claude-code | 117 | 2026-01-07 → 2026-05-21 |
| claude-agent-sdk-typescript | 112 | 2026-01-07 → 2026-05-21 |
| claude-code-action | 102 | 2026-01-05 → 2026-05-21 |
| claude-agent-sdk-python | 65 | 2026-01-08 → 2026-05-21 |
| anthropic-sdk-csharp | 53 (5 packages) | 2026-01-07 → 2026-05-21 |
| anthropic-sdk-typescript | 53 (5 packages) | 2026-01-29 → 2026-05-21 |
| anthropic-sdk-python | 33 | 2026-01-13 → 2026-05-21 |
| anthropic-sdk-go | 31 | 2026-01-29 → 2026-05-21 |
| anthropic-sdk-ruby | 30 | 2026-01-06 → 2026-05-21 |
| claude-api | 26 date entries | 2026-01-05 → 2026-05-19 |
| anthropic-sdk-java | 24 | 2026-01-29 → 2026-05-21 |
| anthropic-apps | 24 (Help Center) | 2026-01-12 → 2026-04-17 |
| anthropic-sdk-php | 21 | 2026-01-30 → 2026-05-21 |
| anthropic-cli | 15 | 2026-04-08 → 2026-05-19 |
| claude-code-security-review | 0 (no tags) | n/a |

### Catalog sources (4)

| Catalog | Entries | Activity in window |
|---------|---------|--------------------|
| skills (official) | 17 skills, per-entry files | 19 commits — claude-api skill added 2026-03-04, Managed Agents buildout Apr–May |
| plugins-official | 1,766 plugins (1,715 marketplace.json + 36 first-party + 15 external) | 385 raw commits → 111 add / 19 remove |
| plugins-community | 1,715 plugins from 1,414 unique submitters | Repo created 2026-03-20; 1,707 net new in 9 weeks via bulk syncs |
| plugins-knowledge-work | 49 Cowork plugins (13 Anthropic + 5 partner + 31 external SHA-pinned) | Commands→skills migration 2026-03-13; SHA bump pipeline 2026-05-19 |

## Not yet audited (deferred, lower priority)

- Vertical marketplaces: `claude-for-legal`, `life-sciences`, `financial-services`, `healthcare` (niche)
- `claude-code-security-review` is in scope but has no release tags (branch-pinned consumption pattern)

---

# Tier 4a additions (2026-05-21 — non-Anthropic landscape)

## 🔴 IMMEDIATE — Landscape shifts your training data may not reflect

### 20. Sourcegraph Cody Free/Pro retired 2025-07-23

> Sourcegraph announced 2025-06-25 that Cody Free, Cody Pro, and Cody-in-Enterprise-Starter would sunset 2025-07-23. Indie users were migrated to Sourcegraph's Amp product (with $10/$40 in transition credits). **Cody Enterprise ($59/user/mo) remains fully supported.**

**Action:** any skill / kickoff / recommendation pointing individual developers at Cody Free or Pro is wrong. Cody mentions are only valid for enterprise contexts.

### 21. Windsurf acquired by Cognition AI 2025-07-14

> After OpenAI's deal collapsed (Microsoft blocked April 2025) and Google reverse-acqui-hired CEO Varun Mohan + Douglas Chen + core R&D staff for $2.4B, Cognition AI acquired the remaining IP/product/brand/team (~210 people, $82M ARR) for ~$250M. Cascade IDE now integrates with Cognition's autonomous **Devin** cloud agent (Devin Review surfaced inside Windsurf IDE for all subscribers since 2026-05-06).

**Action:** treat Windsurf + Devin as one integrated stack; mention SWE-1.5 (their internal model) alongside Claude/GPT options.

### 22. `microsoft/vscode-copilot-chat` GitHub repo archived 2026-05-20

> Repo is now read-only. Latest stable tag v0.43.0 (2026-04-07). Releases ship via the VS Code editor (`code.visualstudio.com/updates/`) and github.blog/changelog/ going forward.

**Action:** for VS Code Copilot Chat tracking, use monthly editor release notes + github.blog roll-ups. Don't use the archived GH repo as a sync source.

### 23. Copilot MCP config wrapper key is `"servers"` not `"mcpServers"`

> Six of seven major MCP-host surfaces (Claude Code, Cursor, Continue, Windsurf, Cody, Claude API) use `"mcpServers"` as the wrapper. GitHub Copilot uses `"servers"`. Value shape per-entry is identical.

**Action:** when bridging configs:

```bash
# Claude Code → Copilot
jq '{servers: .mcpServers}' .mcp.json > .vscode/mcp.json
# Copilot → Claude Code
jq '{mcpServers: .servers}' .vscode/mcp.json > .mcp.json
```

See [synergies/12-mcp-config-format-gotcha.md](synergies/12-mcp-config-format-gotcha.md).
