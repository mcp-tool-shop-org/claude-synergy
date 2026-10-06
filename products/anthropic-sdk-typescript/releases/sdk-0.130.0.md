---
product: anthropic-sdk-typescript
version: "sdk-v0.130.0"
released_at: "2026-09-30"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.130.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.130.0

## 0.130.0 (2026-09-30)

Full Changelog: [sdk-v0.129.0...sdk-v0.130.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.129.0...sdk-v0.130.0)

### Features

* **api:** add a refusal stop reason and stop_details to Managed Agents session idle events ([5cd6910](https://github.com/anthropics/anthropic-sdk-typescript/commit/5cd6910a0e74923f1bef35f5368f9c2cee410058))
* **api:** add Claude Enterprise analytics, spend limits, and RBAC groups and roles to the Admin API ([109c766](https://github.com/anthropics/anthropic-sdk-typescript/commit/109c76647ab5c997820e3d316f4df192926e4156))
* **api:** add per-user usage and cost reports to the Admin API analytics ([0a74a28](https://github.com/anthropics/anthropic-sdk-typescript/commit/0a74a2833469e2972d08b866bbfcecb096138f73))
* **api:** add Plugins and Plugin Marketplaces to the Admin API ([40c2160](https://github.com/anthropics/anthropic-sdk-typescript/commit/40c2160271c63605f161c0d0dd8a8aff0fcf81de))
* **api:** add repository error types to Managed Agents session errors ([6735615](https://github.com/anthropics/anthropic-sdk-typescript/commit/673561514091a1339b3350f1beb2ae2ec2528528))
* **api:** allow removing a plugin's org-wide installation setting ([c7d120f](https://github.com/anthropics/anthropic-sdk-typescript/commit/c7d120f29a15b79d3560322836be7b91c5c0b2be))
* **api:** MCP tunnels beta: add read-only `transport` object to Tunnel and return the one-time relay `token` in the create response ([b0e57ce](https://github.com/anthropics/anthropic-sdk-typescript/commit/b0e57ce51410dccafee49103bd1e0d3b307e3504))
* **api:** Organization API endpoints are now GA ([1a1fd8f](https://github.com/anthropics/anthropic-sdk-typescript/commit/1a1fd8f8d7e5b55f4f759150b5c4064da1df45ac))


### Bug Fixes

* **api:** make memory store description, metadata, archived_at required ([ed68900](https://github.com/anthropics/anthropic-sdk-typescript/commit/ed68900ed31097a089afbdf0b681446020b642ce))
* **api:** type admin plugin preference and marketplace fields as enums ([942ae01](https://github.com/anthropics/anthropic-sdk-typescript/commit/942ae01dc1b9fa0c6cad49ed564c4824e36d3e81))
* **pagination:** auto-paging continues past an empty page while next_page is set ([2d75266](https://github.com/anthropics/anthropic-sdk-typescript/commit/2d75266273fcb7908b3ab24a53d3cdcda2b66002))
* **tool-runner:** only send API fields for runnable tools ([#404](https://github.com/anthropics/anthropic-sdk-typescript/issues/404)) ([a62c2a2](https://github.com/anthropics/anthropic-sdk-typescript/commit/a62c2a2d12234be38f620b60526f179b39e5c738))
* **tools:** stop the session tool runner after any idle that ends the turn ([#878](https://github.com/anthropics/anthropic-sdk-typescript/issues/878)) ([cab32f8](https://github.com/anthropics/anthropic-sdk-typescript/commit/cab32f8b2bea8514572f39a557d08b44ee86568c))


### Chores

* **api:** update MCP Tunnels types and descriptions ([394d60c](https://github.com/anthropics/anthropic-sdk-typescript/commit/394d60cf15873544c3b34a609f8a194d0f566182))
* **docs:** remove placeholder enum descriptions ([04f0812](https://github.com/anthropics/anthropic-sdk-typescript/commit/04f0812ca0c7e761fa58bffdfd95b9cf1f24887c))
* **tests:** fixture update ([#381](https://github.com/anthropics/anthropic-sdk-typescript/issues/381)) ([9cfe4d4](https://github.com/anthropics/anthropic-sdk-typescript/commit/9cfe4d42d097ead9c102dee310fbf674642067d3))
