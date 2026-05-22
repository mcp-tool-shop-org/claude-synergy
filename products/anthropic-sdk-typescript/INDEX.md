---
product: anthropic-sdk-typescript
window: "2026-01-01 .. 2026-05-21"
total_releases: 53
fetched_at: "2026-05-21"
source: "https://github.com/anthropics/anthropic-sdk-typescript/releases"
---

# anthropic-sdk-typescript Release Index

**Window:** 2026-01-01 through 2026-05-21 (inclusive)
**Total releases:** 53
**Source:** [anthropics/anthropic-sdk-typescript GitHub Releases](https://github.com/anthropics/anthropic-sdk-typescript/releases)
**Repo type:** Multi-package monorepo. Separate tags per package (sdk, vertex-sdk, bedrock-sdk, aws-sdk, foundry-sdk).

## Release counts by package

| Package | Count |
|---|---|
| `sdk` | 33 |
| `vertex-sdk` | 6 |
| `bedrock-sdk` | 9 |
| `aws-sdk` | 3 |
| `foundry-sdk` | 2 |
| **Total** | **53** |

## Notable releases

| Date | Tag | Package | Highlight |
|---|---|---|---|
| 2026-02-05 | [`sdk-v0.73.0`](./sdk-0.73.0.md) | `sdk` | **api:** Release Claude Opus 4.6, adaptive thinking, and other features ([f741f92](https://github.com/anthropics/anthrop |
| 2026-01-29 | [`sdk-v0.72.0`](./sdk-0.72.0.md) | `sdk` | **api:** add support for Structured Outputs in the Messages API ([eeb7fab](https://github.com/anthropics/anthropic-sdk-t |
| 2026-04-16 | [`sdk-v0.90.0`](./sdk-0.90.0.md) | `sdk` | **api:** add claude-opus-4-7, token budgets and user_profiles ([b26134b](https://github.com/anthropics/anthropic-sdk-typ |
| 2026-02-17 | [`sdk-v0.75.0`](./sdk-0.75.0.md) | `sdk` | **api:** Releasing claude-sonnet-4-6 ([d75e1c0](https://github.com/anthropics/anthropic-sdk-typescript/commit/d75e1c07bf |
| 2026-02-07 | [`sdk-v0.74.0`](./sdk-0.74.0.md) | `sdk` | **api:** enabling fast-mode in claude-opus-4-6 ([e337981](https://github.com/anthropics/anthropic-sdk-typescript/commit/ |

## sdk

33 releases in window.

| Date | Version | Tag | Summary |
|---|---|---|---|
| 2026-05-21 | `0.98.0` | [`sdk-v0.98.0`](./sdk-0.98.0.md) | **api:** Add support for thinking-token-count beta for estimated tokens in thinking block deltas when streaming ([0528d4 |
| 2026-05-19 | `0.97.1` | [`sdk-v0.97.1`](./sdk-0.97.1.md) | **runner:** skip tool calls SessionToolRunner does not own ([9987379](https://github.com/anthropics/anthropic-sdk-typesc |
| 2026-05-19 | `0.97.0` | [`sdk-v0.97.0`](./sdk-0.97.0.md) | **client:** Add support for self-hosted sandboxes in CMA with sandbox helpers ([659a343](https://github.com/anthropics/a |
| 2026-05-13 | `0.96.0` | [`sdk-v0.96.0`](./sdk-0.96.0.md) | **api:** Add BetaManagedAgentsSearchResultBlock types ([08f02f3](https://github.com/anthropics/anthropic-sdk-typescript/ |
| 2026-05-11 | `0.95.2` | [`sdk-v0.95.2`](./sdk-0.95.2.md) |  |
| 2026-05-07 | `0.95.1` | [`sdk-v0.95.1`](./sdk-0.95.1.md) | redact api-key headers in debug logs ([fad8fee](https://github.com/anthropics/anthropic-sdk-typescript/commit/fad8feeb51 |
| 2026-05-06 | `0.95.0` | [`sdk-v0.95.0`](./sdk-0.95.0.md) | **api:** add support for Managed Agents multiagents and outcomes, webhooks, vault validation ([e0c0e9b](https://github.c |
| 2026-05-05 | `0.94.0` | [`sdk-v0.94.0`](./sdk-0.94.0.md) | **client:** allow targeting a workspace for OIDC federation token exchange ([bde6620](https://github.com/anthropics/anth |
| 2026-05-04 | `0.93.0` | [`sdk-v0.93.0`](./sdk-0.93.0.md) | **client:** add Workload Identity Federation, interactive OAuth, and auth profiles ([d5d6abd](https://github.com/anthrop |
| 2026-04-30 | `0.92.0` | [`sdk-v0.92.0`](./sdk-0.92.0.md) | **api:** improve Managed Agents APIs ([ca1bf4a](https://github.com/anthropics/anthropic-sdk-typescript/commit/ca1bf4a9b2 |
| 2026-04-24 | `0.91.1` | [`sdk-v0.91.1`](./sdk-0.91.1.md) | **memory:** use restrictive file mode for memory files ([#901](https://github.com/anthropics/anthropic-sdk-typescript/is |
| 2026-04-23 | `0.91.0` | [`sdk-v0.91.0`](./sdk-0.91.0.md) | **api:** CMA Memory public beta ([ddf732f](https://github.com/anthropics/anthropic-sdk-typescript/commit/ddf732f5f35c123 |
| 2026-04-16 | `0.90.0` | [`sdk-v0.90.0`](./sdk-0.90.0.md) | **api:** add claude-opus-4-7, token budgets and user_profiles ([b26134b](https://github.com/anthropics/anthropic-sdk-typ |
| 2026-04-14 | `0.89.0` | [`sdk-v0.89.0`](./sdk-0.89.0.md) | **api:** manual updates ([57c2a11](https://github.com/anthropics/anthropic-sdk-typescript/commit/57c2a11c61ef9dfdad49a3a |
| 2026-04-10 | `0.88.0` | [`sdk-v0.88.0`](./sdk-0.88.0.md) | vertex eu region ([#882](https://github.com/anthropics/anthropic-sdk-typescript/issues/882)) ([1933857](https://github.c |
| 2026-04-09 | `0.87.0` | [`sdk-v0.87.0`](./sdk-0.87.0.md) | **api:** Add beta advisor tool ([1e99a8d](https://github.com/anthropics/anthropic-sdk-typescript/commit/1e99a8db387b8dbc |
| 2026-04-08 | `0.86.1` | [`sdk-v0.86.1`](./sdk-0.86.1.md) | update @anthropic-ai/sdk dependency version ([#870](https://github.com/anthropics/anthropic-sdk-typescript/issues/870))  |
| 2026-04-08 | `0.86.0` | [`sdk-v0.86.0`](./sdk-0.86.0.md) | **api:** add support for Claude Managed Agents ([2ef732a](https://github.com/anthropics/anthropic-sdk-typescript/commit/ |
| 2026-04-07 | `0.85.0` | [`sdk-v0.85.0`](./sdk-0.85.0.md) | **client:** Create Bedrock Mantle client ([#810](https://github.com/anthropics/anthropic-sdk-typescript/issues/810)) ([2 |
| 2026-04-07 | `0.84.0` | [`sdk-v0.84.0`](./sdk-0.84.0.md) | **api:** Add support for claude-mythos-preview ([d4057b0](https://github.com/anthropics/anthropic-sdk-typescript/commit/ |
| 2026-04-03 | `0.83.0` | [`sdk-v0.83.0`](./sdk-0.83.0.md) | **vertex:** add support for US multi-region endpoint ([5e5aea7](https://github.com/anthropics/anthropic-sdk-typescript/c |
| 2026-04-01 | `0.82.0` | [`sdk-v0.82.0`](./sdk-0.82.0.md) | **api:** add structured stop_details to message responses ([031328a](https://github.com/anthropics/anthropic-sdk-typescr |
| 2026-03-31 | `0.81.0` | [`sdk-v0.81.0`](./sdk-0.81.0.md) | add .type field to APIError for error kind identification ([#790](https://github.com/anthropics/anthropic-sdk-typescript |
| 2026-03-18 | `0.80.0` | [`sdk-v0.80.0`](./sdk-0.80.0.md) | **api:** manual updates ([dd12f1a](https://github.com/anthropics/anthropic-sdk-typescript/commit/dd12f1a29c4a8f4554caa8c |
| 2026-03-16 | `0.79.0` | [`sdk-v0.79.0`](./sdk-0.79.0.md) | add support for filesystem memory tools ([#599](https://github.com/anthropics/anthropic-sdk-typescript/issues/599)) ([10 |
| 2026-02-19 | `0.78.0` | [`sdk-v0.78.0`](./sdk-0.78.0.md) | **api:** Add top-level cache control (automatic caching) ([1e2f83d](https://github.com/anthropics/anthropic-sdk-typescri |
| 2026-02-18 | `0.77.0` | [`sdk-v0.77.0`](./sdk-0.77.0.md) | **api:** fix shared UserLocation and error code types ([c84038f](https://github.com/anthropics/anthropic-sdk-typescript/ |
| 2026-02-18 | `0.76.0` | [`sdk-v0.76.0`](./sdk-0.76.0.md) | **api:** Make new tool versions available as top level tool types ([25fe41c](https://github.com/anthropics/anthropic-sdk |
| 2026-02-17 | `0.75.0` | [`sdk-v0.75.0`](./sdk-0.75.0.md) | **api:** Releasing claude-sonnet-4-6 ([d75e1c0](https://github.com/anthropics/anthropic-sdk-typescript/commit/d75e1c07bf |
| 2026-02-07 | `0.74.0` | [`sdk-v0.74.0`](./sdk-0.74.0.md) | **api:** enabling fast-mode in claude-opus-4-6 ([e337981](https://github.com/anthropics/anthropic-sdk-typescript/commit/ |
| 2026-02-05 | `0.73.0` | [`sdk-v0.73.0`](./sdk-0.73.0.md) | **api:** Release Claude Opus 4.6, adaptive thinking, and other features ([f741f92](https://github.com/anthropics/anthrop |
| 2026-01-30 | `0.72.1` | [`sdk-v0.72.1`](./sdk-0.72.1.md) | **client:** remove OutputFormat exports from index.ts ([bf2cf08](https://github.com/anthropics/anthropic-sdk-typescript/ |
| 2026-01-29 | `0.72.0` | [`sdk-v0.72.0`](./sdk-0.72.0.md) | **api:** add support for Structured Outputs in the Messages API ([eeb7fab](https://github.com/anthropics/anthropic-sdk-t |

## vertex-sdk

6 releases in window.

| Date | Version | Tag | Summary |
|---|---|---|---|
| 2026-05-19 | `0.16.1` | [`vertex-sdk-v0.16.1`](./vertex-sdk-0.16.1.md) | align @types/node in sub-packages to fix CI build ([#1017](https://github.com/anthropics/anthropic-sdk-typescript/issues |
| 2026-04-10 | `0.16.0` | [`vertex-sdk-v0.16.0`](./vertex-sdk-0.16.0.md) | vertex eu region ([#882](https://github.com/anthropics/anthropic-sdk-typescript/issues/882)) ([1933857](https://github.c |
| 2026-04-03 | `0.15.0` | [`vertex-sdk-v0.15.0`](./vertex-sdk-0.15.0.md) | **vertex:** add support for US multi-region endpoint ([5e5aea7](https://github.com/anthropics/anthropic-sdk-typescript/c |
| 2026-02-19 | `0.14.4` | [`vertex-sdk-v0.14.4`](./vertex-sdk-0.14.4.md) |  |
| 2026-02-05 | `0.14.3` | [`vertex-sdk-v0.14.3`](./vertex-sdk-0.14.3.md) | **client:** avoid memory leak with abort signals ([53e47df](https://github.com/anthropics/anthropic-sdk-typescript/commi |
| 2026-01-29 | `0.14.2` | [`vertex-sdk-v0.14.2`](./vertex-sdk-0.14.2.md) | **internal:** version bump ([24ecc83](https://github.com/anthropics/anthropic-sdk-typescript/commit/24ecc838b0adbb837b14 |

## bedrock-sdk

9 releases in window.

| Date | Version | Tag | Summary |
|---|---|---|---|
| 2026-05-19 | `0.29.2` | [`bedrock-sdk-v0.29.2`](./bedrock-sdk-0.29.2.md) | align @types/node in sub-packages to fix CI build ([#1017](https://github.com/anthropics/anthropic-sdk-typescript/issues |
| 2026-04-30 | `0.29.1` | [`bedrock-sdk-v0.29.1`](./bedrock-sdk-0.29.1.md) | **bedrock:** throw APIError for error events delivered in chunk frames ([#1021](https://github.com/anthropics/anthropic- |
| 2026-04-23 | `0.29.0` | [`bedrock-sdk-v0.29.0`](./bedrock-sdk-0.29.0.md) | **bedrock:** use auth header for mantle client ([#866](https://github.com/anthropics/anthropic-sdk-typescript/issues/866 |
| 2026-04-08 | `0.28.1` | [`bedrock-sdk-v0.28.1`](./bedrock-sdk-0.28.1.md) | update @anthropic-ai/sdk dependency version ([#870](https://github.com/anthropics/anthropic-sdk-typescript/issues/870))  |
| 2026-04-07 | `0.28.0` | [`bedrock-sdk-v0.28.0`](./bedrock-sdk-0.28.0.md) | **client:** Create Bedrock Mantle client ([#810](https://github.com/anthropics/anthropic-sdk-typescript/issues/810)) ([2 |
| 2026-04-01 | `0.27.0` | [`bedrock-sdk-v0.27.0`](./bedrock-sdk-0.27.0.md) | support API keys in Bedrock SDK ([#824](https://github.com/anthropics/anthropic-sdk-typescript/issues/824)) ([be6c608](h |
| 2026-02-19 | `0.26.4` | [`bedrock-sdk-v0.26.4`](./bedrock-sdk-0.26.4.md) | **bedrock:** eliminate race condition in AWS credential resolution ([#901](https://github.com/anthropics/anthropic-sdk-t |
| 2026-02-05 | `0.26.3` | [`bedrock-sdk-v0.26.3`](./bedrock-sdk-0.26.3.md) | **client:** avoid memory leak with abort signals ([53e47df](https://github.com/anthropics/anthropic-sdk-typescript/commi |
| 2026-01-29 | `0.26.2` | [`bedrock-sdk-v0.26.2`](./bedrock-sdk-0.26.2.md) | **internal:** version bump ([24ecc83](https://github.com/anthropics/anthropic-sdk-typescript/commit/24ecc838b0adbb837b14 |

## aws-sdk

3 releases in window.

| Date | Version | Tag | Summary |
|---|---|---|---|
| 2026-05-11 | `0.3.0` | [`aws-sdk-v0.3.0`](./aws-sdk-0.3.0.md) | **aws:** Add AWS client for Claude Platform on AWS ([7a31772](https://github.com/anthropics/anthropic-sdk-typescript/com |
| 2026-04-08 | `0.2.5` | [`aws-sdk-v0.2.5`](./aws-sdk-0.2.5.md) | **internal:** version bump ([eb97e85](https://github.com/anthropics/anthropic-sdk-typescript/commit/eb97e8577279fb150582 |
| 2026-04-01 | `0.2.0` | [`aws-sdk-v0.2.0`](./aws-sdk-0.2.0.md) | prepare aws package ([#782](https://github.com/anthropics/anthropic-sdk-typescript/issues/782)) ([f351d4d](https://githu |

## foundry-sdk

2 releases in window.

| Date | Version | Tag | Summary |
|---|---|---|---|
| 2026-02-05 | `0.2.3` | [`foundry-sdk-v0.2.3`](./foundry-sdk-0.2.3.md) | **client:** avoid memory leak with abort signals ([53e47df](https://github.com/anthropics/anthropic-sdk-typescript/commi |
| 2026-01-29 | `0.2.2` | [`foundry-sdk-v0.2.2`](./foundry-sdk-0.2.2.md) | **internal:** version bump ([24ecc83](https://github.com/anthropics/anthropic-sdk-typescript/commit/24ecc838b0adbb837b14 |

