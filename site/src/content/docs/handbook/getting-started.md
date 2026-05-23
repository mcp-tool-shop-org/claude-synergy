---
title: Getting Started
description: Install Claude Synergy, sync changelogs, and run your first query.
sidebar:
  order: 1
---

## Prerequisites

- **Node.js 22+** — required for the SQLite native bindings
- **pnpm** (recommended) or npm — for dependency management
- **Git** — for cloning and contributing

Optional:
- **Ollama** — for local embeddings (`nomic-embed-text`) and reranking
- **GitHub token** — for higher API rate limits during fetch

## Install

### Global install (recommended)

```bash
npm i -g @mcptoolshop/claude-synergy
```

This gives you the `hk` CLI and `claude-synergy-mcp` server globally.

### From source

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy.git
cd claude-synergy
pnpm install
pnpm build
npm link   # makes 'hk' available globally
```

## First sync

Initialize the database and pull all changelogs:

```bash
hk init          # creates data/claude-synergy.db with schema
hk sync          # fetch -> ingest -> embed (all 44 products)
```

The first sync takes 2-3 minutes — it pulls ~1,200 release files from GitHub, RSS feeds, and HTML changelogs.

### What happens during sync

1. **Fetch** — pulls new releases from each product's source (GitHub Releases API, RSS, HTML scrape, raw changelog, Playwright, MCP registry catalog)
2. **Ingest** — parses markdown release files, extracts individual change bullets, identifies entities (env vars, CLI flags, model IDs, CVEs)
3. **Embed** (optional) — generates contextual chunks + vector embeddings for semantic search

## First query

```bash
# Full-text search
hk query "streaming"

# Filter by product
hk query --product anthropic-sdk-typescript "tool use"

# Filter by date (--since and --until)
hk query --since 2026-01-01 --until 2026-03-01 "breaking"

# Entity lookup
hk env-var ANTHROPIC_API_KEY
hk command /review
hk model claude-sonnet-4-20250514
```

## "What changed lately?" — no search term needed

The `hk diff` and `hk breaking` commands answer windowed-browse questions without requiring a search query:

```bash
# What changed in claude-code in the last week
hk diff claude-code --since 7d

# What broke anywhere in the last 30 days
hk breaking --since 30d

# Everything new in April 2026
hk diff --since 2026-04-01 --until 2026-05-01
```

Both commands accept `--json` for machine output. See the [CLI reference](./cli-reference/#windowed-browsing-commands-new-in-v11) for the full flag set.

## JSON output

Every query command supports `--json` for machine-readable output:

```bash
hk query --json "managed agents" | jq '.[0]'
hk latest --json --limit 5
hk products --json
```

## Hybrid search (optional)

For semantic search, first generate embeddings. Three providers are supported:

```bash
# Ollama (local, 768-dim) — requires Ollama running with nomic-embed-text
ollama pull nomic-embed-text
hk embed --embed ollama --context structured

# Voyage (remote, 1024-dim) — requires VOYAGE_API_KEY
hk embed --embed voyage --context structured

# OpenAI (remote, 1536-dim default) — requires OPENAI_API_KEY
hk embed --embed openai --context structured
```

Then use hybrid search:

```bash
hk hybrid "how do I use tool use with streaming?"
hk hybrid --embed openai "MCP error handling"
hk hybrid --rerank voyage "best practices for MCP server error handling"
```

The provider's vector dimension is stamped into `schema_meta.embedding_dim` on first embed. Switching to a provider with a different dimension requires `--force`, which re-embeds the entire corpus.

## Next steps

- [CLI Reference](./cli-reference/) — all 17 commands
- [MCP Server](./mcp-server/) — wire into your agent harness
- [Architecture](./architecture/) — understand the data model
