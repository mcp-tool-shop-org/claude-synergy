---
product: mcp-rust-sdk
version: "rmcp-v3.11.0"
released_at: "2026-11-17"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v3.11.0"
fetched_at: "2026-11-26"
---

# mcp-rust-sdk rmcp-v3.11.0

### Added

- *(client)* merge cache hints across list pages ([#1429](https://github.com/modelcontextprotocol/rust-sdk/pull/1429))

### Fixed

- *(auth)* avoid refreshing short-lived access tokens on every call ([#1450](https://github.com/modelcontextprotocol/rust-sdk/pull/1450))
- *(service)* expose auth challenge on ServiceError::TransportSend ([#1462](https://github.com/modelcontextprotocol/rust-sdk/pull/1462))
- *(auth)* omit scope on refresh unless caller sets one ([#1433](https://github.com/modelcontextprotocol/rust-sdk/pull/1433))
- *(auth)* allow same-origin IPv6 ULA issuers ([#1393](https://github.com/modelcontextprotocol/rust-sdk/pull/1393))
- *(client)* accept tool results without content ([#1434](https://github.com/modelcontextprotocol/rust-sdk/pull/1434))
- *(client)* keep private scope when merging pages ([#1463](https://github.com/modelcontextprotocol/rust-sdk/pull/1463))
- *(transport)* match unix-socket media types case-insensitively ([#1453](https://github.com/modelcontextprotocol/rust-sdk/pull/1453))
- *(server)* omit non-object tool output for legacy peers ([#1340](https://github.com/modelcontextprotocol/rust-sdk/pull/1340))
- reject unadvertised capability methods by default ([#1446](https://github.com/modelcontextprotocol/rust-sdk/pull/1446))
- *(skills)* harden URI keys and catalog reads ([#1452](https://github.com/modelcontextprotocol/rust-sdk/pull/1452))
- *(server)* send skill text with NUL bytes as a blob ([#1439](https://github.com/modelcontextprotocol/rust-sdk/pull/1439))
- *(model)* validate elicitation enum defaults against min/max items in any setter order ([#1455](https://github.com/modelcontextprotocol/rust-sdk/pull/1455))
- *(transport)* bound buffered Streamable HTTP responses ([#1246](https://github.com/modelcontextprotocol/rust-sdk/pull/1246))
- *(transport)* accept any 2xx reply for notification-only POSTs ([#1424](https://github.com/modelcontextprotocol/rust-sdk/pull/1424))
- *(skills)* validate percent-encoded skill names ([#1431](https://github.com/modelcontextprotocol/rust-sdk/pull/1431))
- *(skills)* prevent symlink swaps during catalog loads ([#1438](https://github.com/modelcontextprotocol/rust-sdk/pull/1438))
- *(transport)* match reqwest response media types exactly ([#1390](https://github.com/modelcontextprotocol/rust-sdk/pull/1390))

### Other

- add polymarket-agent and tokio-prompt-orchestrator to built with rmcp list ([#1459](https://github.com/modelcontextprotocol/rust-sdk/pull/1459))
