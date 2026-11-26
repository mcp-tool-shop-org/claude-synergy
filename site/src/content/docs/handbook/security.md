---
title: Security
description: Threat model, data scope, secrets handling, and security reporting for Claude Synergy.
sidebar:
  order: 5
---

## Threat model

Claude Synergy is a **local-only data tool**. It operates entirely on your machine with optional outbound HTTP for changelog synchronization.

### Data touched

| Asset | Location | Sensitivity |
|-------|----------|-------------|
| SQLite database | `~/.claude-synergy/data/claude-synergy.db` by default; `./data/claude-synergy.db` if it already exists; or `CLAUDE_SYNERGY_DB` | Derived — deletable and re-creatable |
| Markdown release files | `products/*/releases/*.md` beside the database (`~/.claude-synergy/products` by default) | Public changelog data, screened for emails and home paths |
| YAML config | `products.yaml` | Product registry — no secrets |
| Vector embeddings | In SQLite DB (vec_chunks table) | Derived from public data |

All data is **derived** from public sources. Deleting the database and re-running `hk sync` recreates everything.

### Data NOT touched

- No user code, documents, or personal files
- No browser history, cookies, or credentials
- No system configuration or registry entries
- No other application data

### Network egress

| When | Destination | Purpose |
|------|-------------|---------|
| `hk fetch` / `hk sync` | `api.github.com` | Pull GitHub releases |
| `hk fetch` / `hk sync` | RSS feed URLs | Pull Cursor, Cody releases |
| `hk fetch` / `hk sync` | Changelog HTML pages | Scrape Copilot, VS Code Chat |
| `hk fetch` / `hk sync` | Smithery, MCP Registry APIs | Pull MCP catalog data |
| MCP `sync_now` tool | Same as `hk sync` | Refresh the corpus when an agent asks |
| First query or MCP tool call on an empty store | Same as `hk fetch` | Fetch and ingest (no embedding), retried after a 10-minute cooldown while the store stays empty; `CLAUDE_SYNERGY_NO_AUTO_SYNC=1` turns it off |
| `hk hybrid`, MCP `search` (hybrid mode, the default) | `localhost:11434` (Ollama) | Embed the query locally |
| `hk hybrid -e voyage\|openai` / `-r voyage\|cohere` | Voyage AI, OpenAI, Cohere APIs | Remote query embedding or reranking, only when chosen |
| `hk embed` (remote) | Voyage AI, Cohere APIs | Generate embeddings/reranking |
| `hk embed` (local) | `localhost:11434` (Ollama) | Local embedding generation |

**Network calls happen only in the cases above.** Queries read the local database; hybrid search also calls a local Ollama on localhost to embed the query, and Voyage, OpenAI or Cohere only when you choose them on the CLI. Once the store has data, nothing goes out to the internet until you run a sync command, choose a remote provider, or an agent calls `sync_now`; set `CLAUDE_SYNERGY_NO_AUTO_SYNC=1` to keep even the first use offline.

### Permissions required

- **Filesystem**: read/write to the store's `data/` and `products/` directories (under `~/.claude-synergy` by default)
- **Network**: outbound HTTPS for the sync commands, `sync_now`, the first-use sync and any remote provider you choose; hybrid search also calls Ollama on localhost
- **No elevated privileges**: runs as the current user, no `sudo` or admin required

## Secrets handling

Claude Synergy reads these environment variables when present:

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `GITHUB_TOKEN` | Higher GitHub API rate limits | Optional |
| `VOYAGE_API_KEY` | Voyage AI embeddings/reranking | Only for Voyage provider |
| `COHERE_API_KEY` | Cohere reranking | Only for Cohere provider |
| `ANTHROPIC_API_KEY` | Claude Haiku context generation | Only for claude-haiku context |

### Guarantees

- Secrets are **never logged** at any log level (silent through debug)
- Secrets are **never stored to disk** — only held in memory during the active process
- Secrets are **never included in error messages** — error paths use `safeErrorBody()` to strip response bodies
- Secrets are **never sent to unintended destinations** — each key is only used with its corresponding API

## No telemetry

Claude Synergy collects and sends **zero telemetry**:

- No analytics
- No crash reporting
- No usage tracking
- No phone-home checks
- No feature flags fetched from remote servers

This is stated explicitly even though it may seem obvious for a local tool.

## Input validation

### Path traversal protection

All filename inputs from external sources (GitHub tag names, RSS slugs, HTML headings) flow through `sanitizeFilename()` before being joined into filesystem paths:

- Strips `../`, `/`, `\`, leading dots
- Rejects control characters and Windows-reserved characters
- Double-checks output for any remaining traversal patterns
- Length-capped at 100 characters

### Command injection protection

External shell inputs (repository names for `gh` CLI calls) are validated via `assertRepoShape()`:

- Must match `^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$`
- Passed via `execFileSync` argv (not shell template), preventing injection

### MCP input validation

All MCP tool inputs are validated before processing:

- `asRecord()` — enforces arguments are objects
- `requireString()` — enforces non-empty strings
- `optString()`, `optInt()`, `optEnum()` — type and range validation
- Invalid inputs return `McpError` with descriptive messages, never crash the server

## Vendor text

Release notes and catalog entries are written by third parties, so they are treated as quoted data, never as instructions.

- **At ingest,** the text is screened: hidden Unicode controls are removed, images and `javascript:`/`data:`/`vbscript:` links become plain text, emails and home-path usernames are redacted, and lines shaped like instructions to the reader are flagged (not deleted). `hk ingest --rescreen` applies the current rules to stored rows.
- **In MCP answers,** the six tools that return release text (`search`, `lookup_entity`, `get_release`, `get_changes_since`, `search_breaking_changes`, `compare_versions`) wrap it in a frame marked as quoted data. The frame's header and footer carry a fresh random token on every answer, so stored text cannot fake the end of the frame, and flagged lines show `[flagged: …]`.
- **Never written into instruction files:** the tool does not edit `CLAUDE.md`, skills or settings.

## Reporting vulnerabilities

Email: **64996768+mcp-tool-shop@users.noreply.github.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Version affected
- Potential impact

| Action | Target |
|--------|--------|
| Acknowledge report | 48 hours |
| Assess severity | 7 days |
| Release fix | 30 days |

See [SECURITY.md](https://github.com/mcp-tool-shop-org/claude-synergy/blob/main/SECURITY.md) for the full policy.
