---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/server@2.0.0-beta.2"
released_at: "2026-07-02"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/server%402.0.0-beta.2"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/server@2.0.0-beta.2

### Patch Changes

- [#2405](https://github.com/modelcontextprotocol/typescript-sdk/pull/2405) [`f172626`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f172626a8e98b2ae2f0f690e4afb4dc74dbf6011) Thanks [@mattzcarey](https://github.com/mattzcarey)! - Ship CommonJS builds alongside ESM. Each package now emits both `.mjs`/`.d.mts`
  and `.cjs`/`.d.cts` (via tsdown `format: ['esm', 'cjs']`), and its `exports` map
  adds a `require` condition so `require('@modelcontextprotocol/…')` works from
  CommonJS consumers. Output extensions are normalized across all packages
  (`@modelcontextprotocol/core` moves from `.js`/`.d.ts` to `.mjs`/`.d.mts`); the
  public import paths are unchanged.

- [#2399](https://github.com/modelcontextprotocol/typescript-sdk/pull/2399) [`3c7ddaf`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3c7ddafa05d8f17fb52168bf4638f09251c3d0ff) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Return HTTP 400 for a `MissingRequiredClientCapabilityError` (`-32021`) produced after dispatch. The spec mandates `400 Bad Request` for this error with no condition on where it arose, but only the pre-dispatch capability gate honored that; the post-handler emission — the `input_required` gate rejecting an embedded request whose required capability the caller did not declare — surfaced in-band on HTTP 200. The JSON-RPC error body is unchanged, every other error code (including a handler relaying a downstream peer's `-32020`/`-32022`) keeps the origin-keyed in-band behavior, and the mapping only applies while the response is uncommitted: an exchange that already streamed — or one hosted with `responseMode: 'sse'`, which opens its stream at dispatch end — keeps its committed 200 and carries the error in-stream.
