# Claude API release index — historical (Jan–May 2026)

| Date | One-line summary |
|------|------------------|
| 2026-05-19 | MCP tunnels Research Preview; self-hosted CMA sandboxes; CMA active-session MCP/tool config updates; CMA 100K-token output auto-spill to file |
| 2026-05-18 | Web search tool now returns richer SEC filing data |
| 2026-05-13 | Cache diagnostics public beta (`cache-diagnosis-2026-04-07` header, `cache_miss_reason` reporting) |
| 2026-05-12 | Fast mode (research preview) now supports Claude Opus 4.7 |
| 2026-05-11 | Claude Platform on AWS launch (Anthropic-managed infra via AWS billing/IAM) |
| 2026-05-06 | CMA Multiagent sessions + Outcomes public beta; vault credential refresh for `mcp_oauth`; webhooks; filtering/sorting |
| 2026-04-30 | 1M token context window beta RETIRED for Sonnet 4.5 and Sonnet 4 (breaking — header now errors over 200k) |
| 2026-04-24 | Rate Limits API launched (admin programmatic query) |
| 2026-04-23 | Memory for Claude Managed Agents public beta |
| 2026-04-20 | Claude Haiku 3 model RETIRED (`claude-3-haiku-20240307`) |
| 2026-04-16 | Claude Opus 4.7 launch (API breaking changes vs 4.6); Claude in Amazon Bedrock open to all customers |
| 2026-04-14 | Sonnet 4 and Opus 4 DEPRECATED (retirement scheduled June 15, 2026) |
| 2026-04-09 | Advisor tool public beta (`advisor-tool-2026-03-01` header) |
| 2026-04-08 | Claude Managed Agents public beta launch; `ant` CLI launch |
| 2026-04-07 | Claude Mythos Preview gated research preview (Project Glasswing); Messages API on Amazon Bedrock research preview |
| 2026-03-30 | Message Batches `max_tokens` raised to 300k for Opus/Sonnet 4.6 (`output-300k-2026-03-24` header); 1M context beta retirement preannounced |
| 2026-03-18 | Models API now returns `max_input_tokens`, `max_tokens`, `capabilities` |
| 2026-03-16 | Extended thinking `display: "omitted"` field for faster streaming |
| 2026-03-13 | 1M token context window GA for Opus 4.6 and Sonnet 4.6; dedicated 1M rate limits removed; media limit 100→600 |
| 2026-02-19 | Automatic caching for Messages API; Sonnet 3.7 and Haiku 3.5 models RETIRED; Haiku 3 deprecation announced |
| 2026-02-17 | Claude Sonnet 4.6 launch; web search + programmatic tool calling GA; code/web-fetch/tool-search/tool-use-examples/memory tools GA |
| 2026-02-07 | Fast mode research preview for Opus 4.6 (up to 2.5x faster) |
| 2026-02-05 | Claude Opus 4.6 launch + compaction API beta + data residency controls + 1M context beta for Opus 4.6; effort GA; fine-grained tool streaming GA |
| 2026-01-29 | Structured outputs GA on Claude API (Sonnet 4.5, Opus 4.5, Haiku 4.5); `output_format` moved to `output_config.format` |
| 2026-01-12 | `console.anthropic.com` now redirects to `platform.claude.com` (Claude brand consolidation) |
| 2026-01-05 | Claude Opus 3 model RETIRED (`claude-3-opus-20240229`) |

## Notable releases

- **2026-02-05**: Claude Opus 4.6 launch + compaction API + data residency controls + effort parameter GA + 1M context beta for Opus 4.6
- **2026-02-17**: Claude Sonnet 4.6 launch + multiple tools (web search, programmatic tool calling, code execution v2, web fetch, tool search, memory) reach GA
- **2026-04-08**: Claude Managed Agents public beta launch + `ant` CLI — landmark expansion of API as agent harness
- **2026-04-16**: Claude Opus 4.7 launch with API breaking changes vs 4.6; Bedrock open to all
- **2026-05-19**: MCP tunnels Research Preview (private-network MCP server access)

## Breaking changes / model retirements in window

- **2026-01-05**: Claude Opus 3 RETIRED
- **2026-02-19**: Claude Sonnet 3.7 + Claude Haiku 3.5 RETIRED
- **2026-04-14**: Sonnet 4 + Opus 4 deprecation announced (retirement June 15, 2026)
- **2026-04-16**: Opus 4.7 has API breaking changes vs Opus 4.6 (migration guide required)
- **2026-04-20**: Claude Haiku 3 RETIRED
- **2026-04-30**: 1M token context beta RETIRED for Sonnet 4.5 and Sonnet 4 (header now errors)
