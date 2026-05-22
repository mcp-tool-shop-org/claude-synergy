# anthropic-sdk-csharp Release Index

**Product:** anthropic-sdk-csharp (Anthropic .NET SDK)
**Source:** https://github.com/anthropics/anthropic-sdk-csharp
**Window:** 2026-01-01 through 2026-05-21
**Total releases:** 53
**Fetched:** 2026-05-21

## Notes

The C# SDK was launched in **beta on 2025-09-08** and reached **GA on 2026-01-29** (per release notes for `Anthropic-v12.3.0`, which removed the beta warning from the README).

This repository contains **five package channels**, all versioned independently:

- `Anthropic` — core Anthropic API client (highest velocity)
- `Bedrock` — AWS Bedrock provider (first GA 2026-03-16)
- `Vertex` — Google Vertex AI provider (first GA 2026-03-16)
- `Foundry` — Azure AI Foundry provider
- `Aws` — shared AWS support package

Each release is tagged `<Package>-v<X.Y.Z>`. Per-file naming strips the `v`: e.g. `Anthropic-v12.23.0` -> `Anthropic-12.23.0.md`.

## Historical Table

| Released | Version | File | Summary |
|----------|---------|------|---------|
| 2026-05-21 | Anthropic-12.23.0 | [Anthropic-12.23.0.md](./releases/Anthropic-12.23.0.md) | [api] Add support for thinking-token-count beta for estimated tokens in thinking block deltas when streaming |
| 2026-05-19 | Anthropic-12.22.0 | [Anthropic-12.22.0.md](./releases/Anthropic-12.22.0.md) | [client] Add support for self-hosted sandboxes in CMA with sandbox helpers |
| 2026-05-13 | Anthropic-12.21.0 | [Anthropic-12.21.0.md](./releases/Anthropic-12.21.0.md) | [api] Add BetaManagedAgentsSearchResultBlock types; [api] Add support for cache diagnostics beta; [api] spec updates |
| 2026-05-11 | Aws-0.4.0 | [Aws-0.4.0.md](./releases/Aws-0.4.0.md) | [aws] Add AWS client for Claude Platform on AWS; [aws,bedrock] preserve multipart Content-Type and collapse multi-value headers in SigV4 signing; add  |
| 2026-05-11 | Bedrock-0.8.1 | [Bedrock-0.8.1.md](./releases/Bedrock-0.8.1.md) | [aws,bedrock] preserve multipart Content-Type and collapse multi-value headers in SigV4 signing; add SSO package deps |
| 2026-05-11 | Anthropic-12.20.1 | [Anthropic-12.20.1.md](./releases/Anthropic-12.20.1.md) | [internal] disable default HttpClient timeout as we have our own |
| 2026-05-06 | Bedrock-0.8.0 | [Bedrock-0.8.0.md](./releases/Bedrock-0.8.0.md) | [api] add support for Managed Agents multiagents and outcomes, webhooks, vault validation |
| 2026-05-06 | Anthropic-12.20.0 | [Anthropic-12.20.0.md](./releases/Anthropic-12.20.0.md) | [api] add support for Managed Agents multiagents and outcomes, webhooks, vault validation; [api] Adjust webhook configuration |
| 2026-05-05 | Anthropic-12.19.0 | [Anthropic-12.19.0.md](./releases/Anthropic-12.19.0.md) | [client] allow targeting a workspace for OIDC federation token exchange |
| 2026-05-05 | Aws-0.3.0 | [Aws-0.3.0.md](./releases/Aws-0.3.0.md) | [client] add Workload Identity Federation, interactive OAuth, and auth profiles; [client] Adjust credentials auth to be consistent with other SDKs |
| 2026-05-05 | Vertex-0.4.0 | [Vertex-0.4.0.md](./releases/Vertex-0.4.0.md) | [client] add Workload Identity Federation, interactive OAuth, and auth profiles; [client] Adjust credentials auth to be consistent with other SDKs |
| 2026-05-05 | Bedrock-0.7.0 | [Bedrock-0.7.0.md](./releases/Bedrock-0.7.0.md) | [client] add Workload Identity Federation, interactive OAuth, and auth profiles; [client] Adjust credentials auth to be consistent with other SDKs |
| 2026-05-05 | Foundry-0.6.0 | [Foundry-0.6.0.md](./releases/Foundry-0.6.0.md) | [client] add Workload Identity Federation, interactive OAuth, and auth profiles; [client] Adjust credentials auth to be consistent with other SDKs |
| 2026-05-05 | Anthropic-12.18.0 | [Anthropic-12.18.0.md](./releases/Anthropic-12.18.0.md) | [api] improve Managed Agents APIs; [client] add Workload Identity Federation, interactive OAuth, and auth profiles; [memory] add beta memory tool |
| 2026-04-23 | Bedrock-0.6.0 | [Bedrock-0.6.0.md](./releases/Bedrock-0.6.0.md) | [api] CMA Memory public beta; add missing interface method |
| 2026-04-23 | Anthropic-12.17.0 | [Anthropic-12.17.0.md](./releases/Anthropic-12.17.0.md) | [api] CMA Memory public beta; [client] Add prompt caching support via WithCacheControl extension to Microsoft.Extensions.AI; [api] fix errors in api s |
| 2026-04-16 | Vertex-0.3.2 | [Vertex-0.3.2.md](./releases/Vertex-0.3.2.md) | _(maintenance)_ |
| 2026-04-16 | Bedrock-0.5.0 | [Bedrock-0.5.0.md](./releases/Bedrock-0.5.0.md) | [api] add claude-opus-4-7, token budgets and user_profiles |
| 2026-04-16 | Anthropic-12.16.0 | [Anthropic-12.16.0.md](./releases/Anthropic-12.16.0.md) | add beta tool runner; [api] add claude-opus-4-7, token budgets and user_profiles |
| 2026-04-14 | Vertex-0.3.1 | [Vertex-0.3.1.md](./releases/Vertex-0.3.1.md) | _(maintenance)_ |
| 2026-04-14 | Bedrock-0.4.0 | [Bedrock-0.4.0.md](./releases/Bedrock-0.4.0.md) | [bedrock] use auth header for mantle client |
| 2026-04-14 | Anthropic-12.15.0 | [Anthropic-12.15.0.md](./releases/Anthropic-12.15.0.md) | add structured outputs; [api] mark Sonnet and Opus 4 as deprecated; [streaming] add missing events |
| 2026-04-10 | Vertex-0.3.0 | [Vertex-0.3.0.md](./releases/Vertex-0.3.0.md) | vertex eu region |
| 2026-04-09 | Anthropic-12.14.0 | [Anthropic-12.14.0.md](./releases/Anthropic-12.14.0.md) | [api] Add beta advisor tool |
| 2026-04-08 | Bedrock-0.3.0 | [Bedrock-0.3.0.md](./releases/Bedrock-0.3.0.md) | [api] add support for Claude Managed Agents |
| 2026-04-08 | Anthropic-12.13.0 | [Anthropic-12.13.0.md](./releases/Anthropic-12.13.0.md) | [api] add support for Claude Managed Agents |
| 2026-04-07 | Bedrock-0.2.0 | [Bedrock-0.2.0.md](./releases/Bedrock-0.2.0.md) | [bedrock] Create Bedrock Mantle client |
| 2026-04-07 | Vertex-0.2.1 | [Vertex-0.2.1.md](./releases/Vertex-0.2.1.md) | _(maintenance)_ |
| 2026-04-07 | Anthropic-12.12.0 | [Anthropic-12.12.0.md](./releases/Anthropic-12.12.0.md) | [api] Add support for claude-mythos-preview; add string case to FunctionResultContent.Result switch to prevent double-serialization; [client] merge re |
| 2026-04-03 | Vertex-0.2.0 | [Vertex-0.2.0.md](./releases/Vertex-0.2.0.md) | [vertex] add support for US multi-region endpoint |
| 2026-04-01 | Aws-0.2.0 | [Aws-0.2.0.md](./releases/Aws-0.2.0.md) | prepare aws package |
| 2026-04-01 | Bedrock-0.1.2 | [Bedrock-0.1.2.md](./releases/Bedrock-0.1.2.md) | [client] update Bearer scheme casing to match AWS requirement |
| 2026-04-01 | Anthropic-12.11.0 | [Anthropic-12.11.0.md](./releases/Anthropic-12.11.0.md) | [api] add structured stop_details to message responses; [client] enable gzip decompression |
| 2026-03-31 | Bedrock-0.1.1 | [Bedrock-0.1.1.md](./releases/Bedrock-0.1.1.md) | handle oversized SSE events in Bedrock SseEventContentWrapper |
| 2026-03-31 | Anthropic-12.10.0 | [Anthropic-12.10.0.md](./releases/Anthropic-12.10.0.md) | add ErrorType property to API error exceptions; [api] GA thinking-display-setting; [api] manual updates |
| 2026-03-16 | Vertex-0.1.0 | [Vertex-0.1.0.md](./releases/Vertex-0.1.0.md) | [tests] update mock server; [docs] make xml comments valid; [client] update microsoft.bcl.memory |
| 2026-03-16 | Bedrock-0.1.0 | [Bedrock-0.1.0.md](./releases/Bedrock-0.1.0.md) | [tests] update mock server; [docs] make xml comments valid; [client] update microsoft.bcl.memory |
| 2026-03-16 | Foundry-0.5.0 | [Foundry-0.5.0.md](./releases/Foundry-0.5.0.md) | [tests] update mock server; [docs] make xml comments valid; [docs] add undocumented parameters to readme |
| 2026-03-16 | Anthropic-12.9.0 | [Anthropic-12.9.0.md](./releases/Anthropic-12.9.0.md) | [api] change array_format to brackets; [api] chore; [api] remove publishing section from cli target |
| 2026-02-19 | Anthropic-12.8.0 | [Anthropic-12.8.0.md](./releases/Anthropic-12.8.0.md) | [api] Add top-level cache control; [api] Deprecate haiku-3 |
| 2026-02-18 | Anthropic-12.7.0 | [Anthropic-12.7.0.md](./releases/Anthropic-12.7.0.md) | [api] fix shared UserLocation and error code types; [api] manual updates |
| 2026-02-18 | Anthropic-12.6.0 | [Anthropic-12.6.0.md](./releases/Anthropic-12.6.0.md) | [api] Releasing claude-sonnet-4-6; [client] add equality and tostring for multipart data; warn when thinking is enabled for certain models |
| 2026-02-12 | Vertex-0.0.1 | [Vertex-0.0.1.md](./releases/Vertex-0.0.1.md) | Add vertex provider |
| 2026-02-12 | Bedrock-0.0.1 | [Bedrock-0.0.1.md](./releases/Bedrock-0.0.1.md) | Add vertex provider |
| 2026-02-12 | Anthropic-12.5.0 | [Anthropic-12.5.0.md](./releases/Anthropic-12.5.0.md) | [api] enabling fast-mode in claude-opus-4-6; [client] add union variant names for C#; [client] enable upload endpoint |
| 2026-02-05 | Foundry-0.4.2 | [Foundry-0.4.2.md](./releases/Foundry-0.4.2.md) | _(maintenance)_ |
| 2026-02-05 | Anthropic-12.4.0 | [Anthropic-12.4.0.md](./releases/Anthropic-12.4.0.md) | [api] Release Claude Opus 4.6, adaptive thinking, and other features; [client] add common response headers to `HttpResponse`; [client] improve union e |
| 2026-01-29 | Foundry-0.4.1 | [Foundry-0.4.1.md](./releases/Foundry-0.4.1.md) | [internal] codegen related update; [internal] codegen related update; [internal] version bump |
| 2026-01-29 | Anthropic-12.3.0 | [Anthropic-12.3.0.md](./releases/Anthropic-12.3.0.md) | [api] add support for Structured Outputs in the Messages API; [api] migrate sending message format in output_config rather than output_format; [client |
| 2026-01-14 | Foundry-0.4.0 | [Foundry-0.4.0.md](./releases/Foundry-0.4.0.md) | [client] support `WithRawResponse` in Foundry client; [internal] codegen related update; [internal] codegen related update |
| 2026-01-14 | Anthropic-12.2.0 | [Anthropic-12.2.0.md](./releases/Anthropic-12.2.0.md) | [client] add helper functions for raw messages; [client] add more `ToString` implementations; [client] add strong naming |
| 2026-01-07 | Foundry-0.3.0 | [Foundry-0.3.0.md](./releases/Foundry-0.3.0.md) | [client] add EnvironmentUrl; [internal] test nullability warnings; [internal] share csproj properties with dir build props |
| 2026-01-07 | Anthropic-12.1.0 | [Anthropic-12.1.0.md](./releases/Anthropic-12.1.0.md) | [client] add EnvironmentUrl; [client] add multipart form data support; [internal] test nullability warnings |

## Notable Releases

### Anthropic-v12.3.0 (2026-01-29) — Beta-to-GA transition + Structured Outputs

First post-GA Anthropic core SDK release. Removed beta warning from the README (`chore(readme): remove beta warning now that we're in ga`) and added **Structured Outputs in the Messages API** (`output_config` shape migration). Foundational release that marks the SDK's production-ready inflection point.

### Anthropic-v12.9.0 + Bedrock-v0.1.0 + Vertex-v0.1.0 (2026-03-16) — Multi-cloud GA

Coordinated cut where the **Bedrock and Vertex provider packages** both reached `v0.1.0` (their first non-`0.0.x` release), bringing the .NET SDK into multi-cloud parity with the Python/TS SDKs. Anthropic-v12.9.0 paired changes include array_format spec change, model enum cleanup, and IChatClient RawRepresentation preservation.

### Anthropic-v12.18.0 (2026-05-05) — Memory tool + Workload Identity Federation + Managed Agents

Major feature release adding the **beta memory tool**, **Workload Identity Federation + interactive OAuth + auth profiles** for enterprise authentication, and **Managed Agents API improvements**. Shipped alongside coordinated minor bumps to Bedrock, Vertex, Foundry, and Aws packages.

## Breaking Changes & Security

No release in this window flags an explicit **BREAKING CHANGE**, **security advisory**, or **CVE** in its notes. The Anthropic-v12.3.0 beta-to-GA transition is the closest thing to a semver inflection but is documented as additive.

Soft-deprecations within the window:

- `Anthropic-v12.2.0` (2026-01-14): `claude-3-5-haiku` marked as deprecated (`chore(client): mark claude-3-5-haiku as deprecated`).

## Cadence

- 53 releases across 5 package channels over ~20 weeks (~2.6 releases/week aggregate).
- Anthropic core ships approximately weekly; provider packages cut alongside major Anthropic feature waves.
- Versioning is independent per package; coordinated cuts use shared release dates (e.g. 2026-05-05, 2026-03-16).
