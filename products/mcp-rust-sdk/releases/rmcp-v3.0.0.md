---
product: mcp-rust-sdk
version: "rmcp-v3.0.0"
released_at: "2026-07-28"
source_url: "https://github.com/modelcontextprotocol/rust-sdk/releases/tag/rmcp-v3.0.0"
fetched_at: "2026-10-06"
---

# mcp-rust-sdk rmcp-v3.0.0

RMCP 3.0 adds support for MCP 2026-07-28. Review the [protocol key changes](https://modelcontextprotocol.io/specification/2026-07-28/changelog) and the [RMCP 3.0 migration guide](https://github.com/modelcontextprotocol/rust-sdk/discussions/969) before upgrading from 2.x.

## Breaking changes

- **Sessionless Streamable HTTP:** MCP 2026-07-28 removes protocol-level sessions: no `Mcp-Session-Id`, standalone GET stream, DELETE-based session termination, or `Last-Event-ID` resumption. RMCP creates a fresh handler per request, so persistent state must live outside the handler. `stateful_mode` is renamed to `legacy_session_mode` and now only controls older protocol versions; custom SSE clients must also accept an optional session ID.
- **Stateless lifecycle and discovery:** the 2026-07-28 protocol removes `initialize`/`notifications/initialized`; each request carries the protocol version and client capabilities in `_meta`, and servers expose `server/discover`. RMCP clients opt into this lifecycle with `serve_with_lifecycle` and `ClientLifecycleMode::Discover` or `Auto`; the existing `serve()` path remains available for legacy initialization.
- **Subscriptions and removed methods:** `subscriptions/listen` replaces the standalone GET stream and `resources/subscribe`/`resources/unsubscribe`. `ping`, `logging/setLevel`, and `notifications/roots/list_changed` are unavailable under 2026-07-28; RMCP retains their APIs for legacy protocol sessions.
- **Multi Round-Trip Requests and result types:** `ServerHandler::call_tool`, `get_prompt`, and `read_resource` now return MRTR-aware response enums. Manual handler implementations and exhaustive `ServerResult` matches must handle `InputRequiredResult`, and result models carry an optional `result_type` for legacy wire compatibility.
- **Tasks:** the experimental core tasks API is replaced by the `io.modelcontextprotocol/tasks` extension, including new task handlers, methods, and `TaskManager` APIs.
- **Rust model types:** metadata is split into `MetaObject`, `RequestMetaObject`, and `NotificationMetaObject`; `Annotations::last_modified` is now `Option<String>`; and tool structured content accepts any `serde_json::Value`.
- **OAuth:** authorization startup is consolidated around `AuthorizationRequest`; metadata discovery is renamed to `resolve_metadata` and returns provenance; and custom OAuth HTTP errors are now boxed source errors.
- **Compatibility:** APIs deprecated before 3.0 have been removed, and the minimum supported Rust version is now 1.88.

## What's Changed
* feat!: add MRTR model types (SEP-2322) by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/915
* feat!: relax tool result structuredContent type (SEP-2106) by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/933
* feat: relax outputSchema to accept non-object JSON Schema types (SEP-2106) by @branben in https://github.com/modelcontextprotocol/rust-sdk/pull/895
* fix: flag schema derive on schemars feature by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/966
* feat!: add SEP-2243 HTTP standard headers by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/907
* feat!: type Annotations.lastModified as a string by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/956
* feat!: add MRTR behavior support (SEP-2322) by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/929
* fix: specify compatible sse-stream version by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/968
* implementing SEP-2549 TTL for List Results by @michaelneale in https://github.com/modelcontextprotocol/rust-sdk/pull/889
* test: enable supported draft SEP coverage by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/971
* docs: retarget roadmap to 2026-07-28 spec by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/986
* chore(deps): update tokio-tungstenite requirement from 0.29.0 to 0.30.0 by @dependabot[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/989
* chore: update client conformance test scenarios by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/991
* test: stabilize JavaScript dependency install by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/972
* fix(streamable-http): preserve progress in JSON mode by @jstar0 in https://github.com/modelcontextprotocol/rust-sdk/pull/990
* fix: bound streamable HTTP memory usage by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/970
* chore(deps): bump actions/setup-node from 6 to 7 by @dependabot[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/992
* feat!: align metadata models with draft schema by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/993
* feat(conformance): add SEP-2243 header validation tool by @jstar0 in https://github.com/modelcontextprotocol/rust-sdk/pull/997
* feat!: add server discovery and negotiation (SEP-2575) by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/973
* feat: accumulate client-side scopes during step-up authorization (SEP-2350) by @stefanoamorelli in https://github.com/modelcontextprotocol/rust-sdk/pull/888
* chore(deps): update hmac requirement from 0.12 to 0.13 by @dependabot[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/988
* fix(auth): validate discovered metadata issuer by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/996
* feat: add modern client lifecycle modes (SEP-2575) by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/995
* fix(auth): distinguish rejected refresh tokens from transient failures by @stevenlee-oai in https://github.com/modelcontextprotocol/rust-sdk/pull/963
* fix(transport): cancel in-flight request on streamable-HTTP client disconnect (#857) by @ameyypawar in https://github.com/modelcontextprotocol/rust-sdk/pull/967
* fix(auth): add an SDK path for pre-registered OAuth clients by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/994
* feat(auth): bind DCR client credentials to issuing authorization server (SEP-2352) by @alexhancock in https://github.com/modelcontextprotocol/rust-sdk/pull/998
* fix: enumerate conformance client scenarios by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1008
* fix: pass SEP-2243 client conformance by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1012
* fix(server): serve draft-version requests statelessly per SEP-2567 by @alexhancock in https://github.com/modelcontextprotocol/rust-sdk/pull/999
* fix: preserve negotiated progress responses by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1005
* fix: .with_stateful_mode -> .with_legacy_session_mode by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1015
* chore: run full conformance CI suite by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1010
* ci: fix discovery response parsing by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1016
* feat: add subscription listen streams (SEP-2575) by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1000
* ci: add workflow to clean up stale PRs and issues by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1007
* fix: preserve JSON Schema 2020-12 keywords by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1018
* ci: expose extension conformance gaps by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1019
* fix: re-register after auth server change by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1011
* chore(deps): bump actions/labeler from 6 to 7 by @dependabot[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/1023
* fix: accept stringified numeric response IDs by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1021
* fix: conformance tests for tools_call and auth/scope-step-up by @alexhancock in https://github.com/modelcontextprotocol/rust-sdk/pull/1022
* feat: Implement SEP-2663 Tasks Extension by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1020
* feat: add client-side TTL-honoring response cache (SEP-2549) by @alexhancock in https://github.com/modelcontextprotocol/rust-sdk/pull/1025
* fix: reap completed response send tasks by @N0zoM1z0 in https://github.com/modelcontextprotocol/rust-sdk/pull/1026
* feat: add distributed Streamable HTTP event store by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1024
* feat: route SEP-2260 associated server requests to the originating SSE stream by @gocamille in https://github.com/modelcontextprotocol/rust-sdk/pull/1029
* docs: update for 2026-07-28 version by @alexhancock in https://github.com/modelcontextprotocol/rust-sdk/pull/1032
* chore: refactor OAuth client authorization api by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1009
* fix: use issuer for JWT client audience by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1031
* chore: release v3.0.0-beta.1 by @github-actions[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/964
* chore: declare and check MSRV by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1034
* fix!: omit resultType for legacy protocol sessions by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1038
* feat: expose oauth discovery metadata source by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1041
* chore: release v3.0.0-beta.2 by @github-actions[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/1035
* fix: default to allowing missing `issuer` by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1051
* refactor: make oauth discovery reactive by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1052
* fix: reject missing `issuer` in authorization server metadata by default by @jamadeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1054
* chore: release v3.0.0-beta.3 by @github-actions[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/1053
* fix: accept namespaced discovery server information by @tsarlandie-oai in https://github.com/modelcontextprotocol/rust-sdk/pull/1044
* ci: simplify conformance while running against both spec versions by @alexhancock in https://github.com/modelcontextprotocol/rust-sdk/pull/1060
* chore(deps): update jsonwebtoken requirement from 10 to 11 by @dependabot[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/1058
* chore(deps): update base64 requirement from 0.22 to 0.23 by @dependabot[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/1059
* chore: release v3.0.0-beta.4 by @github-actions[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/1061
* fix: gate client handler bounds for local by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1068
* fix!: preserve OAuth discovery transport errors by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1069
* refactor!: remove deprecated v3 APIs by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1066
* chore(deps): bump actions/stale from 10 to 11 by @dependabot[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/1074
* fix: preserve transient OAuth discovery HTTP errors by @tsarlandie-oai in https://github.com/modelcontextprotocol/rust-sdk/pull/1071
* RFC 9728 resource is used instead of base url when possible by @fkonecny in https://github.com/modelcontextprotocol/rust-sdk/pull/962
* docs: prepare for stable 3.0 release by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1073
* fix: remove server_info from DiscoverResult by @howardjohn in https://github.com/modelcontextprotocol/rust-sdk/pull/1065
* chore: release v3.0.0-beta.5 by @github-actions[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/1070
* fix: recognize 2026-07-28 MCP methods by @DaleSeo in https://github.com/modelcontextprotocol/rust-sdk/pull/1076
* chore: release v3.0.0 by @github-actions[bot] in https://github.com/modelcontextprotocol/rust-sdk/pull/1077

## New Contributors
* @branben made their first contribution in https://github.com/modelcontextprotocol/rust-sdk/pull/895
* @stevenlee-oai made their first contribution in https://github.com/modelcontextprotocol/rust-sdk/pull/963
* @N0zoM1z0 made their first contribution in https://github.com/modelcontextprotocol/rust-sdk/pull/1026
* @gocamille made their first contribution in https://github.com/modelcontextprotocol/rust-sdk/pull/1029
* @tsarlandie-oai made their first contribution in https://github.com/modelcontextprotocol/rust-sdk/pull/1044
* @fkonecny made their first contribution in https://github.com/modelcontextprotocol/rust-sdk/pull/962

**Full Changelog**: https://github.com/modelcontextprotocol/rust-sdk/compare/rmcp-v2.2.0...rmcp-v3.0.0








