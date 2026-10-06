---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/server@2.1.0"
released_at: "2026-09-23"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/server%402.1.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/server@2.1.0

### Minor Changes

- [#1624](https://github.com/modelcontextprotocol/typescript-sdk/pull/1624) [`6032170`](https://github.com/modelcontextprotocol/typescript-sdk/commit/60321700871029401a2e3bed8fdf4f02c9ec3331) Thanks [@SamMorrowDrums](https://github.com/SamMorrowDrums)! - Add request-time OAuth scope challenges for tools, resources, resource templates,
  and prompts. Each primitive's `scopeChallenge` callback receives the parsed
  request and verified authentication info, then either continues or returns the
  exact scope set for an `insufficient_scope` response. `requireScopes` provides a
  small helper for static all-of checks.

    `createMcpHandler` and Streamable HTTP transports return HTTP 403 with an
    `insufficient_scope` challenge before handler execution or SSE setup. The
    preflight is active whenever a registered primitive carries a `scopeChallenge`
    callback — there is no handler- or transport-level configuration. The
    challenge's `WWW-Authenticate` header is built by the same formatter as the
    bearer-auth 401/403 answers, and its `resource_metadata` parameter is derived
    from the verified `AuthInfo`: `requireBearerAuth` / `verifyBearerToken` now
    stamp their configured `resourceMetadataUrl` onto the `AuthInfo` they return
    (new optional `AuthInfo.resourceMetadataUrl` field), with a fallback to the
    well-known location for an HTTP(S) RFC 8707 `resource` identifier; the
    parameter is omitted when neither is available.

### Patch Changes

- [#2726](https://github.com/modelcontextprotocol/typescript-sdk/pull/2726) [`6fa4227`](https://github.com/modelcontextprotocol/typescript-sdk/commit/6fa42279fecaba423635072f716bbb2f6f7c77f3) Thanks [@LuckTerence](https://github.com/LuckTerence)! - `SdkError` and `SdkHttpError` accept standard `ErrorOptions` as an optional fourth constructor argument and forward it to `Error`, so a wrapped error is reachable through the standard `Error.cause` chain. Version-negotiation probe failures (`SdkErrorCode.EraNegotiationFailed`) now use it: the underlying `TypeError: fetch failed` and the DNS or socket error beneath it surface via `error.cause`, so pino, Sentry, and `util.inspect` render `ENOTFOUND` / `ECONNREFUSED` / `ETIMEDOUT` instead of stopping at the `SdkError` (#2657). The previous `error.data.cause` slot is still populated for compatibility but is deprecated and slated for removal; read `error.cause` instead.

- [#2654](https://github.com/modelcontextprotocol/typescript-sdk/pull/2654) [`03842cd`](https://github.com/modelcontextprotocol/typescript-sdk/commit/03842cd9cae9a9b142c77d2fb65e829fc4e03eab) Thanks [@pshah19](https://github.com/pshah19)! - Treat request id `0` as a real id. Two guards tested a `RequestId` for truthiness, so the legal JSON-RPC ids `0` and `''` were read as absent. Id `0` is not a corner case: the outbound request counter is zero-based, so it is the first id every peer assigns, which on the server→client leg is the first `sampling/createMessage`, `elicitation/create`, or `roots/list` a server sends.
    - `notifications/cancelled` carrying id `0` was ignored, and the in-flight handler ran to completion with its `AbortSignal` never fired.
    - A notification sent with `relatedRequestId: 0` wrongly passed the debounce gate (for methods opted into `debouncedNotificationMethods`). Because the pending set is keyed by method alone, a second such notification in the same tick was silently dropped rather than sent.

    Absent is now the only value that means "no id".

- [#2668](https://github.com/modelcontextprotocol/typescript-sdk/pull/2668) [`3e90449`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3e90449fd52997da43b79a536d2c19c446603cc7) Thanks [@KKonstantinov](https://github.com/KKonstantinov)! - Stop sending `notifications/cancelled` for the `initialize` handshake. The spec is explicit that a client MUST NOT attempt to cancel its `initialize` request, but the outbound cancel path fired for any in-flight request: aborting the `AbortSignal` passed to `connect()`, or letting the handshake hit its timeout, put a forbidden cancellation on the wire naming the initialize request id.

    The local behaviour is unchanged — the caller's promise still rejects with the same abort/timeout error, and `connect()` still tears the connection down. Only the wire notification is suppressed. Every other method keeps the existing cancellation path.

- [#2698](https://github.com/modelcontextprotocol/typescript-sdk/pull/2698) [`7b781ed`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7b781ed4e25355a25d15974f3c76de81299694ed) Thanks [@maxisbey](https://github.com/maxisbey)! - Read Streamable HTTP request bodies with a size limit. Every SDK-owned body read —
  `WebStandardStreamableHTTPServerTransport` (and the Node transport built on it),
  `createMcpHandler`, `toNodeHandler`, and `createMcpHonoApp`'s JSON pre-parse — now stops at
  4 MiB by default (the limit the legacy SSE transport already uses; the Express adapter and stdio
  bound their reads too) and answers `413 Payload Too Large` before anything is parsed.
  `toWebRequest` (when it reads the Node stream itself) now rejects once the body exceeds the
  limit with an error whose `name` is `'RequestBodyTooLargeError'` and `status` is `413`, and
  `toNodeHandler` answers that with `413`; hand-wired callers of `toWebRequest` should handle the
  rejection or pass a pre-parsed body, and `isLegacyRequest` reports such a request as non-legacy
  so the modern handler answers it. JSON-RPC batch arrays are limited to 100 messages; a longer
  batch is answered `400` / `-32600` and none of it is dispatched.

    The limit is configurable with a new `maxRequestBodySize` option (bytes, default
    `DEFAULT_MAX_REQUEST_BODY_SIZE` = 4 MiB, exported from `@modelcontextprotocol/server`) on
    `WebStandardStreamableHTTPServerTransportOptions`, `CreateMcpHandlerOptions` (forwarded to its
    stateless legacy leg; `isLegacyRequest` and `legacyStatelessFallback` take the same option),
    `CreateMcpHonoAppOptions`, and `ToNodeHandlerOptions` / `ToWebRequestOptions` (the adapter's
    bound applies before the handler's, so raise both). The bounded reader is exported as
    `readRequestBody` for adapter authors. Hosts that pre-parse the body and pass it as
    `parsedBody` skip the SDK's read and its size limit entirely; the batch bound applies either way.

    `createMcpHonoApp` and `createMcpExpressApp` now run their Host/Origin validation before the
    JSON body parser, so a request from a disallowed Host or Origin with an invalid JSON body is
    answered `403` rather than `400`, and its body is not read.

- [#2590](https://github.com/modelcontextprotocol/typescript-sdk/pull/2590) [`75dc7ea`](https://github.com/modelcontextprotocol/typescript-sdk/commit/75dc7ea6e2913e1ac37d4f06eec62cd5cfac9e7a) Thanks [@davidpavlovschi](https://github.com/davidpavlovschi)! - Reject a modern (2026-07-28) POST that omits the required `MCP-Protocol-Version` header.

    `createMcpHandler` accepted a request whose body carried a valid per-request `_meta`
    envelope but whose `MCP-Protocol-Version` header was absent: the request was classified
    modern, dispatched, and answered `200` — tool handlers ran. Only the _mismatch_ case
    (header present, disagreeing with the body) was rejected, so of the standard headers
    SEP-2243 requires on a modern POST, presence was enforced for `Mcp-Method` (and for
    `Mcp-Name` on the methods that mirror `params.name` / `params.uri`) but not for
    `MCP-Protocol-Version`.

    Such a request is now refused with `400 Bad Request` and JSON-RPC `-32020`
    (`HeaderMismatch`), matching the shape the sibling missing-header cells already emit and
    echoing the request id — per the Streamable HTTP spec, which requires the header on every
    POST and lists a missing required standard header as a `HeaderMismatch` failure. The
    spec's allowance to treat a header-less request as `2025-03-26` is available only to a
    server that also serves pre-2025-06-18 clients, and permits routing it to _legacy_
    handling — never serving it as 2026-07-28; under `legacy: 'reject'` the requirement is
    unconditional.

    Era classification is deliberately unchanged and stays body-primary: a proxy that strips
    the header still must not change the era, so such a request is still _classified_ modern
    and is refused one rung later, at `standard-header-validation` — the same rung that
    already answers a missing `Mcp-Method`. Legacy-era traffic is untouched, notifications
    are unaffected, body-less `GET` / `DELETE` session operations are method-routed before
    any header validation, and stdio serving (which has no HTTP headers) is not involved.

    Clients built with this SDK always send the header, so no first-party client is affected;
    hand-rolled clients that omitted it must add it.

- [#2494](https://github.com/modelcontextprotocol/typescript-sdk/pull/2494) [`6a05402`](https://github.com/modelcontextprotocol/typescript-sdk/commit/6a054025e8cebaecead76fb51d92ba3974e8d091) Thanks [@claude](https://github.com/apps/claude)! - `StdioServerTransport` now closes itself and fires `onclose` when its stdin ends or closes. The stdio binding says servers "SHOULD exit promptly when their standard input is closed" — stdin EOF is the primary graceful-shutdown signal, and on some platforms (notably Windows, where no signal is delivered when the parent goes away) the only reliable one. Previously the transport listened only for `data` and `error`, so when an MCP client hung up its end of the pipe (window closed, session restarted, host crashed) the server never noticed: `onclose` never fired, nothing tore down, and server processes accumulated as zombies until killed by hand. The transport now attaches `end`/`close` listeners on stdin that close the transport (idempotently — `onclose` still fires exactly once if `close()` is also called), so `Server`/`McpServer` and `serveStdio` tear down through the existing `onclose` chain and a well-behaved server process exits naturally. Requests still in flight when stdin ends are aborted (their handlers observe `signal.aborted`) and their responses are not written: EOF means the client has hung up and is no longer waiting. A client that wants answers keeps stdin open until it has read them.

- [#2613](https://github.com/modelcontextprotocol/typescript-sdk/pull/2613) [`70de0c8`](https://github.com/modelcontextprotocol/typescript-sdk/commit/70de0c8b569b0d664a56b90be2f141d1d1645880) Thanks [@jwcarman](https://github.com/jwcarman)! - Emit and validate the `Mcp-Name` header for tasks requests per SEP-2663's Streamable HTTP binding: the client transport now mirrors `params.taskId` into `Mcp-Name` on `tasks/get` / `tasks/update` / `tasks/cancel` (previously omitted, causing conforming servers to reject every task poll with `-32020 HeaderMismatch`), and the server-side standard-header validation cross-checks it via the same shared `MCP_NAME_HEADER_SOURCE` table.

    On the server, `createMcpHandler` now answers a modern (2026-07-28) `tasks/get` / `tasks/update` / `tasks/cancel` POST that omits `Mcp-Name`, or whose header disagrees with `params.taskId`, with `400` / `-32020` (`HeaderMismatch`) at the `standard-header-validation` rung, the same treatment `tools/call` / `prompts/get` / `resources/read` already get. Legacy-era (2025-11-25) tasks traffic is unaffected. Clients built with this SDK release send the header; hand-rolled clients that omitted it must add it.

- Updated dependencies [[`dcc0102`](https://github.com/modelcontextprotocol/typescript-sdk/commit/dcc01028ff6a499a5728c2b6181c1727d52e2fab)]:
    - @modelcontextprotocol/core@2.1.0
