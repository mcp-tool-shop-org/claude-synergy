---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/client@2.0.0-beta.4"
released_at: "2026-07-13"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/client%402.0.0-beta.4"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/client@2.0.0-beta.4

### Minor Changes

- [#2468](https://github.com/modelcontextprotocol/typescript-sdk/pull/2468) [`5db6e38`](https://github.com/modelcontextprotocol/typescript-sdk/commit/5db6e38f2bdeb5052f608121e9a2679ff8742af2) Thanks [@felixweinberger](https://github.com/felixweinberger)! - The response cache now stores results as JSON-serialized documents (serialize on write, parse on read) instead of live object graphs isolated with `structuredClone`. Same mutation isolation, but no dependency on the `structuredClone` global — whose absence (jest+jsdom, Node < 17) previously made every cache write throw into the store-error swallow, silently disabling caching and output-schema lookups for the session. A value without a JSON representation now fails the write loudly to the error sink, and an undecodable document in an external store is reported, dropped, and read as a miss.

    Migration for custom `ResponseCacheStore` implementations: `CacheEntry.value` (and the `set()` entry value) is now `string` — persist and return it verbatim, `JSON.parse` to inspect. Entries persisted by a previous SDK version fail decode once (reported, dropped) and are rewritten on the next fetch.

- [#2477](https://github.com/modelcontextprotocol/typescript-sdk/pull/2477) [`8e1d2e9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/8e1d2e92b1720d2520122b3a5f20ea084edaf3c4) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Move the schema source modules (spec schemas, OAuth schemas, protocol constants) into `@modelcontextprotocol/core` and resolve them from there as a regular runtime dependency instead of bundling a private copy into each package. An application importing more than one of the packages now evaluates a single shared schema graph with shared object identity. `@modelcontextprotocol/core` gains a `./internal` subpath (SDK-internal contract; may change in any release) and the four packages now version together.

- [#2483](https://github.com/modelcontextprotocol/typescript-sdk/pull/2483) [`3f07a32`](https://github.com/modelcontextprotocol/typescript-sdk/commit/3f07a325c6741b2374ce2255846dfa0c25f74d03) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Add `preloadSchemas()`, an explicit opt-in to eager wire-schema construction, and call it automatically in the Cloudflare Workers builds. The wire schemas are built lazily by default, which is the right trade on process-per-invocation runtimes — but on isolate platforms that bill request CPU while module evaluation runs during isolate warm-up, laziness moves construction into the first request each fresh isolate serves. Calling `preloadSchemas()` at module scope (it is synchronous and idempotent) moves that one-time cost back to module evaluation; the packages' workerd export condition now does this automatically, while the Node and browser builds stay lazy. The server package gains a dedicated browser shim for this (its `browser` condition previously reused the workerd shim), so browser bundles keep lazy construction.

### Patch Changes

- [#2458](https://github.com/modelcontextprotocol/typescript-sdk/pull/2458) [`7c49b47`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7c49b47fb3a58b51cec8fd0b337f656515f1a2b7) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Construct the default Ajv validation engine lazily on first validation. Creating a `Client` or `Server` no longer pays the ajv + ajv-formats instantiation cost at startup when no JSON Schema validation ever runs.

- [#2476](https://github.com/modelcontextprotocol/typescript-sdk/pull/2476) [`e0a0ab7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e0a0ab74d9baed74572c9f435313fb6daef1b989) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Build protocol-revision wire schemas lazily on first validation instead of at import. Each revision's schema set is now constructed by a module-level memoized factory, so importing the client or server package no longer pays the construction cost of both frozen wire-schema graphs up front. Method membership in the revision registries stays static, the schemas themselves are unchanged, and registry lookups keep returning reference-identical schema objects.

- Updated dependencies [[`8e1d2e9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/8e1d2e92b1720d2520122b3a5f20ea084edaf3c4)]:
    - @modelcontextprotocol/core@2.0.0-beta.4
