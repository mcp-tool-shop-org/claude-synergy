---
title: MCP Server
description: Wire the Claude Synergy MCP server into your agent harness for live changelog queries.
sidebar:
  order: 3
---

Claude Synergy includes an 8-tool MCP server that runs over **stdio**. Any MCP-compatible harness — Claude Code, Cline, Cursor, or custom Agent SDK agents — can query the changelog corpus in real time.

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

List all curated cross-product synergy documents. No parameters.

### `read_synergy`

Read a specific synergy document by slug.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | yes | Synergy document slug (e.g. `01-skill-portability`) |

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
