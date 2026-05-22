---
name: mcp-config-format-gotcha
title: Copilot's MCP config wrapper key is `servers` not `mcpServers`
products: [claude-code, cursor, continue-dev, copilot, windsurf, cody-enterprise]
trigger: User is copy-pasting an MCP server config between Claude Code/Cursor/Continue and GitHub Copilot
status: confirmed
last_validated: 2026-05-21
---

# Copilot's MCP config wrapper key is `servers` not `mcpServers`

**Why this matters:** Six of seven major MCP-host surfaces use `"mcpServers"` as the top-level wrapper key. **GitHub Copilot uses `"servers"`.** Same value shape — just a different parent key. Copy-pasting between configs without renaming silently fails (Copilot ignores `mcpServers` keys; sees an empty config).

**Comparison:**

```jsonc
// Claude Code .mcp.json (also: Cursor, Continue, Windsurf, Cody)
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    }
  }
}

// GitHub Copilot .vscode/mcp.json (note the different key)
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    }
  }
}
```

**Workflow when bridging:**

1. **From Claude Code → Copilot:** strip the outer `mcpServers` key, wrap the contents in `servers` instead.
2. **From Copilot → Claude Code:** reverse — strip `servers`, wrap in `mcpServers`.
3. **For a script that does this:**
   ```bash
   # Claude Code → Copilot
   jq '{servers: .mcpServers}' .mcp.json > .vscode/mcp.json
   ```

**Evidence:**

- [GitHub Copilot MCP docs](https://code.visualstudio.com/docs/copilot/customization/mcp-servers) — uses `"servers"` consistently in all examples
- [GitHub Copilot CLI MCP](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-mcp-servers) — same key
- [Cursor MCP docs](https://forum.cursor.com/t/what-are-the-capabilities-of-mcp-json/63130) — uses `mcpServers`
- [Continue MCP docs](https://docs.continue.dev/customize/deep-dives/mcp) — uses `mcpServers`, explicitly notes compatibility with Claude Desktop's config

**Caveats / extras:**

- **Value shape is identical** across both. `{ command, args, env }` for stdio. `{ url, headers, type: "http" }` for HTTP. No translation needed within each entry.
- **HTTP vs stdio.** Both support both transports. Copilot HTTP entries can use `"type": "http"` explicitly; some Cursor builds require it too.
- **Why the divergence?** Likely historical — Copilot adopted MCP later and chose a config shape closer to VS Code's existing `settings.json` patterns rather than mirroring Claude Desktop's `claude_desktop_config.json` convention.
- **Future:** an Anthropic-shipped MCP `inspector` works against both shapes by reading raw JSON. If a portable config standard ever lands, expect Copilot to align (the `mcpServers` key is the de-facto standard for everyone else).
