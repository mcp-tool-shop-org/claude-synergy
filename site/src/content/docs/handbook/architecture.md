---
title: Architecture
description: Data flow, schema design, fetch strategies, and search pipeline internals.
sidebar:
  order: 4
---

## Data flow

```
Sources (GitHub, RSS, HTML, Playwright, MCP registries)
    |
    v
[hk fetch] ── writes markdown files ──> products/{product}/releases/*.md
    |
    v
[hk ingest] ── parses markdown, extracts bullets + entities ──> SQLite (changes, releases, entities)
    |
    v
[hk embed] ── contextual chunking + vector embeddings ──> SQLite (chunks, vec_chunks)
    |
    v
[hk query / hk hybrid] ── FTS5 or hybrid search ──> results
    |
    v
[MCP server] ── JSON-RPC over stdio ──> agent harness
```

## Fetch strategies

Each product uses one of six fetch strategies:

| Strategy | Source | Products |
|----------|--------|----------|
| `gh-releases` | GitHub Releases API | Anthropic SDKs (7), Agent SDKs (2), claude-code (auto-synced as of v1.1), MCP SDKs, etc. |
| `rss` | RSS 2.0 feeds | Cursor, Cody Enterprise |
| `raw-changelog` | Raw markdown file (Aider HISTORY.md format) | Aider |
| `keep-a-changelog` | Raw CHANGELOG.md in [Keep-a-Changelog](https://keepachangelog.com/) format — available v1.1+ | (generic; no products wired yet) |
| `html-scrape` | HTML changelog pages | GitHub Copilot, VS Code Chat |
| `playwright` | Headless browser | Windsurf (CSR-only pages) |
| `catalog` | MCP registry APIs | Smithery, official MCP Registry |

Strategy selection is driven by `products.yaml` — a YAML config where each product declares its strategy, source URL, and parsing rules.

### Incremental sync

Fetch markers track the last-seen release date per product. Each subsequent `hk fetch` only pulls new releases published after the marker, keeping network usage minimal.

## Database schema

### Core tables

| Table | Purpose |
|-------|---------|
| `releases` | One row per product release (product, version, date, body) |
| `changes` | One row per change bullet (release_id, kind, text) |
| `changes_fts` | FTS5 virtual table for full-text search on change text |
| `entities` | Extracted entities (env_var, slash_command, model_id, etc.) |
| `fetch_markers` | Per-product watermark for incremental fetch |
| `schema_meta` | Schema version + active embedding dimension (`embedding_dim`) |
| `synergies` / `synergy_products` / `synergy_steps` / `synergy_evidence` / `synergy_change_refs` | Cache of `synergies/*.md` populated on `hk ingest` (v1.1+). Powers `list_synergies` / `read_synergy` MCP tools off the DB rather than the filesystem. |

### Vector tables (optional)

| Table | Purpose |
|-------|---------|
| `chunks` | Contextual chunks with metadata (change_id, context text, content hash) |
| `vec_chunks` | sqlite-vec virtual table storing float32 embeddings at the dimension stamped in `schema_meta.embedding_dim` (768 / 1024 / 1536 for Ollama / Voyage / OpenAI respectively) |

### Schema versioning

The database carries a `schema_meta` table with a version stamp. On `hk init`:

- If the DB version matches the code version, no action is taken
- If the DB version is older, migrations run automatically (v2 → v3 stamps `embedding_dim = 768` to preserve existing Ollama DBs)
- If the DB version is newer than the code, the CLI throws with upgrade instructions

Migration is one-way: a v3 DB cannot be opened by a pre-v1.1 tool version. The `embedding_dim` column is the negotiation point for the configurable-dim feature — `setEmbeddingDim()` refuses to change dim while chunks exist, raising `EMBEDDING_DIM_MISMATCH` with a hint to wipe the DB.

## Search pipeline

### FTS5 (full-text)

```
query text
  -> FTS5 MATCH against changes_fts
  -> ranked by BM25
  -> filtered by product/since/kind
  -> limited to N results
```

### Hybrid (FTS5 + semantic)

```
query text
  -> [Channel 1] FTS5 MATCH (BM25 ranking)
  -> [Channel 2] embed query via Ollama/Voyage -> sqlite-vec cosine similarity
  -> Reciprocal Rank Fusion (k=60)
  -> Optional reranking (Voyage, Cohere, or Ollama-judge)
  -> Final top-N results
```

The hybrid pipeline uses **Contextual Retrieval** — each chunk carries context about the product, version, and surrounding changes, giving the embedding model richer signal than bare bullet text.

## Ingest pipeline

1. **Read** markdown release files from `products/{product}/releases/*.md`
2. **Parse** frontmatter (product, version, date) and body
3. **Convert** HTML bodies to markdown via Turndown (for HTML-scrape sources)
4. **Split** body into individual change bullets
5. **Classify** each bullet by kind (added, fixed, breaking, deprecated, etc.)
6. **Extract** entities using regex patterns (env vars, slash commands, model IDs, CVEs, etc.)
7. **Deduplicate** via content hash (SHA-256 prefix) — repeated ingests are idempotent
8. **Insert** into SQLite in a single transaction per product

## Embedding pipeline

1. **Select** un-embedded changes from the database
2. **Generate context** per chunk:
   - `structured` — deterministic template with product + version metadata
   - `ollama` — local LLM generates a natural-language context sentence
   - `claude-haiku` — Claude Haiku generates context (costs API credits)
3. **Batch** chunks into groups of 64
4. **Embed** via Ollama (`nomic-embed-text`, 768-dim), Voyage AI (1024-dim), or OpenAI (`text-embedding-3-small` 1536-dim default; configurable via `OPENAI_EMBED_MODEL`)
5. **Store** vectors in sqlite-vec at the dimension recorded in `schema_meta.embedding_dim` — the first embed pins the dim; subsequent embeds with a different-dim provider raise a clear error unless `--force` is passed
6. **Budget guards** — optional `maxRequests` / `maxTokens` limits with early stop

## File layout

```
claude-synergy/
  src/
    cli.ts          # Commander-based CLI (17 commands)
    mcp-server.ts   # MCP server (11 tools over stdio)
    db.ts           # SQLite schema + migrations
    fetch.ts        # Fetch orchestrator
    fetch-utils.ts  # fetchWithRetry, global timeout controller
    ingest.ts       # Markdown parser + entity extractor
    query.ts        # FTS5 search + formatting
    embed.ts        # Contextual chunking + embedding
    hybrid.ts       # RRF fusion + reranking
    errors.ts       # Structured AppError class
    providers/
      embedding/    # Ollama (768d), Voyage (1024d), OpenAI (1536d) embedding adapters
      rerank/       # Voyage, Cohere, Ollama-judge rerankers
      context/      # Context generation adapters
      retry.ts      # Shared retry utility with backoff
  products.yaml     # Product registry (44 products)
  synergies/        # 12 curated cross-product synergy docs
  schema.sql        # Core DB schema
  schema-vec.sql    # Vector extension schema
```
