---
product: mcp-rust-sdk
version: "rmcp-v1.4.0"
released_at: "2026-04-10"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v1.4.0"
fetched_at: "2026-05-22"
---

# mcp-rust-sdk rmcp-v1.4.0

### Added

- add Default and constructors to ServerSseMessage ([#794](https://github.com/modelcontextprotocol/rust-sdk/pull/794))
- add meta to elicitation results ([#792](https://github.com/modelcontextprotocol/rust-sdk/pull/792))
- *(macros)* auto-generate get_info and default router ([#785](https://github.com/modelcontextprotocol/rust-sdk/pull/785))
- *(transport)* add which_command for cross-platform executable resolution ([#774](https://github.com/modelcontextprotocol/rust-sdk/pull/774))
- *(auth)* add StoredCredentials::new() constructor ([#778](https://github.com/modelcontextprotocol/rust-sdk/pull/778))

### Fixed

- *(server)* remove initialized notification gate to support Streamable HTTP ([#788](https://github.com/modelcontextprotocol/rust-sdk/pull/788))
- default session keep_alive to 5 minutes ([#780](https://github.com/modelcontextprotocol/rust-sdk/pull/780))
- *(http)* add host check ([#764](https://github.com/modelcontextprotocol/rust-sdk/pull/764))
- exclude local feature from docs.rs build ([#782](https://github.com/modelcontextprotocol/rust-sdk/pull/782))

### Other

- update Rust toolchain to 1.92 ([#797](https://github.com/modelcontextprotocol/rust-sdk/pull/797))
- unify IntoCallToolResult Result impls ([#787](https://github.com/modelcontextprotocol/rust-sdk/pull/787))
