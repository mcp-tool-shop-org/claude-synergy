---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/node@2.1.0"
released_at: "2026-09-23"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/node%402.1.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/node@2.1.0

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

- Updated dependencies [[`6fa4227`](https://github.com/modelcontextprotocol/typescript-sdk/commit/6fa42279fecaba423635072f716bbb2f6f7c77f3), [`03842cd`](https://github.com/modelcontextprotocol/typescript-sdk/commit/03842cd9cae9a9b142c77d2fb65e829fc4e03eab), [`3e90449`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3e90449fd52997da43b79a536d2c19c446603cc7), [`7b781ed`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7b781ed4e25355a25d15974f3c76de81299694ed), [`75dc7ea`](https://github.com/modelcontextprotocol/typescript-sdk/commit/75dc7ea6e2913e1ac37d4f06eec62cd5cfac9e7a), [`6032170`](https://github.com/modelcontextprotocol/typescript-sdk/commit/60321700871029401a2e3bed8fdf4f02c9ec3331), [`6a05402`](https://github.com/modelcontextprotocol/typescript-sdk/commit/6a054025e8cebaecead76fb51d92ba3974e8d091), [`70de0c8`](https://github.com/modelcontextprotocol/typescript-sdk/commit/70de0c8b569b0d664a56b90be2f141d1d1645880)]:
    - @modelcontextprotocol/server@2.1.0
