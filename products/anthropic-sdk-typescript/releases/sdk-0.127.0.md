---
product: anthropic-sdk-typescript
version: "sdk-v0.127.0"
released_at: "2026-09-18"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.127.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.127.0

## 0.127.0 (2026-09-18)

Full Changelog: [sdk-v0.126.0...sdk-v0.127.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.126.0...sdk-v0.127.0)

### Features

* **api:** add group with display_name to rate limits, deprecate group_type ([2575d97](https://github.com/anthropics/anthropic-sdk-typescript/commit/2575d977be0508d0bd3e3c429b758efeb1e240a2))
* **tools:** add compactBeforeNextTurn() to the tool runner ([#682](https://github.com/anthropics/anthropic-sdk-typescript/issues/682)) ([9f75ca6](https://github.com/anthropics/anthropic-sdk-typescript/commit/9f75ca69905ba808709c95f31c4159e74fbf6e19))


### Bug Fixes

* **BetaMessageStream:** stop coercing a null compaction_delta content into "null" ([#655](https://github.com/anthropics/anthropic-sdk-typescript/issues/655)) ([dbd6845](https://github.com/anthropics/anthropic-sdk-typescript/commit/dbd684543914f57d8d974d28ad97769d123e56a1))
* **client:** don't retry requests whose body is a stream or iterator ([eebc1b9](https://github.com/anthropics/anthropic-sdk-typescript/commit/eebc1b995b031c7e288a03c1621a3834cc71f3e3))
* **client:** join multiple anthropic-beta values with a comma and no space ([#638](https://github.com/anthropics/anthropic-sdk-typescript/issues/638)) ([e0cb1ff](https://github.com/anthropics/anthropic-sdk-typescript/commit/e0cb1ff479dcd26e58e47dc1ba8c9d68d191e6b5))
* **client:** make pagination exports on the client namespace type-only ([5adea1f](https://github.com/anthropics/anthropic-sdk-typescript/commit/5adea1f6fa5063b06fe3384f23d46fb0418da3c4))
* **internal:** drop jest from tsconfig types ([60588af](https://github.com/anthropics/anthropic-sdk-typescript/commit/60588af343e0c19cc507e5eaef62fb86f28c4c38))
* **middleware:** echo a streamed compaction summary in the fallback continuation ([#657](https://github.com/anthropics/anthropic-sdk-typescript/issues/657)) ([2e0f004](https://github.com/anthropics/anthropic-sdk-typescript/commit/2e0f0042e8d39d0dccfac8bdcaa42e3d10de626e))
* **tools:** keep $defs when transformJSONSchema root is a $ref ([#687](https://github.com/anthropics/anthropic-sdk-typescript/issues/687)) ([57a9f30](https://github.com/anthropics/anthropic-sdk-typescript/commit/57a9f30bf3cb166666dc8fa3006384977cca8bf6))


### Performance Improvements

* **client:** skip formatting request details when debug logging is off ([2b29ed2](https://github.com/anthropics/anthropic-sdk-typescript/commit/2b29ed2f71ea72beed40fea45f532f5aec64af2d))


### Chores

* **ci:** publish releases from Node 24 with its bundled npm ([6b3c6f5](https://github.com/anthropics/anthropic-sdk-typescript/commit/6b3c6f544a17d268ca24e56458b391bb3ad13b26))
* **docs:** add descriptions for enum values and path parameters ([cb254c4](https://github.com/anthropics/anthropic-sdk-typescript/commit/cb254c48f3d15edb66b77ff36a3835123ef31fc6))
* **docs:** clarify the compaction tool_changes and tool change descriptions ([5a695eb](https://github.com/anthropics/anthropic-sdk-typescript/commit/5a695eb84e48b7e639465aecd09442ac168f78a5))
* **internal:** build the sub-packages with TypeScript 6.0.3 ([8a69ff5](https://github.com/anthropics/anthropic-sdk-typescript/commit/8a69ff594ffeec3f6bd964030086b01ae5354aaf))
* **internal:** build with TypeScript 6.0.3 and typescript-eslint 8.58.0 ([01f3ee6](https://github.com/anthropics/anthropic-sdk-typescript/commit/01f3ee693619bd099ce2a85c76a565a46885be19))
* **internal:** keep lib/internal out of the published exports map ([763fb43](https://github.com/anthropics/anthropic-sdk-typescript/commit/763fb43ee3a8d55fda55d99fe84a3af4d894366c))
* **internal:** re-export pagination classes with a plain export list ([c77bdc3](https://github.com/anthropics/anthropic-sdk-typescript/commit/c77bdc3ce95e56cfce425fb1fb1edf21caa74de5))
* **internal:** share a single Simplify type util ([31d5e75](https://github.com/anthropics/anthropic-sdk-typescript/commit/31d5e7574613a6be77e9be5b88b2e73eef50dca2))
* **internal:** switch unit tests from jest to vitest ([110542d](https://github.com/anthropics/anthropic-sdk-typescript/commit/110542dde844ce5171807af0b8f6dcd14a89a825), [788c9c6](https://github.com/anthropics/anthropic-sdk-typescript/commit/788c9c62ba2bd8180ffc7dcebd1cee14cd692d03))
