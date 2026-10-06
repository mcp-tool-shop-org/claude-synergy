---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/codemod@2.0.0-beta.3"
released_at: "2026-07-09"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/codemod%402.0.0-beta.3"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/codemod@2.0.0-beta.3

### Patch Changes

- [#2419](https://github.com/modelcontextprotocol/typescript-sdk/pull/2419) [`79dc162`](https://github.com/modelcontextprotocol/typescript-sdk/commit/79dc162efcb4e1f7b820bfb6068906483cf71ec7) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Read the v2 package versions the codemod writes into migrated `package.json` files directly from the workspace manifests at build time, replacing the committed generated `versions.ts` (which went stale after every release and made source builds write outdated versions).

- [#2420](https://github.com/modelcontextprotocol/typescript-sdk/pull/2420) [`7635115`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7635115d0112c3f980b45a9773a4770660af8aae) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Add runtime-neutral Bearer authentication to `@modelcontextprotocol/server`:
  `requireBearerAuth` gates web-standard `fetch(request)` hosts (Cloudflare
  Workers, Deno, Bun, Hono), built on the exported `verifyBearerToken` and
  `bearerAuthChallengeResponse` pieces, with `OAuthTokenVerifier` now defined
  here. The Express middleware adapts the same core and is unchanged in
  behavior, except that `WWW-Authenticate` challenge values are now RFC 7235
  quoted-string sanitized (quotes and backslashes escaped, control and
  non-ASCII characters replaced); `@modelcontextprotocol/express` re-exports
  `OAuthTokenVerifier` as before.
