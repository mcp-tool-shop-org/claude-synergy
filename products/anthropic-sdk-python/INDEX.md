---
product: anthropic-sdk-python
source: GitHub Releases
source_url: https://github.com/anthropics/anthropic-sdk-python/releases
window_start: 2026-01-01
window_end: 2026-05-21
release_count: 33
fetched_at: 2026-05-21
---

# anthropic-sdk-python — Release Index

Canonical Python SDK for the Claude API (`pip install anthropic`). Distinct from `claude-agent-sdk-python` (agent loop) and Claude Code itself. Versions in the 2026-01-01 → 2026-05-21 window track API surface additions (Structured Outputs, Managed Agents, automatic caching, AWS client, sandboxes, thinking-token-count), new model releases (Opus 4.6, Sonnet 4.6, Opus 4.7, claude-mythos-preview), and cloud-provider expansion (Vertex US/EU, Bedrock Mantle, AWS).

## Historical Table

| Version | Released | Headline |
|---|---|---|
| [0.104.0](0.104.0.md) | 2026-05-21 | thinking-token-count beta — estimated tokens in thinking block streaming deltas |
| [0.103.1](0.103.1.md) | 2026-05-19 | Bug fix: SessionToolRunner skips tool calls it does not own |
| [0.103.0](0.103.0.md) | 2026-05-19 | Self-hosted sandboxes in CMA with sandbox helpers |
| [0.102.0](0.102.0.md) | 2026-05-13 | Cache diagnostics beta; BetaManagedAgentsSearchResultBlock types |
| [0.101.0](0.101.0.md) | 2026-05-11 | AWS client for Claude Platform on AWS |
| [0.100.0](0.100.0.md) | 2026-05-06 | Managed Agents multiagents, outcomes, webhooks, vault validation |
| [0.99.0](0.99.0.md) | 2026-05-05 | OIDC workspace targeting for federation token exchange |
| [0.98.1](0.98.1.md) | 2026-05-04 | Docs typo fix |
| [0.98.0](0.98.0.md) | 2026-05-04 | Workload Identity Federation, interactive OAuth, auth profiles; header env support; Managed Agents API improvements |
| [0.97.0](0.97.0.md) | 2026-04-23 | CMA Memory public beta |
| [0.96.0](0.96.0.md) | 2026-04-16 | claude-opus-4-7, token budgets, user_profiles |
| [0.95.0](0.95.0.md) | 2026-04-14 | Mark Sonnet/Opus 4 as deprecated; Bedrock Mantle auth header |
| [0.94.1](0.94.1.md) | 2026-04-13 | Streaming: add missing events |
| [0.94.0](0.94.0.md) | 2026-04-10 | Vertex EU region |
| [0.93.0](0.93.0.md) | 2026-04-09 | Beta advisor tool |
| [0.92.0](0.92.0.md) | 2026-04-08 | Claude Managed Agents support |
| [0.91.0](0.91.0.md) | 2026-04-07 | Bedrock Mantle client |
| [0.90.0](0.90.0.md) | 2026-04-07 | claude-mythos-preview |
| [0.89.0](0.89.0.md) | 2026-04-03 | Vertex US multi-region; deprecate client-side compaction helpers |
| [0.88.0](0.88.0.md) | 2026-04-01 | Structured stop_details; Bedrock API key auth; aws package prep |
| [0.87.0](0.87.0.md) | 2026-03-31 | APIStatusError error_type field; indices array format serialization; memory file security fixes |
| [0.86.0](0.86.0.md) | 2026-03-18 | Filesystem memory tools support |
| [0.85.0](0.85.0.md) | 2026-03-16 | GA thinking-display-setting; 413/529 async error handlers; clean model enum list |
| [0.84.0](0.84.0.md) | 2026-02-25 | MCP tools/prompts/resources conversion helpers; array_format brackets; rebrand to Claude SDK |
| [0.83.0](0.83.0.md) | 2026-02-19 | Top-level cache control (automatic caching) |
| [0.82.0](0.82.0.md) | 2026-02-18 | Shared UserLocation/error code types; backward-compat aliases |
| [0.81.0](0.81.0.md) | 2026-02-18 | New tool versions exposed as top-level tool types |
| [0.80.0](0.80.0.md) | 2026-02-17 | Releasing claude-sonnet-4-6; remove speed from GA messages |
| [0.79.0](0.79.0.md) | 2026-02-07 | Fast-mode enabled in claude-opus-4-6 |
| [0.78.0](0.78.0.md) | 2026-02-05 | Claude Opus 4.6, adaptive thinking, and other features |
| [0.77.1](0.77.1.md) | 2026-02-03 | Send structured-output beta header when format omitted |
| [0.77.0](0.77.0.md) | 2026-01-29 | Structured Outputs in Messages API; output_config migration; custom JSON encoder |
| [0.76.0](0.76.0.md) | 2026-01-13 | Raw JSON schema in messages.stream(); binary request streaming; server-side tools via tool runner |

## Notable Releases

These are the substantive feature additions — new API surfaces, beta header additions, new model releases, and cloud-provider expansion. Patches, doc tweaks, and chore-only releases are omitted from this list.

### v0.104.0 (2026-05-21) — thinking-token-count beta

Adds the `thinking-token-count` beta which emits estimated tokens in thinking block deltas during streaming. First-class observability for extended thinking spend before the message terminates.

### v0.101.0 (2026-05-11) — AWS client

Introduces a dedicated AWS client for Claude Platform on AWS (`AnthropicAWS`), alongside the existing Vertex and Bedrock provider clients. This is part of the AWS package work that started in v0.88.0 ("prepare aws package") and was wired up here.

### v0.98.0 (2026-05-04) — Workload Identity Federation + OAuth + auth profiles

Major auth expansion:
- **Workload Identity Federation** — OIDC-based token exchange for cloud-to-cloud auth without long-lived secrets
- **Interactive OAuth** — browser-flow auth for desktop/CLI usage
- **Auth profiles** — named credential sets (similar to AWS profiles)
- Headers can now be set via environment variables
- Managed Agents APIs improved

### v0.97.0 (2026-04-23) — CMA Memory public beta

Claude Managed Agents Memory is now public beta. Pairs with v0.86.0's filesystem memory tools and v0.96.0's user_profiles work as the agent-memory product line.

### v0.96.0 (2026-04-16) — claude-opus-4-7 + token budgets + user_profiles

New flagship model `claude-opus-4-7`. Adds `token budgets` (per-request spend limits) and `user_profiles` (persistent per-user context for Managed Agents).

### v0.92.0 (2026-04-08) — Claude Managed Agents

First-class support for the Claude Managed Agents (CMA) API — Anthropic's managed agent-loop product. The CMA surface continues expanding through v0.97 (Memory beta), v0.98 (improved APIs), v0.100 (multiagents/outcomes/webhooks/vault), v0.102 (search result blocks), and v0.103 (sandboxes).

### v0.86.0 (2026-03-18) — Filesystem memory tools

Adds SDK support for the filesystem memory tools. Restrictive file mode + path validation hardening followed in v0.87.0.

### v0.83.0 (2026-02-19) — Top-level cache control (automatic caching)

`cache_control` becomes a top-level Messages API parameter — automatic caching without per-block annotation. Pairs with the cache-diagnostics beta in v0.102.0.

### v0.78.0 (2026-02-05) — Claude Opus 4.6, adaptive thinking

Headline model release: Opus 4.6 with adaptive thinking. v0.79.0 then enabled fast-mode for the same model; v0.80.0 (2026-02-17) shipped Sonnet 4.6.

### v0.77.0 (2026-01-29) — Structured Outputs in Messages API

Adds Structured Outputs to the Messages API via the new `output_config` parameter (replacing the earlier `output_format` shape). Introduces a custom JSON encoder for extended type support. Hot-fixed in v0.77.1 to ensure the beta header sends when format is omitted.

### v0.76.0 (2026-01-13) — Server-side tools + binary streaming + raw JSON schema

Three independent feature lines in one release: server-side tool execution via the tool runner, binary request streaming on the base client, and raw JSON schemas accepted by `messages.stream()`.
