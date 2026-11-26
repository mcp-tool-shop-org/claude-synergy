# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.0.x   | Yes                |
| 0.7.x   | Security fixes only|
| < 0.7   | No                 |

## Reporting a Vulnerability

Email: **64996768+mcp-tool-shop@users.noreply.github.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Version affected
- Potential impact

### Response timeline

| Action | Target |
|--------|--------|
| Acknowledge report | 48 hours |
| Assess severity | 7 days |
| Release fix | 30 days |

## Scope

This tool operates **locally only** with optional outbound HTTP for changelog sync.

- **Data touched:** local SQLite database (`~/.claude-synergy/data/claude-synergy.db` by default, `./data/claude-synergy.db` when that file already exists, or the path in `CLAUDE_SYNERGY_DB`), markdown release files under the `products/` directory beside it, YAML config (`products.yaml`). All data is derived — deletable and re-creatable.
- **Network egress:** outbound HTTPS to GitHub API (`api.github.com`), RSS feeds, HTML changelog pages, MCP registries (Smithery, official), and optionally Ollama (localhost), Voyage AI, or Cohere for embeddings/reranking. Egress happens when `hk fetch` or `hk sync` runs, when `hk embed` or `hk hybrid` uses a remote provider (`hk hybrid -e voyage|openai` or `-r voyage|cohere`), when an agent calls the MCP `sync_now` tool, and on first use: a query command or MCP tool run against an empty store syncs on its own (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` turns that off). Hybrid search otherwise, including the MCP `search` tool's default mode, calls a local Ollama on localhost.
- **Secrets handling:** reads `GITHUB_TOKEN` (optional, for higher rate limits), `VOYAGE_API_KEY`, `COHERE_API_KEY`, and `ANTHROPIC_API_KEY` from environment variables. These are never logged, stored to disk, or included in error messages. Stage A of the dogfood swarm hardened all error paths to sanitize response bodies.
- **No telemetry** is collected or sent. No analytics, no crash reporting, no usage tracking.
- **MCP server:** runs over stdio only. No HTTP listener, no WebSocket. It goes out to the internet only for the `sync_now` tool and the first-use sync; its `search` tool's default hybrid mode calls a local Ollama on localhost. Accepts queries and returns structured JSON-RPC responses. Never executes arbitrary code from inputs.
