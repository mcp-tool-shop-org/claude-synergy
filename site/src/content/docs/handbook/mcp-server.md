---
title: MCP Server
description: Wire the Claude Synergy MCP server into your agent harness for live changelog queries.
sidebar:
  order: 3
---

Claude Synergy includes an 11-tool MCP server that runs over **stdio**. Any MCP-compatible harness — Claude Code, Cline, Cursor, or custom Agent SDK agents — can query the changelog corpus in real time.

## Wiring

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp",
      "env": {
        "HK_DB": "/path/to/data/claude-synergy.db"
      }
    }
  }
}
```

### Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp",
      "args": [],
      "env": {
        "HK_DB": "/path/to/data/claude-synergy.db"
      }
    }
  }
}
```

### Programmatic (Agent SDK)

```typescript
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'claude-synergy-mcp',
  env: { HK_DB: '/path/to/data/claude-synergy.db' },
});
```

## Tools

### `search`

Full-text search across all change bullets.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | yes | FTS5 search query |
| `product` | string | no | Limit to one product |
| `since` | string | no | YYYY-MM-DD lower bound |
| `until` | string | no | YYYY-MM-DD upper bound — **new in v1.1** |
| `kind` | string | no | added, fixed, breaking, etc. |
| `limit` | number | no | Max results (default: 20) |

### `lookup_entity`

Find when a specific entity (env var, slash command, model ID, CVE) was introduced or changed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | string | yes | env_var, slash_command, model_id, cve, etc. |
| `value` | string | yes | The entity value to look up |

### `latest_releases`

Recent releases across all or one product.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product` | string | no | Limit to one product |
| `since` | string | no | YYYY-MM-DD lower bound — **new in v1.1** |
| `limit` | number | no | Max results (default: 20) |

### `get_release`

Get the full content of a specific release.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product` | string | yes | Product name |
| `version` | string | yes | Release version |

### `list_products`

List all products in the database with release counts. No parameters.

### `top_entities`

Most-mentioned entities of a given type.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | string | yes | Entity type to rank |
| `limit` | number | no | Max results (default: 30) |

### `list_synergies`

List all curated cross-product synergy documents.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product` | string | no | Limit to synergies that involve this product — **new in v1.1** |

### `read_synergy`

Read a specific synergy document by slug.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | yes | Synergy document slug (e.g. `01-skill-portability`) |

### `get_changes_since` (new in v1.1)

Changes in a time window, grouped by product+version. Backs the `hk diff` CLI command.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `since` | string | yes | ISO date (`YYYY-MM-DD`), full ISO 8601, or relative (`7d`/`2w`/`3m`/`1y`) |
| `until` | string | no | Upper bound — same formats |
| `product` | string | no | Limit to one product |
| `kind` | string | no | Filter: added, fixed, breaking, deprecated, etc. |
| `limit` | number | no | Max total change rows (default: 200) |

**Example call:**

```json
{
  "name": "get_changes_since",
  "arguments": { "since": "2026-05-15", "product": "claude-code" }
}
```

Returns a `ChangesSinceResult[]` — same JSON shape `hk diff --json` emits: groups of `{product, version, released_at, changes: [{kind, text}]}`.

> **Note on date formats:** Relative forms like `7d` resolve to ISO at the CLI boundary. The MCP tool accepts the same forms, but they are passed through to the query layer — pass ISO `YYYY-MM-DD` for maximum portability across MCP hosts.

### `search_breaking_changes` (new in v1.1)

Flat list of breaking changes — no search term required. Backs the `hk breaking` CLI command.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product` | string | no | Limit to one product |
| `since` | string | no | YYYY-MM-DD lower bound |
| `until` | string | no | YYYY-MM-DD upper bound |
| `limit` | number | no | Max results (default: 50) |

**Example call:**

```json
{
  "name": "search_breaking_changes",
  "arguments": { "since": "2026-04-01", "limit": 20 }
}
```

### `compare_versions` (new in v1.1)

All changes between two versions of one product. Useful for migration planning when you know the exact versions you're upgrading between. The interval is **exclusive at `from_version`, inclusive at `to_version`** — i.e. it returns everything that changed *after* you were on `from_version`, up to and including `to_version`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `product` | string | yes | Product slug |
| `from_version` | string | yes | Start version (**exclusive** — not included in results) |
| `to_version` | string | yes | End version (**inclusive** — included in results) |

**Example call:**

```json
{
  "name": "compare_versions",
  "arguments": {
    "product": "anthropic-sdk-typescript",
    "from_version": "0.94.0",
    "to_version": "0.95.1"
  }
}
```

Returns every change recorded across `(0.94.0, 0.95.1]` for `anthropic-sdk-typescript`, in the same `ChangesSinceResult[]` shape — grouped by release version. A single call replaces N+1 `get_release` lookups when planning an upgrade.

## Safety properties

- **No network calls** — the MCP server reads only from the local SQLite database. No HTTP, no DNS, no egress.
- **No code execution** — accepts JSON-RPC queries, returns structured JSON results. Never executes user input.
- **Structured errors only** — all exceptions are caught and returned as `McpError` with error code and message. Stack traces are never exposed.
- **Timeout protection** — every query has a 30-second timeout guard. Hung providers cannot block the server.
- **Graceful shutdown** — handles `SIGINT`/`SIGTERM` and `server.onclose` for clean DB handle release.

## Use patterns

### Agent self-awareness

An MCP-connected agent can discover what its harness supports:

> "What slash commands were added to Claude Code in the last 30 days?"

The agent calls `search({ query: "slash command", product: "claude-code", since: "2026-04-22", kind: "added" })` and gets actionable results.

### Cross-product planning

> "Is there a way to use the same MCP server config across Claude Code and Cursor?"

The agent calls `list_synergies()`, finds the MCP portability synergy, reads it with `read_synergy({ slug: "02-mcp-server-portability" })`, and summarizes the compatibility matrix.

### Migration guidance

> "We're upgrading from claude-3-haiku to claude-sonnet-4. What changed?"

The agent calls `lookup_entity({ entity_type: "model_id", value: "claude-sonnet-4-20250514" })` and `lookup_entity({ entity_type: "model_id", value: "claude-3-haiku-20240307" })` to compare timelines.

### "What broke this week?"

> "Did anything load-bearing break in the last week?"

The agent calls `search_breaking_changes({ since: "<7 days ago>" })` and gets a flat list — no search term needed. For one product specifically, add `{ product: "claude-code" }`.

### Pin-to-pin upgrade brief

> "We're upgrading anthropic-sdk-typescript from 0.94.0 to 0.95.1. Give me the change brief."

The agent calls `compare_versions({ product: "anthropic-sdk-typescript", from_version: "0.94.0", to_version: "0.95.1" })` and summarizes the response into a migration checklist.
