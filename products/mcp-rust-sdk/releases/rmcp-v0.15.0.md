---
product: mcp-rust-sdk
version: "rmcp-v0.15.0"
released_at: "2026-02-10"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v0.15.0"
fetched_at: "2026-05-22"
---

# mcp-rust-sdk rmcp-v0.15.0

### Added

- *(elicitation)* add support URL elicitation. SEP-1036 ([#605](https://github.com/modelcontextprotocol/rust-sdk/pull/605))
- enforce SEP-1577 MUST requirements for sampling with tools ([#646](https://github.com/modelcontextprotocol/rust-sdk/pull/646))
- add native-tls as an optional TLS backend ([#631](https://github.com/modelcontextprotocol/rust-sdk/pull/631))
- *(capabilities)* add extensions field for SEP-1724 ([#643](https://github.com/modelcontextprotocol/rust-sdk/pull/643))

### Fixed

- *(tasks)* avoid dropping completed task results during collection ([#639](https://github.com/modelcontextprotocol/rust-sdk/pull/639))
- *(auth)* oauth metadata discovery ([#641](https://github.com/modelcontextprotocol/rust-sdk/pull/641))
- compilation with --no-default-features ([#593](https://github.com/modelcontextprotocol/rust-sdk/pull/593))
- *(tasks)* expose `execution.taskSupport` on tools ([#635](https://github.com/modelcontextprotocol/rust-sdk/pull/635))
- *(tasks)* correct enum variant ordering for deserialization ([#634](https://github.com/modelcontextprotocol/rust-sdk/pull/634))

### Other

- Add optional description field to Implementation struct ([#649](https://github.com/modelcontextprotocol/rust-sdk/pull/649))
- Implement SEP-1577: Sampling With Tools ([#628](https://github.com/modelcontextprotocol/rust-sdk/pull/628))
