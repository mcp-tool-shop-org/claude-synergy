---
name: mcp-across-seven-surfaces
title: One MCP server binary, seven agent surfaces
products: [claude-code, cursor, continue-dev, copilot, windsurf, cody-enterprise, claude-api]
trigger: User built an MCP server and wants it available in every IDE/agent surface they use
status: confirmed
last_validated: 2026-05-21
---

# One MCP server binary, seven agent surfaces

**Why it works:** MCP is the universal extension surface. As of mid-2026, MCP servers (stdio or HTTP/SSE) are consumable by:

| Surface | Config location | Wrapper key | Notes |
|---|---|---|---|
| **Claude Code** | `.mcp.json` (project) or `~/.claude/settings.json` | `mcpServers` | Full support, ToolSearch for large catalogs |
| **Cursor** | `.cursor/mcp.json` or `~/.cursor/mcp.json` | `mcpServers` | 40-80 tool cap per session |
| **Continue.dev** | `.continue/mcpServers/*.json` | `mcpServers` | **Agent mode only** (not Chat/Edit) |
| **GitHub Copilot** | `.vscode/mcp.json` (VS Code) or `mcp.json` | **`servers`** | ⚠️ wrapper key differs from everyone else |
| **Windsurf (Cognition)** | Cascade MCP panel | `mcpServers` | First-class; MCP Marketplace; 100-tool cap |
| **Sourcegraph Cody Enterprise** | extension settings | `mcpServers` | Free/Pro plans deprecated 2025-07-23; Enterprise only |
| **Claude API (Managed Agents)** | MCP connector beta header | n/a (request body) | Beta; private-network access via MCP tunnels (2026-05-19) |

Value shape is identical across all: `{ command, args, env }` for stdio, `{ url, headers }` for HTTP/SSE.

**Workflow:**

1. Build the MCP server (any language; use one of the [official SDKs](https://github.com/modelcontextprotocol)).
2. Register in each client's config using the right wrapper key (`mcpServers` for 6 of 7; `servers` for Copilot).
3. The same binary serves every surface.

**Evidence:**

- [Claude Code MCP docs](https://code.claude.com/docs/en/mcp)
- [Cursor MCP setup](https://forum.cursor.com/t/what-are-the-capabilities-of-mcp-json/63130)
- [Continue.dev MCP deep-dive](https://docs.continue.dev/customize/deep-dives/mcp) — JSON config support added 2025-09-29, accepts Claude Desktop's `claude_desktop_config.json` byte-identically
- [GitHub Copilot MCP docs](https://docs.github.com/copilot/customizing-copilot/using-model-context-protocol/extending-copilot-chat-with-mcp) — uses `"servers"` key
- [Windsurf Cascade MCP](https://docs.windsurf.com/windsurf/cascade/mcp)
- [Cody MCP integration](https://sourcegraph.com/blog/cody-supports-anthropic-model-context-protocol)
- [MCP Tunnels (Claude API 2026-05-19)](https://platform.claude.com/docs/en/agents-and-tools/mcp-tunnels/overview)

**Caveats / gotchas:**

- **Copilot uses `"servers"` not `"mcpServers"`.** Copy-pasting Claude Code's `.mcp.json` into Copilot's `.vscode/mcp.json` will fail silently — strip the outer wrapper key.
- **Continue.dev MCP only fires in Agent mode.** Chat/Edit modes don't see MCP tools.
- **Tool count caps vary.** Cursor 40-80, Windsurf 100, others unbounded. Curate per-surface if you bundle a large catalog.
- **Auth differs.** Claude Managed Agents needs vault credentials; Copilot enterprise has registry URL + access-control policy; Cursor stores keys locally per OS.
- **Transports differ.** Stdio is universal. HTTP supported by Code/Copilot/Continue/Windsurf/API. SSE supported by Continue/Windsurf (Copilot's docs reference it but HTTP is the documented modern remote transport).
