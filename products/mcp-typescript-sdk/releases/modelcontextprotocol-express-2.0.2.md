---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/express@2.0.2"
released_at: "2026-10-02"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/express%402.0.2"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/express@2.0.2

### Patch Changes

- [#2929](https://github.com/modelcontextprotocol/typescript-sdk/pull/2929) [`40f8f4e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/40f8f4e229d963cd7fd2890bda2aeebe7005299a) Thanks [@claude](https://github.com/apps/claude)! - `requireBearerAuth` and `verifyBearerToken` take a new optional `expectedResource`, which makes them accept only tokens issued for this resource (the token's audience). Set it to the value your authorization server puts into tokens meant for this server, usually the server's URL. When it is set, a token is accepted only if the verifier reports that value in `AuthInfo.resource`; the two are compared as strings, ignoring a fragment and one trailing slash. A token reported for another value, or for none, is answered `401 invalid_token` with the usual `WWW-Authenticate` challenge. When it is not set, nothing changes. To use it, pass `expectedResource` and have `verifyAccessToken` fill `AuthInfo.resource`, for example from the `aud` claim. The option is declared on a new exported type, `VerifyBearerTokenOptions`, which extends `BearerAuthOptions`; `BearerAuthOptions` itself is unchanged. The Express `requireBearerAuth` passes the option through. With Express, `@modelcontextprotocol/express` has to be upgraded to this release as well: 2.0.1 does not pass the option on, so nothing is compared. Its options type does not have the option, so TypeScript reports an `expectedResource` written in a call to the 2.0.1 `requireBearerAuth` as an error.

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

- [#2908](https://github.com/modelcontextprotocol/typescript-sdk/pull/2908) [`633dd3e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/633dd3e12bff6869c932c4a526341622320912b1) Thanks [@claude](https://github.com/apps/claude)! - The `license` field of the package manifests is now `Apache-2.0`; the `LICENSE` file shipped in each package carries the full terms, including the MIT text for earlier contributions. No code change.

- Updated dependencies [[`40f8f4e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/40f8f4e229d963cd7fd2890bda2aeebe7005299a), [`6d8dbc6`](https://github.com/modelcontextprotocol/typescript-sdk/commit/6d8dbc6cb590edf766fcb66b636ca6b654e99c37), [`5238fba`](https://github.com/modelcontextprotocol/typescript-sdk/commit/5238fba4424f82ec1ae9f6f458dd655ab322062d), [`2fc49ea`](https://github.com/modelcontextprotocol/typescript-sdk/commit/2fc49eaf17a6b9ac0810c875cc96d3b949f9522c), [`4d94e7b`](https://github.com/modelcontextprotocol/typescript-sdk/commit/4d94e7b1ccf769d94a7bbba7789f1ee6c7dfdd8c), [`84804c2`](https://github.com/modelcontextprotocol/typescript-sdk/commit/84804c22e45a662675a198f853b7f00063838a8d), [`e55f9ac`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e55f9ac1b1cae413599b499cbaa45c0378edba78), [`633dd3e`](https://github.com/modelcontextprotocol/typescript-sdk/commit/633dd3e12bff6869c932c4a526341622320912b1), [`2237555`](https://github.com/modelcontextprotocol/typescript-sdk/commit/2237555ed036c3e80341c0f3c28684e9c3ff0728)]:
    - @modelcontextprotocol/server@2.3.0
