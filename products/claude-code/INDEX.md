# Claude Code release index — historical (Jan–May 2026)

| Version | Date | One-line summary |
|---------|------|------------------|
| 2.1.147 | 2026-05-21 | Workflow tool for deterministic multi-agent orchestration; `/simplify` renamed to `/code-review`; AskUserQuestion auto-mode fix |
| 2.1.145 | 2026-05-19 | `claude agents --json` for scripting; OTEL `agent_id` span attributes; `/plugin` previews skills/hooks before install |
| 2.1.144 | 2026-05-19 | `/resume` works for background sessions; `/extra-usage` renamed to `/usage-credits`; many background-session and worktree fixes |
| 2.1.143 | 2026-05-15 | Plugin dependency enforcement on enable/disable; PowerShell `-ExecutionPolicy Bypass` by default; `worktree.bgIsolation: none` |
| 2.1.142 | 2026-05-14 | Fast mode now uses Opus 4.7 by default (was Opus 4.6); `claude agents` config flags; MCP_TOOL_TIMEOUT fix for remote MCP |
| 2.1.141 | 2026-05-13 | `terminalSequence` hook output for notifications; "Summarize up to here" rewind option; many MCP and remote-control fixes |
| 2.1.140 | 2026-05-12 | Agent tool `subagent_type` case- and separator-insensitive matching; updated agent color palette |
| 2.1.139 | 2026-05-11 | Agent view research preview (`claude agents`); `/goal` command for cross-turn objective tracking; transcript navigation shortcuts |
| 2.1.138 | 2026-05-09 | Internal fixes |
| 2.1.137 | 2026-05-09 | [VSCode] Fixed extension failing to activate on Windows |
| 2.1.136 | 2026-05-08 | `autoMode.hard_deny` rules for unconditional auto-mode blocks; MCP servers persisting across `/clear` in IDE extensions |
| 2.1.133 | 2026-05-07 | `worktree.baseRef` setting (fresh/head) for branching base; sandbox bwrap/socat paths; effort level exposed to hooks |
| 2.1.132 | 2026-05-06 | `CLAUDE_CODE_SESSION_ID` env var for Bash subprocesses; opt-out alternate-screen renderer; external-SIGINT graceful shutdown |
| 2.1.131 | 2026-05-06 | Fixed VS Code extension Windows activation regression; Mantle endpoint x-api-key auth fix |
| 2.1.129 | 2026-05-06 | `--plugin-url` flag for zipped plugins; package-manager auto-update env var; gateway model discovery moved to opt-in |
| 2.1.128 | 2026-05-04 | `/mcp` shows tool counts; `--plugin-dir` accepts zip archives; `--channels` works with API-key auth; many MCP fixes |
| 2.1.126 | 2026-05-01 | `/model` picker reads gateway `/v1/models`; `claude project purge` command; `--dangerously-skip-permissions` covers more paths |
| 2.1.123 | 2026-05-01 | Fixed OAuth 401 retry loop when `CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1` is set |
| 2.1.122 | 2026-04-29 | `ANTHROPIC_BEDROCK_SERVICE_TIER` env var; pasting PR URL into `/resume` finds the session; OTEL numeric attribute fixes |
| 2.1.121 | 2026-04-28 | MCP `alwaysLoad` to skip tool-search deferral; `claude plugin prune` for orphans; PostToolUse hooks can replace any tool output |
| 2.1.120 | 2026-04-28 | Windows: Git Bash no longer required (PowerShell fallback); `claude ultrareview` CLI subcommand for CI; many UI and OAuth fixes |
| 2.1.119 | 2026-04-23 | `/config` settings persist to `~/.claude/settings.json`; `prUrlTemplate` setting; `--from-pr` accepts GitLab/Bitbucket/GHE URLs |
| 2.1.118 | 2026-04-23 | Vim visual mode (`v`/`V`); `/cost`+`/stats` merged into `/usage`; custom themes via `/theme` and `~/.claude/themes/` |
| 2.1.117 | 2026-04-22 | Forked subagents on external builds via `CLAUDE_CODE_FORK_SUBAGENT=1`; native macOS/Linux builds replace Glob/Grep with bfs+ugrep |
| 2.1.116 | 2026-04-22 | `/resume` 67% faster on large sessions; thinking spinner with inline progress; downloads moved to downloads.claude.ai |
| 2.1.114 | 2026-04-20 | Fixed permission-dialog crash for agent teams teammate tool requests |
| 2.1.113 | 2026-04-18 | CLI now spawns native Claude Code binary (via per-platform optional dependency); `sandbox.network.deniedDomains` setting |
| 2.1.112 | 2026-04-17 | Fixed "claude-opus-4-7 is temporarily unavailable" for auto mode |
| 2.1.111 | 2026-04-17 | Claude Opus 4.7 xhigh available; auto mode for Max subscribers on Opus 4.7; `xhigh` effort level; `/ultrareview` slash command |
| 2.1.110 | 2026-04-16 | `/tui fullscreen` flicker-free renderer; push notification tool; `/focus` view command separated from `Ctrl+O` |
| 2.1.109 | 2026-04-16 | Extended-thinking indicator now shows rotating progress hint |
| 2.1.108 | 2026-04-16 | `ENABLE_PROMPT_CACHING_1H` env var across all providers; `/recap` returning-to-session feature; `/undo` alias for `/rewind` |
| 2.1.107 | 2026-04-15 | Thinking hints now appear sooner during long operations |
| 2.1.105 | 2026-04-15 | `EnterWorktree` `path` parameter; PreCompact hook can block compaction; plugin `monitors` manifest key; `/proactive` alias for `/loop` |
| 2.1.101 | 2026-04-15 | `/team-onboarding` command for ramp-up guides; OS CA cert store trusted by default; security and stability fixes |
| 2.1.98  | 2026-04-14 | Vertex AI interactive setup wizard from login screen; `CLAUDE_CODE_PERFORCE_MODE` for p4 workflows; Monitor tool for streaming events |
| 2.1.97  | 2026-04-14 | Focus view toggle (`Ctrl+O`) in `NO_FLICKER` mode; `refreshInterval` status line setting; many NO_FLICKER mode polish fixes |
| 2.1.96  | 2026-04-13 | Fixed Bedrock 403 "Authorization header is missing" when using `AWS_BEARER_TOKEN_BEDROCK` (regression in 2.1.94) |
| 2.1.94  | 2026-04-10 | Amazon Bedrock-via-Mantle support (`CLAUDE_CODE_USE_MANTLE=1`); default effort for non-subscriber tiers raised to high |
| 2.1.92  | 2026-04-09 | `forceRemoteSettingsRefresh` fail-closed policy; interactive Bedrock setup wizard; per-model cache-hit breakdown in `/cost` |
| 2.1.91  | 2026-04-08 | MCP `anthropic/maxResultSizeChars` annotation up to 500K; `disableSkillShellExecution` setting; plugin `bin/` executables |
| 2.1.90  | 2026-04-08 | `/powerup` interactive feature lessons; plugin marketplace cache retention on git-pull failure; April Fools `/buddy` cleanup |
| 2.1.89  | 2026-04-07 | `"defer"` PreToolUse hook decision; `CLAUDE_CODE_NO_FLICKER=1` env var; `PermissionDenied` hook for auto-mode denials |
| 2.1.87  | 2026-04-04 | Fixed messages in Cowork Dispatch not getting delivered |
| 2.1.86  | 2026-04-02 | `X-Claude-Code-Session-Id` header on API requests; `.jj` and `.sl` excluded from Grep/file autocomplete |
| 2.1.85  | 2026-04-01 | `CLAUDE_CODE_MCP_SERVER_NAME/URL` for headersHelper scripts; conditional `if` field on hooks; MCP OAuth RFC 9728 discovery |
| 2.1.84  | 2026-04-01 | PowerShell tool for Windows (opt-in preview); `TaskCreated` hook; idle-return prompt nudging `/clear` after 75+ min |
| 2.1.83  | 2026-03-31 | `managed-settings.d/` drop-in policy fragments; `CwdChanged`/`FileChanged` hooks; transcript search; `Ctrl+X Ctrl+E` external-editor alias |
| 2.1.81  | 2026-03-30 | `--bare` flag for scripted `-p` calls (skip hooks/LSP/plugin sync); `--channels` permission relay to phone; multi-session OAuth fixes |
| 2.1.80  | 2026-03-29 | `rate_limits` field in statusline JSON; `source: 'settings'` inline plugin marketplace; CLI tool usage detection for plugin tips |
| 2.1.79  | 2026-03-27 | `claude auth login --console` for Anthropic Console; "Show turn duration" toggle in `/config`; many process-lifecycle fixes |
| 2.1.78  | 2026-03-26 | `StopFailure` hook event; `${CLAUDE_PLUGIN_DATA}` persistent state variable; response text streams line-by-line |
| 2.1.77  | 2026-03-26 | Opus 4.6 default max output bumped to 64k (cap 128k); sandbox `allowRead` re-allow within `denyRead`; `/copy N` for Nth response |
| 2.1.76  | 2026-03-25 | MCP elicitation support with `Elicitation`/`ElicitationResult` hooks; `--name` flag for session display name; `PostCompact` hook |
| 2.1.75  | 2026-03-25 | 1M context for Opus 4.6 on Max/Team/Enterprise by default; `/color` command for all users; session name on prompt bar |
| 2.1.74  | 2026-03-20 | Actionable suggestions in `/context`; `autoMemoryDirectory` setting; many managed-policy and memory-leak fixes |
| 2.1.73  | 2026-03-19 | `modelOverrides` setting for custom provider IDs; SSL-error login guidance; Opus default upgraded to 4.6 on Bedrock/Vertex/Foundry |
| 2.1.72  | 2026-03-18 | `/loop` description shortcut; `ExitWorktree` tool; `/copy w` to write to file; effort levels simplified to low/medium/high |
| 2.1.71  | 2026-03-17 | `/loop` command for recurring prompts; cron scheduling tools; rebindable voice push-to-talk key |
| 2.1.70  | 2026-03-17 | Many tool-search and proxy fixes; `/color default/reset/none` restore; reduced Remote Control polling rate (~300× server load cut) |
| 2.1.69  | 2026-03-14 | `/claude-api` skill for Anthropic SDK work; voice STT in 10 new languages (20 total); InstructionsLoaded hook event; many memory fixes |
| 2.1.68  | 2026-03-13 | Opus 4.6 defaults to medium effort for Max/Team; "ultrathink" keyword restored for high-effort turns; Opus 4/4.1 removed from first-party API |
| 2.1.66  | 2026-03-12 | Reduced spurious error logging |
| 2.1.63  | 2026-03-11 | `/simplify` and `/batch` bundled slash commands; HTTP hooks (POST JSON to URL); broad memory-leak sweep |
| 2.1.62  | 2026-03-10 | Fixed prompt-suggestion cache regression that hurt cache hit rates |
| 2.1.61  | 2026-03-10 | Fixed concurrent writes corrupting config file on Windows |
| 2.1.59  | 2026-03-10 | Auto-memory feature ships — Claude auto-saves useful context; `/copy` picker for code blocks vs full response |
| 2.1.58  | 2026-03-07 | Expand Remote Control to more users |
| 2.1.56  | 2026-03-06 | VS Code: Fixed another cause of `claude-vscode.editor.openLast` crashes |
| 2.1.55  | 2026-03-05 | Fixed BashTool failing on Windows with EINVAL error |
| 2.1.53  | 2026-03-04 | Fixed Windows crashes (corrupted-value panic, WebAssembly interpreter, ARM64 2-minute crash); UI/queue fixes |
| 2.1.52  | 2026-03-04 | VS Code: Fixed extension crash on Windows (`claude-vscode.editor.openLast`) |
| 2.1.51  | 2026-03-04 | `claude remote-control` subcommand for external builds; plugin marketplace git timeout to 120s; security and 50K tool-result fixes |
| 2.1.50  | 2026-02-28 | LSP `startupTimeout` config; `WorktreeCreate`/`WorktreeRemove` hooks; broad memory-leak sweep across long sessions |
| 2.1.49  | 2026-02-27 | MCP OAuth step-up auth + discovery caching; `--worktree` (`-w`) flag for isolated git worktree; `Ctrl+F` to kill background agents |
| 2.1.47  | 2026-02-26 | Large grab-bag: FileWriteTool trailing-blank fix, Windows `\r\n` rendering fixes, compaction-with-PDFs fix, dozens of misc fixes |
| 2.1.46  | 2026-02-26 | Fixed orphaned CC processes after terminal disconnect on macOS; claude.ai MCP connectors support |
| 2.1.45  | 2026-02-26 | Claude Sonnet 4.6 support added; `spinnerTipsOverride` setting; SDK `SDKRateLimitInfo`/`Event` types |
| 2.1.44  | 2026-02-25 | Fixed ENAMETOOLONG for deeply-nested paths; fixed auth refresh errors |
| 2.1.43  | 2026-02-25 | AWS auth refresh hang fixed with 3-minute timeout; spurious `.claude/agents/` markdown warning fix |
| 2.1.42  | 2026-02-25 | Deferred Zod schema construction for faster startup; date moved out of system prompt for better prompt-cache hits |
| 2.1.41  | 2026-02-25 | Nested-session guard; Windows ARM64 native binary; `claude auth login/status/logout` subcommands |
| 2.1.39  | 2026-02-24 | Improved terminal rendering performance; fatal-error display, process-hang and char-loss fixes |
| 2.1.38  | 2026-02-24 | VS Code scroll-to-top regression fix; heredoc delimiter hardening against command smuggling |
| 2.1.37  | 2026-02-24 | Fixed `/fast` not immediately available after enabling `/extra-usage` |
| 2.1.36  | 2026-02-24 | Fast mode now available for Opus 4.6 |
| 2.1.34  | 2026-02-20 | Fixed agent-teams render crash; bash `dangerouslyDisableSandbox` permission-prompt bypass fix |
| 2.1.33  | 2026-02-20 | Agent teammate tmux send/receive fix; `TeammateIdle`/`TaskCompleted` hooks; agent `memory` frontmatter scope |
| 2.1.32  | 2026-02-19 | Claude Opus 4.6 launches; agent teams research preview (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`); auto-memory record/recall |
| 2.1.31  | 2026-02-19 | Session resume hint on exit; Japanese IME zenkaku-space input support; many session-crash and bash sandbox fixes |
| 2.1.30  | 2026-02-18 | Read tool `pages` parameter for PDFs; pre-configured OAuth client creds for non-DCR MCP servers; `/debug` command |
| 2.1.29  | 2026-02-17 | Fixed startup performance regression for sessions with `saved_hook_context` |
| 2.1.27  | 2026-02-17 | `--from-pr` flag to resume PR-linked sessions; `gh pr create` auto-links session to PR; gateway beta-header fix |
| 2.1.25  | 2026-02-16 | Fixed beta header validation error for Bedrock/Vertex gateway users |
| 2.1.23  | 2026-02-13 | `spinnerVerbs` customization; mTLS/proxy connectivity fix; ripgrep timeout error reporting |
| 2.1.22  | 2026-02-13 | Fixed structured outputs for non-interactive (-p) mode |
| 2.1.21  | 2026-02-13 | Japanese IME zenkaku-number input in option prompts; auto-compact too-early fix on large output-token models |
| 2.1.20  | 2026-02-13 | PR review status indicator in prompt footer; `--add-dir` CLAUDE.md support (opt-in); rotating timestamped config backups |
| 2.1.19  | 2026-02-12 | `CLAUDE_CODE_ENABLE_TASKS=false` opt-out; `$0`/`$1` positional args in custom commands; resume-by-title from any directory |
| 2.1.18  | 2026-02-12 | Customizable keyboard shortcuts via `/keybindings` (chord sequences supported) |
| 2.1.17  | 2026-02-12 | Fixed crashes on processors without AVX instruction support |
| 2.1.16  | 2026-02-12 | New task management system with dependency tracking; VS Code native plugin management and remote sessions |
| 2.1.15  | 2026-02-12 | Deprecation notice for npm installations (recommend `claude install`); React Compiler UI rendering perf |
| 2.1.14  | 2026-02-11 | History-based bash mode autocomplete; pin plugins to git commit SHAs; many memory/UI fixes |
| 2.1.12  | 2026-02-11 | Fixed message rendering bug |
| 2.1.11  | 2026-02-11 | Fixed excessive MCP connection requests for HTTP/SSE transports |
| 2.1.10  | 2026-02-11 | New `Setup` hook event with `--init`/`--init-only`/`--maintenance` CLI flags for repo setup |
| 2.1.9   | 2026-02-11 | MCP `auto:N` tool-search threshold syntax; `plansDirectory` setting; PreToolUse `additionalContext` |
| 2.1.7   | 2026-02-11 | `showTurnDuration` setting; permission-prompt feedback field; MCP tool search auto mode enabled by default for all users |
| 2.1.6   | 2026-02-10 | `/config` search; auto-updater channel info in `/doctor`; date-range filtering in `/stats`; nested skills auto-discovery |
| 2.1.5   | 2026-02-10 | Added `CLAUDE_CODE_TMPDIR` env var to override temp directory |
| 2.1.4   | 2026-02-07 | `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` env var; "Help improve Claude" OAuth refresh-on-stale-token fix |
| 2.1.3   | 2026-02-07 | Slash commands and skills merged (no behavior change); stable/latest release-channel toggle in `/config`; unreachable-rule detection |
| 2.1.2   | 2026-02-06 | Source path metadata on dragged images; clickable OSC 8 file paths; winget install detection; bash command-injection fix |
| 2.1.0   | 2026-02-06 | Major release: skill hot-reload, `context: fork` skills, `language` setting, Ctrl+B unified backgrounding, MCP `list_changed`, vim motions |
| 2.0.76  | 2026-01-07 | Fixed macOS code-sign warning with Claude-in-Chrome integration |
| 2.0.75  | 2026-01-07 | Minor bugfixes |

## Notable releases

- **2.1.0 (2026-02-06)** — The big 2.1 line opener. Major surface-area expansion: automatic skill hot-reload, `context: fork` skills running in forked sub-agent contexts, `agent:` field in skills, `language` setting for Claude's response language, Shift+Enter working out of the box in iTerm2/WezTerm/Ghostty/Kitty, unified `Ctrl+B` backgrounding for both bash and agents, MCP `list_changed` dynamic tool updates, `/teleport` and `/remote-env` slash commands, hooks support on agent/skill/command frontmatter, the full new Vim motions pack (`y`, `p`/`P`, text objects, `>>`/`<<`, `J`), wildcard pattern matching anywhere in Bash permission rules, and dozens of fixes.
- **2.1.32 (2026-02-19)** — Claude Opus 4.6 launches. Agent teams research preview behind `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Auto-memory record/recall ships. `/add-dir` skills load automatically. Token-intensive multi-agent collaboration enters preview.
- **2.1.45 (2026-02-26)** — Claude Sonnet 4.6 lands. `spinnerTipsOverride` setting for custom spinners. SDK rate-limit types (`SDKRateLimitInfo`, `SDKRateLimitEvent`).
- **2.1.111 (2026-04-17)** — Claude Opus 4.7 xhigh ships. Auto mode opens to Max subscribers on Opus 4.7. New `xhigh` effort level (between high and max). `/ultrareview` command for parallel multi-agent code review in the cloud.
- **2.1.113 (2026-04-18)** — Architectural shift: CLI now spawns a **native Claude Code binary** via per-platform optional dependencies instead of bundled JavaScript. `sandbox.network.deniedDomains`, Bash deny-rule hardening against exec wrappers (`env`/`sudo`/`watch`/`ionice`/`setsid`).
- **2.1.139 (2026-05-11)** — Agent view research preview (`claude agents`) — a single list of every Claude Code session (running, blocked, or done). `/goal` command for cross-turn objective tracking. Major transcript navigation polish.
- **2.1.147 (2026-05-21)** — The `Workflow` tool for deterministic multi-agent orchestration (opt-in via `CLAUDE_CODE_WORKFLOWS=1`). `/simplify` renamed to `/code-review` with effort-level reporting and `--comment` for inline GitHub PR comments. AskUserQuestion auto-mode classifier honors user-skill intent signals.

## Gaps in version numbering

Several patch numbers do not appear in the canonical CHANGELOG (skipped releases / internal-only / unreleased): 2.1.146, 2.1.135, 2.1.134, 2.1.130, 2.1.127, 2.1.125, 2.1.124, 2.1.115, 2.1.106, 2.1.104, 2.1.103, 2.1.102, 2.1.100, 2.1.99, 2.1.95, 2.1.93, 2.1.82, 2.1.67, 2.1.65, 2.1.60, 2.1.57, 2.1.54, 2.1.48, 2.1.40, 2.1.35, 2.1.28, 2.1.26, 2.1.24, 2.1.13, 2.1.8, 2.1.1.
