---
product: anthropic-sdk-java
source: github-releases
repo: anthropics/anthropic-sdk-java
window_start: "2026-01-01"
window_end: "2026-05-21"
fetched_at: "2026-05-21"
release_count: 24
---

# anthropic-sdk-java — Release History

Window: **2026-01-01 → 2026-05-21** (inclusive). 24 releases (v2.12.0 → v2.34.0).

Source: [GitHub Releases — anthropics/anthropic-sdk-java](https://github.com/anthropics/anthropic-sdk-java/releases).

## Historical Table

| Version | Released | Source |
|---------|----------|--------|
| [v2.34.0](releases/2.34.0.md) | 2026-05-21 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.34.0) |
| [v2.33.0](releases/2.33.0.md) | 2026-05-19 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.33.0) |
| [v2.32.0](releases/2.32.0.md) | 2026-05-13 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.32.0) |
| [v2.31.0](releases/2.31.0.md) | 2026-05-11 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.31.0) |
| [v2.30.0](releases/2.30.0.md) | 2026-05-06 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.30.0) |
| [v2.29.0](releases/2.29.0.md) | 2026-05-05 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.29.0) |
| [v2.28.0](releases/2.28.0.md) | 2026-05-04 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.28.0) |
| [v2.27.0](releases/2.27.0.md) | 2026-04-23 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.27.0) |
| [v2.26.0](releases/2.26.0.md) | 2026-04-16 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.26.0) |
| [v2.25.0](releases/2.25.0.md) | 2026-04-14 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.25.0) |
| [v2.24.0](releases/2.24.0.md) | 2026-04-09 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.24.0) |
| [v2.23.0](releases/2.23.0.md) | 2026-04-09 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.23.0) |
| [v2.22.0](releases/2.22.0.md) | 2026-04-08 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.22.0) |
| [v2.21.0](releases/2.21.0.md) | 2026-04-07 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.21.0) |
| [v2.20.0](releases/2.20.0.md) | 2026-04-01 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.20.0) |
| [v2.19.0](releases/2.19.0.md) | 2026-03-31 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.19.0) |
| [v2.18.0](releases/2.18.0.md) | 2026-03-18 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.18.0) |
| [v2.17.0](releases/2.17.0.md) | 2026-03-16 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.17.0) |
| [v2.16.1](releases/2.16.1.md) | 2026-03-11 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.16.1) |
| [v2.16.0](releases/2.16.0.md) | 2026-03-06 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.16.0) |
| [v2.15.0](releases/2.15.0.md) | 2026-02-19 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.15.0) |
| [v2.14.0](releases/2.14.0.md) | 2026-02-07 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.14.0) |
| [v2.13.0](releases/2.13.0.md) | 2026-02-05 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.13.0) |
| [v2.12.0](releases/2.12.0.md) | 2026-01-29 | [GitHub](https://github.com/anthropics/anthropic-sdk-java/releases/tag/v2.12.0) |

## Notable Releases

### v2.12.0 (2026-01-29) — Opus 4.5 + Structured Outputs + Computer Use v5

Largest release of the window. Adds:
- Claude Opus 4.5 model support
- Effort parameter
- Advance Tool Use Features
- Autocompaction
- Computer Use v5
- Structured Outputs in the Messages API
- `output_config` (migration from `output_format`)
- Microsoft Foundry support for Anthropic models
- Configurable dispatcher executor service, `HttpRequest#url()` method
- Multiple client fixes: float→int coercion disallowed, max-retries fully respected, OkHttp call cancellation on future cancel, BetaMessageAccumulator crash fix on empty tool input

### v2.13.0 (2026-02-05) — Claude Opus 4.6 + Adaptive Thinking

- Release of Claude Opus 4.6
- Adaptive thinking support
- Warning emitted when using `thinking` on the new model

### v2.15.0 (2026-02-19) — Claude Sonnet 4.6, Automatic Caching, Haiku-3 Deprecation

- Release of claude-sonnet-4-6
- Top-level cache control (automatic caching)
- **Deprecation:** Haiku-3 marked deprecated in API
- Connection pooling option in client
- Shared `UserLocation` and error code types fixed

### v2.16.0 (2026-03-06) — Memory Tools + Rebrand to Claude SDK

- `support memory tools` (#853)
- Documentation rebranded from "Anthropic SDK" to "Claude SDK"
- Client model references updated from `claude-4-sonnet-20250514` to `claude-sonnet-4-5`
- `array_format` changed to brackets
- Apache dependency dropped

### v2.22.0 (2026-04-08) — Claude Managed Agents + Bedrock Mantle Client

- API support for Claude Managed Agents (CMA)
- Bedrock Mantle client created (#1066)

### v2.25.0 (2026-04-14) — Sonnet/Opus 4 Deprecation

- **Deprecation:** Sonnet 4 and Opus 4 marked deprecated
- Missing streaming events added

### v2.26.0 (2026-04-16) — Claude Opus 4.7 + Token Budgets + User Profiles

- Claude Opus 4.7 model added
- Token budgets parameter
- `user_profiles` field added

### v2.28.0 (2026-05-04) — Workload Identity Federation + OAuth

- Workload Identity Federation
- Interactive OAuth
- Auth profiles
- Managed Agents API improvements
- More robust error parsing
- Headers settable via environment variables

### v2.30.0 (2026-05-06) — Multiagents, Outcomes, Webhooks, Vault Validation

- Managed Agents: multiagents and outcomes
- Webhooks support
- Vault validation
- Proxy authentication support

### v2.31.0 (2026-05-11) — Logging Hardening (Security-Adjacent)

- API-key headers redacted in debug logs
- Improved logging
- Concurrent test log-pollution fixes

### v2.32.0 (2026-05-13) — MCP Tool Helpers + Cache Diagnostics

- MCP tool helpers added (#1161) — first-class MCP integration
- Cache diagnostics beta
- `BetaManagedAgentsSearchResultBlock` types

### v2.34.0 (2026-05-21) — Thinking-Token-Count Streaming

- Thinking-token-count beta: estimated tokens in thinking block deltas when streaming

## Themes Across the Window

1. **Model cadence:** Opus 4.5 (v2.12), Opus 4.6 (v2.13), Sonnet 4.6 (v2.15), Opus 4.7 (v2.26), mythos-preview (v2.21). Sonnet/Opus 4 + Haiku-3 deprecated in-window.
2. **Managed Agents (CMA) buildout:** v2.22 introduced, then iterated through v2.23 (advisor tool), v2.27 (memory public beta), v2.28 (API improvements), v2.30 (multiagents + outcomes + webhooks), v2.32 (search result block), v2.33 (self-hosted sandboxes).
3. **Auth surface expansion:** v2.28 added Workload Identity Federation, interactive OAuth, auth profiles; v2.29 added OIDC federation workspace targeting; v2.30 added proxy auth.
4. **Memory + Caching:** Memory tools (v2.16), automatic top-level cache control (v2.15), cache diagnostics beta (v2.32).
5. **Tool ecosystem:** Computer Use v5 (v2.12), Memory tools (v2.16), MCP helpers (v2.32), Advisor tool (v2.23/v2.24).

## Breaking-Change / Security Flags

- **Deprecations (functional but flagged in API):**
  - Haiku-3 deprecated (v2.15.0)
  - Sonnet 4 and Opus 4 deprecated (v2.25.0)
- **Migration:** `output_format` → `output_config` (v2.12.0). Old field path migrated.
- **Renames/Reshapes:**
  - `array_format` changed to brackets (v2.16.0)
  - Client default model reference updated from `claude-4-sonnet-20250514` to `claude-sonnet-4-5` (v2.16.0)
  - Library rebranded internally from "Anthropic SDK" to "Claude SDK" (v2.16.0 docs)
- **Security-adjacent:** v2.31.0 redacts api-key headers in debug logs (prior versions logged them in debug-level traces). Worth flagging for downstream consumers running with debug logging enabled.
- **No CVEs or formal security advisories observed in release notes for this window.**
