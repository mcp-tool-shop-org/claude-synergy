---
title: Claude Synergy Handbook
description: Complete guide to Claude Synergy — local Anthropic changelog mirror with hybrid search and MCP server.
sidebar:
  order: 0
---

Claude Synergy is a **local, queryable mirror** of every Anthropic and adjacent AI developer tool changelog, plus a curated **Synergy layer** describing cross-product workflows.

## Why it exists

LLM agents operate inside harnesses (Claude Code, Cline, Cursor, etc.) that ship new features weekly. Without a queryable changelog database, the agent doesn't know what its own harness can do — and neither does the developer.

Claude Synergy fixes this by:

1. **Mirroring changelogs** from 44 products across 6 fetch strategies
2. **Indexing every change bullet** into SQLite with FTS5 full-text search
3. **Optional semantic search** via sqlite-vec embeddings + Reciprocal Rank Fusion
4. **Exposing 8 MCP tools** so any MCP-compatible agent can query the corpus
5. **Curating 12 synergies** — cross-product workflows that no single changelog reveals

## What's in the handbook

| Page | Covers |
|------|--------|
| [Getting started](./getting-started/) | Install, first sync, first query |
| [CLI reference](./cli-reference/) | All 15 commands with flags and examples |
| [MCP server](./mcp-server/) | Wiring, tools, integration patterns |
| [Architecture](./architecture/) | Data flow, schema, fetch strategies |
| [Security](./security/) | Threat model, data scope, secrets handling |

## Quick start

```bash
npm i -g @mcptoolshop/claude-synergy
hk init && hk sync
hk query "managed agents"
```
