---
product: anthropic-sdk-typescript
version: "sdk-v0.132.0"
released_at: "2026-10-07"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.132.0"
fetched_at: "2026-10-10"
---

# anthropic-sdk-typescript sdk-v0.132.0

## 0.132.0 (2026-10-07)

Full Changelog: [sdk-v0.131.0...sdk-v0.132.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.131.0...sdk-v0.132.0)

### Features

* **api:** add claude-haiku-5-5 and typed computer and browser toolset tool calls ([1fd8261](https://github.com/anthropics/anthropic-sdk-typescript/commit/1fd826175b5742df1dc9fd69db708be1434fdc15))
* **api:** add disabled to thinking types in model capabilities ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))
* **api:** add display_name to RBAC roles and deprecate name ([7735ac3](https://github.com/anthropics/anthropic-sdk-typescript/commit/7735ac3d2823c6d74377269772a5ae2b1ed939dc))
* **api:** add include_default parameter to list workspaces ([c4019df](https://github.com/anthropics/anthropic-sdk-typescript/commit/c4019df3ad38e1ce985c1d8177c815ae36528d61))
* **api:** add lifecycle stage fields and filter to /v1/models ([fe8a762](https://github.com/anthropics/anthropic-sdk-typescript/commit/fe8a762e0cdbc01aa2b4161865f44cdab70f502c))
* **api:** add line to model objects ([018aed4](https://github.com/anthropics/anthropic-sdk-typescript/commit/018aed463f7125ef7c8ee6eec2fd3610be585cc4))
* **api:** add url_sources to the Managed Agents web_fetch tool config ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))
* **api:** add web search and code execution support to model capabilities ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))


### Bug Fixes

* **api:** send the beta header by default when listing spend limits ([8f58ca4](https://github.com/anthropics/anthropic-sdk-typescript/commit/8f58ca41ae4097e82fe0efccfae94e0b7c5719b1))
* **client:** throw when a JSONL stream is iterated twice ([a34266c](https://github.com/anthropics/anthropic-sdk-typescript/commit/a34266cf1ed3483eae7d44d275f761ab29d79748))
* **tools:** keep a local edit made after a memory upload whose response was lost ([#893](https://github.com/anthropics/anthropic-sdk-typescript/issues/893)) ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))


### Chores

* **api:** mark the Text Completions API as deprecated ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))
* **docs:** correct example groups in rate limit list description ([f0e6394](https://github.com/anthropics/anthropic-sdk-typescript/commit/f0e63949cf58aeb877a9d695af519f29245522ef))
* **docs:** correct when usage and cost report data becomes final ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))
* **docs:** describe a federation rule's target by its type ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))
* **docs:** fix example IDs in sessions, agents and vault credentials ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))
* **docs:** update Managed Agents multiagent and thread descriptions ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))
* **docs:** update the activity summaries endpoint description ([24f13f2](https://github.com/anthropics/anthropic-sdk-typescript/commit/24f13f20aa606415f0906ce3d3331dcb80fc2247))
* **docs:** update the description of the Model line field ([e3bfc76](https://github.com/anthropics/anthropic-sdk-typescript/commit/e3bfc76831144a52d6b2dfa7153ae98bd2f849c9))
* **internal:** add REVIEW.md with review instructions ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))
* **internal:** refactor deprecated models ([5927033](https://github.com/anthropics/anthropic-sdk-typescript/commit/59270330d1a1d68e469b06ece5e0819263e17877))
* **tests:** run tests skipped for a query param bug that is now fixed ([4c74721](https://github.com/anthropics/anthropic-sdk-typescript/commit/4c74721d93ea751758fb5eac987ea6541e8c64fa))
* **tests:** run tests that an older mock server could not serve ([8100a49](https://github.com/anthropics/anthropic-sdk-typescript/commit/8100a490769086b56775f3e4f8f1bff9ea678a02))
* **tests:** run the skipped MCP resource upload test ([#888](https://github.com/anthropics/anthropic-sdk-typescript/issues/888)) ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))


### Documentation

* **api:** state the agent tools limit as 256 ([7d2a9ef](https://github.com/anthropics/anthropic-sdk-typescript/commit/7d2a9ef98f39602eaf8cef12ad3f9dfc20c7c839))
* **examples:** show initial_events when creating a Managed Agents session ([2b75b49](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b75b497792ab23c7cac350829354a0027a93246))
