---
product: mcp-rust-sdk
version: "rmcp-v3.5.0"
released_at: "2026-09-28"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v3.5.0"
fetched_at: "2026-10-06"
---

# mcp-rust-sdk rmcp-v3.5.0

### Added

- update LATEST and add LATEST_WITH_INITIALIZE ([#1105](https://github.com/modelcontextprotocol/rust-sdk/pull/1105))

### Fixed

- *(model)* decode float fields through serde_json::Number ([#1300](https://github.com/modelcontextprotocol/rust-sdk/pull/1300))
- *(rmcp)* reject duplicate sep-2243 headers ([#1274](https://github.com/modelcontextprotocol/rust-sdk/pull/1274))
- *(transport)* match explicit default ports in Origin allowlist ([#1270](https://github.com/modelcontextprotocol/rust-sdk/pull/1270))
- *(rmcp)* tolerate empty cacheScope instead of silently dropping the whole result ([#1281](https://github.com/modelcontextprotocol/rust-sdk/pull/1281))
- *(model)* preserve explicit null structuredContent in CallToolResult ([#1295](https://github.com/modelcontextprotocol/rust-sdk/pull/1295))

### Other

- cargo fmt fixes on validate_standard_headers changes ([#1275](https://github.com/modelcontextprotocol/rust-sdk/pull/1275))
