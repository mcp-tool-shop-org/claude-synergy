---
product: mcp-rust-sdk
version: "rmcp-v2.1.0"
released_at: "2026-07-02"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v2.1.0"
fetched_at: "2026-10-06"
---

# mcp-rust-sdk rmcp-v2.1.0

### Added

- add SEP-414 trace context meta accessors ([#910](https://github.com/modelcontextprotocol/rust-sdk/pull/910))
- add SEP-2575 meta helpers ([#942](https://github.com/modelcontextprotocol/rust-sdk/pull/942))

### Fixed

- *(transport)* make AsyncRwTransport::receive cancel-safe ([#941](https://github.com/modelcontextprotocol/rust-sdk/pull/941)) ([#947](https://github.com/modelcontextprotocol/rust-sdk/pull/947))
- *(auth)* preserve refresh_token when refresh response omits it ([#949](https://github.com/modelcontextprotocol/rust-sdk/pull/949))
- block redirect header leaks ([#936](https://github.com/modelcontextprotocol/rust-sdk/pull/936))
- don't respond to unparsable messages ([#940](https://github.com/modelcontextprotocol/rust-sdk/pull/940))
- negotiate protocol version in handler ([#930](https://github.com/modelcontextprotocol/rust-sdk/pull/930))
