---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/server@2.0.0-beta.3"
released_at: "2026-07-09"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/server%402.0.0-beta.3"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/server@2.0.0-beta.3

### Minor Changes

- [#2369](https://github.com/modelcontextprotocol/typescript-sdk/pull/2369) [`24be404`](https://github.com/modelcontextprotocol/typescript-sdk/commit/24be4040d454a9c5983901229068477c7a9ea796) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Allow `inputRequired.elicit()` to accept a Standard Schema such as a Zod object for `requestedSchema`. The builder converts it to MCP's restricted form-elicitation JSON Schema, while the same schema can validate and type the response through `acceptedContent()` on handler re-entry. Zod formats mapping to `email`, `uri`, `date`, and `date-time` are supported. Shapes the restricted schema cannot express reject before anything is sent — nested objects, `.regex()` and customized zod format patterns, exclusive number bounds (`.positive()`/`.gt()`), literal unions (use `z.enum` or `z.literal(['a', 'b'])`), and non-spec root keywords like `z.strictObject()`'s `additionalProperties`.

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

- [#2451](https://github.com/modelcontextprotocol/typescript-sdk/pull/2451) [`7e69735`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7e697354de95111ca2c70a12ac9f5d3ec96b56c3) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Return JSON-RPC Invalid Params with the original URI and an `invalid_uri` reason when `resources/read` receives a syntactically malformed URI.

- [#2425](https://github.com/modelcontextprotocol/typescript-sdk/pull/2425) [`e8de519`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e8de519d3129f46b7528d2999b7641f55be1f091) Thanks [@Sehlani042](https://github.com/Sehlani042)! - Stop advertising validator provider classes from the root client/server type declarations. The provider classes remain available from the explicit validator subpaths.

- [#2453](https://github.com/modelcontextprotocol/typescript-sdk/pull/2453) [`0ab5d14`](https://github.com/modelcontextprotocol/typescript-sdk/commit/0ab5d1471d6c7375878316df2930fca77eee1d2a) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Strip RFC 9110 optional whitespace around inbound `MCP-Protocol-Version`, `Mcp-Method`, and `Mcp-Name` values before classifying and validating modern HTTP requests. This keeps valid requests portable across Fetch runtimes that expose raw leading or trailing SP/HTAB through `Headers.get()`.
