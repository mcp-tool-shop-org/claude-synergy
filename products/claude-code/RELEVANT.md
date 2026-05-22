# Relevant for Mike — last 10 releases (2.1.137 → 2.1.147)

Triage of items from the recent release window that affect existing workflows, hooks, skills, or doctrine ratchets. This is the "memory update that coincides with harness updates" deliverable.

## 1. AskUserQuestion auto-mode fix — INVALIDATES a doctrine ratchet (2.1.147)

> Fixed auto mode suppressing `AskUserQuestion` when the user or a skill explicitly relies on it; the auto-mode classifier now sees the user's answers as intent signal

**Why this matters:** the `testing-os` memory entry documents an earned ratchet "AskUserQuestion answers NOT recognized by auto-mode classifier as in-turn authorization for high-blast-radius actions — must be EXPLICITLY re-confirmed in plaintext chat (reinforced 3x this session)." That ratchet was a **workaround for a bug that is now fixed**.

**Action:** update the ratchet wording in memory — note the fix shipped 2026-05-21 in 2.1.147, and that AskUserQuestion answers are now recognized as in-turn intent for auto-mode. The plaintext-confirmation workaround is no longer load-bearing.

## 2. /simplify renamed to /code-review (2.1.147) — surface check

> Renamed `/simplify` to `/code-review`. It now reports correctness bugs at a chosen effort level (e.g., `/code-review high`); pass `--comment` to post findings as inline GitHub PR comments. The old cleanup-and-fix behavior has been removed.

**Why this matters:** any skill, hook, slash-command definition, memory entry, or kickoff prompt referencing `/simplify` now invokes a renamed-and-rescoped command. The semantic shift is real: old was "cleanup-and-fix," new is "report correctness bugs."

**Action:** grep `~/.claude/`, `E:\AI\` memory tree, and all skill files for `/simplify` references. Update to `/code-review` and rewrite any prose that assumed cleanup-and-fix semantics.

## 3. claude agents --json (2.1.145) — pluggable into swarm-control-plane

> Added `claude agents --json` to list live Claude sessions as JSON for scripting (tmux-resurrect, status bars, session pickers)

**Why this matters:** `swarm-control-plane` is SQLite-backed swarm coordination at `F:/AI/dogfood-labs/tools/swarm/` per memory. Live session enumeration via JSON is now a primitive. Could feed `swarm status` with real session state instead of inferred state.

**Action:** evaluate adding `claude agents --json` parsing to swarm-control-plane's status command. Low effort, high signal.

## 4. PowerShell -ExecutionPolicy Bypass default (2.1.143) — Windows quality of life

> PowerShell tool now passes `-ExecutionPolicy Bypass`. Opt out with `CLAUDE_CODE_POWERSHELL_RESPECT_EXECUTION_POLICY=1`

**Why this matters:** you're on Windows 11 (5080). Pre-2.1.143, scripts could fail with ExecutionPolicy denials. Default behavior is now permissive.

**Action:** none required if you weren't already setting the opt-out. If you have ExecutionPolicy doctrine in any policy file, decide whether to keep the default permissive or set `CLAUDE_CODE_POWERSHELL_RESPECT_EXECUTION_POLICY=1`.

## 5. Hook args: string[] exec form (2.1.139) — safer than shell-string hooks

> Added hook `args: string[]` field (exec form) that spawns the command directly without a shell, so path placeholders never need quoting

**Why this matters:** existing memory-gate hook at `C:/Users/mikey/.claude/hooks/memory-gate.py` is invoked via shell-string. Path quoting is implicit-and-brittle. Exec form is safer and faster.

**Action:** consider migrating hook configs to `args: string[]` exec form. Low priority unless a quoting bug bites.

## 6. /model per-session only (2.1.144)

> `/model` now changes the model for the current session only; press `d` in the model picker to set a default for new sessions

**Why this matters:** `dogfood-swarm` runs many concurrent sessions. Pre-2.1.144, `/model` in one session could clobber the autocompact threshold (and possibly model) in other concurrent sessions (see fix in 2.1.141). Per-session is the right default.

**Action:** none required — improves multi-session reliability automatically.

## 7. CLAUDE_PROJECT_DIR in MCP stdio servers (2.1.139)

> MCP stdio servers now receive `CLAUDE_PROJECT_DIR` in their environment, matching hooks. Plugin configs can reference `${CLAUDE_PROJECT_DIR}` in commands

**Why this matters:** `ollama-intern-mcp` and other MCP servers can now project-locate without inferring from cwd. Useful for repo-knowledge and other path-aware MCP tools.

**Action:** if any MCP server you maintain infers project dir from `process.cwd()`, switch to `process.env.CLAUDE_PROJECT_DIR` with cwd fallback.

## 8. /loop redundant-wakeup fix (2.1.140)

> Fixed `/loop` scheduling redundant wakeups to poll for background tasks that already notify on completion

**Why this matters:** the `/loop` skill is in your skill list. If you use `/loop` to poll background work that the harness already notifies on (Agent tool, Bash background tasks), this is now no-op-on-redundant-poll instead of wasted cycles.

**Action:** none required — fix is automatic.

## 9. Hook continueOnBlock for PostToolUse (2.1.139)

> Added hook `continueOnBlock` config option for `PostToolUse` — set to `true` to feed the hook's rejection reason back to Claude and continue the turn

**Why this matters:** PreToolUse blocks (like memory-gate.py) stop the turn. If you want a hook that *advises* rather than *blocks*, `continueOnBlock: true` on a PostToolUse hook lets you surface concerns without halting work.

**Action:** consider whether any existing PreToolUse hooks should become "advise-and-continue" PostToolUse hooks instead.

## 10. Fast mode → Opus 4.7 by default (2.1.142)

> Fast mode now uses Opus 4.7 by default (previously Opus 4.6). Set `CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE=1` to pin fast mode to Opus 4.6

**Why this matters:** already noted in global CLAUDE.md. Confirmed shipped.

**Action:** none — already in your global instructions.

---

## Lower-priority but worth knowing

- **2.1.141:** `terminalSequence` field in hook JSON output (desktop notifications, window titles, bells without a controlling terminal) — useful for long-running swarm runs
- **2.1.141:** `ANTHROPIC_WORKSPACE_ID` for workload identity federation — irrelevant unless you're on federated auth
- **2.1.143:** stop-hook block cap (8 consecutive blocks before warning) — guardrail against runaway stop hooks; override via `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`
- **2.1.143:** `worktree.bgIsolation: "none"` setting — opt-out of background worktree isolation if your repo can't use worktrees
- **2.1.139:** `/goal` command — set completion condition, Claude works across turns until met. Different model from current task tracking.
- **2.1.139:** `claude agents` view (Research Preview) — single list of all sessions. Worth trying for swarm visibility.
- **2.1.147:** `--config` CLI option added — undocumented purpose; check on next sync
- **2.1.147:** `CLAUDE_BG_MEMORY_TOGGLED_OFF`, `CLAUDE_BRIDGE_REATTACH_OUTBOUND_ONLY` env vars added — undocumented; check on next sync

---

**Highest-priority action items, ranked:**

1. **Grep for `/simplify`** across `~/.claude/` and `E:/AI/` memory — rename to `/code-review` (item #2 above)
2. **Update the AskUserQuestion ratchet** in `testing-os` memory entry — note it's a fixed bug as of 2.1.147 (item #1)
3. **Consider `claude agents --json` integration** into swarm-control-plane (item #3)
