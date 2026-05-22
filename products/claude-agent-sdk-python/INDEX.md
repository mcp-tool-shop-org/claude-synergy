# claude-agent-sdk-python release index — historical (Jan–May 2026)

Window: 2026-01-08 (v0.1.19) through 2026-05-21 (v0.2.84). 65 releases total. Source: https://github.com/anthropics/claude-agent-sdk-python/releases. Fetched 2026-05-21.

By heuristic (multi-section bodies = substantive), 30 substantive releases and 35 CLI-bump-only releases. Only one release in the window contains an explicit `### Breaking` section: v0.2.82 (TodoWrite → Task tools; MCP nonblocking-by-default).

| Version | Date | One-line summary |
|---------|------|------------------|
| 0.2.84 | 2026-05-21 | Bundled CLI bump to 2.1.147 |
| 0.2.83 | 2026-05-21 | Bundled CLI bump to 2.1.146 |
| 0.2.82 | 2026-05-15 | **BREAKING:** TodoWrite → TaskCreate/Update/Get/List; MCP servers connect non-blocking by default (set `MCP_CONNECTION_NONBLOCKING=0` or `alwaysLoad: true` to restore). Adds `EffortLevel` export; fixes stderr-callback isolation; bumps `mcp >=1.23.0` for CVE-2025-66416 |
| 0.1.81 | 2026-05-11 | Bundled CLI bump to 2.1.139 |
| 0.1.80 | 2026-05-09 | Bundled CLI bump to 2.1.138 |
| 0.1.79 | 2026-05-09 | Bundled CLI bump to 2.1.137 |
| 0.1.78 | 2026-05-08 | Bundled CLI bump to 2.1.136 |
| 0.1.77 | 2026-05-08 | Actionable error text on error results (was generic "Command failed with exit code 1"); deprecate `"Skill"` in `allowed_tools` in favor of `skills` option |
| 0.1.76 | 2026-05-06 | Added `api_error_status` on `ResultMessage` (HTTP status of failing API calls); fix `ToolPermissionContext.suggestions` deserialization via `PermissionUpdate.from_dict()` |
| 0.1.75 | 2026-05-06 | Bundled CLI bump to 2.1.131 |
| 0.1.74 | 2026-05-06 | Hook event streaming (`include_hook_events`); `"defer"` permission decision + `DeferredToolUse`; `strict_mcp_config`; rich `ToolPermissionContext` fields; `updatedToolOutput` for any tool; `"xhigh"` effort; atexit subprocess cleanup |
| 0.1.73 | 2026-05-04 | Eager session-store flushing (`session_store_flush: "eager"`) for live-tailing UIs and crash durability |
| 0.1.72 | 2026-05-01 | Bundled CLI bump to 2.1.126 |
| 0.1.71 | 2026-04-29 | `SandboxNetworkConfig` domain allowlist fields (`allowedDomains`, `deniedDomains`, `allowManagedDomainsOnly`, `allowMachLookup`) |
| 0.1.70 | 2026-04-28 | Bump `mcp >=1.19.0` floor (older versions silently dropped `CallToolResult` from SDK MCP tools); fix trio nursery corruption on early cancel |
| 0.1.69 | 2026-04-28 | Docs only + CLI bump |
| 0.1.68 | 2026-04-25 | Bundled CLI bump to 2.1.119 |
| 0.1.67 | 2026-04-25 | Restore trio compatibility (regression from v0.1.51); add `sniffio` as explicit runtime dep |
| 0.1.66 | 2026-04-23 | Bundled CLI bump to 2.1.119 (re-publish) |
| 0.1.65 | 2026-04-23 | Batch session summaries (`list_session_summaries`, `fold_session_summary`); `import_session_to_store`; `ThinkingConfig.display` for summarized thinking text; `ServerToolUseBlock` + `AdvisorToolResultBlock` content types (fixes silent message drop) |
| 0.1.64 | 2026-04-20 | Full `SessionStore` adapter API at TS parity — protocol + `InMemorySessionStore` + transcript mirror + 9 store-backed helpers + 13-contract conformance harness + 3 reference adapters (S3/Redis/Postgres) |
| 0.1.63 | 2026-04-18 | Bundled CLI bump to 2.1.114 |
| 0.1.62 | 2026-04-17 | Top-level `skills` option on `ClaudeAgentOptions` (replaces manual `allowed_tools` + `setting_sources` plumbing) |
| 0.1.61 | 2026-04-16 | Bundled CLI bump to 2.1.112 |
| 0.1.60 | 2026-04-16 | `list_subagents` / `get_subagent_messages` helpers; W3C trace context propagation to CLI (optional `[otel]` extra); cascading session deletion; fix `setting_sources=[]` silent-drop |
| 0.1.59 | 2026-04-13 | Bundled CLI bump to 2.1.105 |
| 0.1.58 | 2026-04-09 | Bundled CLI bump to 2.1.97 |
| 0.1.57 | 2026-04-09 | `SystemPromptPreset.exclude_dynamic_sections` for cross-user prompt-cache hits; `"auto"` PermissionMode (CLI 2.1.90+ parity); fix `thinking={"type":"adaptive"}` mapping to correct `--thinking` flag |
| 0.1.56 | 2026-04-04 | Bundled CLI bump to 2.1.92 |
| 0.1.55 | 2026-04-03 | Fix silent truncation of MCP tool results >50K chars (forward `maxResultSizeChars` via `_meta`) |
| 0.1.54 | 2026-04-02 | (empty release notes) |
| 0.1.53 | 2026-03-31 | Fix `--setting-sources` empty-string flag confusion; fix string-prompt + hooks/MCP deadlock |
| 0.1.52 | 2026-03-29 | `get_context_usage()` on `ClaudeSDKClient`; `Annotated` parameter descriptions in `@tool`; `tool_use_id` + `agent_id` in `ToolPermissionContext`; custom `session_id` option; fix `connect(prompt=...)` silent drop and `control_cancel_request` handling |
| 0.1.51 | 2026-03-27 | `fork_session`, `delete_session`, paginated session listing; `task_budget` option; `SystemPromptFile`; `AgentDefinition.disallowedTools`/`maxTurns`/`initialPrompt`; 14+ bug fixes (Python 3.10 TypedDict, async generator cleanup, MCP input_schema JSON-Schema conversion, SIGKILL fallback, stdout buffer corruption, etc.) |
| 0.1.50 | 2026-03-20 | `get_session_info` + `tag`/`created_at` fields on `SDKSessionInfo` |
| 0.1.49 | 2026-03-20 | `AgentDefinition.skills`/`memory`/`mcpServers`; per-turn `usage` on `AssistantMessage`; `tag_session`/`rename_session`; typed `RateLimitEvent`; macOS x86_64 wheel |
| 0.1.48 | 2026-03-07 | Fix `include_partial_messages=True` not delivering `input_json_delta` (regression v0.1.36–0.1.47) via `CLAUDE_CODE_ENABLE_FINE_GRAINED_TOOL_STREAMING` env var |
| 0.1.47 | 2026-03-06 | Bundled CLI bump to 2.1.70 |
| 0.1.46 | 2026-03-05 | `list_sessions` / `get_session_messages`; runtime MCP control (`add_mcp_server`, `remove_mcp_server`, typed `McpServerStatus`); typed `TaskStarted`/`TaskProgress`/`TaskNotification`; `ResultMessage.stop_reason`; `agent_id`/`agent_type` on tool-lifecycle hooks |
| 0.1.45 | 2026-03-03 | Bundled CLI bump to 2.1.63 |
| 0.1.44 | 2026-02-26 | Bundled CLI bump to 2.1.59 |
| 0.1.43 | 2026-02-25 | Bundled CLI bump to 2.1.56 |
| 0.1.42 | 2026-02-25 | Bundled CLI bump to 2.1.55 |
| 0.1.41 | 2026-02-24 | Bundled CLI bump to 2.1.52 |
| 0.1.40 | 2026-02-24 | Skip unknown CLI message types instead of crashing (forward-compat for future CLI message kinds) |
| 0.1.39 | 2026-02-19 | Bundled CLI bump to 2.1.49 |
| 0.1.38 | 2026-02-18 | Bundled CLI bump to 2.1.47 |
| 0.1.37 | 2026-02-16 | Bundled CLI bump to 2.1.44 |
| 0.1.36 | 2026-02-13 | `ThinkingConfig` types (`Adaptive`/`Enabled`/`Disabled`) and `effort` field (`low`/`medium`/`high`/`max`); deprecates `max_thinking_tokens` |
| 0.1.35 | 2026-02-10 | Bundled CLI bump to 2.1.39 |
| 0.1.34 | 2026-02-10 | Bundled CLI bump to 2.1.38 |
| 0.1.33 | 2026-02-07 | Bundled CLI bump to 2.1.37 |
| 0.1.32 | 2026-02-07 | Bundled CLI bump to 2.1.36 |
| 0.1.31 | 2026-02-06 | MCP tool `annotations` parameter on `@tool` (readOnlyHint/destructiveHint/idempotentHint/openWorldHint); fix large agent definitions silently failing (ARG_MAX) via initialize control request |
| 0.1.30 | 2026-02-05 | Bundled CLI bump to 2.1.32 |
| 0.1.29 | 2026-02-04 | New hook events: `Notification`, `SubagentStart`, `PermissionRequest`; field enrichment on existing hook types (`tool_use_id`, `agent_id`/`agent_transcript_path`/`agent_type`, `additionalContext`, `updatedMCPToolOutput`) |
| 0.1.28 | 2026-02-03 | Fix `AssistantMessage.error` field reading from wrong data path |
| 0.1.27 | 2026-01-31 | Bundled CLI bump to 2.1.29 |
| 0.1.26 | 2026-01-30 | `PostToolUseFailure` hook event type with corresponding `*HookInput` / `*HookSpecificOutput` |
| 0.1.25 | 2026-01-29 | Bundled CLI bump to 2.1.23 |
| 0.1.24 | 2026-01-28 | Bundled CLI bump to 2.1.22 |
| 0.1.23 | 2026-01-27 | Public `get_mcp_status()` method on `ClaudeSDKClient` (replaces accessing private internals) |
| 0.1.21 | 2026-01-21 | Bundled CLI bump to 2.1.15 |
| 0.1.20 | 2026-01-16 | CI: claude-code actions @beta → @v1; permission callback test stabilization |
| 0.1.19 | 2026-01-08 | Bundled CLI bump to 2.1.1 |

## Notable releases

- **v0.2.82 (2026-05-15)** — only release with an explicit `### Breaking` section in the window. Two breaking changes: headless/SDK sessions now use `TaskCreate`/`TaskUpdate`/`TaskGet`/`TaskList` instead of `TodoWrite`; MCP servers connect in the background by default with `status: "pending"` in `init` (override via `MCP_CONNECTION_NONBLOCKING=0` or per-server `alwaysLoad: true`). Already flagged in `URGENT_FINDINGS.md`. Also bumps `mcp >=1.23.0` floor for CVE-2025-66416 (DNS-rebinding protection).
- **v0.1.74 (2026-05-06)** — major hook + permission expansion: `include_hook_events` for raw hook event streaming, `"defer"` decision + `DeferredToolUse`, `strict_mcp_config` to ignore project/user/global MCP configs, `updatedToolOutput` on any tool, `"xhigh"` effort level, atexit subprocess cleanup.
- **v0.1.65 (2026-04-23)** — `ServerToolUseBlock` and `AdvisorToolResultBlock` content types fix a silent message-drop bug where messages carrying only server-side tool calls arrived as `AssistantMessage(content=[])`. Also `ThinkingConfig.display` lets callers override Opus 4.7's `"omitted"` default to receive summarized thinking text. Batch session-summary support reduces N-session list cost from N to 1 round-trip on adapters that maintain summary sidecars.
- **v0.1.64 (2026-04-20)** — full `SessionStore` adapter API at TypeScript parity, including 5-method protocol, transcript mirroring, 9 store-backed async helpers, 13-contract conformance test harness, and 3 reference adapters under `examples/session_stores/` (S3, Redis, Postgres).
- **v0.1.51 (2026-03-27)** — large feature + fix wave: `fork_session`/`delete_session`/paginated listing; `task_budget` option; `SystemPromptFile` for `--system-prompt-file` flag; new `AgentDefinition` fields (`disallowedTools`, `maxTurns`, `initialPrompt`). 14+ bug fixes including async-generator cleanup cancel-scope errors, MCP `TypedDict` → JSON Schema conversion, SIGKILL fallback in `close()`, and stdout buffer corruption from non-JSON CLI lines.
