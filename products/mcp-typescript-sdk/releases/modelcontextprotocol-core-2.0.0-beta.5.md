---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/core@2.0.0-beta.5"
released_at: "2026-07-21"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/core%402.0.0-beta.5"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/core@2.0.0-beta.5

### Minor Changes

- [#2513](https://github.com/modelcontextprotocol/typescript-sdk/pull/2513) [`f413763`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f4137630c05dc9a4fb14d4d3777f5cb167bd6313) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Align the 2026-07-28 wire with the final revision (spec PR #3002): `serverInfo` moves from the `DiscoverResult` body to the result `_meta`, and the per-request envelope's `clientInfo` demotes from required to SHOULD.

    Before this change the SDK shipped the pre-#3002 shape in both directions: the client hard-rejected a conforming server's `DiscoverResult` (missing body `serverInfo` failed parse, so the probe misclassified the server as legacy and attempted an `initialize` handshake against it — a hard connect failure against a modern-only server such as go-sdk v1.7.0-pre.3), and the server rejected conforming clients that omit `clientInfo`.

    Now:
    - The 2026 wire schemas are the final revision exactly: no body `serverInfo` on `DiscoverResult`, envelope `clientInfo` optional (a present-but-malformed value still fails validation).
    - Servers stamp `_meta['io.modelcontextprotocol/serverInfo']` on every 2026-era response (spec SHOULD; a handler-authored value wins, the 2025-era wire is untouched). This includes the entry-built `subscriptions/listen` graceful-close results — the spec's `SubscriptionsListenResultMeta` extends `ResultMetaObject`.
    - Clients keep sending `clientInfo` and read server identity from the discover result's `_meta` only. A server that stamps no identity is anonymous: `getServerVersion()` is `undefined` and the response cache partitions under a per-connection surrogate. A malformed `_meta` serverInfo value is treated as absent on receive (the spec marks the field self-reported, unverified, and display-only).
    - Breaking type changes: `DiscoverResult` no longer declares `serverInfo`; `RequestMetaEnvelope`'s `clientInfo` is optional. New public constant `SERVER_INFO_META_KEY` (`'io.modelcontextprotocol/serverInfo'`).
