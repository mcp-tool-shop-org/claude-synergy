---
name: mcp-server-portability
title: One MCP server, every Anthropic surface
products: [claude-code, claude-api, claude-cowork, claude-chat]
trigger: User built an MCP server for one surface and wants it available everywhere
status: confirmed
last_validated: 2026-05-21
---

# One MCP server, every Anthropic surface

**Why it works:** MCP (Model Context Protocol) is the universal extension surface. The same server binary that registers in Claude Code's `.mcp.json` also plugs into Claude API (via MCP connector), Cowork (via plugin marketplace), and Claude.ai (via consumer MCP connectors). Build once, deploy everywhere.

**Workflow:**

1. Build the MCP server (stdio or HTTP/SSE; any language) following the [MCP spec](https://modelcontextprotocol.io)
2. **Claude Code:** add to `.mcp.json` (project) or user `~/.claude/settings.json` (global)
3. **Claude API:** include via [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) in Messages requests (beta since 2025-05-22)
4. **Cowork:** publish to [claude-plugins-official](https://github.com/anthropics/claude-plugins-official) or [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) with `.mcp.json` declaration in the plugin manifest
5. **Claude.ai:** for consumer use, the chat product surfaces MCP connectors directly (varies by tier)
6. **Private network:** for self-hosted MCP servers behind a firewall, use [MCP tunnels](https://platform.claude.com/docs/en/agents-and-tools/mcp-tunnels/overview) (Research Preview 2026-05-19) to connect Managed Agents

**Evidence:**

- [Claude API release notes 2026-05-19](https://platform.claude.com/docs/en/release-notes/overview#may-19-2026): "MCP tunnels is now available as a Research Preview, so you can connect to MCP servers in your private network"
- [Claude API release notes 2025-05-22](https://platform.claude.com/docs/en/release-notes/overview#may-22-2025): MCP connector public beta launch
- [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) — Cowork plugin marketplace; many entries are MCP-server-shaped

**Caveats:**

- Stdio servers need a runtime on the target (Node, Python, etc.); HTTP/SSE servers are more portable but need hosting
- Some surfaces have additional auth requirements (vault credentials for Managed Agents; OAuth flows for Cowork team-shared servers)
- As of [claude-agent-sdk-python v0.2.82 (2026-05-15)](https://github.com/anthropics/claude-agent-sdk-python/releases/tag/v0.2.82) MCP servers connect non-blocking by default; if your server *must* be ready in turn 1, mark `alwaysLoad: true`
