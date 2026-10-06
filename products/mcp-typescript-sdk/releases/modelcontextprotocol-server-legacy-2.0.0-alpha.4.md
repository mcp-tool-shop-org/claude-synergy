---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/server-legacy@2.0.0-alpha.4"
released_at: "2026-06-30"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/server-legacy%402.0.0-alpha.4"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/server-legacy@2.0.0-alpha.4

### Minor Changes

-   [#2286](https://github.com/modelcontextprotocol/typescript-sdk/pull/2286) [`1823aae`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1823aae891837ebb5e3db885ec635f9efefd5771) Thanks [@felixweinberger](https://github.com/felixweinberger)! - SEP-2468 follow-up: `transport.finishAuth()` gains a `URLSearchParams` overload (preferred) that extracts `code`/`iss`, validates `iss` first, and on mismatch throws a sanitized `IssuerMismatchError` (no callback `error_description` text); callers remain responsible for `state`. **Behavior change for `@modelcontextprotocol/server-legacy`:** `mcpAuthRouter` now advertises `authorization_response_iss_parameter_supported` (default `true`; `ProxyOAuthServerProvider` reports `false`) and the bundled authorize handler appends `iss` (RFC 9207) to every `res.redirect(...)` your `OAuthServerProvider.authorize()` issues to the client's `redirect_uri`. If your provider redirects another way (`res.writeHead`, a separate consent-page response, or a standalone `authorizationHandler({provider})` without `issuerUrl`), append `params.issuer` as `iss` yourself or set `authorizationResponseIssParameterSupported: false` — otherwise RFC 9207-compliant clients (including this SDK) will reject the callback.

