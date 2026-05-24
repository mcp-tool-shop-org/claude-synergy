---
product: continue-dev
version: "@continuedev/openai-adapters@1.37.0"
released_at: "2026-01-14"
source_url: "https://github.com/continuedev/continue/releases/tag/%40continuedev/openai-adapters%401.37.0"
fetched_at: "2026-05-24"
---

# continue-dev @continuedev/openai-adapters@1.37.0

# [1.37.0](https://github.com/continuedev/continue/compare/@continuedev/openai-adapters@1.36.0...@continuedev/openai-adapters@1.37.0) (2026-01-14)


### Bug Fixes

* add missing hub mock rejection in test ([53a9fa4](https://github.com/continuedev/continue/commit/53a9fa4cb34d97a9f3e2af1f26a02b10bbd0a9a1))
* also use env vars in Write job summary step ([8969f42](https://github.com/continuedev/continue/commit/8969f422619f63becf2f778c4465cf192ee83e18))
* change 'Agent:' to 'Config:' in intro message and update tests ([c1e4668](https://github.com/continuedev/continue/commit/c1e466836acd0b2a5e81f2925c5d2e14691543d9))
* clarify can't edit in parallel with itself either ([46b31af](https://github.com/continuedev/continue/commit/46b31af330aa669d93c777d5fa577b2ca7c72225))
* **cli:** compaction for missing tool results ([0792b94](https://github.com/continuedev/continue/commit/0792b949bdf629fd14dac45478b2027962b77454))
* **cli:** restart cli for manual update ([595986a](https://github.com/continuedev/continue/commit/595986a6fb46ccd4e023078e9e3a8aeb911629c7))
* context length error detection ([1bfb72e](https://github.com/continuedev/continue/commit/1bfb72edf3f6c0eccb66454eb9e3ad423f58bee5))
* context length fixes, truncation, etc ([613ffb8](https://github.com/continuedev/continue/commit/613ffb8ca9847fcb3ff99beec6f191b25cd85f9b))
* don't fallback to relative path if not markdown file ([d93b432](https://github.com/continuedev/continue/commit/d93b4321a550acf7151949d1fee1c436945e2ee0))
* env stubs for cli platform tests ([6b3c0be](https://github.com/continuedev/continue/commit/6b3c0be2f1443e47db3e985560cb859b8e42f6a9))
* fix lint error and update tests for markdown-only fallback ([4c0c532](https://github.com/continuedev/continue/commit/4c0c53257baf7edb943c76155fa6b0bde79b554f))
* inject blocks tests for cli secret resolution ([219f566](https://github.com/continuedev/continue/commit/219f5661c9999daa5e185740dd2fa1d24f0187b2))
* packages/continue-sdk/package.json & packages/continue-sdk/package-lock.json to reduce vulnerabilities ([2f128be](https://github.com/continuedev/continue/commit/2f128beb2ce1c69097a5eb21e1a2d7834fc16d41))
* prevent string interpolation issues in remaining workflow steps ([2d21472](https://github.com/continuedev/continue/commit/2d2147230c28fc8d91a0d4df8a27fbb88c6b0ed5))
* prompt tweak ([41c4f29](https://github.com/continuedev/continue/commit/41c4f297f3bef3a43f12833d3d2e0d6c84888ec7))
* re-throw hub error for non-markdown hub slugs ([f644c88](https://github.com/continuedev/continue/commit/f644c8873e09f8efa912eefeb1a03e5d8708f24f))
* regenerate package-lock.json to include missing @types/node@25.0.3 ([10b457b](https://github.com/continuedev/continue/commit/10b457b0eae361ed18f9128980f5f6bfb1c9ff1a))
* Remove symlink logic from production blueprint template ([a396ed2](https://github.com/continuedev/continue/commit/a396ed2acccfa523c64a45a94428c3698fdf9601))
* Remove symlink logic from staging blueprint template ([ce07084](https://github.com/continuedev/continue/commit/ce07084d2dcfddebf7e28b6193ecf660b84bfd09))
* show new rule once created ([bf6ee2f](https://github.com/continuedev/continue/commit/bf6ee2f71da3008bf01bd5be030f5bff62410d0e))
* tests and cubic feedback ([d7b91f8](https://github.com/continuedev/continue/commit/d7b91f884c2be22fb6805dbcc5a9ad738bb443ee))
* upgrade lru-cache from 11.0.2 to 11.2.4 ([269be8b](https://github.com/continuedev/continue/commit/269be8bb5fdb4651a2e52f832e92f5dc8b250b55))
* upgrade mocha from 11.7.1 to 11.7.5 ([c65d6df](https://github.com/continuedev/continue/commit/c65d6dfb9ac9daac866fc55b62a55de6fd9a402c))
* upgrade monaco-editor from 0.45.0 to 0.55.1 ([cc1c70d](https://github.com/continuedev/continue/commit/cc1c70d246b124a592cf94b17cb1fe7ba8fa2bc2))
* use env vars for safe string handling in continue-agents workflow ([fe1a35a](https://github.com/continuedev/continue/commit/fe1a35a33e0a54ae32a2fc97991a26a21b53ea09))
* use proxy for unrendered injected block secrets ([91ddbb8](https://github.com/continuedev/continue/commit/91ddbb8c2e6686f91595132c42fafc6c7518e930))


### Features

* Add reusable Continue Agents workflow ([526b0b6](https://github.com/continuedev/continue/commit/526b0b6672abe22567a7f54ed8274e00db19824e))
* Add staging blueprint (cn-staging) for isolated testing ([3dc36ba](https://github.com/continuedev/continue/commit/3dc36ba00ea14ec939b34ed841c436fdca43c582))
* allow selecting images using cmd+a ([e31605a](https://github.com/continuedev/continue/commit/e31605aaf06353dfbf34559595b4664b576fd5d6))
* **assets:** add Xiaomi MiMo logo ([3f61af5](https://github.com/continuedev/continue/commit/3f61af520d43e949ef77821f56558cb3d15cc76b))
* CLI tool truncation and docs ([34537d9](https://github.com/continuedev/continue/commit/34537d926fca7017c748fe69c9bf888aee0d8b95))
* **new model:** adding MiMo-V2-Flash ([a2d8443](https://github.com/continuedev/continue/commit/a2d8443a35b90cc909e888e2e4d503c1525ff9da))
* refined cli bash tool truncation ([9a630a0](https://github.com/continuedev/continue/commit/9a630a025de85dd11069afb04a37f6295aca8029))




