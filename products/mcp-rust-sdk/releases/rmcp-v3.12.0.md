---
product: mcp-rust-sdk
version: "rmcp-v3.12.0"
released_at: "2026-11-26"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v3.12.0"
fetched_at: "2026-11-28"
---

# mcp-rust-sdk rmcp-v3.12.0

### Added

- *(deps)* make chrono optional behind a default feature ([#1474](https://github.com/modelcontextprotocol/rust-sdk/pull/1474))

### Fixed

- *(client)* cap list_all_* pagination like the MRTR round cap ([#1457](https://github.com/modelcontextprotocol/rust-sdk/pull/1457))
- *(model)* keep typed results for numeric cache TTLs ([#1493](https://github.com/modelcontextprotocol/rust-sdk/pull/1493))
- *(transport)* retain completed request-wise SSE cache for resume ([#1487](https://github.com/modelcontextprotocol/rust-sdk/pull/1487))
- *(client)* treat a 404 on an SSE resume GET as session expired ([#1477](https://github.com/modelcontextprotocol/rust-sdk/pull/1477))
- *(macros)* keep doc comment descriptions when other attributes follow ([#1485](https://github.com/modelcontextprotocol/rust-sdk/pull/1485))
- *(model)* keep unknown capability fields on ServerCapabilities and ClientCapabilities ([#1468](https://github.com/modelcontextprotocol/rust-sdk/pull/1468))
- *(auth)* accept same-origin issuers at any address ([#1467](https://github.com/modelcontextprotocol/rust-sdk/pull/1467))
- *(transport)* answer malformed Streamable HTTP bodies with 400 ([#1464](https://github.com/modelcontextprotocol/rust-sdk/pull/1464))
- *(server)* omit cache hints for legacy peers ([#1470](https://github.com/modelcontextprotocol/rust-sdk/pull/1470))
- *(client)* ignore late discovery replies after legacy fallback ([#1436](https://github.com/modelcontextprotocol/rust-sdk/pull/1436))
