# Sources

Canonical changelog/release sources for every Anthropic product surface relevant to an LLM agent's awareness. Audited 2026-05-21.

## Tier 1 — Per-version GitHub Releases (best — fully structured)

These have machine-readable, per-version release notes accessible via `gh api repos/<owner>/<repo>/releases`. Preferred source format.

| Product | Repo | Cadence | Notes |
|---|---|---|---|
| Claude Agent SDK (Python) | [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) | Every Claude Code release + own features | Bundled CLI version visible in release body |
| Claude Agent SDK (TypeScript) | [anthropics/claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript) | Every Claude Code release (parity) | Versions track Claude Code: v0.3.147 = parity with 2.1.147 |
| `ant` CLI | [anthropics/anthropic-cli](https://github.com/anthropics/anthropic-cli) | Independent | API client CLI; release-please format |
| Anthropic SDK (Python) | [anthropics/anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python) | Independent | Feature-flagged via beta headers |
| Anthropic SDK (TypeScript) | [anthropics/anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript) | Independent, multi-package | Tags: `sdk-vX.Y.Z`, `vertex-sdk-vX.Y.Z`, `bedrock-sdk-vX.Y.Z` |
| Anthropic SDK (Go) | [anthropics/anthropic-sdk-go](https://github.com/anthropics/anthropic-sdk-go) | Independent | (not yet audited) |
| Anthropic SDK (Java) | [anthropics/anthropic-sdk-java](https://github.com/anthropics/anthropic-sdk-java) | Independent | (not yet audited) |
| Anthropic SDK (Ruby) | [anthropics/anthropic-sdk-ruby](https://github.com/anthropics/anthropic-sdk-ruby) | Independent | (not yet audited) |
| Anthropic SDK (C#) | [anthropics/anthropic-sdk-csharp](https://github.com/anthropics/anthropic-sdk-csharp) | Independent | (not yet audited) |
| Anthropic SDK (PHP) | [anthropics/anthropic-sdk-php](https://github.com/anthropics/anthropic-sdk-php) | Independent | (not yet audited) |
| `claude-code-action` GH Action | [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action) | Independent | (not yet audited) |
| `claude-code-security-review` GH Action | [anthropics/claude-code-security-review](https://github.com/anthropics/claude-code-security-review) | Independent | (not yet audited) |

**Fetcher:**
```bash
gh api "repos/anthropics/<repo>/releases?per_page=20" --jq '.[] | {tag_name, published_at, body, html_url}'
```

## Tier 2 — Per-commit GitHub CHANGELOG.md (also structured)

| Product | Source | Notes |
|---|---|---|
| Claude Code CLI | [anthropics/claude-code/CHANGELOG.md](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) | Mirrored to docs.claude.com/changelog. Either source works; GitHub gives git history. |

**Fetcher:**
```bash
gh api repos/anthropics/claude-code/contents/CHANGELOG.md --jq .download_url | xargs curl -s
```

## Tier 3 — HTML release-notes pages (parseable)

| Product | URL | Format | Notes |
|---|---|---|---|
| Claude API / Platform | [platform.claude.com/docs/release-notes/overview](https://platform.claude.com/docs/en/release-notes/overview) | Date-keyed HTML | Chronological; covers models, API features, betas, SDKs (high-level), tools, Console |
| Anthropic Apps (Design / Cowork / Chat / Mobile) | [support.claude.com/articles/12138966](https://support.claude.com/en/articles/12138966-release-notes) | Date-keyed HTML | Unified feed across all app surfaces; product-tagged per entry |

**Fetcher:** WebFetch with a structured extraction prompt, or a dedicated parser.

## Tier 4 — Catalog/marketplace repos (no per-version cadence; track current state)

These don't have per-version release notes — they track *what exists right now*. Sync by git pull + diff against last sync.

| Catalog | Repo | Tracks |
|---|---|---|
| Agent Skills (official) | [anthropics/skills](https://github.com/anthropics/skills) | Anthropic-managed skill packages (pptx, xlsx, docx, pdf, etc.) |
| Claude Code plugins (official) | [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official) | Anthropic-curated plugins |
| Claude Code plugins (community) | [anthropics/claude-plugins-community](https://github.com/anthropics/claude-plugins-community) | Read-only mirror of clau.de/plugin-directory-submission |
| Cowork plugins (knowledge work) | [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) | Plugins for Cowork |
| Legal vertical | [anthropics/claude-for-legal](https://github.com/anthropics/claude-for-legal) | Legal-workflow plugins |
| Life sciences vertical | [anthropics/life-sciences](https://github.com/anthropics/life-sciences) | Life-sciences MCP marketplace |
| Financial services vertical | [anthropics/financial-services](https://github.com/anthropics/financial-services) | (no description; private?) |
| Healthcare vertical | [anthropics/healthcare](https://github.com/anthropics/healthcare) | Healthcare workflows |

## Tier 5 — Related but not Anthropic-owned

| Source | URL | Notes |
|---|---|---|
| @ClaudeCodeLog X account | [x.com/ClaudeCodeLog](https://x.com/ClaudeCodeLog) | Automated per-release threads by @marc_krenn |
| marckrenn changelog mirror | [github.com/marckrenn/claude-code-changelog](https://github.com/marckrenn/claude-code-changelog) | 404 releases tracked; structured `meta/cli-surface.md` lists 640 env vars / 90 options / 39 commands |
| github-mcp-server | [github.com/github/github-mcp-server](https://github.com/github/github-mcp-server) | GitHub's official MCP server (mirrored to anthropics org as a reference, useful for synergy patterns) |

## Sync strategy (per tier)

- **Tier 1 (GitHub Releases):** `gh api releases` since last seen tag; idempotent
- **Tier 2 (CHANGELOG.md):** git fetch + diff since last seen sha; idempotent
- **Tier 3 (HTML):** scheduled WebFetch; parser must dedupe by date+title
- **Tier 4 (catalogs):** git fetch + diff against snapshot; surface adds/removes
- **Tier 5 (third-party):** advisory only, cross-reference with Tier 1-2

## Auth

All Tier 1-2-4 sources are public GitHub. `gh` CLI must be authenticated (already is on this rig). No tokens needed for Tier 3 or 5.
