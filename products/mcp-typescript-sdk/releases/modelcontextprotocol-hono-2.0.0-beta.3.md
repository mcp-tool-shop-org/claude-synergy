---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/hono@2.0.0-beta.3"
released_at: "2026-07-09"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/hono%402.0.0-beta.3"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/hono@2.0.0-beta.3

### Patch Changes

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

- Updated dependencies [[`44797d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/44797d77792953d0ce70b68922bb6bb69e697c32), [`1b90c96`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1b90c96d11fd17016d2977cae9dd661de3fb84df), [`561c6d8`](https://github.com/modelcontextprotocol/typescript-sdk/commit/561c6d83456ef98d6c713bbda9837e64337f22c9), [`ce2f65d`](https://github.com/modelcontextprotocol/typescript-sdk/commit/ce2f65db0e019506f4d2526466ec8cc7106de98e), [`7e69735`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7e697354de95111ca2c70a12ac9f5d3ec96b56c3), [`e8de519`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e8de519d3129f46b7528d2999b7641f55be1f091), [`0ab5d14`](https://github.com/modelcontextprotocol/typescript-sdk/commit/0ab5d1471d6c7375878316df2930fca77eee1d2a), [`24be404`](https://github.com/modelcontextprotocol/typescript-sdk/commit/24be4040d454a9c5983901229068477c7a9ea796), [`7635115`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7635115d0112c3f980b45a9773a4770660af8aae), [`61866d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/61866d7a5ff4475663ceb525c88447c497c1b92a)]:
    - @modelcontextprotocol/server@2.0.0-beta.3
