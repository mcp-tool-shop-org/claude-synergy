---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/client@2.1.0"
released_at: "2026-09-23"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/client%402.1.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/client@2.1.0

### Minor Changes

- [#2629](https://github.com/modelcontextprotocol/typescript-sdk/pull/2629) [`dcc0102`](https://github.com/modelcontextprotocol/typescript-sdk/commit/dcc01028ff6a499a5728c2b6181c1727d52e2fab) Thanks [@gbshankar](https://github.com/gbshankar)! - Add DPoP (RFC 9449 / SEP-1932) sender-constrained access token support to the client.
    - Opt in by implementing `OAuthClientProvider.dpop()` returning a `DpopSession` (new, along with `generateDpopKeyPair`, `accessTokenHash`, `isDpopNonceChallenge`). `auth()` / `exchangeAuthorization` / `refreshAuthorization` / `fetchToken` then sign a DPoP proof into token requests (retrying once on an authorization-server `use_dpop_nonce` challenge, with client authentication re-applied per attempt), and `StreamableHTTPClientTransport`, `SSEClientTransport` and `withOAuth` present a `token_type: "DPoP"` access token as `Authorization: DPoP <token>` plus a fresh per-request proof, retry a resource-server `use_dpop_nonce` challenge once, and pick up a `DPoP-Nonce` delivered on any response. Tokens the AS issued as `Bearer` are still presented as Bearer.
    - DPoP is applied at the fetch layer: the transports wrap their resource-server `fetch` (including a caller-supplied `fetch` / `eventSourceInit.fetch`) with the new `withDpopFromProvider(provider)` middleware, so proofs are always bound to the request actually sent. `withDpop(session, getToken)` is exported for callers that manage tokens themselves (e.g. alongside a minimal `AuthProvider`); the `AuthProvider` interface itself is unchanged.
    - `auth()` now recovers from `invalid_dpop_proof` on refresh (e.g. a refresh token bound to a key that is no longer held) by discarding the tokens and re-authorizing, like `invalid_grant`. `OAuthErrorCode` gains `InvalidDpopProof` and `UseDpopNonce`; `extractWWWAuthenticateParams` recognizes the `DPoP` challenge scheme; `OAuthMetadataSchema` gains `dpop_signing_alg_values_supported`.

### Patch Changes

- [#2726](https://github.com/modelcontextprotocol/typescript-sdk/pull/2726) [`6fa4227`](https://github.com/modelcontextprotocol/typescript-sdk/commit/6fa42279fecaba423635072f716bbb2f6f7c77f3) Thanks [@LuckTerence](https://github.com/LuckTerence)! - `SdkError` and `SdkHttpError` accept standard `ErrorOptions` as an optional fourth constructor argument and forward it to `Error`, so a wrapped error is reachable through the standard `Error.cause` chain. Version-negotiation probe failures (`SdkErrorCode.EraNegotiationFailed`) now use it: the underlying `TypeError: fetch failed` and the DNS or socket error beneath it surface via `error.cause`, so pino, Sentry, and `util.inspect` render `ENOTFOUND` / `ECONNREFUSED` / `ETIMEDOUT` instead of stopping at the `SdkError` (#2657). The previous `error.data.cause` slot is still populated for compatibility but is deprecated and slated for removal; read `error.cause` instead.

- [#2654](https://github.com/modelcontextprotocol/typescript-sdk/pull/2654) [`03842cd`](https://github.com/modelcontextprotocol/typescript-sdk/commit/03842cd9cae9a9b142c77d2fb65e829fc4e03eab) Thanks [@pshah19](https://github.com/pshah19)! - Treat request id `0` as a real id. Two guards tested a `RequestId` for truthiness, so the legal JSON-RPC ids `0` and `''` were read as absent. Id `0` is not a corner case: the outbound request counter is zero-based, so it is the first id every peer assigns, which on the server→client leg is the first `sampling/createMessage`, `elicitation/create`, or `roots/list` a server sends.
    - `notifications/cancelled` carrying id `0` was ignored, and the in-flight handler ran to completion with its `AbortSignal` never fired.
    - A notification sent with `relatedRequestId: 0` wrongly passed the debounce gate (for methods opted into `debouncedNotificationMethods`). Because the pending set is keyed by method alone, a second such notification in the same tick was silently dropped rather than sent.

    Absent is now the only value that means "no id".

- [#2043](https://github.com/modelcontextprotocol/typescript-sdk/pull/2043) [`c4248a9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/c4248a935f245a86b2fb8b88b9c3d594e2bfea75) Thanks [@ChrisJr404](https://github.com/ChrisJr404)! - On Windows, stdio servers spawned by `StdioClientTransport` now also inherit `COMSPEC`, `PATHEXT`, `PROGRAMDATA`, `PROGRAMFILES(X86)`, `PROGRAMW6432`, and `WINDIR` (added to `DEFAULT_INHERITED_ENV_VARS`). Programs a server launches can depend on them: PowerShell finds no native executables without `PATHEXT`, and Windows OpenSSH exits 255 without `ProgramData`.

- [#2668](https://github.com/modelcontextprotocol/typescript-sdk/pull/2668) [`3e90449`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3e90449fd52997da43b79a536d2c19c446603cc7) Thanks [@KKonstantinov](https://github.com/KKonstantinov)! - Stop sending `notifications/cancelled` for the `initialize` handshake. The spec is explicit that a client MUST NOT attempt to cancel its `initialize` request, but the outbound cancel path fired for any in-flight request: aborting the `AbortSignal` passed to `connect()`, or letting the handshake hit its timeout, put a forbidden cancellation on the wire naming the initialize request id.

    The local behaviour is unchanged — the caller's promise still rejects with the same abort/timeout error, and `connect()` still tears the connection down. Only the wire notification is suppressed. Every other method keeps the existing cancellation path.

- [#2475](https://github.com/modelcontextprotocol/typescript-sdk/pull/2475) [`b654261`](https://github.com/modelcontextprotocol/typescript-sdk/commit/b65426158ed9f29aea8ef3dc09ca22d7d9d6f970) Thanks [@sanjibani](https://github.com/sanjibani)! - `StreamableHTTPClientTransport` and `SSEClientTransport` now give their transport-managed headers precedence over same-named entries in `requestInit.headers`: `Authorization` when `authProvider` yields a token, `mcp-protocol-version`, and (Streamable HTTP) `mcp-session-id`. Header names compare case-insensitively and every `HeadersInit` form is covered (plain object, tuple array, `Headers` instance). Previously the caller-supplied value won, so a static `Authorization` placeholder (e.g. an env-var API key) kept overriding the OAuth token even after the provider obtained one and the fallback-to-OAuth flow never completed; a `Headers` instance or lowercase key produced a combined `Bearer <fresh>, Bearer <stale>` value instead. A configured `Authorization` is still sent while the provider has no token, and other configured headers pass through unchanged. Closes #2208.

- [#2581](https://github.com/modelcontextprotocol/typescript-sdk/pull/2581) [`5119ee7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/5119ee7fd7790e335a3fb60ef36f85334e2a6326) Thanks [@hugosmoreira](https://github.com/hugosmoreira)! - Preserve the exact OAuth resource indicator from protected resource metadata when building authorization and token requests. Previously a pathless `resource` such as `https://example.com` was normalized to `https://example.com/` via `URL.href`, which breaks authorization servers that require the `resource` parameter to match the published value exactly (Microsoft Entra ID rejects it with `AADSTS9010010`). The exported OAuth helpers (`startAuthorization`, `exchangeAuthorization`, `refreshAuthorization`, `fetchToken`, `executeTokenRequest`) now also accept a `string` for `resource`; `selectResourceURL` still returns a `URL`, and a provider's `validateResourceURL` result is used unchanged. Fixes #1968.

- [`3924de9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3924de99df834302d89f5997a1b64ca268282284) - Let `saveTokens` failures surface after a successful token refresh. In `auth()`, one `try`
  wrapped both `refreshAuthorization()` and the `provider.saveTokens()` that persists its
  result, and the `catch` deliberately swallows anything that is not an `OAuthError` — plus
  `ServerError` — so that a failed refresh falls through to a fresh authorization request.
  A persistence error thrown by the provider landed in that same branch: it was discarded
  with no log and no rethrow, and `auth()` continued to `startAuthorization()` and returned
  `'REDIRECT'`.

    Against an authorization server that rotates refresh tokens (the OAuth 2.1 default, and
    Keycloak's) this loses credentials rather than merely hiding an error. The exchange has
    already succeeded server-side, so the old refresh token is invalidated at the moment the
    new one is issued; dropping the new token set leaves nothing usable on either side. On a
    headless or CLI client, where `redirectToAuthorization` is typically a no-op, the fallthrough
    is silent and the client is left with stale tokens and no indication of why.

    The `try`/`catch` now covers only `refreshAuthorization()`. Persisting the result happens
    after it, on an unguarded path, so a provider's I/O error propagates to the caller.

    Refresh-request failures keep their existing control flow exactly: a `ServerError` or an
    unknown error still falls through to a new authorization flow, a non-`ServerError`
    `OAuthError` is still rethrown, and `InsecureTokenEndpointError` is still surfaced. The
    SEP-2352 `issuer` stamp written with the refreshed tokens is unchanged.

    Those fallbacks no longer happen in silence, though. Both routes to an unexplained
    re-authorization now emit a `console.warn` naming the cause: the in-place fallthrough in
    the refresh block, and `auth()`'s outer recovery for `invalid_grant`, `invalid_client`,
    and `unauthorized_client`, which discards stored credentials and retries. The second one
    matters most in practice — an expired, revoked, or rotation-reuse-detected refresh token
    is reported as `invalid_grant`, which is precisely the state a dropped token set leaves
    behind for the next call.

    Consumers whose `OAuthClientProvider.saveTokens` can reject should note that `auth()` may
    now reject where it previously returned `'REDIRECT'` — that rejection is the failure that
    was being discarded.

- [#2613](https://github.com/modelcontextprotocol/typescript-sdk/pull/2613) [`70de0c8`](https://github.com/modelcontextprotocol/typescript-sdk/commit/70de0c8b569b0d664a56b90be2f141d1d1645880) Thanks [@jwcarman](https://github.com/jwcarman)! - Emit and validate the `Mcp-Name` header for tasks requests per SEP-2663's Streamable HTTP binding: the client transport now mirrors `params.taskId` into `Mcp-Name` on `tasks/get` / `tasks/update` / `tasks/cancel` (previously omitted, causing conforming servers to reject every task poll with `-32020 HeaderMismatch`), and the server-side standard-header validation cross-checks it via the same shared `MCP_NAME_HEADER_SOURCE` table.

    On the server, `createMcpHandler` now answers a modern (2026-07-28) `tasks/get` / `tasks/update` / `tasks/cancel` POST that omits `Mcp-Name`, or whose header disagrees with `params.taskId`, with `400` / `-32020` (`HeaderMismatch`) at the `standard-header-validation` rung, the same treatment `tools/call` / `prompts/get` / `resources/read` already get. Legacy-era (2025-11-25) tasks traffic is unaffected. Clients built with this SDK release send the header; hand-rolled clients that omitted it must add it.

- Updated dependencies [[`dcc0102`](https://github.com/modelcontextprotocol/typescript-sdk/commit/dcc01028ff6a499a5728c2b6181c1727d52e2fab)]:
    - @modelcontextprotocol/core@2.1.0
