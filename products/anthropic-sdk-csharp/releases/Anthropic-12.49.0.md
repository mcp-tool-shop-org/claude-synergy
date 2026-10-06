---
product: anthropic-sdk-csharp
version: "Anthropic-v12.49.0"
released_at: "2026-09-18"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.49.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-csharp Anthropic-v12.49.0

## 12.49.0 (2026-09-18)

Full Changelog: [Anthropic-v12.48.0...Anthropic-v12.49.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.48.0...Anthropic-v12.49.0)

### Features

* **api:** add group with display_name to rate limits, deprecate group_type ([05fd63c](https://github.com/anthropics/anthropic-sdk-csharp/commit/05fd63cfa6ac3a9f8dde84bc24b7682fae2de199))
* **tools:** add CompactBeforeNextTurn() to the tool runner ([#239](https://github.com/anthropics/anthropic-sdk-csharp/issues/239)) ([61cbe8b](https://github.com/anthropics/anthropic-sdk-csharp/commit/61cbe8b9b0b32e3a1f8342da3a4fef1fb5c1440f))


### Bug Fixes

* **client:** don't replay a stream upload on the 401 token-refresh retry ([#240](https://github.com/anthropics/anthropic-sdk-csharp/issues/240)) ([2617360](https://github.com/anthropics/anthropic-sdk-csharp/commit/26173606cc35caf987a26ba5273d75e29df115b0))
* **client:** join multiple anthropic-beta values with a comma and no space ([#237](https://github.com/anthropics/anthropic-sdk-csharp/issues/237)) ([5e47840](https://github.com/anthropics/anthropic-sdk-csharp/commit/5e47840dbc37598481cf86fd0720969ea4887690))
* **client:** retry file uploads given as bytes; send stream uploads once ([6e4229e](https://github.com/anthropics/anthropic-sdk-csharp/commit/6e4229ed833485f0b41231584049d6288d0870d7))
* **helpers:** keep absent encrypted_content out of streamed compaction blocks ([#242](https://github.com/anthropics/anthropic-sdk-csharp/issues/242)) ([716475c](https://github.com/anthropics/anthropic-sdk-csharp/commit/716475ca4e95a2448feefc96992e97dc230ce524))
* **meai:** honour RequiredChatToolMode.RequiredFunctionName as tool_choice.tool ([#265](https://github.com/anthropics/anthropic-sdk-csharp/issues/265)) ([dd51ea0](https://github.com/anthropics/anthropic-sdk-csharp/commit/dd51ea06dee67c254bd46117132bf67db5e79058))
* **meai:** keep type-specific keywords on union-typed schema nodes ([#266](https://github.com/anthropics/anthropic-sdk-csharp/issues/266)) ([0cb6328](https://github.com/anthropics/anthropic-sdk-csharp/commit/0cb6328ccfd7307947ebb8a1ce0f03349fcbdd2a))


### Chores

* **docs:** add descriptions for enum values and path parameters ([b30baae](https://github.com/anthropics/anthropic-sdk-csharp/commit/b30baae3d5e5623e1e4081f703395792d10ac94b))
* **docs:** clarify the compaction tool_changes and tool change descriptions ([850c348](https://github.com/anthropics/anthropic-sdk-csharp/commit/850c3481edb43e6728d0add742a1278a9f4913a3))
