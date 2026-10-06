---
product: mcp-rust-sdk
version: "rmcp-v2.0.0"
released_at: "2026-06-29"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v2.0.0"
fetched_at: "2026-10-06"
---

# mcp-rust-sdk rmcp-v2.0.0

Migration guide: https://github.com/modelcontextprotocol/rust-sdk/discussions/926

### Added

- [**breaking**] *(rmcp)* add Audio variant to PromptMessageContent ([#865](https://github.com/modelcontextprotocol/rust-sdk/pull/865))
- [**breaking**] align model types with MCP 2025-11-25 spec ([#927](https://github.com/modelcontextprotocol/rust-sdk/pull/927))
- deprecate roots/sampling/logging types ([#923](https://github.com/modelcontextprotocol/rust-sdk/pull/923))

### Fixed

- prevent OAuth resource spoofing ([#937](https://github.com/modelcontextprotocol/rust-sdk/pull/937))
- block oauth metadata ssrf ([#935](https://github.com/modelcontextprotocol/rust-sdk/pull/935))
- prevent streamable HTTP session leak ([#934](https://github.com/modelcontextprotocol/rust-sdk/pull/934))
- fill missing fully qualified syntax in prompt_handler macros ([#866](https://github.com/modelcontextprotocol/rust-sdk/pull/866))

### Other

- consolidate repeated rmcp tests ([#931](https://github.com/modelcontextprotocol/rust-sdk/pull/931))
- align README examples with v2 model API ([#928](https://github.com/modelcontextprotocol/rust-sdk/pull/928))
