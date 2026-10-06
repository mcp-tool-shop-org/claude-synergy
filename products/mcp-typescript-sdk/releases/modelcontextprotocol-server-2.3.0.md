---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/server@2.3.0"
released_at: "2026-10-02"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/server%402.3.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/server@2.3.0

### Minor Changes

- [#2929](https://github.com/modelcontextprotocol/typescript-sdk/pull/2929) [`40f8f4e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/40f8f4e229d963cd7fd2890bda2aeebe7005299a) Thanks [@claude](https://github.com/apps/claude)! - `requireBearerAuth` and `verifyBearerToken` take a new optional `expectedResource`, which makes them accept only tokens issued for this resource (the token's audience). Set it to the value your authorization server puts into tokens meant for this server, usually the server's URL. When it is set, a token is accepted only if the verifier reports that value in `AuthInfo.resource`; the two are compared as strings, ignoring a fragment and one trailing slash. A token reported for another value, or for none, is answered `401 invalid_token` with the usual `WWW-Authenticate` challenge. When it is not set, nothing changes. To use it, pass `expectedResource` and have `verifyAccessToken` fill `AuthInfo.resource`, for example from the `aud` claim. The option is declared on a new exported type, `VerifyBearerTokenOptions`, which extends `BearerAuthOptions`; `BearerAuthOptions` itself is unchanged. The Express `requireBearerAuth` passes the option through. With Express, `@modelcontextprotocol/express` has to be upgraded to this release as well: 2.0.1 does not pass the option on, so nothing is compared. Its options type does not have the option, so TypeScript reports an `expectedResource` written in a call to the 2.0.1 `requireBearerAuth` as an error.

- [#2926](https://github.com/modelcontextprotocol/typescript-sdk/pull/2926) [`6d8dbc6`](https://github.com/modelcontextprotocol/typescript-sdk/commit/6d8dbc6cb590edf766fcb66b636ca6b654e99c37) Thanks [@claude](https://github.com/apps/claude)! - `McpServer` now accepts a `maxToolInputElements` option that limits the number of elements in tool-call arguments: the largest combined number of array elements and object members a single `tools/call` `arguments` payload may contain. It is off by default, so behavior is unchanged unless you set it. When it is set and a call exceeds it, that call is answered with an `isError: true` tool result that names the limit, before the input schema runs, and the server keeps serving. Set it above the largest arguments your tools legitimately accept; `maxRequestBodySize` remains the primary limit on request size. The value must be a number of at least 1, or `Infinity` for no limit; any other value is rejected at construction. The options type is exported as `McpServerOptions`.

- [#2918](https://github.com/modelcontextprotocol/typescript-sdk/pull/2918) [`84804c2`](https://github.com/modelcontextprotocol/typescript-sdk/commit/84804c22e45a662675a198f853b7f00063838a8d) Thanks [@claude](https://github.com/apps/claude)! - A `Server` or `McpServer` now serves one connection at a time, and a Streamable HTTP server transport without sessions (`sessionIdGenerator: undefined`) serves one request. An app that uses one server object, or one stateless transport, for every HTTP request fails on the second request after this upgrade. Build the server and the transport per request instead.

    What keeps working without a change:
    - `createMcpHandler(buildServer)` and `serveStdio(buildServer)`, where `buildServer` returns a new server on every call.
    - A handler that builds a new server and a new stateless transport for each request.
    - One server and one transport per session (a transport with a `sessionIdGenerator`).
    - Connecting a server again after `close()`.
    - `Client`.

    What fails now, how it shows, and what to change:
    - One server object with a new stateless transport per request (`const server = new McpServer(...)` outside the handler, `await server.connect(transport)` inside it): the second HTTP request the process receives fails, and so does every later one. `connect()` rejects with an `SdkError` of code `ALREADY_CONNECTED`. If the handler closes the transport when the response ends, requests that arrive one after the other still work and a request that overlaps another one fails. Change: move `new McpServer(...)` and its registrations into the handler.
    - One stateless transport for every request (a transport built once with `sessionIdGenerator: undefined`): the second HTTP request fails. `WebStandardStreamableHTTPServerTransport.handleRequest()` rejects with `Stateless transport cannot be reused across requests. Create a new transport per request.`, and `NodeStreamableHTTPServerTransport.handleRequest()` answers `500`. Change: build the server and the transport inside the handler and connect them there.
    - `createMcpHandler(() => server)` with a server built once: a request that arrives after the previous response has been read to its end still works. A request that arrives while another one is being served is answered `500` with the JSON-RPC error `-32603` (`Internal server error`); the reason is reported only through the `onerror` option. Change: pass a function that builds the server, as in `createMcpHandler(buildServer)`.
    - One server object for every session: the `initialize` request of the second session fails with `ALREADY_CONNECTED`. Change: build a server per session.

    What the caller sees when `connect()` or `handleRequest()` rejects depends on the host. Express 5, Fastify and Hono answer `500`. A plain `node:http` listener without its own error handling gets an unhandled rejection, which ends the process.

    The README examples of `@modelcontextprotocol/express`, `@modelcontextprotocol/fastify`, `@modelcontextprotocol/hono` and `@modelcontextprotocol/node`, and the handler examples in the JSDoc of `WebStandardStreamableHTTPServerTransport` and `NodeStreamableHTTPServerTransport`, now build a server and a transport per request.

- [#2907](https://github.com/modelcontextprotocol/typescript-sdk/pull/2907) [`e55f9ac`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e55f9ac1b1cae413599b499cbaa45c0378edba78) Thanks [@claude](https://github.com/apps/claude)! - `allowedOrigins` and `validateOriginHeader` accept lowercase entries of the form `<scheme>://*`, such as `moz-extension://*` or `chrome-extension://*`, which admit every origin of that scheme. This lets a server admit MCP clients that run as a browser extension when the extension ID cannot be listed, as on Firefox, where it differs on every install. `http://*` and `https://*` are not honoured, and the defaults are unchanged.

### Patch Changes

- [#2599](https://github.com/modelcontextprotocol/typescript-sdk/pull/2599) [`5238fba`](https://github.com/modelcontextprotocol/typescript-sdk/commit/5238fba4424f82ec1ae9f6f458dd655ab322062d) Thanks [@freya0926](https://github.com/freya0926)! - A server can now serve, and a client can now call, `tasks/get` and `tasks/cancel` of the Tasks extension (SEP-2663) on a 2026-07-28 connection, when the handler is registered and the request is sent with an explicit schema. Every other method that a protocol revision removed is still refused. If one server factory serves both eras and such a handler is meant for 2025-era clients only, register it only when `ctx.era === 'legacy'`.

- [#2107](https://github.com/modelcontextprotocol/typescript-sdk/pull/2107) [`2fc49ea`](https://github.com/modelcontextprotocol/typescript-sdk/commit/2fc49eaf17a6b9ac0810c875cc96d3b949f9522c) Thanks [@pragnyanramtha](https://github.com/pragnyanramtha)! - `prompts/get` without `arguments` no longer fails with "Invalid arguments" when every argument of the prompt is optional. A missing `arguments` is now validated as `{}`, as it already is for `tools/call`, so a top-level `.optional()` or `.default(...)` on `argsSchema` no longer sees `undefined`.

- [#2889](https://github.com/modelcontextprotocol/typescript-sdk/pull/2889) [`4d94e7b`](https://github.com/modelcontextprotocol/typescript-sdk/commit/4d94e7b1ccf769d94a7bbba7789f1ee6c7dfdd8c) Thanks [@claude](https://github.com/apps/claude)! - `registerTool` no longer converts tool schemas up front, so a server built per request stops converting every tool on every request. The warning about an invalid `x-mcp-header` declaration now appears each time tools are listed, not when the tool is registered.

- [#2908](https://github.com/modelcontextprotocol/typescript-sdk/pull/2908) [`633dd3e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/633dd3e12bff6869c932c4a526341622320912b1) Thanks [@claude](https://github.com/apps/claude)! - The `license` field of the package manifests is now `Apache-2.0`; the `LICENSE` file shipped in each package carries the full terms, including the MIT text for earlier contributions. No code change.

- [#2841](https://github.com/modelcontextprotocol/typescript-sdk/pull/2841) [`2237555`](https://github.com/modelcontextprotocol/typescript-sdk/commit/2237555ed036c3e80341c0f3c28684e9c3ff0728) Thanks [@sharziki](https://github.com/sharziki)! - `McpServer.registerPrompt()` now types the callback correctly when no `argsSchema` is given: its one parameter is the server context. Before, reading `ctx.mcpReq` there was a type error although it worked at runtime. Prompts registered with an `argsSchema` are unchanged.

- Updated dependencies [[`633dd3e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/633dd3e12bff6869c932c4a526341622320912b1)]:
    - @modelcontextprotocol/core@2.3.0
