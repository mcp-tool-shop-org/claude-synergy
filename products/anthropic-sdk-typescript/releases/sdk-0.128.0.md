---
product: anthropic-sdk-typescript
version: "sdk-v0.128.0"
released_at: "2026-09-22"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.128.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.128.0

## 0.128.0 (2026-09-22)

Full Changelog: [sdk-v0.127.0...sdk-v0.128.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.127.0...sdk-v0.128.0)

### Features

* **api:** add support for claude-opus-5-5, inline tool definitions and MCP tool-list pinning (beta) ([eff2748](https://github.com/anthropics/anthropic-sdk-typescript/commit/eff27483d20beffef332312ef764a92c80ec5681))


### Bug Fixes

* **api:** share one evaluated_permission enum across Managed Agents events ([0c1cc0f](https://github.com/anthropics/anthropic-sdk-typescript/commit/0c1cc0fdf89efed709728e7f4fc8ac9ce3149cdb))
* **tools:** addTools() takes effect straight away ([#773](https://github.com/anthropics/anthropic-sdk-typescript/issues/773)) ([1ccdad0](https://github.com/anthropics/anthropic-sdk-typescript/commit/1ccdad0d1b6ad76eefd22085e4653e865e453af3))
* **tools:** leave reply-only params off the tool runner's compaction request ([#769](https://github.com/anthropics/anthropic-sdk-typescript/issues/769)) ([8afc336](https://github.com/anthropics/anthropic-sdk-typescript/commit/8afc3364dc739fb32c9ff4dd2802941c518e4147))


### Chores

* **docs:** add descriptions to the Dreams API reference ([ea4ddd1](https://github.com/anthropics/anthropic-sdk-typescript/commit/ea4ddd1ee391f06fc054e67516cb1a631d3b83ec))
* **docs:** add descriptions to the User Profiles API reference ([ea4ddd1](https://github.com/anthropics/anthropic-sdk-typescript/commit/ea4ddd1ee391f06fc054e67516cb1a631d3b83ec))
* **docs:** add memory store descriptions to the Managed Agents API reference ([ea4ddd1](https://github.com/anthropics/anthropic-sdk-typescript/commit/ea4ddd1ee391f06fc054e67516cb1a631d3b83ec))
* **docs:** improve descriptions in the Dreams API reference ([971c54a](https://github.com/anthropics/anthropic-sdk-typescript/commit/971c54a5dd562aa077ffcbe03883d13523c8d0ed))
* **docs:** simplify the session thread agent type description ([ccf71a2](https://github.com/anthropics/anthropic-sdk-typescript/commit/ccf71a27bd5b66dcd6c663afb2193a33e2041108))
* **docs:** update diagnostics field descriptions on beta messages ([c0b8746](https://github.com/anthropics/anthropic-sdk-typescript/commit/c0b87466791e409df068d7c3b7b8aad43997818f))
* **internal:** add property-based tests for partial JSON parsing ([#776](https://github.com/anthropics/anthropic-sdk-typescript/issues/776)) ([3ffac09](https://github.com/anthropics/anthropic-sdk-typescript/commit/3ffac0927f708de329763083b54266947851d4b4))
