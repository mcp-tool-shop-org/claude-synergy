---
product: mcp-rust-sdk
version: "rmcp-v1.3.0"
released_at: "2026-03-26"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v1.3.0"
fetched_at: "2026-05-22"
---

# mcp-rust-sdk rmcp-v1.3.0

### Added

- *(transport)* add Unix domain socket client for streamable HTTP ([#749](https://github.com/modelcontextprotocol/rust-sdk/pull/749))
- *(auth)* implement SEP-2207 OIDC-flavored refresh token guidance ([#676](https://github.com/modelcontextprotocol/rust-sdk/pull/676))
- add configuration for transparent session re-init ([#760](https://github.com/modelcontextprotocol/rust-sdk/pull/760))
- add local feature for !Send tool handler support ([#740](https://github.com/modelcontextprotocol/rust-sdk/pull/740))

### Fixed

- prevent CallToolResult and GetTaskPayloadResult from shadowing CustomResult in untagged enums ([#771](https://github.com/modelcontextprotocol/rust-sdk/pull/771))
- drain in-flight responses on stdin EOF ([#759](https://github.com/modelcontextprotocol/rust-sdk/pull/759))
- remove default type param from StreamableHttpService ([#758](https://github.com/modelcontextprotocol/rust-sdk/pull/758))
- use cfg-gated Send+Sync supertraits to avoid semver break ([#757](https://github.com/modelcontextprotocol/rust-sdk/pull/757))
- *(rmcp)* surface JSON-RPC error bodies on HTTP 4xx responses ([#748](https://github.com/modelcontextprotocol/rust-sdk/pull/748))
- default CallToolResult content to empty vec on missing field ([#752](https://github.com/modelcontextprotocol/rust-sdk/pull/752))
- *(auth)* redact secrets in Debug output for StoredCredentials and StoredAuthorizationState ([#744](https://github.com/modelcontextprotocol/rust-sdk/pull/744))

### Other

- fix all clippy warnings across workspace ([#746](https://github.com/modelcontextprotocol/rust-sdk/pull/746))
