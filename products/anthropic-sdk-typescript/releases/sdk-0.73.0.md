---
product: anthropic-sdk-typescript
package: "sdk"
version: "0.73.0"
tag: "sdk-v0.73.0"
released_at: "2026-02-05"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.73.0"
fetched_at: "2026-05-21"
---

# anthropic-sdk-typescript sdk@0.73.0

## 0.73.0 (2026-02-05)

Full Changelog: [sdk-v0.72.1...sdk-v0.73.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.72.1...sdk-v0.73.0)

### Features

* **api:** Release Claude Opus 4.6, adaptive thinking, and other features ([f741f92](https://github.com/anthropics/anthropic-sdk-typescript/commit/f741f921d10e020d3c67c7a3f8442f0c4adf229d))


### Bug Fixes

* **client:** avoid memory leak in abort signal listener ([#895](https://github.com/anthropics/anthropic-sdk-typescript/issues/895)) ([3bdd153](https://github.com/anthropics/anthropic-sdk-typescript/commit/3bdd153c43280adf233a2d7d7d9bb55cd5ad4c26))
* **client:** avoid memory leak with abort signals ([53e47df](https://github.com/anthropics/anthropic-sdk-typescript/commit/53e47dfa6985e6a206c475b8c920b8a97c27e17e))
* **client:** avoid removing abort listener too early ([cd6e832](https://github.com/anthropics/anthropic-sdk-typescript/commit/cd6e83255a2e5644872902ee878c9aba881976cb))


### Chores

* **client:** do not parse responses with empty content-length ([2be2df9](https://github.com/anthropics/anthropic-sdk-typescript/commit/2be2df928d1564286cddc9765fd9959f9649d314))
* **client:** restructure abort controller binding ([0eeacb6](https://github.com/anthropics/anthropic-sdk-typescript/commit/0eeacb6c310d961e09ac3d00b4b2e50957b31e2f))
* **internal:** fix pagination internals not accepting option promises ([7c23a3f](https://github.com/anthropics/anthropic-sdk-typescript/commit/7c23a3f93d039116845b045ede8863ffbafbad85))
* remove claude-code-review workflow ([#644](https://github.com/anthropics/anthropic-sdk-typescript/issues/644)) ([ad09c76](https://github.com/anthropics/anthropic-sdk-typescript/commit/ad09c76b0d323c0a867d23f765f20909cddbd885))
