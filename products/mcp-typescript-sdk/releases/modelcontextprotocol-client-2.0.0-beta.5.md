---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/client@2.0.0-beta.5"
released_at: "2026-07-21"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/client%402.0.0-beta.5"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/client@2.0.0-beta.5

### Minor Changes

- [#2501](https://github.com/modelcontextprotocol/typescript-sdk/pull/2501) [`1480241`](https://github.com/modelcontextprotocol/typescript-sdk/commit/1480241e2a2a7f0ceee8e7723b2adcf88579bb36) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Export the `Protocol` base class and `mergeCapabilities` from the `@modelcontextprotocol/client` and `@modelcontextprotocol/server` package roots, restoring the v1 import for consumers that subclass `Protocol` (e.g. the MCP Apps SDK). The client and server packages each bundle their own compiled copy of the class, so import it from one package consistently within a process.

    The codemod now rewrites `Protocol` and `mergeCapabilities` imports from `shared/protocol.js` to the client or server package root, like the module's other symbols, instead of dropping them with an action-required marker.

- [#2511](https://github.com/modelcontextprotocol/typescript-sdk/pull/2511) [`f60dff0`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f60dff0674954ab516739f21ad9905349c8e9249) Thanks [@felixweinberger](https://github.com/felixweinberger)! - `ConnectOptions.prior` accepts a cached era verdict — the new exported type `PriorDiscovery`. `{ kind: 'modern', discover }` adopts a previously obtained `DiscoverResult` with zero round trips; `{ kind: 'legacy' }` skips the `server/discover` probe and runs the plain `initialize` handshake directly, for servers known out-of-band to be legacy — without pinning the client to `mode: 'legacy'`: stop supplying the verdict and `connect()` falls back to the configured `versionNegotiation` mode (under `'auto'`, it re-probes and rediscovers an upgraded server). Freshness is the supplying host's responsibility — a stale legacy verdict succeeds silently against an upgraded server, so hosts must date cached legacy verdicts in their own storage and stop supplying them past their policy horizon. Persisted-blob plumbing is hardened: `prior: null` is treated as absent, the modern arm's `discover` payload is schema-validated before any connection state changes, and an unrecognized shape rejects with a typed `SdkError(EraNegotiationFailed)` instead of a `TypeError`.

- [#2513](https://github.com/modelcontextprotocol/typescript-sdk/pull/2513) [`f413763`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f4137630c05dc9a4fb14d4d3777f5cb167bd6313) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Align the 2026-07-28 wire with the final revision (spec PR #3002): `serverInfo` moves from the `DiscoverResult` body to the result `_meta`, and the per-request envelope's `clientInfo` demotes from required to SHOULD.

    Before this change the SDK shipped the pre-#3002 shape in both directions: the client hard-rejected a conforming server's `DiscoverResult` (missing body `serverInfo` failed parse, so the probe misclassified the server as legacy and attempted an `initialize` handshake against it — a hard connect failure against a modern-only server such as go-sdk v1.7.0-pre.3), and the server rejected conforming clients that omit `clientInfo`.

    Now:
    - The 2026 wire schemas are the final revision exactly: no body `serverInfo` on `DiscoverResult`, envelope `clientInfo` optional (a present-but-malformed value still fails validation).
    - Servers stamp `_meta['io.modelcontextprotocol/serverInfo']` on every 2026-era response (spec SHOULD; a handler-authored value wins, the 2025-era wire is untouched). This includes the entry-built `subscriptions/listen` graceful-close results — the spec's `SubscriptionsListenResultMeta` extends `ResultMetaObject`.
    - Clients keep sending `clientInfo` and read server identity from the discover result's `_meta` only. A server that stamps no identity is anonymous: `getServerVersion()` is `undefined` and the response cache partitions under a per-connection surrogate. A malformed `_meta` serverInfo value is treated as absent on receive (the spec marks the field self-reported, unverified, and display-only).
    - Breaking type changes: `DiscoverResult` no longer declares `serverInfo`; `RequestMetaEnvelope`'s `clientInfo` is optional. New public constant `SERVER_INFO_META_KEY` (`'io.modelcontextprotocol/serverInfo'`).

### Patch Changes

- [#2514](https://github.com/modelcontextprotocol/typescript-sdk/pull/2514) [`6fe1963`](https://github.com/modelcontextprotocol/typescript-sdk/commit/6fe196310ddba95a9f9655facb6b7c1ab503d346) Thanks [@felixweinberger](https://github.com/felixweinberger)! - Probe stdio servers on a disposable sibling process. Some stdio servers exit on any pre-`initialize` request (servers built on the official Rust SDK, rmcp, behave this way), so under `versionNegotiation: { mode: 'auto' }` the `server/discover` probe previously killed the server and `connect()` hard-failed. The probe now runs on a short-lived sibling spawned from the same parameters — its stderr is discarded and it is reaped once the era is known — and the caller's transport spawns exactly once, afterwards: a legacy verdict connects with the plain `initialize` handshake (byte-identical to `mode: 'legacy'`), a modern verdict is adopted directly, and the session wire never carries `server/discover`. Closing the caller's transport during the probe aborts `connect()` with the typed `SdkError(EraNegotiationFailed)` and the session child is never spawned. On HTTP — and on custom stdio-shaped transports, which probe in place — a mid-probe connection close keeps rejecting with the typed connect error, now naming the close in pin-mode and modern-only diagnostics.

- Updated dependencies [[`f413763`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f4137630c05dc9a4fb14d4d3777f5cb167bd6313)]:
    - @modelcontextprotocol/core@2.0.0-beta.5
