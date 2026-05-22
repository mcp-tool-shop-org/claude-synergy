---
product: mcp-rust-sdk
version: "rmcp-v1.2.0"
released_at: "2026-03-11"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v1.2.0"
fetched_at: "2026-05-22"
---

# mcp-rust-sdk rmcp-v1.2.0

### Added

- add missing constructors for non-exhaustive model types ([#739](https://github.com/modelcontextprotocol/rust-sdk/pull/739))
- include granted scopes in OAuth refresh token request ([#731](https://github.com/modelcontextprotocol/rust-sdk/pull/731))

### Fixed

- handle ping requests sent before initialize handshake ([#745](https://github.com/modelcontextprotocol/rust-sdk/pull/745))
- allow deserializing notifications without params field ([#729](https://github.com/modelcontextprotocol/rust-sdk/pull/729))

### Other

- *(deps)* update jsonwebtoken requirement from 9 to 10 ([#737](https://github.com/modelcontextprotocol/rust-sdk/pull/737))
