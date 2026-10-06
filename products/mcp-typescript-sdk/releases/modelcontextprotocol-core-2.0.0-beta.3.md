---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/core@2.0.0-beta.3"
released_at: "2026-07-09"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/core%402.0.0-beta.3"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/core@2.0.0-beta.3

### Patch Changes

- [#2456](https://github.com/modelcontextprotocol/typescript-sdk/pull/2456) [`44797d7`](https://github.com/modelcontextprotocol/typescript-sdk/commit/44797d77792953d0ce70b68922bb6bb69e697c32) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Restore the v1 parse tolerance for `CallToolResult.content`: an inbound legacy-era `tools/call` result without `content` defaults to `[]` instead of failing validation. Deployed servers — accepted by SDK v1 for years — return `structuredContent`-only (or otherwise content-less) results, and the strict parse turned every such call into an `INVALID_RESULT` error before application code could run.

    The silent-empty-success hazard the strictness guarded is preserved where it matters: the 2025 era's wire-seam schema refuses to default `content` for a body carrying another result family's vocabulary (`task`, `inputRequests`, `requestState` — the era is frozen, so the list is complete), and the 2026-era wire schemas stay strict — modern-revision servers have no legacy excuse. Task interop through an explicit result schema is untouched (including bodies that also stamp a foreign `resultType`), and the server-side authoring normalization refuses the same foreign-family vocabulary.

    Server-side authoring is era-independent: a handler result without `content` (dynamic/JS callers — the TypeScript surface requires it) is normalized to `content: []` before era validation on every leg, reaching the wire spec-valid.

    Conscious call: the nested sampling `ToolResultContentSchema` stays spec-strict — v1 had defaulted its `content` too, but it is params-side (tool results a caller authors into a sampling message), deliberately not restored.
