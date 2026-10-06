---
product: anthropic-sdk-typescript
version: "sdk-v0.103.0"
released_at: "2026-06-09"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.103.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.103.0

## 0.103.0 (2026-06-09)

Full Changelog: [sdk-v0.102.0...sdk-v0.103.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.102.0...sdk-v0.103.0)

### Features

* **api:** add support for claude-mythos-5 and claude-fable-5, with support for server-side fallbacks on refusal ([cc337f7](https://github.com/anthropics/anthropic-sdk-typescript/commit/cc337f72dcf22d2ffd92f511918330f37ffab652))
* **client:** adds client-side fallbacks middleware for API providers that do not support server-side fallbacks ([cc337f7](https://github.com/anthropics/anthropic-sdk-typescript/commit/cc337f72dcf22d2ffd92f511918330f37ffab652))
* **middleware:** add ctx.logger ([#55](https://github.com/anthropics/anthropic-sdk-typescript/issues/55)) ([edd1454](https://github.com/anthropics/anthropic-sdk-typescript/commit/edd14544173cf60ee2a2bf01acbf14e50bcfdaaa))


### Bug Fixes

* **client:** 3p middleware ordering ([#53](https://github.com/anthropics/anthropic-sdk-typescript/issues/53)) ([2a4c339](https://github.com/anthropics/anthropic-sdk-typescript/commit/2a4c339e6887aa2e8e1278c7b22d3732cf64a76c))
