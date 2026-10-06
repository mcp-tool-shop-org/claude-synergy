---
product: anthropic-sdk-typescript
version: "sdk-v0.118.0"
released_at: "2026-08-19"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.118.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.118.0

## 0.118.0 (2026-08-18)

Full Changelog: [sdk-v0.117.1...sdk-v0.118.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.117.1...sdk-v0.118.0)

### Features

* **api:** additions to files and memory stores ([fdc0379](https://github.com/anthropics/anthropic-sdk-typescript/commit/fdc03790dc3e7fb0352298382f8a9603e92e19c2))
* **api:** updates to skill, files, and user profiles ([671e6b1](https://github.com/anthropics/anthropic-sdk-typescript/commit/671e6b187f475b5a7a797adbbe5b908bd74d3935))
* **client:** add helpers for accessing the workspace ID in response headers ([28aa5af](https://github.com/anthropics/anthropic-sdk-typescript/commit/28aa5afe3284bcdc2cc35264f6f4d8dd762e186f))


### Bug Fixes

* **api:** remove unsupported mid_conv_system content block ([ae6ca94](https://github.com/anthropics/anthropic-sdk-typescript/commit/ae6ca9403125b5a0effb22c9d9c65804a99a80bd))
* **session-runner:** retry tool-result sends for at least the lease TTL ([#339](https://github.com/anthropics/anthropic-sdk-typescript/issues/339)) ([7dc6325](https://github.com/anthropics/anthropic-sdk-typescript/commit/7dc632557bfea8475aab8345e27469f02faa6a5a))


### Chores

* **internal:** bump zod to 4.4.3 ([#334](https://github.com/anthropics/anthropic-sdk-typescript/issues/334)) ([faa5b7b](https://github.com/anthropics/anthropic-sdk-typescript/commit/faa5b7b841a31967ee4679423c22802d4e70c79f))
* **internal:** remove leftover prism references ([a163b96](https://github.com/anthropics/anthropic-sdk-typescript/commit/a163b960ce982ffb2827a0e95a5ae05a1120aa51))
* stop shipping the v0.50 migration guide and migrate CLI ([53992d7](https://github.com/anthropics/anthropic-sdk-typescript/commit/53992d708ba024c25adabc864fe0268cc065865d))


### Documentation

* **tools:** warn that blocking tool bodies stall the worker heartbeat ([#299](https://github.com/anthropics/anthropic-sdk-typescript/issues/299)) ([908fdb5](https://github.com/anthropics/anthropic-sdk-typescript/commit/908fdb5d9de8809190bdcf9d14a8319e80d8f31c))
