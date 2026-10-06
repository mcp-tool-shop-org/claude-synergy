---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/codemod@2.0.0"
released_at: "2026-07-27"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/codemod%402.0.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/codemod@2.0.0

### Patch Changes

- [#2402](https://github.com/modelcontextprotocol/typescript-sdk/pull/2402) [`a400259`](https://github.com/modelcontextprotocol/typescript-sdk/commit/a4002596b914c675d17ac22471d1287976dbb52a) Thanks [@felixweinberger](https://github.com/felixweinberger)! - First beta release of SDK v2 with support for the MCP 2026-07-28 specification
  revision. See the migration guides for upgrading from v1
  (`docs/migration/upgrade-to-v2.md`) and adopting the 2026-07-28 revision
  (`docs/migration/support-2026-07-28.md`).

- [#2405](https://github.com/modelcontextprotocol/typescript-sdk/pull/2405) [`f172626`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f172626a8e98b2ae2f0f690e4afb4dc74dbf6011) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Ship CommonJS builds alongside ESM. Each package now emits both `.mjs`/`.d.mts`
  and `.cjs`/`.d.cts` (via tsdown `format: ['esm', 'cjs']`), and its `exports` map
  adds a `require` condition so `require('@modelcontextprotocol/…')` works from
  CommonJS consumers. Output extensions are normalized across all packages
  (`@modelcontextprotocol/core` moves from `.js`/`.d.ts` to `.mjs`/`.d.mts`); the
  public import paths are unchanged.

- [#2486](https://github.com/modelcontextprotocol/typescript-sdk/pull/2486) [`ee8267a`](https://github.com/modelcontextprotocol/typescript-sdk/commit/ee8267af4a55efda3cebdb35a1ebb1d797e4235d) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Version the codemod together with the core SDK packages, matching the migration guide's shared-version guarantee.

- [#2412](https://github.com/modelcontextprotocol/typescript-sdk/pull/2412) [`ef120b2`](https://github.com/modelcontextprotocol/typescript-sdk/commit/ef120b2be0c3c3d80468c3d4a9f79be30bb0c0a3) Thanks [@felixweinberger](https://github.com/felixweinberger)! - v1-to-v2 migration fixes from continued real-world migrations (codemod iterations 5).

- [#2419](https://github.com/modelcontextprotocol/typescript-sdk/pull/2419) [`79dc162`](https://github.com/modelcontextprotocol/typescript-sdk/commit/79dc162efcb4e1f7b820bfb6068906483cf71ec7) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Read the v2 package versions the codemod writes into migrated `package.json` files directly from the workspace manifests at build time, replacing the committed generated `versions.ts` (which went stale after every release and made source builds write outdated versions).

- [#2501](https://github.com/modelcontextprotocol/typescript-sdk/pull/2501) [`1480241`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1480241e2a2a7f0ceee8e7723b2adcf88579bb36) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Export the `Protocol` base class and `mergeCapabilities` from the `@modelcontextprotocol/client` and `@modelcontextprotocol/server` package roots, restoring the v1 import for consumers that subclass `Protocol` (e.g. the MCP Apps SDK). The client and server packages each bundle their own compiled copy of the class, so import it from one package consistently within a process.

    The codemod now rewrites `Protocol` and `mergeCapabilities` imports from `shared/protocol.js` to the client or server package root, like the module's other symbols, instead of dropping them with an action-required marker.

- [#2420](https://github.com/modelcontextprotocol/typescript-sdk/pull/2420) [`7635115`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7635115d0112c3f980b45a9773a4770660af8aae) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Add runtime-neutral Bearer authentication to `@modelcontextprotocol/server`:
  `requireBearerAuth` gates web-standard `fetch(request)` hosts (Cloudflare
  Workers, Deno, Bun, Hono), built on the exported `verifyBearerToken` and
  `bearerAuthChallengeResponse` pieces, with `OAuthTokenVerifier` now defined
  here. The Express middleware adapts the same core and is unchanged in
  behavior, except that `WWW-Authenticate` challenge values are now RFC 7235
  quoted-string sanitized (quotes and backslashes escaped, control and
  non-ASCII characters replaced); `@modelcontextprotocol/express` re-exports
  `OAuthTokenVerifier` as before.
