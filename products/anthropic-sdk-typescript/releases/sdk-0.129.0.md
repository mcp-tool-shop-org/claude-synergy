---
product: anthropic-sdk-typescript
version: "sdk-v0.129.0"
released_at: "2026-09-28"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.129.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.129.0

## 0.129.0 (2026-09-28)

Full Changelog: [sdk-v0.128.0...sdk-v0.129.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.128.0...sdk-v0.129.0)

### Features

* **api:** add between_tools thinking type ([ab51075](https://github.com/anthropics/anthropic-sdk-typescript/commit/ab51075609a2d583dffdca24856f4214779d9e7f))
* **api:** add claude-sonnet-5-5 ([4e77366](https://github.com/anthropics/anthropic-sdk-typescript/commit/4e7736625fd23a5607800e8de4aa3c37daa74a07))
* **api:** add ClientToolUnion type for client-executed tools ([2c1d2d7](https://github.com/anthropics/anthropic-sdk-typescript/commit/2c1d2d712071a5f10d2e70ea02dc33425b087799))
* **api:** add include_inherited and source to workspace rate limits ([66e925e](https://github.com/anthropics/anthropic-sdk-typescript/commit/66e925e54ff3435a56f51f687641728b94aff306))
* **api:** add typed event type values to the Managed Agents events list filter ([8ac4a26](https://github.com/anthropics/anthropic-sdk-typescript/commit/8ac4a26809418453b64fee79f8ec790d32d1f92c))
* **api:** cache diagnostics GA — diagnostics on Message / MessageCreateParams ([5ba5f29](https://github.com/anthropics/anthropic-sdk-typescript/commit/5ba5f29696d520f68a794936eff7337dce83ac05))
* **tools:** optionally start tool calls while the reply streams ([083969b](https://github.com/anthropics/anthropic-sdk-typescript/commit/083969beadb360b9c4b329ee2541f67bd78d9caf))


### Bug Fixes

* **client:** also send X-Stainless-Timeout for client-level timeouts ([b84783b](https://github.com/anthropics/anthropic-sdk-typescript/commit/b84783b6ee03eed519d622ea1e477cf8eb3863bf))
* **client:** send upload filenames as given, with no placeholder ([f9d3e98](https://github.com/anthropics/anthropic-sdk-typescript/commit/f9d3e980b1b498c1c452300a205811f6a56de69b))
* **helpers:** degrade between_tools thinking to disabled on fallback hops ([#841](https://github.com/anthropics/anthropic-sdk-typescript/issues/841)) ([edbbf05](https://github.com/anthropics/anthropic-sdk-typescript/commit/edbbf05a62ffe2c95c13810f6d7a0a2796786e5f))
* **internal:** let bundlers drop unused classes with more than ten private-member assignments ([67c7adb](https://github.com/anthropics/anthropic-sdk-typescript/commit/67c7adbe5ebae805631e104b341d932a1554bda8))
* **streaming:** show every complete array item and hold back unfinished numbers in partial tool input ([#781](https://github.com/anthropics/anthropic-sdk-typescript/issues/781)) ([5806588](https://github.com/anthropics/anthropic-sdk-typescript/commit/58065889d6b112db6da5127484e0a24025e3fa37))


### Performance Improvements

* **streaming:** drop the redundant iterSSEChunks layer ([0357f81](https://github.com/anthropics/anthropic-sdk-typescript/commit/0357f812dab273c0780c558606663a03e93e34df))
* **streaming:** take each string token as one slice in the partial JSON tokenizer ([#255](https://github.com/anthropics/anthropic-sdk-typescript/issues/255)) ([cdfb1e5](https://github.com/anthropics/anthropic-sdk-typescript/commit/cdfb1e55afebe1c3be50401ca56bebf0ff009a4e))


### Chores

* **api:** deprecate the betas param on GA models and completions methods ([5c74e45](https://github.com/anthropics/anthropic-sdk-typescript/commit/5c74e4532bb69f22afa3e08013645ac059440aef))
* **api:** list the known model ids first in the Model types ([9452822](https://github.com/anthropics/anthropic-sdk-typescript/commit/94528226386311c3ade468cbdea0326c06a1e53d))
* **ci:** choose the CI runner by repository ([33db1ec](https://github.com/anthropics/anthropic-sdk-typescript/commit/33db1ec2e99a415ff98619cf88ddddbf2b7ca7b1))
* **docs:** clarify that stream: true returns the raw event stream ([4286c22](https://github.com/anthropics/anthropic-sdk-typescript/commit/4286c227c3a605bf04d4f59ffb496f44c102a6ec))
* **docs:** make Managed Agents actor descriptions resource-neutral ([15733f9](https://github.com/anthropics/anthropic-sdk-typescript/commit/15733f98deaae4aee2fba26c1bfe4ee1514c7080))
* **docs:** restore the research-preview notice on the Dream type ([b32f8ba](https://github.com/anthropics/anthropic-sdk-typescript/commit/b32f8baa27c40ad5901531024bae86e0ca046bb5))
* **internal:** move old constants around ([0cd8edf](https://github.com/anthropics/anthropic-sdk-typescript/commit/0cd8edfdc6dd91af4ffee4ed3cc7fc8cc22d65e3))
* **tests:** add diagnostics to the parser test's Message fixtures ([eb5ca58](https://github.com/anthropics/anthropic-sdk-typescript/commit/eb5ca58d51ed3309b1f317b20f7d248b036ba76a))
* **tools:** remove client-side compaction control ([#802](https://github.com/anthropics/anthropic-sdk-typescript/issues/802)) ([9c3e8a5](https://github.com/anthropics/anthropic-sdk-typescript/commit/9c3e8a5ffa38c35dec32f0258becd360babd5fb1))


### Documentation

* **api:** prefer each field's own description over its shared type's ([5193478](https://github.com/anthropics/anthropic-sdk-typescript/commit/51934782720725acca570edeb0a3a7501ca7dbd8))
* expand CLAUDE.md into a full contributor guide ([98d2ddb](https://github.com/anthropics/anthropic-sdk-typescript/commit/98d2ddbce7c1eabbabe5a130d18d307c237fb75c))
