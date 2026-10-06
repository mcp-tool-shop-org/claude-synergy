---
product: anthropic-sdk-csharp
version: "Anthropic-v12.52.0"
released_at: "2026-09-30"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.52.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-csharp Anthropic-v12.52.0

## 12.52.0 (2026-09-30)

Full Changelog: [Anthropic-v12.51.0...Anthropic-v12.52.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.51.0...Anthropic-v12.52.0)

### Features

* **api:** add a refusal stop reason and stop_details to Managed Agents session idle events ([de3c72d](https://github.com/anthropics/anthropic-sdk-csharp/commit/de3c72d786e12dd3ae99e87173ecbe5db6d027cd))
* **api:** add Claude Enterprise analytics, spend limits, and RBAC groups and roles to the Admin API ([35e80fc](https://github.com/anthropics/anthropic-sdk-csharp/commit/35e80fc97a39da48ba7b69bf3f5a385f210da0fd))
* **api:** add per-user usage and cost reports to the Admin API analytics ([69db0bf](https://github.com/anthropics/anthropic-sdk-csharp/commit/69db0bf35c3943d38524892466f22eaeac1e0955))
* **api:** add Plugins and Plugin Marketplaces to the Admin API ([2831b38](https://github.com/anthropics/anthropic-sdk-csharp/commit/2831b3809b404076b0a3f75cfaa2cc7db6ec829b))
* **api:** add repository error types to Managed Agents session errors ([a3a6a94](https://github.com/anthropics/anthropic-sdk-csharp/commit/a3a6a940ceeb9cd045c57ee96355fcdc599425d3))
* **api:** allow removing a plugin's org-wide installation setting ([8585c41](https://github.com/anthropics/anthropic-sdk-csharp/commit/8585c41b3fb702ca55430d9bffd058629661de13))
* **api:** MCP tunnels beta: add read-only `transport` object to Tunnel and return the one-time relay `token` in the create response ([4c36f08](https://github.com/anthropics/anthropic-sdk-csharp/commit/4c36f087ccd051f533008918e4ddd6898b139273))
* **api:** Organization API endpoints are now GA ([2804c98](https://github.com/anthropics/anthropic-sdk-csharp/commit/2804c984a0cafaa665d6c966f2589426fafe0201))


### Bug Fixes

* **api:** make memory store description, metadata, archived_at required ([24bc644](https://github.com/anthropics/anthropic-sdk-csharp/commit/24bc6445d0eebfb293fbf1f97b7045d52bd5ec8e))
* **api:** type admin plugin preference and marketplace fields as enums ([5243b91](https://github.com/anthropics/anthropic-sdk-csharp/commit/5243b910eb815e89ceca61bc37dd6ce664c0e706))
* **pagination:** auto-paging continues past an empty page while next_page is set ([9eaba95](https://github.com/anthropics/anthropic-sdk-csharp/commit/9eaba95eddb7347898a880cab915da1061d68bfb))


### Chores

* **api:** update MCP Tunnels types and descriptions ([b930975](https://github.com/anthropics/anthropic-sdk-csharp/commit/b9309758ab65bb6abdf5675c052ca55095d708c7))
* **docs:** remove placeholder enum descriptions ([b061143](https://github.com/anthropics/anthropic-sdk-csharp/commit/b061143e90a696112e70c5b8763a60cd522832ee))
