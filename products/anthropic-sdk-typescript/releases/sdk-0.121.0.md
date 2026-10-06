---
product: anthropic-sdk-typescript
version: "sdk-v0.121.0"
released_at: "2026-08-26"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.121.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.121.0

## 0.121.0 (2026-08-26)

Full Changelog: [sdk-v0.120.0...sdk-v0.121.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.120.0...sdk-v0.121.0)

### Features

* **api:** add `updates` thinking display mode (beta) ([22274ea](https://github.com/anthropics/anthropic-sdk-typescript/commit/22274eaf968edc62a8b9e1f39a1913f5e04b2ada))
* **api:** add missing anthropic-beta values ([0779f02](https://github.com/anthropics/anthropic-sdk-typescript/commit/0779f02666cfc6088c1555ee25e8cd8677e421da))
* **api:** add support for Organization API endpoints ([8b61e7a](https://github.com/anthropics/anthropic-sdk-typescript/commit/8b61e7a4d441d662cd121c94c6d27dbffa5c294a))
* **helpers:** support Standard Schema for structured outputs and tools ([7880078](https://github.com/anthropics/anthropic-sdk-typescript/commit/788007889c048e18f6bdf19d4903f1ac96f66cb0))


### Bug Fixes

* **tools:** keep the tool runner going on pause_turn ([#288](https://github.com/anthropics/anthropic-sdk-typescript/issues/288)) ([f040dc9](https://github.com/anthropics/anthropic-sdk-typescript/commit/f040dc9d39a3ec471a87ac8eb93387fb7d9960c3))
* **types:** don't reference NodeJS.ProcessEnv from published types ([#367](https://github.com/anthropics/anthropic-sdk-typescript/issues/367)) ([fd38dfd](https://github.com/anthropics/anthropic-sdk-typescript/commit/fd38dfdc48beec5d0d3640b65ac3e467bc73ea4e))


### Chores

* **docs:** clarify skill version `latest` support and memory version retention ([7405a69](https://github.com/anthropics/anthropic-sdk-typescript/commit/7405a692be3ab6728037223482337f640cfa00b9))
* **examples:** remove redundant main().catch boilerplate ([154ace7](https://github.com/anthropics/anthropic-sdk-typescript/commit/154ace7ea8ccd66d59b3a7d2ca61dcff82b39417))
* **internal:** cancel superseded CI runs ([0532c98](https://github.com/anthropics/anthropic-sdk-typescript/commit/0532c9878433dd93cc1b7b34c8a895f2a80aeb2c))
* **internal:** codegen related update ([228ff1e](https://github.com/anthropics/anthropic-sdk-typescript/commit/228ff1e5fa09fe6d6e1cca2cb876d2fa29d431b6))
* **internal:** minor workflow reformat ([41b6c31](https://github.com/anthropics/anthropic-sdk-typescript/commit/41b6c3190f4c4196817e9102fac1f9fca674452e))
* **internal:** tighten publint and attw lint checks ([e3fbd62](https://github.com/anthropics/anthropic-sdk-typescript/commit/e3fbd62677554699b51498179fe15feb73f1f24e))


### Documentation

* **api:** clarify session thread agent and usage.iterations compaction descriptions (beta) ([6e852a7](https://github.com/anthropics/anthropic-sdk-typescript/commit/6e852a70ee5db1d514e9459ac627324bfe6c904f))
* **examples:** use adaptive thinking in thinking examples ([3dd7699](https://github.com/anthropics/anthropic-sdk-typescript/commit/3dd7699110fd34b82b795841e76ac40122a63c7d))
