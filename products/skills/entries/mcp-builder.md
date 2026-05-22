---
product: skills
catalog: anthropics-skills-official
skill_name: "mcp-builder"
trigger_summary: "Build high-quality MCP (Model Context Protocol) servers — TypeScript SDK or Python FastMCP."
github_path: "skills/mcp-builder"
fetched_at: "2026-05-21"
---

# mcp-builder

**Description:** Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).

**Trigger:** "Build an MCP server", "wrap this API as MCP", "FastMCP", "TypeScript MCP SDK", "stdio MCP", "streamable HTTP transport".

**Surfaces:** Claude Code (primary — scaffolds projects), Claude API, Claude.ai (uploadable skill).

## Original SKILL.md excerpt

> # MCP Server Development Guide
>
> ## Overview
> Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. The quality of an MCP server is measured by how well it enables LLMs to accomplish real-world tasks.
>
> ## High-Level Workflow
>
> ### Phase 1: Deep Research and Planning
>
> **Understand Modern MCP Design:**
> - **API Coverage vs. Workflow Tools:** Balance comprehensive API endpoint coverage with specialized workflow tools. When uncertain, prioritize comprehensive API coverage.
> - **Tool Naming and Discoverability:** Use consistent prefixes (e.g., `github_create_issue`, `github_list_repos`) and action-oriented naming.
> - **Context Management:** Design tools that return focused, relevant data.
> - **Actionable Error Messages:** Error messages should guide agents toward solutions.
>
> **Study MCP Protocol Documentation:**
> - Sitemap: `https://modelcontextprotocol.io/sitemap.xml`
> - Fetch specific pages with `.md` suffix for markdown format.
>
> **Recommended stack:**
> - **Language**: TypeScript (high-quality SDK support and good compatibility in many execution environments e.g. MCPB)
> - **Transport**: Streamable HTTP for remote servers, using stateless JSON. stdio for local servers.
>
> ### Phase 2: Implementation
> - Set up project structure (TypeScript or Python)
> - Implement shared infrastructure: API client with auth, error helpers, response formatting (JSON/Markdown), pagination
> - For each tool: define input schema with Zod (TS) or Pydantic (Python), include constraints and clear descriptions
>
> Bundled `reference/` contains `mcp_best_practices.md`, `node_mcp_server.md`, `python_mcp_server.md`.
