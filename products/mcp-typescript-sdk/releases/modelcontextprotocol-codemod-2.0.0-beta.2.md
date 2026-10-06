---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/codemod@2.0.0-beta.2"
released_at: "2026-07-02"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/codemod%402.0.0-beta.2"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/codemod@2.0.0-beta.2

### Patch Changes

- [#2405](https://github.com/modelcontextprotocol/typescript-sdk/pull/2405) [`f172626`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f172626a8e98b2ae2f0f690e4afb4dc74dbf6011) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Ship CommonJS builds alongside ESM. Each package now emits both `.mjs`/`.d.mts`
  and `.cjs`/`.d.cts` (via tsdown `format: ['esm', 'cjs']`), and its `exports` map
  adds a `require` condition so `require('@modelcontextprotocol/…')` works from
  CommonJS consumers. Output extensions are normalized across all packages
  (`@modelcontextprotocol/core` moves from `.js`/`.d.ts` to `.mjs`/`.d.mts`); the
  public import paths are unchanged.

- [#2412](https://github.com/modelcontextprotocol/typescript-sdk/pull/2412) [`ef120b2`](https://github.com/modelcontextprotocol/typescript-sdk/commit/ef120b2be0c3c3d80468c3d4a9f79be30bb0c0a3) Thanks [@felixweinberger](https://github.com/felixweinberger)! - v1-to-v2 migration fixes from continued real-world migrations (codemod iterations 5).
