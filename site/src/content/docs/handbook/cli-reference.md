---
title: CLI Reference
description: Complete reference for all 17 hk commands — flags, options, and examples.
sidebar:
  order: 2
---

The `hk` CLI provides 17 commands organized into five groups: **setup**, **search**, **windowed browsing**, **sync**, and **analysis**.

## Global flags

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON (all query commands) |
| `--verbose` | Show verbose output (also: `HK_LOG_LEVEL=verbose`) |
| `--debug` | Show debug output including query parameters (also: `HK_LOG_LEVEL=debug`) |
| `--version` | Print version |
| `--help` | Show help |

## Setup commands

### `hk init`

Create the database file with the current schema.

```bash
hk init                     # default: data/claude-synergy.db
hk init --db /path/to/db    # custom path
```

### `hk seed-markers`

Seed fetch markers from the current DB state. Run once after initial ingest to enable incremental fetch.

```bash
hk seed-markers
```

## Search commands

### `hk query <text>`

Full-text search across all change bullets using FTS5.

```bash
hk query "managed agents"
hk query --product anthropic-sdk-python --since 2026-01-01 "streaming"
hk query --since 2026-03-01 --until 2026-04-01 "tool use"
hk query --kind breaking --limit 50 "deprecated"
```

| Flag | Description |
|------|-------------|
| `-p, --product <name>` | Limit to one product |
| `-s, --since <date>` | YYYY-MM-DD lower bound (or relative: `7d`, `2w`, `3m`) |
| `-u, --until <date>` | YYYY-MM-DD upper bound (or relative) — **new in v1.1** |
| `-k, --kind <kind>` | Filter: added, fixed, breaking, deprecated, etc. |
| `-l, --limit <n>` | Max results (default: 20) |

### `hk env-var <name>`

Find when an environment variable was introduced or last changed.

```bash
hk env-var ANTHROPIC_API_KEY
hk env-var CLAUDE_CODE_MAX_TURNS
```

### `hk command <slash>`

Find a slash command's history across all products.

```bash
hk command /review
hk command /memory
```

### `hk model <id>`

Find a Claude model ID's history — launches, deprecations, renames.

```bash
hk model claude-sonnet-4-20250514
hk model claude-3-haiku-20240307
```

### `hk cve <id>`

Find releases mentioning a specific CVE.

```bash
hk cve CVE-2024-12345
```

### `hk hybrid <text>`

Hybrid FTS5 + sqlite-vec search via Reciprocal Rank Fusion. Requires `hk embed` first.

```bash
hk hybrid "how do I use tool use with streaming?"
hk hybrid --rerank voyage --limit 5 "MCP error handling"
hk hybrid --embed openai "MCP error handling"
hk hybrid --until 2026-04-01 "deprecated"
```

| Flag | Description |
|------|-------------|
| `-e, --embed <provider>` | Embedding provider: `ollama` (default), `voyage`, `openai` |
| `-r, --rerank <provider>` | Rerank: `none` (default), `ollama-judge`, `voyage`, `cohere` |
| `-u, --until <date>` | YYYY-MM-DD upper bound (or relative) — **new in v1.1** |
| `-l, --limit <n>` | Max results (default: 10) |
| `--top-k <n>` | Per-channel pull before fusion (default: 60) |
| `--rerank-candidates <n>` | RRF candidates to rerank (default: 20) |

## Windowed browsing commands (new in v1.1)

Date bounds across these commands accept either `YYYY-MM-DD` (or full ISO 8601) or a relative form: `7d` (7 days ago), `2w` (2 weeks ago), `3m` (3 months ago), `1y` (1 year ago). Invalid input raises a structured error with code `INVALID_DATE`.

### `hk diff [product]`

"What changed in this window," grouped by product+version. No search term required.

```bash
hk diff                              # all products, last 7 days (default --since 7d)
hk diff claude-code --since 7d       # claude-code only, last 7 days
hk diff --since 2026-04-01 --until 2026-05-01   # April 2026
hk diff --kind breaking --since 30d  # only breaking changes in last 30 days
hk diff --json --since 7d | jq '.[].changes[] | select(.kind == "added")'
```

| Flag | Description |
|------|-------------|
| Positional `product` | Optional product slug (e.g. `claude-code`) |
| `-s, --since <date>` | YYYY-MM-DD or relative (default: `7d`) |
| `-u, --until <date>` | YYYY-MM-DD or relative upper bound |
| `-k, --kind <kind>` | Filter by kind: added, fixed, breaking, deprecated, etc. |
| `-l, --limit <n>` | Max total change rows (default: 200). Note this caps changes, not releases — a single release with many changes can exhaust the limit. |
| `--json` | Machine-readable JSON output (`ChangesSinceResult[]`) |
| `--db <path>` | Override DB path (default: `data/claude-synergy.db`) |

### `hk breaking`

Filter-browse of breaking changes only. No search term required — the answer to "did anything load-bearing break recently?"

```bash
hk breaking                          # all products, all time
hk breaking --since 30d              # last 30 days
hk breaking --product anthropic-sdk-python --since 2026-01-01
hk breaking --json --limit 50 | jq '.[]'
```

| Flag | Description |
|------|-------------|
| `-p, --product <name>` | Limit to one product |
| `-s, --since <date>` | YYYY-MM-DD or relative lower bound |
| `-u, --until <date>` | YYYY-MM-DD or relative upper bound |
| `-l, --limit <n>` | Max results (default: 50) |
| `--json` | Machine-readable JSON output |
| `--db <path>` | Override DB path |

## Sync commands

### `hk fetch`

Pull new releases since last sync.

```bash
hk fetch                    # all products
hk fetch --product cursor   # one product
hk fetch --since 2026-05-01 # override marker
```

### `hk sync`

Run fetch → ingest → embed in sequence (designed for daily cron / GitHub Actions).

```bash
hk sync
hk sync --skip-embed            # fetch+ingest only
hk sync --skip-fetch            # ingest+embed existing files
hk sync --context structured    # context provider for embed
hk sync --embed-provider voyage # use Voyage for embeddings
```

### `hk embed`

Generate contextual chunks + embeddings. Opt-in semantic layer.

```bash
hk embed                               # defaults: ollama + structured
hk embed --embed voyage --context structured
hk embed --embed openai                # OpenAI text-embedding-3-small (1536-dim)
hk embed --product cursor --force      # re-embed one product
hk embed --limit 100                   # test with small batch
```

| Flag | Description |
|------|-------------|
| `-c, --context <provider>` | Context: `structured` (default), `none`, `ollama`, `claude-haiku` |
| `-e, --embed <provider>` | Embedding: `ollama` (default, 768-dim), `voyage` (1024-dim), `openai` (1536-dim default) |
| `-p, --product <name>` | Limit to one product |
| `--batch-size <n>` | Embedding batch size (default: 64) |
| `--force` | Recompute even if chunk already exists (required when switching to a provider with a different vector dimension) |

#### Embedding providers and dimensions

Each provider produces vectors of a fixed native dimension. The DB stores the active dimension in `schema_meta.embedding_dim` so that switching providers across different dimensions raises a clear error rather than corrupting the vector table:

| Provider | Default model | Native dim | Env vars |
|----------|---------------|------------|----------|
| `ollama` | `nomic-embed-text` | 768 | (none — local) |
| `voyage` | `voyage-3` | 1024 | `VOYAGE_API_KEY` |
| `openai` | `text-embedding-3-small` | 1536 | `OPENAI_API_KEY`, optional: `OPENAI_EMBED_MODEL`, `OPENAI_BASE_URL` |

OpenAI also supports **Matryoshka truncation** — request a smaller-than-native dim and the provider sends the `dimensions` parameter to truncate. Useful for matching a previously-stamped 768d or 1024d DB. Native dim per OpenAI model:

| OpenAI model | Native dim |
|--------------|------------|
| `text-embedding-3-small` | 1536 |
| `text-embedding-3-large` | 3072 |
| `text-embedding-ada-002` | 1536 |

To switch providers across **different** dimensions on a DB that already has chunks, the DB must be wiped and re-initialized:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --embed <new-provider>
```

Attempting to switch dim with existing chunks raises `EMBEDDING_DIM_MISMATCH` (an `AppError` with a clear hint). On a fresh DB or one with no chunks yet, `hk embed --embed <provider>` records the new dim transparently.

### `hk ingest`

Parse `products/*/releases/*.md` and load into DB (idempotent).

```bash
hk ingest
hk ingest --products /path/to/products
```

## Analysis commands

### `hk latest`

Recent releases across all products.

```bash
hk latest
hk latest --product anthropic-sdk-typescript --limit 5
hk latest --since 2026-05-01     # only releases on or after 2026-05-01
hk latest --since 7d --limit 100 # last week, broad
```

| Flag | Description |
|------|-------------|
| `-p, --product <name>` | Limit to one product |
| `-s, --since <date>` | YYYY-MM-DD or relative lower bound — **new in v1.1** |
| `-l, --limit <n>` | Max results (default: 20) |

### `hk products`

List all products in the DB with release counts.

```bash
hk products
```

### `hk top <entity-type>`

Most-mentioned entities of a type.

```bash
hk top env_var
hk top slash_command
hk top model_id --limit 10
```

Entity types: `env_var`, `slash_command`, `cli_option`, `model_id`, `beta_header`, `cve`, `ghsa`, `hook_event`, `setting_key`.

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | User error (invalid input, missing args) |
| 2 | Runtime error (network failure, DB error) |
| 3 | Partial success (some products failed during fetch/sync) |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | Higher rate limits for GitHub API fetch |
| `VOYAGE_API_KEY` | Voyage AI embeddings and reranking |
| `COHERE_API_KEY` | Cohere reranking |
| `OPENAI_API_KEY` | OpenAI embeddings |
| `OPENAI_EMBED_MODEL` | OpenAI embedding model override (default: `text-embedding-3-small`) |
| `OPENAI_BASE_URL` | Override OpenAI API base URL (default: `https://api.openai.com/v1`) — useful for OpenAI-compatible gateways |
| `ANTHROPIC_API_KEY` | Claude Haiku context generation |
| `HK_LOG_LEVEL` | Log verbosity: `silent`, `normal`, `verbose`, `debug` |
| `HK_DEBUG` | Legacy: equivalent to `HK_LOG_LEVEL=debug` |
