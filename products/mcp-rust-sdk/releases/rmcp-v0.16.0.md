---
product: mcp-rust-sdk
version: "rmcp-v0.16.0"
released_at: "2026-02-17"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v0.16.0"
fetched_at: "2026-05-22"
---

# mcp-rust-sdk rmcp-v0.16.0

### Added

- add support for custom HTTP headers in StreamableHttpClient ([#655](https://github.com/modelcontextprotocol/rust-sdk/pull/655))
- *(auth)* add token_endpoint_auth_method to OAuthClientConfig ([#648](https://github.com/modelcontextprotocol/rust-sdk/pull/648))

### Fixed

- remove unnecessary doc-cfg ([#661](https://github.com/modelcontextprotocol/rust-sdk/pull/661))
- duplicate meta serialization ([#662](https://github.com/modelcontextprotocol/rust-sdk/pull/662))
- sort list_all() output in ToolRouter and PromptRouter for deterministic ordering ([#665](https://github.com/modelcontextprotocol/rust-sdk/pull/665))
- align task response types with MCP spec ([#658](https://github.com/modelcontextprotocol/rust-sdk/pull/658))

### Other

- upgrade reqwest to 0.13.2 ([#669](https://github.com/modelcontextprotocol/rust-sdk/pull/669))
- include LICENSE in final crate tarball ([#657](https://github.com/modelcontextprotocol/rust-sdk/pull/657))
- *(deps)* update rand requirement from 0.9 to 0.10 ([#650](https://github.com/modelcontextprotocol/rust-sdk/pull/650))
- remove unused axum dependency from server-side-http feature ([#642](https://github.com/modelcontextprotocol/rust-sdk/pull/642))
- 11-25-2025 compliant Auth ([#651](https://github.com/modelcontextprotocol/rust-sdk/pull/651))
- add rudof-mcp to MCP servers list ([#645](https://github.com/modelcontextprotocol/rust-sdk/pull/645))
