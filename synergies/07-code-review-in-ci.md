---
name: code-review-in-ci
title: /code-review in GitHub Actions for automated PR review
products: [claude-code, claude-code-action, claude-code-security-review]
trigger: User wants Claude to review every PR in a repo using their existing local skills/hooks/conventions
status: confirmed
last_validated: 2026-05-21
---

# /code-review in GitHub Actions for automated PR review

**Why it works:** The same skills, hooks, and conventions that run when you invoke `/code-review` locally also run when [claude-code-action](https://github.com/anthropics/claude-code-action) runs Claude Code in CI. The agent behaves identically because it IS the same binary, with the same skills loaded from your repo. The `--comment` flag added in 2.1.147 posts findings as inline GitHub PR review comments — closing the loop.

**Workflow:**

1. **Local: tune `/code-review` against your codebase.** Run with different effort levels (`/code-review low`, `/code-review high`) until findings match your taste. Adjust skills in `.claude/skills/` to encode codebase-specific patterns ("don't flag X; do flag Y").
2. **Configure** [`claude-code-action`](https://github.com/anthropics/claude-code-action) in `.github/workflows/`. The action checks out the repo, including `.claude/`, so it picks up the same skills/hooks
3. **In the workflow step**, invoke `/code-review high --comment` (or whatever effort level you tuned to). Findings post as inline PR review comments on the changed lines
4. **(Optional) Layer with** [claude-code-security-review](https://github.com/anthropics/claude-code-security-review) for a security-specific second pass — different effort tuning, different findings
5. Iterate on the workflow until the comment quality is what you want; the local-vs-CI loop is fast because they share the same Claude Code binary

**Evidence:**

- [Claude Code 2.1.147 release notes](https://code.claude.com/docs/en/changelog#2-1-147): "Renamed `/simplify` to `/code-review`. It now reports correctness bugs at a chosen effort level (e.g., `/code-review high`); pass `--comment` to post findings as inline GitHub PR comments. The old cleanup-and-fix behavior has been removed"
- [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) — official GH Action that runs Claude Code in CI
- [anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) — security-specific review action

**Caveats:**

- ⚠️ **Anything referencing `/simplify` in your skill files or hook configs now invokes a renamed command with different semantics** (was "cleanup-and-fix"; is now "report correctness bugs"). Grep your `.claude/` tree for `/simplify` before relying on this synergy. See [URGENT_FINDINGS.md](../URGENT_FINDINGS.md).
- The action consumes Claude API tokens billed to whatever account is configured — protect with workflow concurrency limits + branch filters
- Token cost per PR scales with diff size and effort level; budget accordingly
- `--comment` requires the action to have GitHub write permissions on the PR (`pull-requests: write` in the workflow `permissions:` block)
