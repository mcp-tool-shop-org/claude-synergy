---
title: CLI Reference
description: Complete reference for all 15 hk commands — flags, options, and examples.
sidebar:
  order: 2
---

The `hk` CLI provides 15 commands organized into four groups: **setup**, **search**, **sync**, and **analysis**.

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
hk query --kind breaking --limit 50 "deprecated"
```

| Flag | Description |
|------|-------------|
| `-p, --product <name>` | Limit to one product |
| `-s, --since <date>` | YYYY-MM-DD lower bound |
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
```

| Flag | Description |
|------|-------------|
| `-e, --embed <provider>` | Embedding provider: `ollama` (default), `voyage` |
| `-r, --rerank <provider>` | Rerank: `none` (default), `ollama-judge`, `voyage`, `cohere` |
| `-l, --limit <n>` | Max results (default: 10) |
| `--top-k <n>` | Per-channel pull before fusion (default: 60) |
| `--rerank-candidates <n>` | RRF candidates to rerank (default: 20) |

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
hk embed --product cursor --force      # re-embed one product
hk embed --limit 100                   # test with small batch
```

| Flag | Description |
|------|-------------|
| `-c, --context <provider>` | Context: `structured` (default), `none`, `ollama`, `claude-haiku` |
| `-e, --embed <provider>` | Embedding: `ollama` (default), `voyage` |
| `-p, --product <name>` | Limit to one product |
| `--batch-size <n>` | Embedding batch size (default: 64) |
| `--force` | Recompute even if chunk already exists |

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
```

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
| `ANTHROPIC_API_KEY` | Claude Haiku context generation |
| `HK_LOG_LEVEL` | Log verbosity: `silent`, `normal`, `verbose`, `debug` |
| `HK_DEBUG` | Legacy: equivalent to `HK_LOG_LEVEL=debug` |
