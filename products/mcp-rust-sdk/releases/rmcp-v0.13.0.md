---
product: mcp-rust-sdk
version: "rmcp-v0.13.0"
released_at: "2026-01-15"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v0.13.0"
fetched_at: "2026-05-22"
---

# mcp-rust-sdk rmcp-v0.13.0

### Added

- provide blanket implementations for ClientHandler and ServerHandler traits ([#609](https://github.com/modelcontextprotocol/rust-sdk/pull/609))
- *(service)* add close() method for graceful connection shutdown ([#588](https://github.com/modelcontextprotocol/rust-sdk/pull/588))
- *(auth)* add StateStore trait for pluggable OAuth state storage ([#614](https://github.com/modelcontextprotocol/rust-sdk/pull/614))
- *(elicitation)* implement SEP-1330 Elicitation Enum Schema Improvements ([#539](https://github.com/modelcontextprotocol/rust-sdk/pull/539))
- *(task)* add task support (SEP-1686) ([#536](https://github.com/modelcontextprotocol/rust-sdk/pull/536))

### Fixed

- use the json rpc error from the initialize response and bubble it up to the client ([#569](https://github.com/modelcontextprotocol/rust-sdk/pull/569))
- *(build)* fix build of the project when no features are selected ([#606](https://github.com/modelcontextprotocol/rust-sdk/pull/606))
- use Semaphore instead of Notify in OneshotTransport to prevent race condition ([#611](https://github.com/modelcontextprotocol/rust-sdk/pull/611))
- add OpenID Connect discovery support per spec-2025-11-25 4.3 ([#598](https://github.com/modelcontextprotocol/rust-sdk/pull/598))
- only try to refresh access tokens if we have a refresh token or an expiry time ([#594](https://github.com/modelcontextprotocol/rust-sdk/pull/594))
- *(docs)* add spreadsheet-mcp to Built with rmcp ([#582](https://github.com/modelcontextprotocol/rust-sdk/pull/582))

### Other

- *(elicitation)* improve enum schema builder, small changes of elicitation builder ([#608](https://github.com/modelcontextprotocol/rust-sdk/pull/608))
- add pre-commit hook for conventional commit verification ([#619](https://github.com/modelcontextprotocol/rust-sdk/pull/619))
- clean up optional dependencies ([#546](https://github.com/modelcontextprotocol/rust-sdk/pull/546))
- re-export ServerSseMessage from session module ([#612](https://github.com/modelcontextprotocol/rust-sdk/pull/612))
- Implement SEP-1699: Support SSE Polling via Server-Side Disconnect ([#604](https://github.com/modelcontextprotocol/rust-sdk/pull/604))
- update README external links ([#603](https://github.com/modelcontextprotocol/rust-sdk/pull/603))
- clarity and formatting ([#602](https://github.com/modelcontextprotocol/rust-sdk/pull/602))
- Add optional icons field to RawResourceTemplate ([#589](https://github.com/modelcontextprotocol/rust-sdk/pull/589))
