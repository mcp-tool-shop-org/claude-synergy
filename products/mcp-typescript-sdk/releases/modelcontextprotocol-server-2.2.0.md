---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/server@2.2.0"
released_at: "2026-09-28"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/server%402.2.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/server@2.2.0

### Patch Changes

- [#2885](https://github.com/modelcontextprotocol/typescript-sdk/pull/2885) [`9dd722f`](https://github.com/modelcontextprotocol/typescript-sdk/commit/9dd722fd0b533b3cb44cd2834409f7ea4dd32b00) Thanks [@claude](https://github.com/apps/claude)! - Sending a notification on a closed connection no longer produces a briefly unhandled promise rejection (seen as `unhandledrejection` on Cloudflare Workers) in addition to the returned rejection.

- [#2778](https://github.com/modelcontextprotocol/typescript-sdk/pull/2778) [`e3fb9ed`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e3fb9edcdec70ed7c8463548ea9b90bbcb74c4ab) Thanks [@vjymisal0](https://github.com/vjymisal0)! - Fix a stack overflow in `createMcpHandler` when the factory returns the same server instance for more than one request. Returning a fresh instance per request is still required.

- [#2651](https://github.com/modelcontextprotocol/typescript-sdk/pull/2651) [`c55efa6`](https://github.com/modelcontextprotocol/typescript-sdk/commit/c55efa62fc4218592418ffbd313d1a906286f1d3) Thanks [@sushantkumar23](https://github.com/sushantkumar23)! - `createMcpHandler` now ends a `subscriptions/listen` stream right after the acknowledgement when it honored none of the requested notification types, instead of holding the stream open with nothing to deliver. The client receives the acknowledgement and then the `resultType: "complete"` result. Streams that honor at least one type are unchanged.

- Updated dependencies [[`edd12e2`](https://github.com/modelcontextprotocol/typescript-sdk/commit/edd12e282620ebf770d67316f19cf91d4112a1bd)]:
    - @modelcontextprotocol/core@2.2.0
