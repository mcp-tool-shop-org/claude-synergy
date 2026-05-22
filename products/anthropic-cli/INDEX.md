---
product: anthropic-cli
source: https://github.com/anthropics/anthropic-cli/releases
window_start: "2026-01-01"
window_end: "2026-05-21"
fetched_at: "2026-05-21"
total_releases: 15
---

# anthropic-cli release index

The `ant` CLI — a command-line client for the Claude API. Public beta launched 2026-04-08 (v1.0.0). All releases in this window are post-launch GA-track. Distinct from Claude Code (the agentic harness).

## Historical table

| Version | Date | Type | Headline |
|---------|------|------|----------|
| [1.9.1](releases/1.9.1.md) | 2026-05-19 | patch | runner: skip tool calls the worker does not own |
| [1.9.0](releases/1.9.0.md) | 2026-05-19 | feature | CMA self-hosted sandboxes + sandbox helpers |
| [1.8.0](releases/1.8.0.md) | 2026-05-13 | feature | cache diagnostics beta |
| [1.7.1](releases/1.7.1.md) | 2026-05-11 | chore | redact api-key headers in debug logs |
| [1.7.0](releases/1.7.0.md) | 2026-05-06 | feature | Managed Agents multiagents/outcomes, webhooks, vault validation |
| [1.6.0](releases/1.6.0.md) | 2026-05-05 | feature | workspace targeting for OIDC federation token exchange |
| [1.5.0](releases/1.5.0.md) | 2026-05-04 | feature | Workload Identity Federation + interactive OAuth + auth profiles; stdin path/query params |
| [1.4.0](releases/1.4.0.md) | 2026-04-28 | feature | improve Managed Agents APIs |
| [1.3.2](releases/1.3.2.md) | 2026-04-23 | patch | (no body) |
| [1.3.1](releases/1.3.1.md) | 2026-04-23 | patch | (no body) |
| [1.3.0](releases/1.3.0.md) | 2026-04-23 | feature | CMA Memory public beta; `--raw-output`/`-r`; interactive explore default on TTY; file metadata |
| [1.2.1](releases/1.2.1.md) | 2026-04-16 | patch | goreleaser pull request config fix; manual release trigger |
| [1.2.0](releases/1.2.0.md) | 2026-04-16 | feature | claude-opus-4-7 + token budgets + user_profiles; multipart array fix |
| [1.1.0](releases/1.1.0.md) | 2026-04-09 | feature | manual API updates; `--format raw` + `--transform` composability |
| [1.0.0](releases/1.0.0.md) | 2026-04-08 | launch | Initial release of the `ant` CLI |

## Notable releases

- **v1.0.0 (2026-04-08)** — Public beta launch of the `ant` CLI, the official command-line client for the Claude API.
- **v1.2.0 (2026-04-16)** — Added `claude-opus-4-7` support along with token budgets and user_profiles surfaces; first release introducing a new model line through the CLI.
- **v1.3.0 (2026-04-23)** — **CMA Memory public beta**, plus major UX additions: `--raw-output`/`-r` for non-JSON strings, interactive "explore" format as default on TTY for retrieve/list commands, and filename + content-type forwarding on file inputs.
- **v1.5.0 (2026-05-04)** — Auth overhaul: Workload Identity Federation, interactive OAuth, and named auth profiles all land in a single release. Also adds stdin support for path/query params.
- **v1.7.0 (2026-05-06)** — **Managed Agents multiagents and outcomes, webhooks, vault validation** — the largest CMA surface expansion in the window.

## Release cadence

- 15 releases in 43 days (2026-04-08 to 2026-05-19).
- Median gap ~2-3 days; longest gap 5 days (v1.7.1 to v1.8.0).
- Release-please conventional-commit format from v1.3.0 onward; v1.0.0-v1.2.x use commit-list format.
- Heavy concentration of CMA (Claude Managed Agents) work — at least 4 of 15 releases touch CMA directly (1.3.0 Memory, 1.4.0 API improvements, 1.7.0 multiagents/outcomes/webhooks, 1.9.0 self-hosted sandboxes).
