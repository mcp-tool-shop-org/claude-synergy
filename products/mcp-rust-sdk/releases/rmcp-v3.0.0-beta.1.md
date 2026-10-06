---
product: mcp-rust-sdk
version: "rmcp-v3.0.0-beta.1"
released_at: "2026-07-23"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v3.0.0-beta.1"
fetched_at: "2026-10-06"
---

# mcp-rust-sdk rmcp-v3.0.0-beta.1

### Added

- route SEP-2260 associated server requests to the originating SSE stream ([#1029](https://github.com/modelcontextprotocol/rust-sdk/pull/1029))
- [**breaking**] add distributed SSE event store ([#1024](https://github.com/modelcontextprotocol/rust-sdk/pull/1024))
- add client-side TTL-honoring response cache (SEP-2549) ([#1025](https://github.com/modelcontextprotocol/rust-sdk/pull/1025))
- [**breaking**] Implement SEP-2663 Tasks Extension ([#1020](https://github.com/modelcontextprotocol/rust-sdk/pull/1020))
- add subscription listen streams (SEP-2575) ([#1000](https://github.com/modelcontextprotocol/rust-sdk/pull/1000))
- *(auth)* bind DCR client credentials to issuing authorization server (SEP-2352) ([#998](https://github.com/modelcontextprotocol/rust-sdk/pull/998))
- add modern client lifecycle modes (SEP-2575) ([#995](https://github.com/modelcontextprotocol/rust-sdk/pull/995))
- *(auth)* accumulate client-side scopes during step-up authorization ([#888](https://github.com/modelcontextprotocol/rust-sdk/pull/888))
- [**breaking**] add server discovery and negotiation (SEP-2575) ([#973](https://github.com/modelcontextprotocol/rust-sdk/pull/973))
- *(conformance)* add SEP-2243 header validation tool ([#997](https://github.com/modelcontextprotocol/rust-sdk/pull/997))
- [**breaking**] align metadata models with draft schema ([#993](https://github.com/modelcontextprotocol/rust-sdk/pull/993))
- [**breaking**] implement SEP-2549 cache hints ([#889](https://github.com/modelcontextprotocol/rust-sdk/pull/889))
- [**breaking**] add MRTR behavior support (SEP-2322) ([#929](https://github.com/modelcontextprotocol/rust-sdk/pull/929))
- [**breaking**] type Annotations.lastModified as a string ([#956](https://github.com/modelcontextprotocol/rust-sdk/pull/956))
- [**breaking**] add SEP-2243 HTTP standard headers ([#907](https://github.com/modelcontextprotocol/rust-sdk/pull/907))
- relax outputSchema to accept non-object JSON Schema types (SEP-2106) ([#895](https://github.com/modelcontextprotocol/rust-sdk/pull/895))
- [**breaking**] relax tool result structuredContent type (SEP-2106) ([#933](https://github.com/modelcontextprotocol/rust-sdk/pull/933))
- [**breaking**] add MRTR model types (SEP-2322) ([#915](https://github.com/modelcontextprotocol/rust-sdk/pull/915))

### Fixed

- reap completed response send tasks ([#1026](https://github.com/modelcontextprotocol/rust-sdk/pull/1026))
- accept stringified numeric response IDs ([#1021](https://github.com/modelcontextprotocol/rust-sdk/pull/1021))
- re-register after auth server change ([#1011](https://github.com/modelcontextprotocol/rust-sdk/pull/1011))
- .with_stateful_mode -> .with_legacy_session_mode ([#1015](https://github.com/modelcontextprotocol/rust-sdk/pull/1015))
- preserve negotiated progress responses ([#1005](https://github.com/modelcontextprotocol/rust-sdk/pull/1005))
- *(server)* serve draft-version requests statelessly per SEP-2567 ([#999](https://github.com/modelcontextprotocol/rust-sdk/pull/999))
- pass client header conformance ([#1012](https://github.com/modelcontextprotocol/rust-sdk/pull/1012))
- *(auth)* add an SDK path for pre-registered OAuth clients ([#994](https://github.com/modelcontextprotocol/rust-sdk/pull/994))
- *(transport)* cancel in-flight request on stateless streamable-HTTP client disconnect ([#857](https://github.com/modelcontextprotocol/rust-sdk/pull/857)) ([#967](https://github.com/modelcontextprotocol/rust-sdk/pull/967))
- *(auth)* distinguish rejected refresh tokens from transient failures ([#963](https://github.com/modelcontextprotocol/rust-sdk/pull/963))
- *(auth)* validate discovered metadata issuer ([#996](https://github.com/modelcontextprotocol/rust-sdk/pull/996))
- bound streamable HTTP memory usage ([#970](https://github.com/modelcontextprotocol/rust-sdk/pull/970))
- *(streamable-http)* preserve progress in JSON mode ([#990](https://github.com/modelcontextprotocol/rust-sdk/pull/990))
- specify compatible sse-stream version ([#968](https://github.com/modelcontextprotocol/rust-sdk/pull/968))
- flag schema derive on schemars feature ([#966](https://github.com/modelcontextprotocol/rust-sdk/pull/966))

### Other

- refactor OAuth client authorization api ([#1009](https://github.com/modelcontextprotocol/rust-sdk/pull/1009))
- update for 2026-07-28 version ([#1032](https://github.com/modelcontextprotocol/rust-sdk/pull/1032))
- *(deps)* update hmac requirement from 0.12 to 0.13 ([#988](https://github.com/modelcontextprotocol/rust-sdk/pull/988))
- serialize JavaScript dependency install ([#972](https://github.com/modelcontextprotocol/rust-sdk/pull/972))

### Changed

- **BREAKING**: rename `StreamableHttpServerConfig::stateful_mode` to `legacy_session_mode` (and the builder `with_stateful_mode` to `with_legacy_session_mode`) to clarify that the option only affects legacy protocol versions (`< 2026-07-28`); per SEP-2567 the `2026-07-28` draft version is always served statelessly ([#999](https://github.com/modelcontextprotocol/rust-sdk/pull/999))

### Fixed

- use the authorization server issuer as the default `private_key_jwt` audience
