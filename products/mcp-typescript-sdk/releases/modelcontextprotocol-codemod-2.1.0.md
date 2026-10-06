---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/codemod@2.1.0"
released_at: "2026-09-23"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/codemod%402.1.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/codemod@2.1.0

### Patch Changes

- [#2765](https://github.com/modelcontextprotocol/typescript-sdk/pull/2765) [`5ecc791`](https://github.com/modelcontextprotocol/typescript-sdk/commit/5ecc791d81a7221ebe15ae3ae3f36a8e978af820) Thanks [@claude](https://github.com/apps/claude)! - Project-type inference no longer counts bare SDK paths that appear only in ordinary string data. The v1→v2 codemod's source scanner matched any quoted `@modelcontextprotocol/sdk/client|server` subpath anywhere in a file, so a server path stored as data (example text, a log message, a config value) misclassified a client-only project as `both` — rewriting shared type imports to `@modelcontextprotocol/server` and adding a server dependency the project never uses. The scanner now requires a module-specifier position: static imports and re-exports (`from '...'`), side-effect imports, dynamic `import('...')` (including webpack magic comments), `require('...')` / `require.resolve('...')`, and the `vi.`/`jest.` mock-method calls the mock-paths transform rewrites. Known limitation: the scan is lexical, so a string whose text embeds a complete import statement still counts.
