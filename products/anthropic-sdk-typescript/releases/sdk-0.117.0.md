---
product: anthropic-sdk-typescript
version: "sdk-v0.117.0"
released_at: "2026-08-13"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.117.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.117.0

## 0.117.0 (2026-08-13)

Full Changelog: [sdk-v0.116.0...sdk-v0.117.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.116.0...sdk-v0.117.0)

### Features

* **api:** add output_behavior to dream creation (create a new memory store or update the input store in place) ([6a5bd0f](https://github.com/anthropics/anthropic-sdk-typescript/commit/6a5bd0f34d214759f97d485e46b09203fff3ea99))


### Bug Fixes

* **build:** include dotfiles when flattening dist during git installs ([917dbbb](https://github.com/anthropics/anthropic-sdk-typescript/commit/917dbbb40070dbd1f861b16fcf297720d96f691b))
* **client:** add models ([a7bfbb1](https://github.com/anthropics/anthropic-sdk-typescript/commit/a7bfbb1b31e9d1dffe9a83b90ec1d0dabf5c36db))
* **messages:** honor per-request timeout in the non-streaming long-request check ([#272](https://github.com/anthropics/anthropic-sdk-typescript/issues/272)) ([0fdd8a8](https://github.com/anthropics/anthropic-sdk-typescript/commit/0fdd8a8feb5d16fbb943490a2b1e8ecf915596d6))
* **streaming:** apply all message_delta fields when accumulating streamed messages ([#289](https://github.com/anthropics/anthropic-sdk-typescript/issues/289)) ([7b82659](https://github.com/anthropics/anthropic-sdk-typescript/commit/7b82659d70201ae3edab846f1693366db7e62ce3))
* **tool-runner:** forward the response container id to the next request ([#271](https://github.com/anthropics/anthropic-sdk-typescript/issues/271)) ([5bdee4a](https://github.com/anthropics/anthropic-sdk-typescript/commit/5bdee4a8ddd83e2f1c71daa429345b3b0fea4602))
* **tools:** align path resolution, skill-archive members, and heartbeat bounds with the other SDKs ([#264](https://github.com/anthropics/anthropic-sdk-typescript/issues/264)) ([5fbc729](https://github.com/anthropics/anthropic-sdk-typescript/commit/5fbc729c82ec3967c9f76428d0f733b5fa61ddd5))


### Chores

* **ci:** run breaking-change detection as a ci.yml job on every push ([c34c1d5](https://github.com/anthropics/anthropic-sdk-typescript/commit/c34c1d53f3227b3978621590e67f5a33f5cad107))
* **internal:** switch from yarn to pnpm ([f4eeea0](https://github.com/anthropics/anthropic-sdk-typescript/commit/f4eeea09648620d35517513814ffdc3bd3080801))
* **tools:** escape backslashes in skill archive exclusion patterns ([#311](https://github.com/anthropics/anthropic-sdk-typescript/issues/311)) ([67ede1c](https://github.com/anthropics/anthropic-sdk-typescript/commit/67ede1c665883b7785af3240c749601d7ca19255))


### Documentation

* **api:** clarify that user profile name is optional for resold profiles ([1b6fed5](https://github.com/anthropics/anthropic-sdk-typescript/commit/1b6fed5868bd16dd92120440d373da22084be237))
