---
product: mcp-rust-sdk
version: "rmcp-v3.9.0"
released_at: "2026-11-05"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v3.9.0"
fetched_at: "2026-11-26"
---

# mcp-rust-sdk rmcp-v3.9.0

### Added

- *(auth)* structure protected resource discovery errors ([#1305](https://github.com/modelcontextprotocol/rust-sdk/pull/1305))
- *(transport)* log followed same-origin redirects at debug level ([#1417](https://github.com/modelcontextprotocol/rust-sdk/pull/1417))
- support the Skills extension (SEP-2640) ([#1392](https://github.com/modelcontextprotocol/rust-sdk/pull/1392))

### Fixed

- *(model)* don't treat _meta alone as a CallToolResult ([#1405](https://github.com/modelcontextprotocol/rust-sdk/pull/1405))
- *(client)* keep ProgressDispatcher lock off the await path ([#1310](https://github.com/modelcontextprotocol/rust-sdk/pull/1310))
- *(auth)* refresh with only granted scopes ([#1331](https://github.com/modelcontextprotocol/rust-sdk/pull/1331))
- streamable-http server: stateful session workers ignore config.canc ([#1427](https://github.com/modelcontextprotocol/rust-sdk/pull/1427))
- *(skills)* enforce manifest boundaries and capability negotiation ([#1412](https://github.com/modelcontextprotocol/rust-sdk/pull/1412))
- *(transport)* send SIGTERM before killing a child process on graceful shutdown ([#1379](https://github.com/modelcontextprotocol/rust-sdk/pull/1379))
- *(handler)* generate a tool's outputSchema for the serialize contract ([#1378](https://github.com/modelcontextprotocol/rust-sdk/pull/1378))
- *(server)* reject server-to-client requests on discover sessions ([#1397](https://github.com/modelcontextprotocol/rust-sdk/pull/1397))
- *(auth)* accept ID-JAGs without a resource claim ([#1406](https://github.com/modelcontextprotocol/rust-sdk/pull/1406))
- *(rmcp)* reject Mcp-Param headers with invalid characters ([#1414](https://github.com/modelcontextprotocol/rust-sdk/pull/1414))
- *(transport)* match explicit HTTP media types and Accept quality values ([#1382](https://github.com/modelcontextprotocol/rust-sdk/pull/1382))
- *(model)* accept URL elicitation requests without elicitationId ([#1383](https://github.com/modelcontextprotocol/rust-sdk/pull/1383))
- *(transport)* preserve protocol error replies across cancellation ([#1370](https://github.com/modelcontextprotocol/rust-sdk/pull/1370))

### Other

- *(transport)* fix spell-check failures in response-limit tests ([#1432](https://github.com/modelcontextprotocol/rust-sdk/pull/1432))
- Merge commit from fork
- *(deps)* update rstest requirement from 0.27.0 to 0.28.0 ([#1422](https://github.com/modelcontextprotocol/rust-sdk/pull/1422))
- *(client)* point on_*_list_changed callbacks to Peer::listen ([#1402](https://github.com/modelcontextprotocol/rust-sdk/pull/1402))
- add Voltip to built with rmcp list ([#1401](https://github.com/modelcontextprotocol/rust-sdk/pull/1401))
