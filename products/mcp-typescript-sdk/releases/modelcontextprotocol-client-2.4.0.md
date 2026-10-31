---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/client@2.4.0"
released_at: "2026-10-23"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/client%402.4.0"
fetched_at: "2026-10-31"
---

# mcp-typescript-sdk @modelcontextprotocol/client@2.4.0

### Minor Changes

- [#3085](https://github.com/modelcontextprotocol/typescript-sdk/pull/3085) [`a633756`](https://github.com/modelcontextprotocol/typescript-sdk/commit/a63375661399956a744ff8b34d03d36e3d09e98a) Thanks [@claude](https://github.com/apps/claude)! - Add an opt-in for sending `scope` on refresh-token requests, for authorization servers that reject a refresh without it (Microsoft Entra ID answers `AADSTS90009` when the client and the resource are the same app registration, #2718). `OAuthClientProvider` gains an optional `scopeForRefresh(tokens)`: `auth()`, and so the transports and `withOAuth`, sends the string it returns. `refreshAuthorization()` gains an optional `scope`. When a scope is sent and the response has none, the sent scope is kept on the returned tokens. Without either option the refresh request and the saved tokens are unchanged.

- [#3047](https://github.com/modelcontextprotocol/typescript-sdk/pull/3047) [`46d9c99`](https://github.com/modelcontextprotocol/typescript-sdk/commit/46d9c9921b6542e813c1ecc5f9fc964085e8e3bb) Thanks [@KKonstantinov](https://github.com/KKonstantinov), [@tobi-oye](https://github.com/tobi-oye), [@mattzcarey](https://github.com/mattzcarey)! - Add the Skills extension (SEP-2640), reachable through new `ext/skills` subpaths; package root exports are unchanged.
    - `@modelcontextprotocol/server/ext/skills`: `SkillsExtension` (`attach(server)` serves `skills/list`, `skills/get`, `resources/directory/read` and a `skill://{+path}` resource template), `SkillsExtension.load(files)` returning a `SkillCatalog` with `entries` and `reload()`, the `SkillFiles` storage adapter with `memorySkillFiles`, `SkillSource` for generated catalogs, `skillEntry`, and `SkillCatalogError`. Invalid skills are skipped with a warning (`onWarning`), or fail under `strict`. A file whose bytes are valid UTF-8 is served as `text`, whatever its MIME type; any other file as a base64 `blob`.
    - `@modelcontextprotocol/server/ext/skills/node`: `loadSkills(folder)` and `nodeSkillFiles(folder)`.
    - `@modelcontextprotocol/client/ext/skills`: `SkillsClient` with `list()` (throws on an invalid entry; `skipInvalid: true` keeps the valid ones and returns the rest in `invalid`), `get()`, `read(skill, path?)` (size, digest and `SKILL.md` frontmatter verified, `SkillVerificationError` on a mismatch; a copy from the response cache that fails a check is fetched once more with `cacheMode: 'refresh'` first) and `readDirectory()`.
    - `@modelcontextprotocol/core/ext/skills`: schemas, types and constants, including `SKILL_LIMITS`. The result schemas follow the stable spec, so `ttlMs` and `cacheScope` are required.

    `SkillsExtension.attach` is `@experimental`: how an extension is wired to a server may change in a minor release. The rest of the Skills API is stable.

    Works on 2025-11-25 and 2026-07-28. On 2026-07-28 only, the server sends the caching fields (`ttlMs`, `cacheScope`), and `SkillsClient` requires them and returns them from `list()`, `get()` and `readDirectory()`.

### Patch Changes

- [#3083](https://github.com/modelcontextprotocol/typescript-sdk/pull/3083) [`ef38c67`](https://github.com/modelcontextprotocol/typescript-sdk/commit/ef38c6765a15ee29030340dfea28b013893fa0a2) Thanks [@claude](https://github.com/apps/claude)! - The bundled Ajv validator is now built with fast-uri 3.1.8 (was 3.1.0). fast-uri 3.1.6 and later reject a `$id` or `$ref` whose text before the first colon is not a valid URI scheme (`my_tool:output`), or whose URN namespace is not valid (`urn:my_tool:output`): a schema that uses one no longer compiles, and a tool that carries it fails with an invalid-schema error. An underscore without a colon (`my_tool_output`) and a `$ref` into `#/$defs/...` or `#/definitions/...` are not affected.

- [#2762](https://github.com/modelcontextprotocol/typescript-sdk/pull/2762) [`b022522`](https://github.com/modelcontextprotocol/typescript-sdk/commit/b022522089a0c8b632595c6e7b536453945ed5a9) Thanks [@pcarleton](https://github.com/pcarleton)! - `x-mcp-header` on a `number`-typed tool parameter is now rejected, matching the 2026-07-28 spec ("Parameters with type `number` are not permitted"; clients MUST exclude such tools from `tools/list`). Previously `number` was accepted only to satisfy an older conformance fixture that has since been corrected. `integer`, `string` and `boolean` are unaffected.

- Updated dependencies [[`46d9c99`](https://github.com/modelcontextprotocol/typescript-sdk/commit/46d9c9921b6542e813c1ecc5f9fc964085e8e3bb)]:
    - @modelcontextprotocol/core@2.4.0
