---
product: anthropic-sdk-php
source: https://github.com/anthropics/anthropic-sdk-php/releases
window_start: 2026-01-01
window_end: 2026-05-21
fetched_at: 2026-05-21
release_count: 21
launched: 2025-08-27 (beta, per Claude API release notes)
---

# anthropic-sdk-php — Release Index

Historical release record for the official Anthropic PHP SDK, covering the window 2026-01-01 through 2026-05-21. The package remained pre-1.0 throughout this window (zero-major / 0.x), meaning by SemVer convention any minor bump may carry breaking changes.

## Historical Releases

| Version | Released | Notes |
|---------|----------|-------|
| [0.24.0](releases/0.24.0.md) | 2026-05-21 | thinking-token-count beta (streaming thinking-block deltas) |
| [0.23.0](releases/0.23.0.md) | 2026-05-19 | CMA self-hosted sandboxes + sandbox helpers |
| [0.22.0](releases/0.22.0.md) | 2026-05-13 | BetaManagedAgentsSearchResultBlock types; cache diagnostics beta; Guzzle streaming fix |
| [0.21.0](releases/0.21.0.md) | 2026-05-11 | **AWS client for Claude Platform on AWS**; PageCursor pagination fix; betas-param-override fix |
| [0.20.0](releases/0.20.0.md) | 2026-05-06 | Managed Agents multiagents/outcomes; webhooks; vault validation |
| [0.19.0](releases/0.19.0.md) | 2026-05-05 | OIDC federation: workspace targeting for token exchange |
| [0.18.0](releases/0.18.0.md) | 2026-05-04 | Workload Identity Federation; interactive OAuth; auth profiles; MCP tool helpers; env-based header config |
| [0.17.1](releases/0.17.1.md) | 2026-04-27 | **Hotfix:** revert enum parsing change that caused unconditional failure |
| [0.17.0](releases/0.17.0.md) | 2026-04-23 | CMA Memory public beta; union/enum serialization fixes |
| [0.16.0](releases/0.16.0.md) | 2026-04-16 | **claude-opus-4-7 support**, token budgets, user_profiles |
| [0.15.0](releases/0.15.0.md) | 2026-04-14 | Upload methods enabled; Bedrock Mantle auth header; streaming-event completeness |
| [0.14.0](releases/0.14.0.md) | 2026-04-10 | Vertex EU region; file params generation fix |
| [0.13.0](releases/0.13.0.md) | 2026-04-09 | Beta advisor tool |
| [0.12.0](releases/0.12.0.md) | 2026-04-08 | Claude Managed Agents (CMA) support |
| [0.11.0](releases/0.11.0.md) | 2026-04-07 | Bedrock Mantle client |
| [0.10.0](releases/0.10.0.md) | 2026-04-07 | claude-mythos-preview; Vertex US multi-region endpoint |
| [0.9.0](releases/0.9.0.md) | 2026-04-01 | AWS package prep; Bedrock API-key auth; APIStatusException.errorType; structured stop_details |
| [0.8.0](releases/0.8.0.md) | 2026-03-18 | **Removed Bedrock/Vertex/Foundry clients + structured output** (filed under chores — see Breaking Changes) |
| [0.7.0](releases/0.7.0.md) | 2026-03-16 | Beta tool runner; structured-output helpers for messages; thinking-display-setting GA |
| [0.6.0](releases/0.6.0.md) | 2026-02-19 | **Bedrock + Vertex + Foundry clients**; speed mode; top-level cache control (automatic caching) |
| [0.5.0](releases/0.5.0.md) | 2026-01-30 | **BREAKING:** camelCase class properties; replace `omittable` flag with `null`; BaseResponse; idempotency header |

## Notable Releases

### v0.5.0 (2026-01-30) — Naming convention break
First release in the window and the only one with an explicit `BREAKING CHANGES` section. Two breaks land together:
- Class properties switched to camelCase (was previously snake_case).
- The special `omittable` flag type was replaced with plain `null`.

Also added the `BaseResponse` class for accessing raw responses and idempotency-header support.

### v0.6.0 (2026-02-19) — Multi-platform expansion
Major surface-area growth: Bedrock, Vertex, and Foundry clients all added in a single release alongside speed mode and top-level cache control (automatic caching). Largest body in the window.

### v0.21.0 (2026-05-11) — Pagination and betas-header bugs
Adds the AWS client for Claude Platform on AWS, and fixes two correctness bugs that affected real client behavior:
- `PageCursor` not advancing past the first page (silent data loss when iterating).
- Per-endpoint `extraHeaders` default silently overriding caller-supplied `betas` request parameter.

## Breaking Changes & Removals

The SDK is pre-1.0 (0.x) so minor bumps carry no SemVer stability guarantees. Explicit and de-facto breaks observed in the window:

- **v0.5.0** — Explicitly labeled `BREAKING CHANGES`: camelCase property naming + `omittable` -> `null`.
- **v0.8.0** — Filed under `chores` but materially breaking: **removed** the Bedrock, Vertex, and Foundry clients that v0.6.0 had introduced, plus removed structured output. Bedrock/Vertex returned piecemeal across v0.9.0 (aws prep, Bedrock API-key auth), v0.10.0 (Vertex US multi-region), v0.11.0 (Bedrock Mantle), v0.14.0 (Vertex EU region), and v0.21.0 (AWS client). Foundry did not return in the window.
- **v0.17.0 -> v0.17.1** — v0.17.0 shipped an enum parsing change that caused unconditional failure on the path covered; v0.17.1 reverted it the next business day (a regression, not a labeled break, but functionally a hard incompatibility for v0.17.0 users).

## Security Advisories

None published in the window. No CVEs, vulnerability notices, or security-tagged sections appear in any of the 21 release bodies.

## Trajectory Summary

- 21 releases in ~16 weeks (averaging ~1 minor per 5-6 days), cadence accelerating from monthly (Jan-Feb) to ~weekly (Apr-May).
- Strong April-May activity around Managed Agents (CMA) — introduced in v0.12.0, then iterated across v0.17.0 (Memory beta), v0.18.0 (API improvements), v0.20.0 (multiagents/outcomes/webhooks), v0.22.0 (search-result-block types), v0.23.0 (self-hosted sandboxes).
- Auth surface matured substantially in v0.18.0-v0.19.0 (Workload Identity Federation, interactive OAuth, auth profiles, OIDC workspace targeting).
- Cloud-platform support consolidated under a unified `AWS client` in v0.21.0 after the Bedrock/Vertex/Foundry rollercoaster of v0.6.0 -> v0.8.0 removal -> piecemeal re-introduction.
- Package remains pre-1.0 throughout the window; no 1.0 release shipped by 2026-05-21.
