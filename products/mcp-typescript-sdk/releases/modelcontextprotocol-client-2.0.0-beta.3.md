---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/client@2.0.0-beta.3"
released_at: "2026-07-09"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/client%402.0.0-beta.3"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/client@2.0.0-beta.3

### Patch Changes

- [#2456](https://github.com/modelcontextprotocol/typescript-sdk/pull/2456) [`44797d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/44797d77792953d0ce70b68922bb6bb69e697c32) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Restore the v1 parse tolerance for `CallToolResult.content`: an inbound legacy-era `tools/call` result without `content` defaults to `[]` instead of failing validation. Deployed servers — accepted by SDK v1 for years — return `structuredContent`-only (or otherwise content-less) results, and the strict parse turned every such call into an `INVALID_RESULT` error before application code could run.

    The silent-empty-success hazard the strictness guarded is preserved where it matters: the 2025 era's wire-seam schema refuses to default `content` for a body carrying another result family's vocabulary (`task`, `inputRequests`, `requestState` — the era is frozen, so the list is complete), and the 2026-era wire schemas stay strict — modern-revision servers have no legacy excuse. Task interop through an explicit result schema is untouched (including bodies that also stamp a foreign `resultType`), and the server-side authoring normalization refuses the same foreign-family vocabulary.

    Server-side authoring is era-independent: a handler result without `content` (dynamic/JS callers — the TypeScript surface requires it) is normalized to `content: []` before era validation on every leg, reaching the wire spec-valid.

    Conscious call: the nested sampling `ToolResultContentSchema` stays spec-strict — v1 had defaulted its `content` too, but it is params-side (tool results a caller authors into a sampling message), deliberately not restored.

- [#2431](https://github.com/modelcontextprotocol/typescript-sdk/pull/2431) [`1b90c96`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1b90c96d11fd17016d2977cae9dd661de3fb84df) Thanks [@morluto](https://github.com/morluto)! - Fix the CommonJS `validators/ajv` subpath so reading the exported `Ajv` class no longer throws `ReferenceError: import_ajv is not defined`. The subpath now re-exports the bundled provider's concrete `Ajv` value in CJS output, matching the existing ESM behavior.

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

- [#2455](https://github.com/modelcontextprotocol/typescript-sdk/pull/2455) [`cc70c5e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/cc70c5e6a9f9b1c15dcba0bdd019a479b81375de) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Version negotiation no longer discards transport handlers the caller set before `connect()`. The probe window now saves any pre-set `onmessage`/`onerror`/`onclose`, forwards error and close events to them while the probe is in flight, and restores them when the window closes — so `Protocol.connect()` chains them exactly as it does on a plain connect. Previously, connecting with `versionNegotiation` silently cleared pre-set handlers (e.g. an `onerror` used to detect session-expiry auth failures), leaving them permanently detached for the life of the connection.

- [#2425](https://github.com/modelcontextprotocol/typescript-sdk/pull/2425) [`e8de519`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e8de519d3129f46b7528d2999b7641f55be1f091) Thanks [@Sehlani042](https://github.com/Sehlani042)! - Stop advertising validator provider classes from the root client/server type declarations. The provider classes remain available from the explicit validator subpaths.
