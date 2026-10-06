---
product: mcp-typescript-sdk
version: "@modelcontextprotocol/codemod@2.2.0"
released_at: "2026-09-28"
source_url: "https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/%40modelcontextprotocol/codemod%402.2.0"
fetched_at: "2026-10-06"
---

# mcp-typescript-sdk @modelcontextprotocol/codemod@2.2.0

### Patch Changes

- [#2582](https://github.com/modelcontextprotocol/typescript-sdk/pull/2582) [`f091897`](https://github.com/modelcontextprotocol/typescript-sdk/commit/f091897f4ba6c0519584382e31b68a6ca935f35b) Thanks [@axits-lab](https://github.com/axits-lab)! - The `v1-to-v2` codemod now writes rewritten imports where the first v1 import stood, not at the top of the file, so a license header, `// @ts-nocheck`, `/// <reference>` or a `'use client'` / `'use server'` / `'use strict'` directive above it stays in place. Known gap: when a later step of the codemod replaces or removes the import (for example a file whose only SDK import is `ErrorCode` or `StreamableHTTPError`), the new import can still land above or inside the header, and a `/** */` header can be removed. Files already migrated with codemod 2.1.0 or earlier are not repaired; check the top of those files.
