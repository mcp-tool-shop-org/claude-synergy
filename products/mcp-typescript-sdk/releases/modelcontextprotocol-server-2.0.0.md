---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/server@2.0.0"
released_at: "2026-07-27"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/server%402.0.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/server@2.0.0

### Minor Changes

- [#2501](https://github.com/modelcontextprotocol/typescript-sdk/pull/2501) [`1480241`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1480241e2a2a7f0ceee8e7723b2adcf88579bb36) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Export the `Protocol` base class and `mergeCapabilities` from the `@modelcontextprotocol/client` and `@modelcontextprotocol/server` package roots, restoring the v1 import for consumers that subclass `Protocol` (e.g. the MCP Apps SDK). The client and server packages each bundle their own compiled copy of the class, so import it from one package consistently within a process.

    The codemod now rewrites `Protocol` and `mergeCapabilities` imports from `shared/protocol.js` to the client or server package root, like the module's other symbols, instead of dropping them with an action-required marker.

- [#2477](https://github.com/modelcontextprotocol/typescript-sdk/pull/2477) [`8e1d2e9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/8e1d2e92b1720d2520122b3a5f20ea084edaf3c4) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Move the schema source modules (spec schemas, OAuth schemas, protocol constants) into `@modelcontextprotocol/core` and resolve them from there as a regular runtime dependency instead of bundling a private copy into each package. An application importing more than one of the packages now evaluates a single shared schema graph with shared object identity. `@modelcontextprotocol/core` gains a `./internal` subpath (SDK-internal contract; may change in any release) and the four packages now version together.

- [#2513](https://github.com/modelcontextprotocol/typescript-sdk/pull/2513) [`f413763`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f4137630c05dc9a4fb14d4d3777f5cb167bd6313) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Align the 2026-07-28 wire with the final revision (spec PR #3002): `serverInfo` moves from the `DiscoverResult` body to the result `_meta`, and the per-request envelope's `clientInfo` demotes from required to SHOULD.

    Before this change the SDK shipped the pre-#3002 shape in both directions: the client hard-rejected a conforming server's `DiscoverResult` (missing body `serverInfo` failed parse, so the probe misclassified the server as legacy and attempted an `initialize` handshake against it — a hard connect failure against a modern-only server such as go-sdk v1.7.0-pre.3), and the server rejected conforming clients that omit `clientInfo`.

    Now:
    - The 2026 wire schemas are the final revision exactly: no body `serverInfo` on `DiscoverResult`, envelope `clientInfo` optional (a present-but-malformed value still fails validation).
    - Servers stamp `_meta['io.modelcontextprotocol/serverInfo']` on every 2026-era response (spec SHOULD; a handler-authored value wins, the 2025-era wire is untouched). This includes the entry-built `subscriptions/listen` graceful-close results — the spec's `SubscriptionsListenResultMeta` extends `ResultMetaObject`.
    - Clients keep sending `clientInfo` and read server identity from the discover result's `_meta` only. A server that stamps no identity is anonymous: `getServerVersion()` is `undefined` and the response cache partitions under a per-connection surrogate. A malformed `_meta` serverInfo value is treated as absent on receive (the spec marks the field self-reported, unverified, and display-only).
    - Breaking type changes: `DiscoverResult` no longer declares `serverInfo`; `RequestMetaEnvelope`'s `clientInfo` is optional. New public constant `SERVER_INFO_META_KEY` (`'io.modelcontextprotocol/serverInfo'`).

- [#2369](https://github.com/modelcontextprotocol/typescript-sdk/pull/2369) [`24be404`](https://github.com/modelcontextprotocol/typescript-sdk/commit/24be4040d454a9c5983901229068477c7a9ea796) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Allow `inputRequired.elicit()` to accept a Standard Schema such as a Zod object for `requestedSchema`. The builder converts it to MCP's restricted form-elicitation JSON Schema, while the same schema can validate and type the response through `acceptedContent()` on handler re-entry. Zod formats mapping to `email`, `uri`, `date`, and `date-time` are supported. Shapes the restricted schema cannot express reject before anything is sent — nested objects, `.regex()` and customized zod format patterns, exclusive number bounds (`.positive()`/`.gt()`), literal unions (use `z.enum` or `z.literal(['a', 'b'])`), and non-spec root keywords like `z.strictObject()`'s `additionalProperties`.

- [#2541](https://github.com/modelcontextprotocol/typescript-sdk/pull/2541) [`470678d`](https://github.com/modelcontextprotocol/typescript-sdk/commit/470678d56b9ee2a365fcf6d3de21e3a8b32eeef5) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Add configurable SSE keep-alive comment frames to Streamable HTTP transports and apply `createMcpHandler`'s existing `keepAliveMs` option to every HTTP SSE stream it serves.

- [#2420](https://github.com/modelcontextprotocol/typescript-sdk/pull/2420) [`7635115`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7635115d0112c3f980b45a9773a4770660af8aae) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Add runtime-neutral Bearer authentication to `@modelcontextprotocol/server`:
  `requireBearerAuth` gates web-standard `fetch(request)` hosts (Cloudflare
  Workers, Deno, Bun, Hono), built on the exported `verifyBearerToken` and
  `bearerAuthChallengeResponse` pieces, with `OAuthTokenVerifier` now defined
  here. The Express middleware adapts the same core and is unchanged in
  behavior, except that `WWW-Authenticate` challenge values are now RFC 7235
  quoted-string sanitized (quotes and backslashes escaped, control and
  non-ASCII characters replaced); `@modelcontextprotocol/express` re-exports
  `OAuthTokenVerifier` as before.

- [#2422](https://github.com/modelcontextprotocol/typescript-sdk/pull/2422) [`61866d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/61866d7a5ff4475663ceb525c88447c497c1b92a) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Add runtime-neutral OAuth discovery serving to `@modelcontextprotocol/server`:
  `oauthMetadataResponse` serves the RFC 9728 Protected Resource Metadata and
  RFC 8414 Authorization Server metadata documents from web-standard
  `fetch(request)` hosts, built on the exported
  `buildOAuthProtectedResourceMetadata`, with
  `getOAuthProtectedResourceMetadataUrl` now defined here. The Express metadata
  router adapts the same core and is unchanged in behavior; the insecure-issuer
  escape hatch is an explicit `dangerouslyAllowInsecureIssuerUrl` option in the
  neutral core instead of a module-scope environment read. The web-standard
  matcher validates lazily so unmatched traffic always falls through, tolerates
  a trailing slash, supports HEAD, and marks reflected CORS preflights with
  `Vary`.

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

- [#2458](https://github.com/modelcontextprotocol/typescript-sdk/pull/2458) [`7c49b47`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7c49b47fb3a58b51cec8fd0b337f656515f1a2b7) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Construct the default Ajv validation engine lazily on first validation. Creating a `Client` or `Server` no longer pays the ajv + ajv-formats instantiation cost at startup when no JSON Schema validation ever runs.

- [#2476](https://github.com/modelcontextprotocol/typescript-sdk/pull/2476) [`e0a0ab7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e0a0ab74d9baed74572c9f435313fb6daef1b989) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Build protocol-revision wire schemas lazily on first validation instead of at import. Each revision's schema set is now constructed by a module-level memoized factory, so importing the client or server package no longer pays the construction cost of both frozen wire-schema graphs up front. Method membership in the revision registries stays static, the schemas themselves are unchanged, and registry lookups keep returning reference-identical schema objects.

- [#2451](https://github.com/modelcontextprotocol/typescript-sdk/pull/2451) [`7e69735`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7e697354de95111ca2c70a12ac9f5d3ec96b56c3) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Return JSON-RPC Invalid Params with the original URI and an `invalid_uri` reason when `resources/read` receives a syntactically malformed URI.

- [#2399](https://github.com/modelcontextprotocol/typescript-sdk/pull/2399) [`3c7ddaf`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3c7ddafa05d8f17fb52168bf4638f09251c3d0ff) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Return HTTP 400 for a `MissingRequiredClientCapabilityError` (`-32021`) produced after dispatch. The spec mandates `400 Bad Request` for this error with no condition on where it arose, but only the pre-dispatch capability gate honored that; the post-handler emission — the `input_required` gate rejecting an embedded request whose required capability the caller did not declare — surfaced in-band on HTTP 200. The JSON-RPC error body is unchanged, every other error code (including a handler relaying a downstream peer's `-32020`/`-32022`) keeps the origin-keyed in-band behavior, and the mapping only applies while the response is uncommitted: an exchange that already streamed — or one hosted with `responseMode: 'sse'`, which opens its stream at dispatch end — keeps its committed 200 and carries the error in-stream.

- [#2425](https://github.com/modelcontextprotocol/typescript-sdk/pull/2425) [`e8de519`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e8de519d3129f46b7528d2999b7641f55be1f091) Thanks [@Sehlani042](https://github.com/Sehlani042)! - Stop advertising validator provider classes from the root client/server type declarations. The provider classes remain available from the explicit validator subpaths.

- [#2453](https://github.com/modelcontextprotocol/typescript-sdk/pull/2453) [`0ab5d14`](https://github.com/modelcontextprotocol/typescript-sdk/commit/0ab5d1471d6c7375878316df2930fca77eee1d2a) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Strip RFC 9110 optional whitespace around inbound `MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` values before classifying and validating modern HTTP requests. This keeps valid requests portable across Fetch runtimes that expose raw leading or trailing SP/HTAB through `Headers.get()`.

- [#2534](https://github.com/modelcontextprotocol/typescript-sdk/pull/2534) [`f130e1a`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f130e1ac5fcab34bd568f59907e0f2ce1d22074c) Thanks [@felixweinberger](https://github.com/felixweinberger)! - The default validator now honors declared 2019-09 and draft-07/06 dialects instead of rejecting them: a schema stamped `"$schema": "http://json-schema.org/draft-07/schema#"` (zod-to-json-schema's default output) validates with draft-07 semantics, and a 2019-09 stamp (zod-to-json-schema's `2019-09`/`openAi` targets) with 2019-09 semantics, on both the Ajv and Cloudflare Workers providers (with known engine differences documented in the migration guide). Schemas with no `$schema` still validate as 2020-12, and unknown dialects still produce the typed error (now listing the supported dialects: 2020-12, 2019-09, draft-07, draft-06).

- Updated dependencies [[`a400259`](https://github.com/modelcontextprotocol/typescript-sdk/commit/a4002596b914c675d17ac22471d1287976dbb52a), [`44797d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/44797d77792953d0ce70b68922bb6bb69e697c32), [`f172626`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f172626a8e98b2ae2f0f690e4afb4dc74dbf6011), [`8e1d2e9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/8e1d2e92b1720d2520122b3a5f20ea084edaf3c4), [`f413763`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f4137630c05dc9a4fb14d4d3777f5cb167bd6313)]:
    - @modelcontextprotocol/core@2.0.0
