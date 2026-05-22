---
product: claude-agent-sdk-typescript
source_url: https://github.com/anthropics/claude-agent-sdk-typescript/releases
window_start: 2026-01-01
window_end: 2026-05-21
fetched_at: 2026-05-21
release_count: 112
parity_bump_count: 55
substantive_count: 52
empty_body_count: 5
---

# claude-agent-sdk-typescript — Historical Releases (2026-01-07 → 2026-05-21)

The TypeScript Agent SDK ships at version parity with Claude Code: SDK `v0.2.X` corresponds to Claude Code `v2.1.X`, and the recent jump to `v0.3.X` corresponds to Claude Code `v2.1.142+` (the SDK's minor bump tracked an internal breaking-change wave, not a Code minor). Most releases are pure parity bumps with a one-line `Updated to parity with Claude Code vX.Y.Z` body; substantive releases call out new SDK-side API surface, breaking changes, deprecations, or fixes.

Counts in window:

- **Total releases:** 112
- **Parity-bump-only:** 55
- **Substantive (SDK-side changes called out):** 52
- **Empty body / no changelog:** 5 (`v0.1.76`, `v0.2.1`, `v0.2.2`, `v0.2.62`, `v0.2.104`)

## Notable releases (load-bearing)

These are the entries with breaking changes, new public API, deprecations, or otherwise architecturally significant SDK-side moves:

- **[v0.3.144](releases/0.3.144.md) (2026-05-19)** — Added `@anthropic-ai/claude-agent-sdk/extract` export for `bun build --compile` consumers: `extractFromBunfs(binPath)` copies the native binary out of the compiled executable's virtual filesystem so it can be passed to `options.pathToClaudeCodeExecutable`. Also: assistant messages and `StopFailure` hooks now report `error: 'model_not_found'` for unavailable models instead of the generic `'invalid_request'`.
- **[v0.3.143](releases/0.3.143.md) (2026-05-15)** — `@anthropic-ai/sdk` and `@modelcontextprotocol/sdk` moved from `dependencies` to `peerDependencies`. Runtime unaffected (both still bundled), but yarn classic users must add them explicitly for full TypeScript type resolution.
- **[v0.3.142](releases/0.3.142.md) (2026-05-14)** — **Triple breaking change wave**, the largest in the window:
  1. **Removed the v2 session API** (`unstable_v2_createSession`, `unstable_v2_resumeSession`, `unstable_v2_prompt`, `SDKSession`, `SDKSessionOptions`), deprecated since 0.2.133. Use `query()` instead — pass an `AsyncIterable<SDKUserMessage>` for multi-turn or `options.resume` to continue a session.
  2. **MCP servers now connect in the background by default**; sessions start immediately and slow servers report `status: "pending"`. Set `MCP_CONNECTION_NONBLOCKING=0` for old behavior, or mark a server `alwaysLoad: true` to require it in turn 1.
  3. **Headless and SDK sessions now use Task tools** (`TaskCreate` / `TaskUpdate` / `TaskGet` / `TaskList`) instead of `TodoWrite`, deprecated since 0.2.136. Tool consumers must accumulate by task ID instead of replacing a snapshot list.
- **[v0.2.136](releases/0.2.136.md) (2026-05-08)** — Added `resolveSettings()` (alpha) to inspect effective merged settings without spawning the CLI. **Deprecated `TodoWrite` tool** — future versions will switch to Task tools (the actual switch landed in v0.3.142).
- **[v0.2.133](releases/0.2.133.md) (2026-05-07)** — Deprecated the unstable V2 session API (`unstable_v2_*`); deprecated passing `'Skill'` in `allowedTools` (use the `skills` option instead).
- **[v0.2.113](releases/0.2.113.md) (2026-04-17)** — **Architectural rewrite**: SDK now spawns a native Claude Code binary via a per-platform optional dependency instead of bundled JavaScript. Added `sessionStore` option (alpha) with `SessionStore` / `SessionKey` / `SessionStoreEntry` types and an `InMemorySessionStore` reference implementation; added `deleteSession()`, `SDKMirrorErrorMessage` (`subtype: 'mirror_error'`), `title` option on `query()`, and OpenTelemetry trace-context propagation to the CLI subprocess. **Breaking:** `options.env` once again replaces `process.env` instead of overlaying it.
- **[v0.2.111](releases/0.2.111.md) (2026-04-16)** — Opus 4.7 support landed; this SDK version is required to use it. Per-tool `permission_policy` on remote MCP server entries via `mcp_set_servers`. `startup()` and `WarmQuery` exposed as public API. Reverted v0.2.113's later decision: `options.env` *overlays* `process.env`.
- **[v0.2.110](releases/0.2.110.md) (2026-04-15)** — Added `shouldQuery: false` field on `SDKUserMessage` to append a user message without triggering an assistant turn.
- **[v0.2.101](releases/0.2.101.md) (2026-04-10)** — Security patch: bumped `@anthropic-ai/sdk` to `^0.81.0` and `@modelcontextprotocol/sdk` to `^1.29.0` to resolve GHSA-5474-4w2j-mq4c and transitive hono advisories.
- **[v0.2.91](releases/0.2.91.md) (2026-04-02)** — Added `terminal_reason` field to result messages. Changed `sandbox` option to default `failIfUnavailable: true` when `enabled: true` — `query()` now errors out instead of silently running unsandboxed if sandbox deps are missing.
- **[v0.2.89](releases/0.2.89.md) (2026-04-01)** — Added `startup()` to pre-warm the CLI subprocess (~20x first-query speedup). New `listSubagents()` / `getSubagentMessages()` for subagent conversation history; `includeHookEvents` option for hook lifecycle messages.
- **[v0.2.86](releases/0.2.86.md) (2026-03-27)** — Added `getContextUsage()` control method for context-window breakdown by category. Made `session_id` optional on `SDKUserMessage`. **Fixed TypeScript types resolving to `any`** by adding `@anthropic-ai/sdk` and `@modelcontextprotocol/sdk` as dependencies (later reverted to peerDependencies in v0.3.143).
- **[v0.2.85](releases/0.2.85.md) (2026-03-26)** — Added `reloadPlugins()` SDK method.
- **[v0.2.84](releases/0.2.84.md) (2026-03-26)** — Added `taskBudget` option for API-side token-budget awareness. Added `enableChannel()` and `capabilities` on `McpServerStatus`. Exported `EffortLevel` type.
- **[v0.2.76](releases/0.2.76.md) (2026-03-14)** — Added `forkSession(sessionId, opts?)` for branching conversations from a point. Added `cancel_async_message` control subtype, `planFilePath` on `ExitPlanMode` tool input, MCP elicitation hook types, and `SDKElicitationCompleteMessage`.
- **[v0.2.74](releases/0.2.74.md) (2026-03-12)** — Added `renameSession(sessionId, title, opts?)`. Fixed `import type` from `@anthropic-ai/claude-agent-sdk/sdk-tools` failing under NodeNext/Bundler module resolution (missing exports map entry since v0.2.69).
- **[v0.2.69](releases/0.2.69.md) (2026-03-05)** — Added `toolConfig.askUserQuestion.previewFormat`. Added `supportsFastMode` on `ModelInfo`. Added `agent_id` and `agent_type` to hook events. **Fixed an unintentional breaking change in a patch release** that had renamed the Agent tool name from `'Task'` to `'Agent'` in `system:init` and `result` events; reverted to `'Task'`; the wire name will migrate to `'Agent'` in the next minor release.
- **[v0.2.59](releases/0.2.59.md) (2026-02-26)** — Added `getSessionMessages()` for reading session transcripts with pagination.
- **[v0.2.51](releases/0.2.51.md) (2026-02-24)** — Fixed SDK crashing with `ReferenceError` inside compiled Bun binaries (`bun build --compile`). Fixed unbounded memory growth in long-running sessions. Added `task_progress` events for background-agent progress.
- **[v0.2.49](releases/0.2.49.md) (2026-02-19)** — SDK model info now includes `supportsEffort`, `supportedEffortLevels`, `supportsAdaptiveThinking`. Added `ConfigChange` hook event for enterprise security auditing.
- **[v0.2.45](releases/0.2.45.md) (2026-02-17)** — Claude Sonnet 4.6 support. New `task_started` system message.
- **[v0.2.33](releases/0.2.33.md) (2026-02-06)** — Added `TeammateIdle` and `TaskCompleted` hook events; new `sessionId` option for custom UUIDs.
- **[v0.2.27](releases/0.2.27.md) (2026-01-30)** — Added `listSessions` function for discovering resumable sessions. Added optional `annotations` on the `tool()` helper (readOnlyHint, destructiveHint, openWorldHint, idempotentHint).
- **[v0.2.21](releases/0.2.21.md) (2026-01-28)** — Added `config`, `scope`, `tools` fields on `McpServerStatus`. Added `reconnectMcpServer()` and `toggleMcpServer()` methods. Fixed PermissionRequest hooks not executing in SDK mode (VS Code extension).
- **[v0.2.20](releases/0.2.20.md) (2026-01-27)** — Added support for loading CLAUDE.md files from `additionalDirectories`. Added `CLAUDE_CODE_ENABLE_TASKS` env var to opt into the new task system.

## Full historical table

| Version | Released | Parity | Class | Summary |
|---------|----------|--------|-------|---------|
| [0.3.147](releases/0.3.147.md) | 2026-05-21 | Code v2.1.147 | parity | parity with Claude Code v2.1.147 |
| [0.3.146](releases/0.3.146.md) | 2026-05-21 | Code v2.1.146 | parity | parity with Claude Code v2.1.146 |
| [0.3.145](releases/0.3.145.md) | 2026-05-19 | Code v2.1.145 | parity | parity with Claude Code v2.1.145 |
| [0.3.144](releases/0.3.144.md) | 2026-05-19 |  | **substantive** | Assistant messages and StopFailure hooks now report error: 'model_not_found' when the selected model doesn't exist or isn't available, in... |
| [0.3.143](releases/0.3.143.md) | 2026-05-15 |  | **substantive** | @anthropic-ai/sdk and @modelcontextprotocol/sdk are now peerDependencies instead of dependencies. Runtime is unaffected (both are bundled... |
| [0.3.142](releases/0.3.142.md) | 2026-05-14 |  | **substantive** | Breaking: Removed the v2 session API (unstable_v2_createSession, unstable_v2_resumeSession, unstable_v2_prompt, SDKSession, SDKSessionOpt... |
| [0.2.141](releases/0.2.141.md) | 2026-05-13 |  | **substantive** | TaskCreateInput, TaskCreateOutput, TaskGetInput, TaskGetOutput, TaskUpdateInput, TaskUpdateOutput, TaskListInput, and TaskListOutput type... |
| [0.2.140](releases/0.2.140.md) | 2026-05-12 | Code v2.1.140 | parity | parity with Claude Code v2.1.140 |
| [0.2.139](releases/0.2.139.md) | 2026-05-11 | Code v2.1.139 | parity | parity with Claude Code v2.1.139 |
| [0.2.138](releases/0.2.138.md) | 2026-05-09 | Code v2.1.138 | parity | parity with Claude Code v2.1.138 |
| [0.2.137](releases/0.2.137.md) | 2026-05-09 | Code v2.1.137 | parity | parity with Claude Code v2.1.137 |
| [0.2.136](releases/0.2.136.md) | 2026-05-08 |  | **substantive** | Added resolveSettings() (alpha) to inspect effective merged settings without spawning the Claude CLI; reads MDM (plist/HKLM/HKCU) for par... |
| [0.2.133](releases/0.2.133.md) | 2026-05-07 | Code v2.1.133 | **substantive** | Deprecated the unstable V2 session API (unstable_v2_createSession / unstable_v2_resumeSession / unstable_v2_prompt) — use query() instead |
| [0.2.132](releases/0.2.132.md) | 2026-05-06 | Code v2.1.132 | **substantive** | Documented applyFlagSettings() in the TypeScript Agent SDK reference and added support for null on top-level keys to clear flag-settings ... |
| [0.2.131](releases/0.2.131.md) | 2026-05-06 | Code v2.1.131 | parity | parity with Claude Code v2.1.131 |
| [0.2.129](releases/0.2.129.md) | 2026-05-06 | Code v2.1.129 | parity | parity with Claude Code v2.1.129 |
| [0.2.128](releases/0.2.128.md) | 2026-05-04 | Code v2.1.128 | parity | parity with Claude Code v2.1.128 |
| [0.2.126](releases/0.2.126.md) | 2026-05-01 |  | **substantive** | Added origin to result messages (SDKResultSuccess / SDKResultError) — forwards the triggering message's SDKMessageOrigin so consumers can... |
| [0.2.123](releases/0.2.123.md) | 2026-04-29 | Code v2.1.123 | parity | parity with Claude Code v2.1.123 |
| [0.2.122](releases/0.2.122.md) | 2026-04-28 | Code v2.1.122 | parity | parity with Claude Code v2.1.122 |
| [0.2.121](releases/0.2.121.md) | 2026-04-28 |  | **substantive** | Added updatedToolOutput to PostToolUseHookSpecificOutput for replacing tool output on all tools. updatedMCPToolOutput is deprecated. |
| [0.2.119](releases/0.2.119.md) | 2026-04-23 |  | **substantive** | excludeDynamicSections now keeps static auto-memory instructions in the cacheable system-prompt block; only the per-user memory directory... |
| [0.2.118](releases/0.2.118.md) | 2026-04-23 |  | **substantive** | Added Options.managedSettings for embedders to pass policy-tier settings to the spawned CLI in-memory, honored below IT-controlled manage... |
| [0.2.117](releases/0.2.117.md) | 2026-04-22 | Code v2.1.117 | parity | parity with Claude Code v2.1.117 |
| [0.2.116](releases/0.2.116.md) | 2026-04-20 | Code v2.1.116 | parity | parity with Claude Code v2.1.116 |
| [0.2.114](releases/0.2.114.md) | 2026-04-18 | Code v2.1.114 | parity | parity with Claude Code v2.1.114 |
| [0.2.113](releases/0.2.113.md) | 2026-04-17 |  | **substantive** | Changed the SDK to spawn a native Claude Code binary (via a per-platform optional dependency) instead of bundled JavaScript |
| [0.2.112](releases/0.2.112.md) | 2026-04-16 | Code v2.1.112 | parity | parity with Claude Code v2.1.112 |
| [0.2.111](releases/0.2.111.md) | 2026-04-16 |  | **substantive** | Opus 4.7 is now available! This version of the SDK is required to use it. |
| [0.2.110](releases/0.2.110.md) | 2026-04-15 |  | **substantive** | Fixed unstable_v2_createSession not respecting cwd, settingSources, and allowDangerouslySkipPermissions options |
| [0.2.109](releases/0.2.109.md) | 2026-04-15 | Code v2.1.109 | parity | parity with Claude Code v2.1.109 |
| [0.2.108](releases/0.2.108.md) | 2026-04-14 |  | **substantive** | SDKStatus now includes 'requesting'; when includePartialMessages is enabled, a {type:'system', subtype:'status', status:'requesting'} mes... |
| [0.2.107](releases/0.2.107.md) | 2026-04-14 | Code v2.1.107 | parity | parity with Claude Code v2.1.107 |
| [0.2.105](releases/0.2.105.md) | 2026-04-13 |  | **substantive** | Added system/memory_recall event and memory_paths on system/init for SDK renderers to surface memory operations |
| [0.2.104](releases/0.2.104.md) | 2026-04-13 |  | empty | _(no body)_ |
| [0.2.101](releases/0.2.101.md) | 2026-04-10 |  | **substantive** | Security: bumped @anthropic-ai/sdk to ^0.81.0 and @modelcontextprotocol/sdk to ^1.29.0 to resolve GHSA-5474-4w2j-mq4c and transitive hono... |
| [0.2.98](releases/0.2.98.md) | 2026-04-09 | Code v2.1.98 | parity | parity with Claude Code v2.1.98 |
| [0.2.97](releases/0.2.97.md) | 2026-04-08 | Code v2.1.97 | parity | parity with Claude Code v2.1.97 |
| [0.2.96](releases/0.2.96.md) | 2026-04-08 | Code v2.1.96 | parity | parity with Claude Code v2.1.96 |
| [0.2.94](releases/0.2.94.md) | 2026-04-07 | Code v2.1.94 | **substantive** | Fixed getContextUsage() to include agents passed via options.agents in the agents breakdown |
| [0.2.92](releases/0.2.92.md) | 2026-04-04 | Code v2.1.92 | parity | parity with Claude Code v2.1.92 |
| [0.2.91](releases/0.2.91.md) | 2026-04-02 | Code v2.1.91 | **substantive** | Added optional terminal_reason field to result messages, exposing why the query loop terminated (completed, aborted_tools, max_turns, blo... |
| [0.2.90](releases/0.2.90.md) | 2026-04-01 | Code v2.1.90 | parity | parity with Claude Code v2.1.90 |
| [0.2.89](releases/0.2.89.md) | 2026-04-01 |  | **substantive** | Added startup() to pre-warm the CLI subprocess before query(), making the first query ~20x faster when startup cost can be paid upfront |
| [0.2.87](releases/0.2.87.md) | 2026-03-29 | Code v2.1.87 | parity | parity with Claude Code v2.1.87 |
| [0.2.86](releases/0.2.86.md) | 2026-03-27 | Code v2.1.86 | **substantive** | Added getContextUsage() control method to retrieve a breakdown of context window usage by category |
| [0.2.85](releases/0.2.85.md) | 2026-03-26 | Code v2.1.85 | **substantive** | Added reloadPlugins() SDK method to reload plugins and receive refreshed commands, agents, and MCP server status |
| [0.2.84](releases/0.2.84.md) | 2026-03-26 | Code v2.1.84 | **substantive** | Added taskBudget option for API-side token budget awareness, allowing the model to pace tool use within a token limit |
| [0.2.83](releases/0.2.83.md) | 2026-03-25 | Code v2.1.83 | **substantive** | Added seed_read_state control subtype to seed readFileState with {path, mtime} so Edit works after the originating Read was removed from ... |
| [0.2.81](releases/0.2.81.md) | 2026-03-20 | Code v2.1.81 | **substantive** | Fixed canUseTool not providing a working addRules suggestion when a write under .claude/skills/{name}/ hits the bypass-immune safety check |
| [0.2.80](releases/0.2.80.md) | 2026-03-19 | Code v2.1.80 | **substantive** | Fixed getSessionMessages() dropping parallel tool results — sessions with parallel tool calls now return all tool_use/tool_result pairs |
| [0.2.79](releases/0.2.79.md) | 2026-03-18 | Code v2.1.79 | **substantive** | Added 'resume' to the ExitReason type for distinguishing resume-triggered session ends in hooks |
| [0.2.77](releases/0.2.77.md) | 2026-03-17 | Code v2.1.77 | **substantive** | Added api_retry system messages when retrying transient API errors, exposing attempt count, max retries, delay, and error status |
| [0.2.76](releases/0.2.76.md) | 2026-03-14 | Code v2.1.76 | **substantive** | Added forkSession(sessionId, opts?) for branching conversations from a point |
| [0.2.75](releases/0.2.75.md) | 2026-03-13 | Code v2.1.75 | parity | parity with Claude Code v2.1.75 |
| [0.2.74](releases/0.2.74.md) | 2026-03-12 | Code v2.1.74 | **substantive** | Added renameSession(sessionId, title, opts?) for renaming session files |
| [0.2.73](releases/0.2.73.md) | 2026-03-11 | Code v2.1.73 | **substantive** | Fixed options.env being overridden by the ~/.claude/settings.json env block when not using user as a settingSources option |
| [0.2.72](releases/0.2.72.md) | 2026-03-10 | Code v2.1.72 | **substantive** | Added agentProgressSummaries option to enable periodic AI-generated progress summaries for running subagents (foreground and background),... |
| [0.2.71](releases/0.2.71.md) | 2026-03-07 | Code v2.1.71 | parity | parity with Claude Code v2.1.71 |
| [0.2.70](releases/0.2.70.md) | 2026-03-06 | Code v2.1.70 | **substantive** | Fixed type: "http" MCP servers failing with HTTP 406 "Not Acceptable" on Streamable HTTP servers that strictly enforce the Accept: applic... |
| [0.2.69](releases/0.2.69.md) | 2026-03-05 |  | **substantive** | Added toolConfig.askUserQuestion.previewFormat option to configure the content format ('markdown' or 'html') for the preview field on Ask... |
| [0.2.68](releases/0.2.68.md) | 2026-03-04 | Code v2.1.68 | parity | parity with Claude Code v2.1.68 |
| [0.2.66](releases/0.2.66.md) | 2026-03-04 | Code v2.1.66 | parity | parity with Claude Code v2.1.66 |
| [0.2.63](releases/0.2.63.md) | 2026-02-28 |  | **substantive** | SDK: Fixed pathToClaudeCodeExecutable failing when set to a bare command name (e.g., "claude") that should resolve via PATH |
| [0.2.62](releases/0.2.62.md) | 2026-02-27 |  | empty | _(no body)_ |
| [0.2.61](releases/0.2.61.md) | 2026-02-26 | Code v2.1.61 | parity | parity with Claude Code v2.1.61 |
| [0.2.59](releases/0.2.59.md) | 2026-02-26 |  | **substantive** | Added getSessionMessages() function for reading a session's conversation history from its transcript file, with support for pagination vi... |
| [0.2.58](releases/0.2.58.md) | 2026-02-25 | Code v2.1.58 | parity | parity with Claude Code v2.1.58 |
| [0.2.56](releases/0.2.56.md) | 2026-02-25 | Code v2.1.56 | parity | parity with Claude Code v2.1.56 |
| [0.2.55](releases/0.2.55.md) | 2026-02-25 | Code v2.1.55 | parity | parity with Claude Code v2.1.55 |
| [0.2.53](releases/0.2.53.md) | 2026-02-25 |  | **substantive** | Added listSessions() for discovering and listing past sessions with light metadata |
| [0.2.52](releases/0.2.52.md) | 2026-02-24 | Code v2.1.52 | parity | parity with Claude Code v2.1.52 |
| [0.2.51](releases/0.2.51.md) | 2026-02-24 | Code v2.1.51 | **substantive** | Updated to parity with Claude Code v2.1.51 |
| [0.2.50](releases/0.2.50.md) | 2026-02-20 | Code v2.1.50 | parity | parity with Claude Code v2.1.50 |
| [0.2.49](releases/0.2.49.md) | 2026-02-19 | Code v2.1.49 | **substantive** | Updated to parity with Claude Code v2.1.49 |
| [0.2.47](releases/0.2.47.md) | 2026-02-18 | Code v2.1.47 | **substantive** | Updated to parity with Claude Code v2.1.47 |
| [0.2.45](releases/0.2.45.md) | 2026-02-17 |  | **substantive** | Added support for Claude Sonnet 4.6 |
| [0.2.44](releases/0.2.44.md) | 2026-02-16 | Code v2.1.44 | parity | parity with Claude Code v2.1.44 |
| [0.2.42](releases/0.2.42.md) | 2026-02-13 | Code v2.1.42 | parity | parity with Claude Code v2.1.42 |
| [0.2.41](releases/0.2.41.md) | 2026-02-13 | Code v2.1.41 | parity | parity with Claude Code v2.1.41 |
| [0.2.39](releases/0.2.39.md) | 2026-02-10 | Code v2.1.39 | parity | parity with Claude Code v2.1.39 |
| [0.2.38](releases/0.2.38.md) | 2026-02-10 | Code v2.1.38 | parity | parity with Claude Code v2.1.38 |
| [0.2.37](releases/0.2.37.md) | 2026-02-07 | Code v2.1.37 | parity | parity with Claude Code v2.1.37 |
| [0.2.36](releases/0.2.36.md) | 2026-02-07 | Code v2.1.36 | parity | parity with Claude Code v2.1.36 |
| [0.2.34](releases/0.2.34.md) | 2026-02-06 | Code v2.1.34 | parity | parity with Claude Code v2.1.34 |
| [0.2.33](releases/0.2.33.md) | 2026-02-06 | Code v2.1.33 | **substantive** | Added TeammateIdle and TaskCompleted hook events with corresponding TeammateIdleHookInput and TaskCompletedHookInput types |
| [0.2.32](releases/0.2.32.md) | 2026-02-05 | Code v2.1.32 | parity | parity with Claude Code v2.1.32 |
| [0.2.31](releases/0.2.31.md) | 2026-02-04 |  | **substantive** | Added stop_reason field to SDKResultSuccess and SDKResultError to indicate why the model stopped generating |
| [0.2.30](releases/0.2.30.md) | 2026-02-03 |  | **substantive** | Added debug and debugFile options for programmatic control of debug logging |
| [0.2.29](releases/0.2.29.md) | 2026-01-31 | Code v2.1.29 | parity | parity with Claude Code v2.1.29 |
| [0.2.27](releases/0.2.27.md) | 2026-01-30 | Code v2.1.27 | **substantive** | Added listSessions function to discover resumable sessions by project, repo, or globally |
| [0.2.25](releases/0.2.25.md) | 2026-01-29 | Code v2.1.25 | parity | parity with Claude Code v2.1.25 |
| [0.2.23](releases/0.2.23.md) | 2026-01-29 | Code v2.1.23 | **substantive** | Fixed structured output validation errors not being reported correctly |
| [0.2.22](releases/0.2.22.md) | 2026-01-28 | Code v2.1.22 | **substantive** | Fixed structured outputs to handle empty assistant messsages |
| [0.2.21](releases/0.2.21.md) | 2026-01-28 | Code v2.1.21 | **substantive** | Added config, scope, and tools fields to McpServerStatus for richer server introspection |
| [0.2.20](releases/0.2.20.md) | 2026-01-27 | Code v2.1.20 | **substantive** | Added support for loading CLAUDE.md files from directories specified via additionalDirectories option (requires setting CLAUDE_CODE_ADDIT... |
| [0.2.19](releases/0.2.19.md) | 2026-01-23 |  | **substantive** | Added CLAUDE_CODE_ENABLE_TASKS env var, set to true to opt into the new task system |
| [0.2.17](releases/0.2.17.md) | 2026-01-22 | Code v2.1.17 | parity | parity with Claude Code v2.1.17 |
| [0.2.16](releases/0.2.16.md) | 2026-01-22 | Code v2.1.16 | parity | parity with Claude Code v2.1.16 |
| [0.2.15](releases/0.2.15.md) | 2026-01-21 | Code v2.1.15 | **substantive** | Added notification hook support |
| [0.2.14](releases/0.2.14.md) | 2026-01-20 | Code v2.1.14 | parity | parity with Claude Code v2.1.14 |
| [0.2.12](releases/0.2.12.md) | 2026-01-17 | Code v2.1.12 | parity | parity with Claude Code v2.1.12 |
| [0.2.11](releases/0.2.11.md) | 2026-01-17 | Code v2.1.11 | parity | parity with Claude Code v2.1.11 |
| [0.2.9](releases/0.2.9.md) | 2026-01-16 | Code v2.1.9 | parity | parity with Claude Code v2.1.9 |
| [0.2.7](releases/0.2.7.md) | 2026-01-14 | Code v2.1.7 | parity | parity with Claude Code v2.1.7 |
| [0.2.6](releases/0.2.6.md) | 2026-01-13 | Code v2.1.6 | **substantive** | Updated to parity with Claude Code v2.1.6 |
| [0.2.5](releases/0.2.5.md) | 2026-01-12 | Code v2.1.5 | parity | parity with Claude Code v2.1.5 |
| [0.2.4](releases/0.2.4.md) | 2026-01-11 | Code v2.1.4 | parity | parity with Claude Code v2.1.4 |
| [0.2.3](releases/0.2.3.md) | 2026-01-09 | Code v2.1.3 | parity | parity with Claude Code v2.1.3 |
| [0.2.2](releases/0.2.2.md) | 2026-01-09 |  | empty | _(no body)_ |
| [0.2.1](releases/0.2.1.md) | 2026-01-07 |  | empty | _(no body)_ |
| [0.1.76](releases/0.1.76.md) | 2026-01-07 |  | empty | _(no body)_ |
