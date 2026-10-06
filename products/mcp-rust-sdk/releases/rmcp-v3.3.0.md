---
product: mcp-rust-sdk
version: "rmcp-v3.3.0"
released_at: "2026-09-10"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v3.3.0"
fetched_at: "2026-10-06"
---

# mcp-rust-sdk rmcp-v3.3.0

### Added

- add ServerHandler::negotiate_initialize ([#1247](https://github.com/modelcontextprotocol/rust-sdk/pull/1247))
- *(macros)* reject empty tool_router ([#1233](https://github.com/modelcontextprotocol/rust-sdk/pull/1233))
- *(auth)* add enterprise refresh-token and ID-JAG exchanges ([#1234](https://github.com/modelcontextprotocol/rust-sdk/pull/1234))

### Fixed

- *(sse)* saturate exponential reconnect backoff to avoid overflow panic ([#1231](https://github.com/modelcontextprotocol/rust-sdk/pull/1231))
- resolve clippy warnings across workspace ([#1195](https://github.com/modelcontextprotocol/rust-sdk/pull/1195))
- *(auth)* unify refresh checks and error handling ([#1236](https://github.com/modelcontextprotocol/rust-sdk/pull/1236))

### Other

- *(deps)* update process-wrap requirement from 9.0 to 10.0 ([#1229](https://github.com/modelcontextprotocol/rust-sdk/pull/1229))
