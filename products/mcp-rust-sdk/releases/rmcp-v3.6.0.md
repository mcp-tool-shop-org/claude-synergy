---
product: mcp-rust-sdk
version: "rmcp-v3.6.0"
released_at: "2026-10-20"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v3.6.0"
fetched_at: "2026-10-31"
---

# mcp-rust-sdk rmcp-v3.6.0

### Added

- *(client)* cancel an abandoned tools/call, prompts/get or resources/read ([#1344](https://github.com/modelcontextprotocol/rust-sdk/pull/1344))
- *(auth)* add initial authorization scope selection ([#1352](https://github.com/modelcontextprotocol/rust-sdk/pull/1352))
- *(transport)* add non-blocking stdio_pipes transport ([#1304](https://github.com/modelcontextprotocol/rust-sdk/pull/1304))

### Fixed

- *(server)* reject requests to 2026-07-28 clients ([#1326](https://github.com/modelcontextprotocol/rust-sdk/pull/1326))
- *(streamable-http-server)* look up tool schemas per request ([#1349](https://github.com/modelcontextprotocol/rust-sdk/pull/1349))
- *(transport)* follow same-origin 307/308 redirects in the default Streamable HTTP client ([#1367](https://github.com/modelcontextprotocol/rust-sdk/pull/1367))
- *(streamable-http-server)* answer a session-less non-initialize POST with 400 ([#1377](https://github.com/modelcontextprotocol/rust-sdk/pull/1377))
- *(model)* read a request id written in float form as that integer ([#1346](https://github.com/modelcontextprotocol/rust-sdk/pull/1346))
- *(client)* answer a server ping during the initialize handshake ([#1366](https://github.com/modelcontextprotocol/rust-sdk/pull/1366))
- *(transport)* accept nested x-mcp-header annotations ([#1359](https://github.com/modelcontextprotocol/rust-sdk/pull/1359))
- *(streamable-http-client)* handle error responses to initialize ([#1361](https://github.com/modelcontextprotocol/rust-sdk/pull/1361))
- *(transport)* bound the incoming line buffer in AsyncRwTransport ([#1049](https://github.com/modelcontextprotocol/rust-sdk/pull/1049))
- *(model)* reject malformed JSON-RPC messages with conflicting result and error fields ([#1283](https://github.com/modelcontextprotocol/rust-sdk/pull/1283)) ([#1287](https://github.com/modelcontextprotocol/rust-sdk/pull/1287))
- ship LICENSE in rmcp and rmcp-macros crates ([#1342](https://github.com/modelcontextprotocol/rust-sdk/pull/1342))
- *(streamable-http-server)* release the session map lock before waiting on a session ([#1323](https://github.com/modelcontextprotocol/rust-sdk/pull/1323))
- *(rmcp)* gate client- and server-only helpers behind their features ([#1329](https://github.com/modelcontextprotocol/rust-sdk/pull/1329))
- cancel pending request tokens after transport EOF ([#1333](https://github.com/modelcontextprotocol/rust-sdk/pull/1333))
- *(rmcp)* import base64-only prompt content types under the feature ([#1314](https://github.com/modelcontextprotocol/rust-sdk/pull/1314))

### Other

- combine AI issue triage with a maintainer rotation as the responsible reviewer ([#1260](https://github.com/modelcontextprotocol/rust-sdk/pull/1260))
