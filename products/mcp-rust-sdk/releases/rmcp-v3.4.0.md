---
product: mcp-rust-sdk
version: "rmcp-v3.4.0"
released_at: "2026-09-15"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v3.4.0"
fetched_at: "2026-10-06"
---

# mcp-rust-sdk rmcp-v3.4.0

### Added

- *(model)* add ServerConfig and ClientConfig ([#1266](https://github.com/modelcontextprotocol/rust-sdk/pull/1266))

### Fixed

- *(rmcp)* use ServerConfig in cancellation test ([#1273](https://github.com/modelcontextprotocol/rust-sdk/pull/1273))
- *(rmcp)* route peer cancellation by lifecycle ([#1262](https://github.com/modelcontextprotocol/rust-sdk/pull/1262))
- run first pre-init request in service loop ([#1263](https://github.com/modelcontextprotocol/rust-sdk/pull/1263))
- *(auth)* let url origin decide prm discovery ([#1264](https://github.com/modelcontextprotocol/rust-sdk/pull/1264))
- *(model)* deprecate ServerInfo and ClientInfo aliases ([#1156](https://github.com/modelcontextprotocol/rust-sdk/pull/1156))
- *(auth)* ignore non-metadata JSON when probing for protected resource metadata ([#1204](https://github.com/modelcontextprotocol/rust-sdk/pull/1204))
- do not treat malformed JSON 200 as Accepted for requests ([#1208](https://github.com/modelcontextprotocol/rust-sdk/pull/1208))
- *(streamable-http-server)* map handler-generated HeaderMismatch to HTTP 400 ([#1259](https://github.com/modelcontextprotocol/rust-sdk/pull/1259))
- *(http)* enforce Origin validation semantics ([#1192](https://github.com/modelcontextprotocol/rust-sdk/pull/1192))
