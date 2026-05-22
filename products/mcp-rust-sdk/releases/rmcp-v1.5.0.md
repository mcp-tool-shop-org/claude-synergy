---
product: mcp-rust-sdk
version: "rmcp-v1.5.0"
released_at: "2026-04-16"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v1.5.0"
fetched_at: "2026-05-22"
---

# mcp-rust-sdk rmcp-v1.5.0

### Added

- *(transport)* add constructors for non_exhaustive error types ([#806](https://github.com/modelcontextprotocol/rust-sdk/pull/806))
- add 2025-11-25 protocol version support ([#802](https://github.com/modelcontextprotocol/rust-sdk/pull/802))

### Fixed

- treat resource metadata JSON parse failure as soft error ([#810](https://github.com/modelcontextprotocol/rust-sdk/pull/810))
- include http_request_id in request-wise priming event IDs ([#799](https://github.com/modelcontextprotocol/rust-sdk/pull/799))
- *(http)* drain SSE stream for connection reuse ([#790](https://github.com/modelcontextprotocol/rust-sdk/pull/790))

### Other

- *(deps)* update which requirement from 7 to 8 ([#807](https://github.com/modelcontextprotocol/rust-sdk/pull/807))
