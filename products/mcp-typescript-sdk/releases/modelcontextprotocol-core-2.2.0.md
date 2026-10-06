---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/core@2.2.0"
released_at: "2026-09-28"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/core%402.2.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/core@2.2.0

### Minor Changes

- [#2887](https://github.com/modelcontextprotocol/typescript-sdk/pull/2887) [`edd12e2`](https://github.com/modelcontextprotocol/typescript-sdk/commit/edd12e282620ebf770d67316f19cf91d4112a1bd) Thanks [@maxisbey](https://github.com/maxisbey)! - Constructing `ClientCredentialsProvider`, `PrivateKeyJwtProvider`, `StaticPrivateKeyJwtProvider` or `CrossAppAccessProvider` without `expectedIssuer` is deprecated: the constructor logs one `console.warn` and that call signature is marked `@deprecated`. Behaviour is otherwise unchanged. Pass the `issuer` of the authorization server the credentials were registered with.

    `fetchToken()` throws `AuthorizationServerMismatchError`, before sending anything, when the provider's client information is bound to a different authorization server than the one it is called with. The `AuthorizationServerMismatchError` message no longer assumes the authorization-code callback; its fields are unchanged.

    `OAuthTokensSchema` and `OAuthClientInformationSchema` accept the optional `issuer` stamp, so a provider that reads storage back through them keeps it. `auth()` overwrites it on every save.
