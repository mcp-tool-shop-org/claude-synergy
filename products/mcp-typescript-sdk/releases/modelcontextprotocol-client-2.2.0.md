---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/client@2.2.0"
released_at: "2026-09-28"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/client%402.2.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/client@2.2.0

### Minor Changes

- [#2887](https://github.com/modelcontextprotocol/typescript-sdk/pull/2887) [`edd12e2`](https://github.com/modelcontextprotocol/typescript-sdk/commit/edd12e282620ebf770d67316f19cf91d4112a1bd) Thanks [@maxisbey](https://github.com/maxisbey)! - Constructing `ClientCredentialsProvider`, `PrivateKeyJwtProvider`, `StaticPrivateKeyJwtProvider` or `CrossAppAccessProvider` without `expectedIssuer` is deprecated: the constructor logs one `console.warn` and that call signature is marked `@deprecated`. Behaviour is otherwise unchanged. Pass the `issuer` of the authorization server the credentials were registered with.

    `fetchToken()` throws `AuthorizationServerMismatchError`, before sending anything, when the provider's client information is bound to a different authorization server than the one it is called with. The `AuthorizationServerMismatchError` message no longer assumes the authorization-code callback; its fields are unchanged.

    `OAuthTokensSchema` and `OAuthClientInformationSchema` accept the optional `issuer` stamp, so a provider that reads storage back through them keeps it. `auth()` overwrites it on every save.

### Patch Changes

- [#2885](https://github.com/modelcontextprotocol/typescript-sdk/pull/2885) [`9dd722f`](https://github.com/modelcontextprotocol/typescript-sdk/commit/9dd722fd0b533b3cb44cd2834409f7ea4dd32b00) Thanks [@claude](https://github.com/apps/claude)! - Sending a notification on a closed connection no longer produces a briefly unhandled promise rejection (seen as `unhandledrejection` on Cloudflare Workers) in addition to the returned rejection.

- [#2883](https://github.com/modelcontextprotocol/typescript-sdk/pull/2883) [`c0f7aec`](https://github.com/modelcontextprotocol/typescript-sdk/commit/c0f7aec2925a46b32dc2f2aad5bf636a36f02c78) Thanks [@claude](https://github.com/apps/claude)! - Fix a type-check failure for CommonJS TypeScript projects introduced in 2.1.0: `dist/index.d.cts` imported types from `jose`, which is ESM-only, so `tsc` with `module: node16`/`node18` and `skipLibCheck: false` failed with TS1479. The two `jose` types used by the DPoP API (`CryptoKey`, `JWK`) are now inlined into the declaration files. No runtime change.

- [#2768](https://github.com/modelcontextprotocol/typescript-sdk/pull/2768) [`efebf5b`](https://github.com/modelcontextprotocol/typescript-sdk/commit/efebf5b2ba2f07c6fa27ada824a0999b801fec0a) Thanks [@web-abin](https://github.com/web-abin)! - Correct the JSDoc for insecure OAuth token endpoints. The TLS requirement comes from the MCP authorization specification's OAuth 2.1 communication-security rules, not SEP-2207, which covers OIDC-flavored refresh-token guidance. Documentation only; no runtime behavior change.

- [#2729](https://github.com/modelcontextprotocol/typescript-sdk/pull/2729) [`a4ae2f9`](https://github.com/modelcontextprotocol/typescript-sdk/commit/a4ae2f98da3814a9290f2791cfcca8148dcec978) Thanks [@claude](https://github.com/apps/claude)! - Correct the `registerClient` `@deprecated` notice: Dynamic Client Registration was deprecated by spec PR modelcontextprotocol#2858 (Client ID Metadata Documents), not SEP-2577 (which deprecates roots, sampling, and logging). The notice now also names the earliest possible removal date under the feature lifecycle policy (2027-07-28) and clarifies that the `client_id_metadata_document_supported` gating lives in the built-in `auth()` flow — `registerClient` called directly always sends the registration request. Documentation only; no runtime behavior change.

- [#2862](https://github.com/modelcontextprotocol/typescript-sdk/pull/2862) [`e780e13`](https://github.com/modelcontextprotocol/typescript-sdk/commit/e780e13869ad419a864b669bd5fa9702cfb36b14) Thanks [@SyedTashfin](https://github.com/SyedTashfin)! - Preserve `_meta` on `input_required` results. The 2026-07-28 decode seam rebuilt the payload from `inputRequests` and `requestState` only, so result-level metadata a server sent on an `input_required` result (including `io.modelcontextprotocol/serverInfo`) was dropped before an `allowInputRequired: true` caller could see it. `Result._meta` is a result-level field, so `input_required` carries it exactly like any other result.

- [#2886](https://github.com/modelcontextprotocol/typescript-sdk/pull/2886) [`ef39308`](https://github.com/modelcontextprotocol/typescript-sdk/commit/ef39308e963496b75e50553f6265d99cacb4fbb9) Thanks [@claude](https://github.com/apps/claude)! - `listTools()`, `listPrompts()`, `listResources()` and `listResourceTemplates()` called without a cursor now follow `nextCursor` until the server stops sending one, instead of stopping silently with a short list when a cursor repeats; a page that has the same items and the same `nextCursor` as the page before it ends the walk and is not added twice, and `listMaxPages` still caps the walk.

- [#2642](https://github.com/modelcontextprotocol/typescript-sdk/pull/2642) [`cfa09db`](https://github.com/modelcontextprotocol/typescript-sdk/commit/cfa09db614308eaf4fd575c89833da8878d4acb7) Thanks [@claude](https://github.com/apps/claude)! - Fix `Client.listen()` rejections escaping as process-level unhandled rejections. The internal `opening` promise could reject (ack timeout, transport close, server cancel, caller abort) while `listen()` was still serially awaiting `transport.send(...)`, so no rejection handler was attached yet — the rejection surfaced as an `unhandledRejection` that caller-side handling cannot prevent, and a send that never settles (e.g. a stdio write parked on `'drain'`) left `listen()` suspended forever even though the ack timer had already fired. `listen()` now suspends on the `opening` state machine directly and routes send failures into it, so every termination path rejects the returned promise and nothing escapes.

- [#2597](https://github.com/modelcontextprotocol/typescript-sdk/pull/2597) [`7f7a94c`](https://github.com/modelcontextprotocol/typescript-sdk/commit/7f7a94c22017e121a960e071bb50ec75e34450bd) Thanks [@arimu1](https://github.com/arimu1)! - Treat hostnames ending in `.localhost` as loopback for the SEP-2207 token-endpoint https guard (RFC 6761 §6.3), so host-based multi-tenant local OAuth works. The SDK does not resolve the name itself: `*.localhost` reaches the local machine only if the system resolver follows RFC 6761.

- Updated dependencies [[`edd12e2`](https://github.com/modelcontextprotocol/typescript-sdk/commit/edd12e282620ebf770d67316f19cf91d4112a1bd)]:
    - @modelcontextprotocol/core@2.2.0
