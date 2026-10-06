---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/server-legacy@2.3.1"
released_at: "2026-10-05"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/server-legacy%402.3.1"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/server-legacy@2.3.1

### Patch Changes

- [#2952](https://github.com/modelcontextprotocol/typescript-sdk/pull/2952) [`5a18673`](https://github.com/modelcontextprotocol/typescript-sdk/commit/5a1867390b91b8836f49af76c45427279f513325) Thanks [@claude](https://github.com/apps/claude)! - `requireBearerAuth` in `@modelcontextprotocol/server-legacy` takes the optional `expectedResource` that `@modelcontextprotocol/server` 2.3.0 and `@modelcontextprotocol/sdk` 1.32.0 added: the resource the token must be issued for (its audience), usually the server's URL. When it is set, a token is accepted only if the verifier reports that value in `AuthInfo.resource`; the two are compared as strings, ignoring a fragment and one trailing slash. A token reported for another value, or for none, is answered `401 invalid_token` with the usual `WWW-Authenticate` challenge. When it is not set, nothing changes. The package stays frozen otherwise; this option is added so that its `requireBearerAuth` matches the 1.x middleware it is a copy of.

- Updated dependencies []:
    - @modelcontextprotocol/core@2.3.1
