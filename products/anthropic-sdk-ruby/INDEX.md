---
product: anthropic-sdk-ruby
source: GitHub Releases — https://github.com/anthropics/anthropic-sdk-ruby/releases
window_start: "2026-01-01"
window_end: "2026-05-21"
fetched_at: "2026-05-21"
total_releases: 30
---

# anthropic-sdk-ruby — Release Index

Historical release data for [anthropics/anthropic-sdk-ruby](https://github.com/anthropics/anthropic-sdk-ruby), covering the window 2026-01-01 through 2026-05-21.

## Historical Table

| Version | Released | Headline |
|---------|----------|----------|
| [1.43.0](releases/1.43.0.md) | 2026-05-21 | thinking-token-count beta for estimated tokens in thinking block deltas when streaming |
| [1.42.0](releases/1.42.0.md) | 2026-05-19 | api spec updates |
| [1.41.0](releases/1.41.0.md) | 2026-05-13 | BetaManagedAgentsSearchResultBlock types; cache diagnostics beta |
| [1.40.0](releases/1.40.0.md) | 2026-05-11 | feature additions + bug fixes |
| [1.39.0](releases/1.39.0.md) | 2026-05-06 | Managed Agents multiagents, outcomes, webhooks, vault validation |
| [1.38.0](releases/1.38.0.md) | 2026-05-05 | feature additions |
| [1.37.0](releases/1.37.0.md) | 2026-05-04 | improvements to Managed Agents APIs |
| [1.36.0](releases/1.36.0.md) | 2026-04-23 | CMA Memory public beta |
| [1.35.0](releases/1.35.0.md) | 2026-04-16 | claude-opus-4-7, token budgets, user_profiles |
| [1.34.0](releases/1.34.0.md) | 2026-04-14 | mark Sonnet and Opus 4 deprecated |
| [1.33.1](releases/1.33.1.md) | 2026-04-13 | bug fixes |
| [1.33.0](releases/1.33.0.md) | 2026-04-10 | feature additions |
| [1.32.0](releases/1.32.0.md) | 2026-04-09 | beta advisor tool |
| [1.31.0](releases/1.31.0.md) | 2026-04-08 | support for Claude Managed Agents |
| [1.30.0](releases/1.30.0.md) | 2026-04-07 | feature additions |
| [1.29.0](releases/1.29.0.md) | 2026-04-07 | support for claude-mythos-preview |
| [1.28.0](releases/1.28.0.md) | 2026-04-03 | feature additions |
| [1.27.0](releases/1.27.0.md) | 2026-04-01 | structured stop_details in message responses |
| [1.26.0](releases/1.26.0.md) | 2026-03-31 | feature additions + bug fixes |
| [1.25.0](releases/1.25.0.md) | 2026-03-18 | manual API updates |
| [1.24.0](releases/1.24.0.md) | 2026-03-16 | GA thinking-display-setting; model enum cleanup |
| [1.23.0](releases/1.23.0.md) | 2026-02-19 | top-level cache control (automatic caching); deprecate haiku-3 |
| [1.22.0](releases/1.22.0.md) | 2026-02-18 | fix shared UserLocation and error code types |
| [1.21.0](releases/1.21.0.md) | 2026-02-18 | new tool versions available as top level tool types |
| [1.20.0](releases/1.20.0.md) | 2026-02-17 | releasing claude-sonnet-4-6 |
| [1.19.0](releases/1.19.0.md) | 2026-02-07 | enabling fast-mode in claude-opus-4-6 |
| [1.18.1](releases/1.18.1.md) | 2026-02-07 | bug fixes |
| [1.18.0](releases/1.18.0.md) | 2026-02-05 | Claude Opus 4.6, adaptive thinking |
| [1.17.0](releases/1.17.0.md) | 2026-01-29 | Structured Outputs in the Messages API |
| [1.16.3](releases/1.16.3.md) | 2026-01-06 | structured output parsing fix |

## Notable Releases

- **[1.18.0](releases/1.18.0.md) — 2026-02-05 — Claude Opus 4.6 + adaptive thinking.** New flagship model surface for the Ruby SDK; introduces adaptive thinking. Pairs with 1.20.0 (claude-sonnet-4-6), 1.29.0 (claude-mythos-preview), and 1.35.0 (claude-opus-4-7) as the model-rollout arc through the window.
- **[1.31.0](releases/1.31.0.md) — 2026-04-08 — Claude Managed Agents.** First-class support for the Managed Agents API. Extended subsequently in 1.36.0 (CMA Memory public beta), 1.37.0 (Managed Agents API improvements), 1.39.0 (multiagents, outcomes, webhooks, vault validation), and 1.41.0 (BetaManagedAgentsSearchResultBlock types).
- **[1.17.0](releases/1.17.0.md) — 2026-01-29 — Structured Outputs in the Messages API.** Adds structured-output support and migrates send format from `output_format` to `output_config`.

## Notes

- **Breaking changes:** none flagged in release bodies via the BREAKING keyword. All releases in the window are minor or patch bumps within the 1.x series.
- **Deprecations:** 1.23.0 deprecates haiku-3; 1.34.0 marks Sonnet and Opus 4 deprecated. These are model-roster shifts, not SDK API breaks.
- **Format migration (soft-breaking, no BREAKING marker):** 1.17.0 migrated structured-outputs send format from `output_format` to `output_config`. Callers using the older field name needed to update.
- **Security advisories:** none in the window. No CVEs or vulnerability notes appear in any release body.
