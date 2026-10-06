---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/client@2.0.0"
released_at: "2026-07-27"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/client%402.0.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/client@2.0.0

### Minor Changes

- [#2501](https://github.com/modelcontextprotocol/typescript-sdk/pull/2501) [`1480241`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1480241e2a2a7f0ceee8e7723b2adcf88579bb36) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Export the `Protocol` base class and `mergeCapabilities` from the `@modelcontextprotocol/client` and `@modelcontextprotocol/server` package roots, restoring the v1 import for consumers that subclass `Protocol` (e.g. the MCP Apps SDK). The client and server packages each bundle their own compiled copy of the class, so import it from one package consistently within a process.

    The codemod now rewrites `Protocol` and `mergeCapabilities` imports from `shared/protocol.js` to the client or server package root, like the module's other symbols, instead of dropping them with an action-required marker.

- [#2511](https://github.com/modelcontextprotocol/typescript-sdk/pull/2511) [`f60dff0`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f60dff0674954ab516739f21ad9905349c8e9249) Thanks [@felixweinberger](https://github.com/felixweinberger)! - `ConnectOptions.prior` accepts a cached era verdict — the new exported type `PriorDiscovery`. `{ kind: 'modern', discover }` adopts a previously obtained `DiscoverResult` with zero round trips; `{ kind: 'legacy' }` skips the `server/discover` probe and runs the plain `initialize` handshake directly, for servers known out-of-band to be legacy — without pinning the client to `mode: 'legacy'`: stop supplying the verdict and `connect()` falls back to the configured `versionNegotiation` mode (under `'auto'`, it re-probes and rediscovers an upgraded server). Freshness is the supplying host's responsibility — a stale legacy verdict succeeds silently against an upgraded server, so hosts must date cached legacy verdicts in their own storage and stop supplying them past their policy horizon. Persisted-blob plumbing is hardened: `prior: null` is treated as absent, the modern arm's `discover` payload is schema-validated before any connection state changes, and an unrecognized shape rejects with a typed `SdkError(EraNegotiationFailed)` instead of a `TypeError`.

- [#2468](https://github.com/modelcontextprotocol/typescript-sdk/pull/2468) [`5db6e38`](https://github.com/modelcontextprotocol/typescript-sdk/commit/5db6e38f2bdeb5052f608121e9a2679ff8742af2) Thanks [@felixweinberger](https://github.com/felixweinberger)! - The response cache now stores results as JSON-serialized documents (serialize on write, parse on read) instead of live object graphs isolated with `structuredClone`. Same mutation isolation, but no dependency on the `structuredClone` global — whose absence (jest+jsdom, Node < 17) previously made every cache write throw into the store-error swallow, silently disabling caching and output-schema lookups for the session. A value without a JSON representation now fails the write loudly to the error sink, and an undecodable document in an external store is reported, dropped, and read as a miss.

    Migration for custom `ResponseCacheStore` implementations: `CacheEntry.value` (and the `set()` entry value) is now `string` — persist and return it verbatim, `JSON.parse` to inspect. Entries persisted by a previous SDK version fail decode once (reported, dropped) and are rewritten on the next fetch.

- [#2477](https://github.com/modelcontextprotocol/typescript-sdk/pull/2477) [`8e1d2e9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/8e1d2e92b1720d2520122b3a5f20ea084edaf3c4) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Move the schema source modules (spec schemas, OAuth schemas, protocol constants) into `@modelcontextprotocol/core` and resolve them from there as a regular runtime dependency instead of bundling a private copy into each package. An application importing more than one of the packages now evaluates a single shared schema graph with shared object identity. `@modelcontextprotocol/core` gains a `./internal` subpath (SDK-internal contract; may change in any release) and the four packages now version together.

- [#2513](https://github.com/modelcontextprotocol/typescript-sdk/pull/2513) [`f413763`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f4137630c05dc9a4fb14d4d3777f5cb167bd6313) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Align the 2026-07-28 wire with the final revision (spec PR #3002): `serverInfo` moves from the `DiscoverResult` body to the result `_meta`, and the per-request envelope's `clientInfo` demotes from required to SHOULD.

    Before this change the SDK shipped the pre-#3002 shape in both directions: the client hard-rejected a conforming server's `DiscoverResult` (missing body `serverInfo` failed parse, so the probe misclassified the server as legacy and attempted an `initialize` handshake against it — a hard connect failure against a modern-only server such as go-sdk v1.7.0-pre.3), and the server rejected conforming clients that omit `clientInfo`.

    Now:
    - The 2026 wire schemas are the final revision exactly: no body `serverInfo` on `DiscoverResult`, envelope `clientInfo` optional (a present-but-malformed value still fails validation).
    - Servers stamp `_meta['io.modelcontextprotocol/serverInfo']` on every 2026-era response (spec SHOULD; a handler-authored value wins, the 2025-era wire is untouched). This includes the entry-built `subscriptions/listen` graceful-close results — the spec's `SubscriptionsListenResultMeta` extends `ResultMetaObject`.
    - Clients keep sending `clientInfo` and read server identity from the discover result's `_meta` only. A server that stamps no identity is anonymous: `getServerVersion()` is `undefined` and the response cache partitions under a per-connection surrogate. A malformed `_meta` serverInfo value is treated as absent on receive (the spec marks the field self-reported, unverified, and display-only).
    - Breaking type changes: `DiscoverResult` no longer declares `serverInfo`; `RequestMetaEnvelope`'s `clientInfo` is optional. New public constant `SERVER_INFO_META_KEY` (`'io.modelcontextprotocol/serverInfo'`).

- [#2483](https://github.com/modelcontextprotocol/typescript-sdk/pull/2483) [`3f07a32`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3f07a325c6741b2374ce2255846dfa0c25f74d03) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Add `preloadSchemas()`, an explicit opt-in to eager wire-schema construction, and call it automatically in the Cloudflare Workers builds. The wire schemas are built lazily by default, which is the right trade on process-per-invocation runtimes — but on isolate platforms that bill request CPU while module evaluation runs during isolate warm-up, laziness moves construction into the first request each fresh isolate serves. Calling `preloadSchemas()` at module scope (it is synchronous and idempotent) moves that one-time cost back to module evaluation; the packages' workerd export condition now does this automatically, while the Node and browser builds stay lazy. The server package gains a dedicated browser shim for this (its `browser` condition previously reused the workerd shim), so browser bundles keep lazy construction.

### Patch Changes

- [#2402](https://github.com/modelcontextprotocol/typescript-sdk/pull/2402) [`a400259`](https://github.com/modelcontextprotocol/typescript-sdk/commit/a4002596b914c675d17ac22471d1287976dbb52a) Thanks [@felixweinberger](https://github.com/felixweinberger)! - First beta release of SDK v2 with support for the MCP 2026-07-28 specification
  revision. See the migration guides for upgrading from v1
  (`docs/migration/upgrade-to-v2.md`) and adopting the 2026-07-28 revision
  (`docs/migration/support-2026-07-28.md`).

- [#2456](https://github.com/modelcontextprotocol/typescript-sdk/pull/2456) [`44797d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/44797d77792953d0ce70b68922bb6bb69e697c32) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Restore the v1 parse tolerance for `CallToolResult.content`: an inbound legacy-era `tools/call` result without `content` defaults to `[]` instead of failing validation. Deployed servers — accepted by SDK v1 for years — return `structuredContent`-only (or otherwise content-less) results, and the strict parse turned every such call into an `INVALID_RESULT` error before application code could run.

    The silent-empty-success hazard the strictness guarded is preserved where it matters: the 2025 era's wire-seam schema refuses to default `content` for a body carrying another result family's vocabulary (`task`, `inputRequests`, `requestState` — the era is frozen, so the list is complete), and the 2026-era wire schemas stay strict — modern-revision servers have no legacy excuse. Task interop through an explicit result schema is untouched (including bodies that also stamp a foreign `resultType`), and the server-side authoring normalization refuses the same foreign-family vocabulary.

    Server-side authoring is era-independent: a handler result without `content` (dynamic/JS callers — the TypeScript surface requires it) is normalized to `content: []` before era validation on every leg, reaching the wire spec-valid.

    Conscious call: the nested sampling `ToolResultContentSchema` stays spec-strict — v1 had defaulted its `content` too, but it is params-side (tool results a caller authors into a sampling message), deliberately not restored.

- [#2431](https://github.com/modelcontextprotocol/typescript-sdk/pull/2431) [`1b90c96`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1b90c96d11fd17016d2977cae9dd661de3fb84df) Thanks [@morluto](https://github.com/morluto)! - Fix the CommonJS `validators/ajv` subpath so reading the exported `Ajv` class no longer throws `ReferenceError: import_ajv is not defined`. The subpath now re-exports the bundled provider's concrete `Ajv` value in CJS output, matching the existing ESM behavior.

- [#2405](https://github.com/modelcontextprotocol/typescript-sdk/pull/2405) [`f172626`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f172626a8e98b2ae2f0f690e4afb4dc74dbf6011) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Ship CommonJS builds alongside ESM. Each package now emits both `.mjs`/`.d.mts`
  and `.cjs`/`.d.cts` (via tsdown `format: ['esm', 'cjs']`), and its `exports` map
  adds a `require` condition so `require('@modelcontextprotocol/…')` works from
  CommonJS consumers. Output extensions are normalized across all packages
  (`@modelcontextprotocol/core` moves from `.js`/`.d.ts` to `.mjs`/`.d.mts`); the
  public import paths are unchanged.

- [#2441](https://github.com/modelcontextprotocol/typescript-sdk/pull/2441) [`561c6d8`](https://github.com/modelcontextprotocol/typescript-sdk/commit/561c6d83456ef98d6c713bbda9837e64337f22c9) Thanks [@felixweinberger](https://github.com/felixweinberger)! - POSTs whose `Content-Type` media type is not `application/json` are now
  rejected with `415 Unsupported Media Type`; the header is parsed instead of
  substring-matched. Previously any value merely containing the substring
  passed the check (for example `text/plain; a=application/json`), case
  variants were wrongly rejected, and the 2026-07-28 entry did not inspect
  `Content-Type` at all — requests with a missing or non-JSON header that used
  to be served on that path now also answer 415. Values with parameters
  (`application/json; charset=utf-8`, including malformed parameter sections
  like `application/json;`) continue to work. SDK clients always send the
  correct header and are unaffected.

    The new `isJsonContentType(header)` helper is exported for transport and
    framework-adapter authors — custom entries composing the exported building
    blocks (`classifyInboundRequest`, `PerRequestHTTPServerTransport`) must apply
    it themselves. The hono adapter's JSON body pre-parse and the client's
    response dispatch now use the same parsed-media-type comparison.

- [#2384](https://github.com/modelcontextprotocol/typescript-sdk/pull/2384) [`ce2f65d`](https://github.com/modelcontextprotocol/typescript-sdk/commit/ce2f65db0e019506f4d2526466ec8cc7106de98e) Thanks [@felixweinberger](https://github.com/felixweinberger)! - `instanceof` on the SDK error classes (`ProtocolError` and its typed subclasses, `SdkError`/`SdkHttpError`, `OAuthError`, and the client's `SseError`, `UnauthorizedError`, and OAuth-client-flow error family — `OAuthClientFlowError` and its subclasses) now works across separately bundled copies of the SDK. The classes match by a stable brand (via `Symbol.hasInstance` and a registry symbol) instead of prototype identity, so a process that uses both `@modelcontextprotocol/client` and `@modelcontextprotocol/server` - a gateway, host, or in-process test - can check errors constructed by either package against the class re-exported by the other. Ordinary prototype-based `instanceof` is preserved as a fallback; user-defined subclasses keep plain prototype semantics. Notes: cross-bundle matching requires both copies to be at or after this release; brands assert identity, not field shape, across versions - keep reading fields defensively. As a side effect, a foreign-bundle `SdkError` used as an abort reason is now rethrown as-is instead of being wrapped as a `RequestTimeout`. Branded hierarchies additionally expose an explicit static guard, `X.isInstance(value)`, that reads the same brand and narrows in TypeScript — an alternative for codebases that prefer predicate-style checks over `instanceof`. Also: `UnauthorizedError` now sets `error.name` to `'UnauthorizedError'` (previously `'Error'`), and per-package conformance tests enforce that every exported error class participates in branding. Version-negotiation probing now recognizes `UnauthorizedError` (previously a dead name-string check) and propagates it unchanged, so `connect()` on an auth-gated server rejects with the original `UnauthorizedError` (previously wrapped as the `cause` of an `SdkError(EraNegotiationFailed)`) — run `finishAuth()` and reconnect, and the retry probes with the token.

- [#2469](https://github.com/modelcontextprotocol/typescript-sdk/pull/2469) [`9b41b56`](https://github.com/modelcontextprotocol/typescript-sdk/commit/9b41b5685ded29c0afc194bbd91bb1902bee6f84) Thanks [@felixweinberger](https://github.com/felixweinberger)! - The Streamable HTTP client transport no longer attaches a session ID to a POST containing an `initialize` request — a new session starts "without a session ID attached" (2025-11-25 transports §Session Management) — and it only captures the `mcp-session-id` response header from a successful initialize response, since the spec assigns the session ID "at initialization time … on the HTTP response containing the InitializeResult". Previously the transport stored the header from any response, so a legacy server answering a protocol-version probe with an error that happened to carry a session ID would poison the fallback initialize, which then went out with a session ID it should not have had. A stale session ID from a previous connection is likewise no longer leaked onto the initialize handshake, and a successful initialize response that carries no session ID now clears any stale ID the transport was holding — clients include only an ID "returned by the server during initialization", so an ID the server never returned this session is outside the session model. Ignoring `mcp-session-id` headers mid-session is the complement of the spec's one actual rotation mechanism: a server that wants a new session terminates the old one (it "MAY terminate the session at any time") and answers 404, after which the client "MUST start a new session by sending a new InitializeRequest without a session ID attached". Rotation exists as session replacement via 404 + re-initialize, never as a header swap on a live session, so a server that rotates per the spec's own flow is handled correctly by this transport.

- [#2458](https://github.com/modelcontextprotocol/typescript-sdk/pull/2458) [`7c49b47`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7c49b47fb3a58b51cec8fd0b337f656515f1a2b7) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Construct the default Ajv validation engine lazily on first validation. Creating a `Client` or `Server` no longer pays the ajv + ajv-formats instantiation cost at startup when no JSON Schema validation ever runs.

- [#2476](https://github.com/modelcontextprotocol/typescript-sdk/pull/2476) [`e0a0ab7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e0a0ab74d9baed74572c9f435313fb6daef1b989) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Build protocol-revision wire schemas lazily on first validation instead of at import. Each revision's schema set is now constructed by a module-level memoized factory, so importing the client or server package no longer pays the construction cost of both frozen wire-schema graphs up front. Method membership in the revision registries stays static, the schemas themselves are unchanged, and registry lookups keep returning reference-identical schema objects.

- [#2564](https://github.com/modelcontextprotocol/typescript-sdk/pull/2564) [`faa7e2b`](https://github.com/modelcontextprotocol/typescript-sdk/commit/faa7e2b47090219060c0699bfe49ebe011516bce) Thanks [@felixweinberger](https://github.com/felixweinberger)! - The version-negotiation probe no longer misclassifies auth-protected or
  failing servers as legacy. Auth status is never era evidence: a 401 or 403
  rejection of the `server/discover` probe now surfaces as a typed
  authorization failure — an `SdkHttpError` with code `ClientHttpAuthentication`
  (401) or `ClientHttpForbidden` (403), carrying the HTTP status, reason
  phrase, and response text — instead of triggering the legacy `initialize`
  fallback (which put a doomed `initialize` on the wire) or, under `pin` mode,
  the false "server did not offer pinned protocol version" diagnostic. The
  codes are deliberately not `EraNegotiationFailed`, so era-recovery flows
  keyed on that code cannot persist a verdict for an unauthorized exchange. A
  5xx rejecting the probe is a server failure and now also rejects typed
  (`SdkHttpError(EraNegotiationFailed)`) instead of demoting a mid-deploy
  modern server to legacy — the legacy fallback now fires only on the 4xx
  shapes the spec licenses.

    With an `authProvider`, a `401` (and a `403` `insufficient_scope` challenge) runs the transport's auth flow first — a plain `403` rejects the same as without a provider — and whatever
    escapes it propagates unchanged, identity intact: the HTTP transports stamp
    errors at their auth seams (the `token()` read, `onUnauthorized` including
    custom callbacks, the 403 step-up flow, and their own auth-failure
    constructions), so `UnauthorizedError` for `finishAuth()`, the flow's typed
    failures (`OAuthError`, `InsufficientScopeError`, the
    401-after-re-authentication diagnostic), and even an untyped `TypeError`
    thrown inside the flow all reach the caller as thrown — never rewrapped,
    never consumed by the probe's browser CORS heuristic as legacy-era evidence.

- [#2514](https://github.com/modelcontextprotocol/typescript-sdk/pull/2514) [`6fe1963`](https://github.com/modelcontextprotocol/typescript-sdk/commit/6fe196310ddba95a9f9655facb6b7c1ab503d346) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Probe stdio servers on a disposable sibling process. Some stdio servers exit on any pre-`initialize` request (servers built on the official Rust SDK, rmcp, behave this way), so under `versionNegotiation: { mode: 'auto' }` the `server/discover` probe previously killed the server and `connect()` hard-failed. The probe now runs on a short-lived sibling spawned from the same parameters — its stderr is discarded and it is reaped once the era is known — and the caller's transport spawns exactly once, afterwards: a legacy verdict connects with the plain `initialize` handshake (byte-identical to `mode: 'legacy'`), a modern verdict is adopted directly, and the session wire never carries `server/discover`. Closing the caller's transport during the probe aborts `connect()` with the typed `SdkError(EraNegotiationFailed)` and the session child is never spawned. On HTTP — and on custom stdio-shaped transports, which probe in place — a mid-probe connection close keeps rejecting with the typed connect error, now naming the close in pin-mode and modern-only diagnostics.

- [#2455](https://github.com/modelcontextprotocol/typescript-sdk/pull/2455) [`cc70c5e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/cc70c5e6a9f9b1c15dcba0bdd019a479b81375de) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Version negotiation no longer discards transport handlers the caller set before `connect()`. The probe window now saves any pre-set `onmessage`/`onerror`/`onclose`, forwards error and close events to them while the probe is in flight, and restores them when the window closes — so `Protocol.connect()` chains them exactly as it does on a plain connect. Previously, connecting with `versionNegotiation` silently cleared pre-set handlers (e.g. an `onerror` used to detect session-expiry auth failures), leaving them permanently detached for the life of the connection.

- [#2425](https://github.com/modelcontextprotocol/typescript-sdk/pull/2425) [`e8de519`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e8de519d3129f46b7528d2999b7641f55be1f091) Thanks [@Sehlani042](https://github.com/Sehlani042)! - Stop advertising validator provider classes from the root client/server type declarations. The provider classes remain available from the explicit validator subpaths.

- [#2534](https://github.com/modelcontextprotocol/typescript-sdk/pull/2534) [`f130e1a`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f130e1ac5fcab34bd568f59907e0f2ce1d22074c) Thanks [@felixweinberger](https://github.com/felixweinberger)! - The default validator now honors declared 2019-09 and draft-07/06 dialects instead of rejecting them: a schema stamped `"$schema": "http://json-schema.org/draft-07/schema#"` (zod-to-json-schema's default output) validates with draft-07 semantics, and a 2019-09 stamp (zod-to-json-schema's `2019-09`/`openAi` targets) with 2019-09 semantics, on both the Ajv and Cloudflare Workers providers (with known engine differences documented in the migration guide). Schemas with no `$schema` still validate as 2020-12, and unknown dialects still produce the typed error (now listing the supported dialects: 2020-12, 2019-09, draft-07, draft-06).

- Updated dependencies [[`a400259`](https://github.com/modelcontextprotocol/typescript-sdk/commit/a4002596b914c675d17ac22471d1287976dbb52a), [`44797d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/44797d77792953d0ce70b68922bb6bb69e697c32), [`f172626`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f172626a8e98b2ae2f0f690e4afb4dc74dbf6011), [`8e1d2e9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/8e1d2e92b1720d2520122b3a5f20ea084edaf3c4), [`f413763`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f4137630c05dc9a4fb14d4d3777f5cb167bd6313)]:
    - @modelcontextprotocol/core@2.0.0
