---
product: mcp-rust-sdk
version: "rmcp-v0.17.0"
released_at: "2026-02-27"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v0.17.0"
fetched_at: "2026-05-22"
---

# mcp-rust-sdk rmcp-v0.17.0

### Added

- *(streamable-http)* add json_response option for stateless server mode ([#683](https://github.com/modelcontextprotocol/rust-sdk/pull/683))
- mcp sdk conformance ([#687](https://github.com/modelcontextprotocol/rust-sdk/pull/687))
- add default value support to string, number, and integer schemas ([#686](https://github.com/modelcontextprotocol/rust-sdk/pull/686))
- add trait-based tool declaration ([#677](https://github.com/modelcontextprotocol/rust-sdk/pull/677))
- send and validate MCP-Protocol-Version header ([#675](https://github.com/modelcontextprotocol/rust-sdk/pull/675))

### Fixed

- improve error logging and remove token secret from logs ([#685](https://github.com/modelcontextprotocol/rust-sdk/pull/685))
- refresh token expiry ([#680](https://github.com/modelcontextprotocol/rust-sdk/pull/680))
- gate optional dependencies behind feature flags ([#672](https://github.com/modelcontextprotocol/rust-sdk/pull/672))
- allow empty content in CallToolResult ([#681](https://github.com/modelcontextprotocol/rust-sdk/pull/681))
- *(schema)* remove AddNullable from draft2020_12 settings ([#664](https://github.com/modelcontextprotocol/rust-sdk/pull/664))

### Other

- add prose documentation for core features to meet conformance ([#702](https://github.com/modelcontextprotocol/rust-sdk/pull/702))
- Fix/sse channel replacement conflict ([#682](https://github.com/modelcontextprotocol/rust-sdk/pull/682))
- document session management for streamable HTTP transport ([#674](https://github.com/modelcontextprotocol/rust-sdk/pull/674))
