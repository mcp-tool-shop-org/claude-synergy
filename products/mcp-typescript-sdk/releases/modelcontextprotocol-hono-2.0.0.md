---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/hono@2.0.0"
released_at: "2026-07-27"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/hono%402.0.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/hono@2.0.0

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

- [#2441](https://github.com/modelcontextprotocol/typescript-sdk/pull/2441) [`561c6d8`](https://github.com/modelcontextprotocol/typescript-sdk/commit/561c6d83456ef98d6c713bbda9837e64337f22c9) Thanks [@felixweinberger](https://github.com/felixweinberger)! - POSTs whose `Content-Type` media type is not `application/json` are now
  rejected with `415 Unsupported Media Type`; the header is parsed instead of
  substring-matched. Previously any value merely containing the substring
  passed the check (for example `text/plain; a=application/json`), case
  variants were wrongly rejected, and the 2026-07-28 entry did not inspect
  `Content-Type` at all — requests with a missing or non-JSON header that used
  to be served on that path now also answer 415. Values with parameters
  (`application/json; charset=utf-8`, including malformed parameter sections
  like `application/json;`) continue to work. SDK clients always send the
  correct header and are unaffected.

    The new `isJsonContentType(header)` helper is exported for transport and
    framework-adapter authors — custom entries composing the exported building
    blocks (`classifyInboundRequest`, `PerRequestHTTPServerTransport`) must apply
    it themselves. The hono adapter's JSON body pre-parse and the client's
    response dispatch now use the same parsed-media-type comparison.

- Updated dependencies [[`a400259`](https://github.com/modelcontextprotocol/typescript-sdk/commit/a4002596b914c675d17ac22471d1287976dbb52a), [`44797d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/44797d77792953d0ce70b68922bb6bb69e697c32), [`1b90c96`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1b90c96d11fd17016d2977cae9dd661de3fb84df), [`f172626`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f172626a8e98b2ae2f0f690e4afb4dc74dbf6011), [`561c6d8`](https://github.com/modelcontextprotocol/typescript-sdk/commit/561c6d83456ef98d6c713bbda9837e64337f22c9), [`ce2f65d`](https://github.com/modelcontextprotocol/typescript-sdk/commit/ce2f65db0e019506f4d2526466ec8cc7106de98e), [`1480241`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1480241e2a2a7f0ceee8e7723b2adcf88579bb36), [`7c49b47`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7c49b47fb3a58b51cec8fd0b337f656515f1a2b7), [`e0a0ab7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e0a0ab74d9baed74572c9f435313fb6daef1b989), [`7e69735`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7e697354de95111ca2c70a12ac9f5d3ec96b56c3), [`3c7ddaf`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3c7ddafa05d8f17fb52168bf4638f09251c3d0ff), [`8e1d2e9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/8e1d2e92b1720d2520122b3a5f20ea084edaf3c4), [`e8de519`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e8de519d3129f46b7528d2999b7641f55be1f091), [`f413763`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f4137630c05dc9a4fb14d4d3777f5cb167bd6313), [`0ab5d14`](https://github.com/modelcontextprotocol/typescript-sdk/commit/0ab5d1471d6c7375878316df2930fca77eee1d2a), [`24be404`](https://github.com/modelcontextprotocol/typescript-sdk/commit/24be4040d454a9c5983901229068477c7a9ea796), [`470678d`](https://github.com/modelcontextprotocol/typescript-sdk/commit/470678d56b9ee2a365fcf6d3de21e3a8b32eeef5), [`f130e1a`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f130e1ac5fcab34bd568f59907e0f2ce1d22074c), [`7635115`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7635115d0112c3f980b45a9773a4770660af8aae), [`61866d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/61866d7a5ff4475663ceb525c88447c497c1b92a), [`3f07a32`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3f07a325c6741b2374ce2255846dfa0c25f74d03)]:
    - @modelcontextprotocol/server@2.0.0
