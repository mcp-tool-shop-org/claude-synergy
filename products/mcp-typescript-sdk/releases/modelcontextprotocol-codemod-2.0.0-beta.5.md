---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/codemod@2.0.0-beta.5"
released_at: "2026-07-21"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/codemod%402.0.0-beta.5"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/codemod@2.0.0-beta.5

### Patch Changes

- [#2501](https://github.com/modelcontextprotocol/typescript-sdk/pull/2501) [`1480241`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1480241e2a2a7f0ceee8e7723b2adcf88579bb36) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Export the `Protocol` base class and `mergeCapabilities` from the `@modelcontextprotocol/client` and `@modelcontextprotocol/server` package roots, restoring the v1 import for consumers that subclass `Protocol` (e.g. the MCP Apps SDK). The client and server packages each bundle their own compiled copy of the class, so import it from one package consistently within a process.

    The codemod now rewrites `Protocol` and `mergeCapabilities` imports from `shared/protocol.js` to the client or server package root, like the module's other symbols, instead of dropping them with an action-required marker.
