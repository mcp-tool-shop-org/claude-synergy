---
product: anthropic-sdk-csharp
version: "Anthropic-v12.50.0"
released_at: "2026-09-22"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.50.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-csharp Anthropic-v12.50.0

## 12.50.0 (2026-09-22)

Full Changelog: [Anthropic-v12.49.0...Anthropic-v12.50.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.49.0...Anthropic-v12.50.0)

### Features

* **api:** add support for claude-opus-5-5, inline tool definitions and MCP tool-list pinning (beta) ([f9c7c55](https://github.com/anthropics/anthropic-sdk-csharp/commit/f9c7c553b3e2c751892a4f1289d3da7097a77b96))


### Bug Fixes

* **api:** share one evaluated_permission enum across Managed Agents events ([783d859](https://github.com/anthropics/anthropic-sdk-csharp/commit/783d85902f02ca3310b3dd36fe93a7de00539c76))
* **tools:** AddTools takes effect straight away ([#250](https://github.com/anthropics/anthropic-sdk-csharp/issues/250)) ([ec16fde](https://github.com/anthropics/anthropic-sdk-csharp/commit/ec16fdeed473d69a119ef50336ce1c80ce999786))
* **tools:** leave reply-only params off the tool runner's compaction request ([#249](https://github.com/anthropics/anthropic-sdk-csharp/issues/249)) ([bd1483f](https://github.com/anthropics/anthropic-sdk-csharp/commit/bd1483f04861ce9c0c35b704d6b2d1fad3445dfc))


### Chores

* **docs:** add descriptions to the Dreams API reference ([5a28b92](https://github.com/anthropics/anthropic-sdk-csharp/commit/5a28b925987f0dda88cba8254b5ee2eb2abfc5e8))
* **docs:** add descriptions to the User Profiles API reference ([5a28b92](https://github.com/anthropics/anthropic-sdk-csharp/commit/5a28b925987f0dda88cba8254b5ee2eb2abfc5e8))
* **docs:** add memory store descriptions to the Managed Agents API reference ([5a28b92](https://github.com/anthropics/anthropic-sdk-csharp/commit/5a28b925987f0dda88cba8254b5ee2eb2abfc5e8))
* **docs:** improve descriptions in the Dreams API reference ([63d26f3](https://github.com/anthropics/anthropic-sdk-csharp/commit/63d26f3e891fc57b7a9ae6b596cf42f06795acf2))
* **docs:** remove placeholder parameter descriptions ([17905a0](https://github.com/anthropics/anthropic-sdk-csharp/commit/17905a0f319d97cbf5fe219fd25427a567dce400))
* **docs:** simplify the session thread agent type description ([be046f0](https://github.com/anthropics/anthropic-sdk-csharp/commit/be046f04733f26745bf521b51d20c5cb98065b4d))
* **docs:** update diagnostics field descriptions on beta messages ([a521395](https://github.com/anthropics/anthropic-sdk-csharp/commit/a5213954db41037d7c0234a31921bf3bfaa38bfe))


### Documentation

* add path and header parameter descriptions ([dfa3f27](https://github.com/anthropics/anthropic-sdk-csharp/commit/dfa3f2758b37e716bcdb38608e124c234e776683))
