# Ship Gate

> No repo is "done" until every applicable line is checked.
> Copy this into your repo root. Check items off per-release.

**Tags:** `[all]` every repo · `[npm]` `[pypi]` `[vsix]` `[desktop]` `[container]` published artifacts · `[mcp]` MCP servers · `[cli]` CLI tools

---

## A. Security Baseline

- [x] `[all]` SECURITY.md exists (report email, supported versions, response timeline) (2026-05-22)
- [x] `[all]` README includes threat model paragraph (data touched, data NOT touched, permissions required) (2026-05-22)
- [x] `[all]` No secrets, tokens, or credentials in source or diagnostics output (2026-05-22)
- [x] `[all]` No telemetry by default — state it explicitly even if obvious (2026-05-22)

### Default safety posture

- [x] `[cli|mcp|desktop]` SKIP: no dangerous actions (kill, delete, restart) — all mutations are idempotent DB writes to local data/ and products/ dirs (2026-05-22)
- [x] `[cli|mcp|desktop]` File operations constrained to known directories (2026-05-22)
- [x] `[mcp]` Network egress off by default (2026-05-22)
- [x] `[mcp]` Stack traces never exposed — structured error results only (2026-05-22)

## B. Error Handling

- [x] `[all]` Errors follow the Structured Error Shape: `code`, `message`, `hint`, `cause?`, `retryable?` (2026-05-22 — AppError class in src/errors.ts)
- [x] `[cli]` Exit codes: 0 ok · 1 user error · 2 runtime error · 3 partial success (2026-05-22 — fetch/sync partial success returns exit 3)
- [x] `[cli]` No raw stack traces without `--debug` (2026-05-22)
- [x] `[mcp]` Tool errors return structured results — server never crashes on bad input (2026-05-22)
- [x] `[mcp]` State/config corruption degrades gracefully (stale data over crash) (2026-05-22)
- [x] `[desktop]` SKIP: not a desktop app
- [x] `[vscode]` SKIP: not a VS Code extension

## C. Operator Docs

- [x] `[all]` README is current: what it does, install, usage, supported platforms + runtime versions (2026-05-22)
- [x] `[all]` CHANGELOG.md (Keep a Changelog format) (2026-05-22)
- [x] `[all]` LICENSE file present and repo states support status (2026-05-22)
- [x] `[cli]` `--help` output accurate for all commands and flags (2026-05-22 — 15 commands, all with .description() + .option())
- [x] `[cli|mcp|desktop]` Logging levels defined: silent / normal / verbose / debug — secrets redacted at all levels (2026-05-22 — HK_LOG_LEVEL env + --verbose/--debug flags)
- [x] `[mcp]` All tools documented with description + parameters (2026-05-22 — 8 tools with JSON Schema inputSchema)
- [x] `[complex]` SKIP: not a long-running service requiring daily ops handbook. Troubleshooting in README covers recovery.

## D. Shipping Hygiene

- [x] `[all]` `verify` script exists (test + build + smoke in one command) (2026-05-22 — verify.sh)
- [x] `[all]` Version in manifest matches git tag (2026-05-22 — will be tagged v1.0.0 at release)
- [x] `[all]` Dependency scanning runs in CI (ecosystem-appropriate) (2026-05-22 — pnpm audit in test.yml)
- [x] `[all]` Automated dependency update mechanism exists (2026-05-22 — .github/dependabot.yml)
- [x] `[npm]` `npm pack --dry-run` includes: dist/, README.md, CHANGELOG.md, LICENSE (2026-05-22 — CHANGELOG.md added to files field)
- [x] `[npm]` `engines.node` set (2026-05-22 — >=22.0.0)
- [x] `[npm]` Lockfile committed (2026-05-22 — pnpm-lock.yaml tracked)
- [x] `[vsix]` SKIP: not a VS Code extension
- [x] `[desktop]` SKIP: not a desktop app

## E. Identity (soft gate — does not block ship)

- [ ] `[all]` Logo in README header
- [ ] `[all]` Translations (polyglot-mcp, 8 languages)
- [ ] `[org]` Landing page (@mcptoolshop/site-theme)
- [ ] `[all]` GitHub repo metadata: description, homepage, topics

---

## Gate Rules

**Hard gate (A–D):** Must pass before any version is tagged or published.
If a section doesn't apply, mark `SKIP:` with justification — don't leave it unchecked.

**Soft gate (E):** Should be done. Product ships without it, but isn't "whole."

**Checking off:**
```
- [x] `[all]` SECURITY.md exists (2026-02-27)
```

**Skipping:**
```
- [ ] `[pypi]` SKIP: not a Python project
```
