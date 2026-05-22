---
product: anthropic-sdk-go
source: https://github.com/anthropics/anthropic-sdk-go
window_start: 2026-01-01
window_end: 2026-05-21
release_count: 31
fetched_at: 2026-05-21
---

# anthropic-sdk-go — Release History (2026-01-01 to 2026-05-21)

Official Anthropic Go SDK. Releases use [release-please](https://github.com/googleapis/release-please) format with `Features` / `Bug Fixes` / `Chores` sections. Within the window: 31 tagged releases spanning v1.20.0 (2026-01-29) through v1.45.0 (2026-05-21). All releases are minor or patch under a stable 1.x line; no major version bumps. The cadence is dense — averaging roughly one release every 4 days, with multiple back-to-back minor bumps (v1.31.0+v1.32.0 same day, v1.44.0+v1.44.1 same day).

## Classification summary

| Class | Count | Notes |
|-------|-------|-------|
| Feature-bearing | 26 | Every minor (`x.y.0` where `y` advances) carries at least one feature commit, even when most of the work is internal/codegen. |
| Fix-led (patches) | 4 | v1.22.1, v1.25.1, v1.35.1, v1.44.1 — all patch releases addressing single regressions. |
| Chore-led | 1 | v1.27.1 (republish of v1.27.0 with no functional changes). |
| Other / unknown | 0 | — |

Note: this is a release-please repo, so even feature-class releases routinely bundle multiple chore/internal commits. The classification above reflects the highest-impact section present.

## Historical table (newest first)

| Version | Date | Class | Headline |
|---------|------|-------|----------|
| 1.45.0 | 2026-05-21 | Feature | Add support for `thinking-token-count` beta for estimated tokens in thinking-block deltas during streaming |
| 1.44.1 | 2026-05-19 | Fix | runner: skip tool calls SessionToolRunner does not own |
| 1.44.0 | 2026-05-19 | Feature | client: add support for self-hosted sandboxes in CMA with sandbox helpers |
| 1.43.0 | 2026-05-13 | Feature | Add `BetaManagedAgentsSearchResultBlock` types; cache-diagnostics beta; compatibility aliases for old type names; structured-outputs fix (allowlist enum/const/pattern/allOf in `transformSchema`) |
| 1.42.0 | 2026-05-11 | Feature | aws: Add AWS client for Claude Platform on AWS; redact api-key headers in debug logs; go: avoid panic when `http.DefaultTransport` is wrapped |
| 1.41.0 | 2026-05-06 | Feature | api: Managed Agents multi-agents + outcomes, webhooks, vault validation; mcp: add MCP tool helpers |
| 1.40.0 | 2026-05-05 | Feature | client: allow targeting a workspace for OIDC federation token exchange |
| 1.39.0 | 2026-05-04 | Feature | client: add Workload Identity Federation, interactive OAuth, and auth profiles; go: add default HTTP client with timeout; api: improve Managed Agents APIs; support setting headers via env |
| 1.38.0 | 2026-04-23 | Feature | api: CMA Memory public beta; structured outputs via `Schema any` with auto-parse; add `Type()` method to API errors for error-kind identification |
| 1.37.0 | 2026-04-16 | Feature | api: add `claude-opus-4-7`, token budgets and user_profiles |
| 1.36.0 | 2026-04-14 | Feature | api: mark Sonnet and Opus 4 as deprecated; bedrock: use auth header for mantle client |
| 1.35.1 | 2026-04-13 | Fix | streaming: add missing events |
| 1.35.0 | 2026-04-10 | Feature | vertex eu region; tools: convert tool-response type to array |
| 1.34.0 | 2026-04-09 | Feature | api: Add beta advisor tool |
| 1.33.0 | 2026-04-08 | Feature | api: add support for Claude Managed Agents |
| 1.32.0 | 2026-04-07 | Feature | bedrock: add `AnthropicBedrockMantle` client |
| 1.31.0 | 2026-04-07 | Feature | api: Add support for `claude-mythos-preview` |
| 1.30.0 | 2026-04-03 | Feature | vertex: add support for US multi-region endpoint |
| 1.29.0 | 2026-04-01 | Feature | api: add structured `stop_details` to message responses |
| 1.28.0 | 2026-03-31 | Feature | multipart-form comma encoding; security: bump `buger/jsonparser` to v1.1.2 (GO-2026-4514); internal: bump Go toolchain to go1.25.8 for stdlib vulns |
| 1.27.1 | 2026-03-18 | Chore | internal: regenerate SDK with no functional changes |
| 1.27.0 | 2026-03-16 | Feature | api: GA `thinking-display-setting`; api: change array_format to brackets; client: update default model reference from `claude-3-7-sonnet-latest` to `claude-sonnet-4-5`; allow canceling a request while waiting to retry |
| 1.26.0 | 2026-02-19 | Feature | api: Add top-level cache control (automatic caching); client: add `BetaToolRunner` for automatic tool-use loops |
| 1.25.1 | 2026-02-19 | Fix | client: use correct format specifier for header serialization |
| 1.25.0 | 2026-02-18 | Feature | api: fix shared `UserLocation` and error-code types |
| 1.24.0 | 2026-02-18 | Feature | api: Make new tool versions available as top-level tool types |
| 1.23.0 | 2026-02-17 | Feature | api: Releasing `claude-sonnet-4-6` |
| 1.22.1 | 2026-02-10 | Fix | encoder: correctly serialize `NullStruct` |
| 1.22.0 | 2026-02-07 | Feature | api: enable fast-mode in `claude-opus-4-6` |
| 1.21.0 | 2026-02-05 | Feature | api: Release Claude Opus 4.6, adaptive thinking, and other features |
| 1.20.0 | 2026-01-29 | Feature | api: Structured Outputs in Messages API; migrate to `output_config` (was `output_format`); client: mark `claude-3-5-haiku` as deprecated; `param.SetJSON` helper |

## Notable Releases

### v1.20.0 — Structured Outputs land (2026-01-29)
- **Structured Outputs** added to the Messages API surface (`output_config` parameter).
- `claude-3-5-haiku` officially deprecated in the client.
- New `param.SetJSON` helper for raw-JSON parameter overrides.
- Multiple streaming-correctness fixes (`accumulator` revert, `streaming endpoints should pass through errors correctly`, `client: retain streaming when user sets request body`).

### v1.21.0 — Claude Opus 4.6 release (2026-02-05)
- Public release of **Claude Opus 4.6**, adaptive thinking, and other features (single feature bullet, but high-impact model add).

### v1.23.0 — Claude Sonnet 4.6 release (2026-02-17)
- Public release of **Claude Sonnet 4.6**.

### v1.26.0 — Automatic caching + BetaToolRunner (2026-02-19)
- **Top-level cache control** (automatic caching) — significant ergonomic + cost change for callers.
- **`BetaToolRunner`** added for automatic tool-use loops; reduces the boilerplate of multi-turn tool calling.

### v1.27.0 — Default-model bump and array-format change (2026-03-16)
- **Default-model reference** updated from `claude-3-7-sonnet-latest` to `claude-sonnet-4-5` — meaningful for callers relying on the SDK's default.
- **`array_format` changed to brackets** (API-spec change visible in form/query encoding).
- GA of `thinking-display-setting`.
- Cancellation while waiting-to-retry now works correctly.

### v1.28.0 — Security backstop (2026-03-31)
- **`buger/jsonparser` bumped to v1.1.2 to address Go vulnerability `GO-2026-4514`** (advisory-flag — see URGENT below).
- **Go toolchain bumped to go1.25.8** to address standard-library vulnerabilities.
- Misc multipart/encoder/CI hardening.

### v1.31.0 — Mythos preview (2026-04-07)
- API surface for **`claude-mythos-preview`** added.

### v1.32.0 — Bedrock Mantle client (2026-04-07)
- New **`AnthropicBedrockMantle`** client (Bedrock-tier client variant alongside the existing Bedrock surface).

### v1.33.0 — Claude Managed Agents (CMA) (2026-04-08)
- Initial support for **Claude Managed Agents** (CMA) — first appearance of the CMA API in the SDK. CMA expands across the next several releases (Memory beta in v1.38.0, multiagents + outcomes in v1.41.0, sandboxes in v1.44.0, search-result types in v1.43.0).

### v1.34.0 — Advisor tool beta (2026-04-09)
- **Beta advisor tool** added to the API surface.

### v1.35.0 — Vertex EU region + tools-response array (2026-04-10)
- Vertex EU region targeting.
- **Tool-response type converted to array** (potential downstream type change for callers reading the field).

### v1.36.0 — Sonnet/Opus 4 deprecated (2026-04-14)
- **`claude-sonnet-4` and `claude-opus-4` marked as deprecated** in the API surface — heads-up for callers still pinning to the 4.0 family.

### v1.37.0 — Opus 4.7 (2026-04-16)
- **`claude-opus-4-7` added**, plus token budgets and `user_profiles`.

### v1.38.0 — CMA Memory beta + structured-outputs auto-parse (2026-04-23)
- **CMA Memory public beta**.
- **Structured Outputs via `Schema any` with auto-parse** — significant DX improvement for callers using structured outputs.
- New `Type()` method on API errors for programmatic error-kind identification.

### v1.39.0 — Auth surface expansion (2026-05-04)
- **Workload Identity Federation, interactive OAuth, and auth profiles** added on the client.
- **Default HTTP client now ships with a 10-min timeout** (previously zero/no timeout — behavioral change for callers relying on the prior default).
- `support setting headers via env`.

### v1.42.0 — AWS client + api-key redaction (2026-05-11)
- New **AWS client for Claude Platform on AWS** (`aws:` package).
- **`redact api-key headers in debug logs`** (logged twice in the changelog — security-hardening change relevant to anyone using debug logging in production).
- Avoid panic when `http.DefaultTransport` is wrapped.

### v1.43.0 — Cache-diagnostics beta + compatibility aliases (2026-05-13)
- **Cache-diagnostics beta** added.
- `BetaManagedAgentsSearchResultBlock` types for CMA search workflows.
- **Compatibility aliases for old type names** (logged twice — points at a recent type-rename sweep being smoothed over for callers).
- **Bug fix**: structured-outputs `transformSchema` now allowlists `enum`, `const`, `pattern`, and `allOf` (#823) — fixes structured-outputs failures for callers using those JSON-Schema keywords.

### v1.44.0 — Self-hosted CMA sandboxes (2026-05-19)
- **Self-hosted sandboxes** in CMA with sandbox helpers.

### v1.45.0 — Thinking-token-count beta (2026-05-21)
- **`thinking-token-count` beta** for estimated tokens in thinking-block deltas during streaming — observability improvement for callers tracking thinking-token spend mid-stream.

---

## URGENT_FINDINGS candidates

**Security advisory (transitively patched in this window):**
- **v1.28.0 (2026-03-31)** bumps `buger/jsonparser` to v1.1.2 to address **GO-2026-4514** (Go vulnerability database advisory). Same release bumps the **Go toolchain to go1.25.8** to address unspecified stdlib vulnerabilities. Callers pinned to `anthropic-sdk-go <= 1.27.1` are running a vulnerable `buger/jsonparser` transitive dep. Recommend URGENT_FINDINGS entry: "Upgrade `anthropic-sdk-go` to >= 1.28.0 to pick up GO-2026-4514 patch and go1.25.8 stdlib vuln fixes."

**Security-hardening (debug-log api-key redaction):**
- **v1.42.0 (2026-05-11)** introduces **api-key header redaction in debug logs** (changelog entry logged twice). Callers running with debug logging enabled on prior versions may have been leaking `x-api-key` headers into log sinks. Recommend URGENT_FINDINGS entry: "Upgrade to >= 1.42.0 if running with debug logging — prior versions did not redact `x-api-key` headers from debug output."

**Behavioral changes worth flagging (not strictly breaking, but caller-visible):**
- **v1.27.0**: default-model reference changed from `claude-3-7-sonnet-latest` to `claude-sonnet-4-5`. Callers depending on the SDK's default model resolution will see a different model after this bump.
- **v1.27.0**: `array_format` changed to brackets. Callers parsing the wire format directly (rare) may break.
- **v1.35.0**: tool-response type converted to **array** — callers reading the tool-response field may need to update types.
- **v1.36.0**: `claude-sonnet-4` and `claude-opus-4` marked deprecated — callers should plan migration to 4.5 / 4.6 / 4.7.
- **v1.39.0**: default HTTP client now ships a 10-minute timeout (previously no timeout per the bug-fix entry `client: add 10 min timeout #770`). Long-running calls that relied on the absent default may now time out.
- **v1.20.0**: Structured-Outputs payload migrated from `output_format` to `output_config` — caller-visible spec shift.

**No `BREAKING CHANGE:` / `!:` semver-breaking markers were found in any release body in this window.** All shifts above are framed as features, fixes, or deprecations under a stable 1.x line.
