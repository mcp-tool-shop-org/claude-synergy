---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/server@2.4.0"
released_at: "2026-10-23"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/server%402.4.0"
fetched_at: "2026-10-24"
---

# mcp-typescript-sdk @modelcontextprotocol/server@2.4.0

### Minor Changes

- [#3057](https://github.com/modelcontextprotocol/typescript-sdk/pull/3057) [`c05225a`](https://github.com/modelcontextprotocol/typescript-sdk/commit/c05225a636c679870b65f8ca4fe83a76ea1cf113) Thanks [@steipete](https://github.com/steipete)! - `ServerEvent` takes optional `params`, which the `subscriptions/listen` router delivers with its own subscription ID, so a gateway can forward change notifications with their `_meta` and extension params.

- [#3047](https://github.com/modelcontextprotocol/typescript-sdk/pull/3047) [`46d9c99`](https://github.com/modelcontextprotocol/typescript-sdk/commit/46d9c9921b6542e813c1ecc5f9fc964085e8e3bb) Thanks [@KKonstantinov](https://github.com/KKonstantinov), [@tobi-oye](https://github.com/tobi-oye), [@mattzcarey](https://github.com/mattzcarey)! - Add the Skills extension (SEP-2640), reachable through new `ext/skills` subpaths; package root exports are unchanged.
    - `@modelcontextprotocol/server/ext/skills`: `SkillsExtension` (`attach(server)` serves `skills/list`, `skills/get`, `resources/directory/read` and a `skill://{+path}` resource template), `SkillsExtension.load(files)` returning a `SkillCatalog` with `entries` and `reload()`, the `SkillFiles` storage adapter with `memorySkillFiles`, `SkillSource` for generated catalogs, `skillEntry`, and `SkillCatalogError`. Invalid skills are skipped with a warning (`onWarning`), or fail under `strict`. A file whose bytes are valid UTF-8 is served as `text`, whatever its MIME type; any other file as a base64 `blob`.
    - `@modelcontextprotocol/server/ext/skills/node`: `loadSkills(folder)` and `nodeSkillFiles(folder)`.
    - `@modelcontextprotocol/client/ext/skills`: `SkillsClient` with `list()` (throws on an invalid entry; `skipInvalid: true` keeps the valid ones and returns the rest in `invalid`), `get()`, `read(skill, path?)` (size, digest and `SKILL.md` frontmatter verified, `SkillVerificationError` on a mismatch; a copy from the response cache that fails a check is fetched once more with `cacheMode: 'refresh'` first) and `readDirectory()`.
    - `@modelcontextprotocol/core/ext/skills`: schemas, types and constants, including `SKILL_LIMITS`. The result schemas follow the stable spec, so `ttlMs` and `cacheScope` are required.

    `SkillsExtension.attach` is `@experimental`: how an extension is wired to a server may change in a minor release. The rest of the Skills API is stable.

    Works on 2025-11-25 and 2026-07-28. On 2026-07-28 only, the server sends the caching fields (`ttlMs`, `cacheScope`), and `SkillsClient` requires them and returns them from `list()`, `get()` and `readDirectory()`.

### Patch Changes

- [#3083](https://github.com/modelcontextprotocol/typescript-sdk/pull/3083) [`ef38c67`](https://github.com/modelcontextprotocol/typescript-sdk/commit/ef38c6765a15ee29030340dfea28b013893fa0a2) Thanks [@claude](https://github.com/apps/claude)! - The bundled Ajv validator is now built with fast-uri 3.1.8 (was 3.1.0). fast-uri 3.1.6 and later reject a `$id` or `$ref` whose text before the first colon is not a valid URI scheme (`my_tool:output`), or whose URN namespace is not valid (`urn:my_tool:output`): a schema that uses one no longer compiles, and a tool that carries it fails with an invalid-schema error. An underscore without a colon (`my_tool_output`) and a `$ref` into `#/$defs/...` or `#/definitions/...` are not affected.

- [#2960](https://github.com/modelcontextprotocol/typescript-sdk/pull/2960) [`43c45f4`](https://github.com/modelcontextprotocol/typescript-sdk/commit/43c45f4941d824e7251a7d1266823a84af90fab3) Thanks [@claude](https://github.com/apps/claude)! - A server whose tool puts `x-mcp-header` on a `number`-typed parameter keeps checking that tool's `Mcp-Param-*` headers on `tools/call`, as 2.3.0 does: a header that is missing for a value in the body, or that disagrees with the body, is answered `400` with JSON-RPC error `-32020`. Clients on a 2026-07-28 connection other than stdio no longer list such a tool and send no `Mcp-Param-*` headers for it, so a call that carries a value for a declared parameter is rejected the same way; the server logs a warning each time tools are listed. Use an integer (`z.int()`) or remove the annotation.

- [#3081](https://github.com/modelcontextprotocol/typescript-sdk/pull/3081) [`5820f79`](https://github.com/modelcontextprotocol/typescript-sdk/commit/5820f796a48ae6b8e756a7fbfd627e7e2e1ac891) Thanks [@claude](https://github.com/apps/claude)! - A tool `outputSchema` whose root is a `$ref` to a `type: "object"` entry of its own `$defs` or `definitions` (what zod writes for `z.object({...}).meta({ id })`), or a union of such refs, is now treated as an object schema. On 2025-era connections the tool's schema and `structuredContent` are no longer wrapped in `{ result: ... }`, so a 2025-era client that read `structuredContent.result` for such a tool now reads `structuredContent`. On every era the advertised schema gains `type: "object"` at its root.

- [#3057](https://github.com/modelcontextprotocol/typescript-sdk/pull/3057) [`c05225a`](https://github.com/modelcontextprotocol/typescript-sdk/commit/c05225a636c679870b65f8ca4fe83a76ea1cf113) Thanks [@steipete](https://github.com/steipete)! - Connecting a `Server` or `McpServer` to a `PerRequestHTTPServerTransport` classified at a modern revision that `supportedProtocolVersions` lists and the SDK implements now binds that revision, instead of answering `-32022`.

- [#3005](https://github.com/modelcontextprotocol/typescript-sdk/pull/3005) [`b381559`](https://github.com/modelcontextprotocol/typescript-sdk/commit/b381559edc0dbe25ab8324cada345b49bd1d2fc4) Thanks [@chaeyn](https://github.com/chaeyn)! - Reflect resource and resource template `update({ title })` changes in list responses. Preserve other metadata and individual resource titles when a template supplies list entries.

- [#3002](https://github.com/modelcontextprotocol/typescript-sdk/pull/3002) [`895007f`](https://github.com/modelcontextprotocol/typescript-sdk/commit/895007fe728b9c57fbe3ed45fe279ddc51f731f7) Thanks [@Hugo-DDT](https://github.com/Hugo-DDT)! - `createMcpHandler` now sends `Allow: POST` on every `405` it answers to a non-POST request, with `legacy: 'stateless'` (the default) and with `legacy: 'reject'`.

- [#2762](https://github.com/modelcontextprotocol/typescript-sdk/pull/2762) [`b022522`](https://github.com/modelcontextprotocol/typescript-sdk/commit/b022522089a0c8b632595c6e7b536453945ed5a9) Thanks [@pcarleton](https://github.com/pcarleton)! - `x-mcp-header` on a `number`-typed tool parameter is now rejected, matching the 2026-07-28 spec ("Parameters with type `number` are not permitted"; clients MUST exclude such tools from `tools/list`). Previously `number` was accepted only to satisfy an older conformance fixture that has since been corrected. `integer`, `string` and `boolean` are unaffected.

- Updated dependencies [[`46d9c99`](https://github.com/modelcontextprotocol/typescript-sdk/commit/46d9c9921b6542e813c1ecc5f9fc964085e8e3bb)]:
    - @modelcontextprotocol/core@2.4.0
