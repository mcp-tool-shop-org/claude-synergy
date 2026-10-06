---
product: mcp-rust-sdk
version: "rmcp-v1.8.0"
released_at: "2026-06-23"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v1.8.0"
fetched_at: "2026-10-06"
---

# mcp-rust-sdk rmcp-v1.8.0

> [!WARNING]
> ### ⚠️ Breaking Changes
>
> Despite being a minor version bump, this release contains a **source-breaking API change** (it should have been `2.0.0`). If you depend on `rmcp = "1.7"`, Cargo will resolve to `1.8.0` automatically and your build may fail. Pin to `=1.7.x` if you are not ready to migrate.
>
> **`Peer::peer_info()` return type changed** ([#862](https://github.com/modelcontextprotocol/rust-sdk/pull/862)):
>
> ```diff
> - pub fn peer_info(&self) -> Option<&R::PeerInfo>
> + pub fn peer_info(&self) -> Option<Arc<R::PeerInfo>>
> ```
>
> This was needed so peer info can be re-set on a duplicate `initialize` (it now lives behind an `RwLock`), which is why a borrow can no longer be returned.
>
> **Migration:** field access still works through `Arc`'s `Deref`. If you need the old `&InitializeResult` (e.g. you bound the type explicitly), use `.as_deref()`:
>
> ```rust
> // Before (1.7.x): info is &InitializeResult
> let info: Option<&InitializeResult> = client.peer_info();
>
> // After (1.8.0): info is Arc<InitializeResult>
> let info: Option<Arc<InitializeResult>> = client.peer_info();
>
> // To recover the old reference type:
> let info: Option<&InitializeResult> = client.peer_info().as_deref();
> ```

### Added

- standardize resource-not-found error code (SEP-2164) ([#899](https://github.com/modelcontextprotocol/rust-sdk/pull/899))
- validate OAuth authorization response issuer ([#896](https://github.com/modelcontextprotocol/rust-sdk/pull/896))
- specify OIDC application_type during dynamic client registration (SEP-837) ([#883](https://github.com/modelcontextprotocol/rust-sdk/pull/883))
- deprecate roots, sampling, and logging (SEP-2577) ([#884](https://github.com/modelcontextprotocol/rust-sdk/pull/884))

### Fixed

- *(auth)* preserve configured reqwest client ([#917](https://github.com/modelcontextprotocol/rust-sdk/pull/917))
- *(auth)* align OAuth metadata discovery ordering ([#887](https://github.com/modelcontextprotocol/rust-sdk/pull/887))
- align progress timeout token ([#909](https://github.com/modelcontextprotocol/rust-sdk/pull/909))
- *(elicitation)* preserve enumNames through ElicitationSchema serde round-trip ([#905](https://github.com/modelcontextprotocol/rust-sdk/pull/905))
- return tool errors for invalid arguments ([#894](https://github.com/modelcontextprotocol/rust-sdk/pull/894))
- *(auth)* apply offline_access to reauth paths ([#897](https://github.com/modelcontextprotocol/rust-sdk/pull/897))
- update peer info on duplicate initialize ([#862](https://github.com/modelcontextprotocol/rust-sdk/pull/862)) — ⚠️ **breaking**: changes the `Peer::peer_info()` signature, see Breaking Changes above
- strip and validate tool outputSchema and inputSchema ([#860](https://github.com/modelcontextprotocol/rust-sdk/pull/860))
- remove unnecessary fields from tools' inputSchema ([#856](https://github.com/modelcontextprotocol/rust-sdk/pull/856))
- reject init header/body version mismatch ([#853](https://github.com/modelcontextprotocol/rust-sdk/pull/853))
- align protocol version negotiation ([#855](https://github.com/modelcontextprotocol/rust-sdk/pull/855))
- accept 200 with empty body in response to notifications in addition to 202 ([#849](https://github.com/modelcontextprotocol/rust-sdk/pull/849))

### Other

- Allow custom HTTP clients for OAuth ([#908](https://github.com/modelcontextprotocol/rust-sdk/pull/908))
- Add progress-aware request timeout reset ([#858](https://github.com/modelcontextprotocol/rust-sdk/pull/858))
- *(server)* document Err vs Ok(CallToolResult::error) visibility contract on ServerHandler::call_tool ([#854](https://github.com/modelcontextprotocol/rust-sdk/pull/854))
- refine mcpmate listing copy ([#885](https://github.com/modelcontextprotocol/rust-sdk/pull/885))
- added jilebi-mcp to the list of built with rmcp ([#861](https://github.com/modelcontextprotocol/rust-sdk/pull/861))

