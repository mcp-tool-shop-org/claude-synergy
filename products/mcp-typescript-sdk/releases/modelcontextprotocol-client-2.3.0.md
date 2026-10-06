---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/client@2.3.0"
released_at: "2026-10-02"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/client%402.3.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/client@2.3.0

### Minor Changes

- [#2901](https://github.com/modelcontextprotocol/typescript-sdk/pull/2901) [`433eb41`](https://github.com/modelcontextprotocol/typescript-sdk/commit/433eb413dc305ebeb93b8ebcde0095a8fc0d5fa0) Thanks [@claude](https://github.com/apps/claude)! - The HTTP client transports and the OAuth client helpers now follow a redirect only when it stays within the origin of the request (same scheme, host and port, or http to https on the same host with default ports) and keeps the method (a 307 or 308, or any redirect of a GET). Any other redirect is not followed. A transport then fails the request with an error that names the target; the session is kept and later messages still send. OAuth metadata discovery moves on to the next well-known URL, and any other OAuth request fails with an error that gives the status. Same-origin redirects that keep the method keep working on Node, up to five in a row, and no code changes are needed there. If your endpoint redirects to another origin, configure the transport with the URL it redirects to. A `requestInit.redirect` of `'error'` or `'manual'` is passed to fetch as it is for the requests a transport sends to the server (POST, GET and DELETE of the Streamable HTTP transport, POST of the SSE transport); for its OAuth requests, and for any other value, `requestInit.redirect` is not consulted by default. Browsers do not expose the target of a redirect to a page, so there a redirected request fails instead of being followed. Setting `redirectPolicy: 'follow'` on a transport leaves its redirects to the fetch implementation, as before this change.

### Patch Changes

- [#2599](https://github.com/modelcontextprotocol/typescript-sdk/pull/2599) [`5238fba`](https://github.com/modelcontextprotocol/typescript-sdk/commit/5238fba4424f82ec1ae9f6f458dd655ab322062d) Thanks [@freya0926](https://github.com/freya0926)! - A server can now serve, and a client can now call, `tasks/get` and `tasks/cancel` of the Tasks extension (SEP-2663) on a 2026-07-28 connection, when the handler is registered and the request is sent with an explicit schema. Every other method that a protocol revision removed is still refused. If one server factory serves both eras and such a handler is meant for 2025-era clients only, register it only when `ctx.era === 'legacy'`.

- [#2846](https://github.com/modelcontextprotocol/typescript-sdk/pull/2846) [`63c0fca`](https://github.com/modelcontextprotocol/typescript-sdk/commit/63c0fcab49dc13f22dd7d016d6320c62d05e3ca8) Thanks [@Sthreal](https://github.com/Sthreal)! - Receiving a large message as a single SSE event over Streamable HTTP, such as a tool result of tens of megabytes, is now fast: a 50 MB result that took about 13 seconds arrives in under a second. The client now requires `eventsource-parser` 3.0.8 or later. `SSEClientTransport` reads through the `eventsource` package and gets the same speed-up once that also resolves `eventsource-parser` 3.0.8 or later.

- [#2908](https://github.com/modelcontextprotocol/typescript-sdk/pull/2908) [`633dd3e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/633dd3e12bff6869c932c4a526341622320912b1) Thanks [@claude](https://github.com/apps/claude)! - The `license` field of the package manifests is now `Apache-2.0`; the `LICENSE` file shipped in each package carries the full terms, including the MIT text for earlier contributions. No code change.

- [#2903](https://github.com/modelcontextprotocol/typescript-sdk/pull/2903) [`e765b3b`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e765b3be84b7eba1837ba8da84acd6898cc47c65) Thanks [@claude](https://github.com/apps/claude)! - With `versionNegotiation` in `'auto'` or pin mode, a `server/discover` probe answered with a 2xx that carries no usable reply (a body that
  is not JSON under `application/json`, a bare `204`, a missing or unaccepted content type) still rejects `connect()` with
  `EraNegotiationFailed`; an empty SSE stream or a `202` surfaces as the probe timeout instead. The message now says
  `the server answered with an unusable reply (...)` instead of reading like a network failure. To connect to a 2025 server behind a front that
  answers the probe this way, pass `connect(transport, { prior: { kind: 'legacy' } })` or use `mode: 'legacy'`.

- [#2905](https://github.com/modelcontextprotocol/typescript-sdk/pull/2905) [`c0cd01a`](https://github.com/modelcontextprotocol/typescript-sdk/commit/c0cd01a21d867e57b29d7216416b25bf36898292) Thanks [@claude](https://github.com/apps/claude)! - `SSEClientTransport` now retries the SSE connection once after `onUnauthorized()` resolves, as documented. If the retry is also answered with 401, `start()` rejects with `SdkHttpError` (`ClientHttpAuthentication`) instead of calling `onUnauthorized()` again. A 401 on a later reconnect of a stream that had opened still gets one refresh.

- Updated dependencies [[`633dd3e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/633dd3e12bff6869c932c4a526341622320912b1)]:
    - @modelcontextprotocol/core@2.3.0
