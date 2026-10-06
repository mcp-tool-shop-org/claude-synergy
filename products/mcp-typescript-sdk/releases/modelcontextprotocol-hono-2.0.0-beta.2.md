---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/hono@2.0.0-beta.2"
released_at: "2026-07-02"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/hono%402.0.0-beta.2"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/hono@2.0.0-beta.2

### Patch Changes

- [#2405](https://github.com/modelcontextprotocol/typescript-sdk/pull/2405) [`f172626`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f172626a8e98b2ae2f0f690e4afb4dc74dbf6011) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Ship CommonJS builds alongside ESM. Each package now emits both `.mjs`/`.d.mts`
  and `.cjs`/`.d.cts` (via tsdown `format: ['esm', 'cjs']`), and its `exports` map
  adds a `require` condition so `require('@modelcontextprotocol/…')` works from
  CommonJS consumers. Output extensions are normalized across all packages
  (`@modelcontextprotocol/core` moves from `.js`/`.d.ts` to `.mjs`/`.d.mts`); the
  public import paths are unchanged.
- Updated dependencies [[`f172626`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f172626a8e98b2ae2f0f690e4afb4dc74dbf6011), [`3c7ddaf`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3c7ddafa05d8f17fb52168bf4638f09251c3d0ff)]:
    - @modelcontextprotocol/server@2.0.0-beta.2
