---
product: continue-dev
version: "@continuedev/config-yaml@1.38.0"
released_at: "2026-01-13"
source_url: "https://github.com/continuedev/continue/releases/tag/%40continuedev/config-yaml%401.38.0"
fetched_at: "2026-05-24"
---

# continue-dev @continuedev/config-yaml@1.38.0

# [1.38.0](https://github.com/continuedev/continue/compare/@continuedev/config-yaml@1.37.0...@continuedev/config-yaml@1.38.0) (2026-01-13)


### Bug Fixes

* add case insensitive match strategy for find and replace ([ac476cc](https://github.com/continuedev/continue/commit/ac476cc02884bf6d3dd52adf67a0c6eb89ab9d0a))
* add missing hub mock rejection in test ([53a9fa4](https://github.com/continuedev/continue/commit/53a9fa4cb34d97a9f3e2af1f26a02b10bbd0a9a1))
* also use env vars in Write job summary step ([8969f42](https://github.com/continuedev/continue/commit/8969f422619f63becf2f778c4465cf192ee83e18))
* **anthropic:** support Azure-hosted Anthropic endpoints ([9e8bfcd](https://github.com/continuedev/continue/commit/9e8bfcd9396b9abf7643c79bb53f7263da8138c6))
* change 'Agent:' to 'Config:' in intro message and update tests ([c1e4668](https://github.com/continuedev/continue/commit/c1e466836acd0b2a5e81f2925c5d2e14691543d9))
* clarify can't edit in parallel with itself either ([46b31af](https://github.com/continuedev/continue/commit/46b31af330aa669d93c777d5fa577b2ca7c72225))
* **cli:** expand model capability detection to include Llama, Nemotron, and Mistral ([#8845](https://github.com/continuedev/continue/issues/8845)) ([528a8ab](https://github.com/continuedev/continue/commit/528a8abceb69a6afb12e0a32ea5eb8acbc1e8241)), closes [#1](https://github.com/continuedev/continue/issues/1)
* **cli:** fix test expectations and import path for uriUtils ([3ccaa09](https://github.com/continuedev/continue/commit/3ccaa092e65fdd520e3e8b157feaf0eb3d18ba25))
* **cli:** path to uri and vice versa conversion ([d09b3e2](https://github.com/continuedev/continue/commit/d09b3e2126d7349f23e50e90107e154838bc06ae))
* **cli:** resolve circular dependency in uploadArtifact tool ([b5da44d](https://github.com/continuedev/continue/commit/b5da44ddd665d571b9669a9832e2d5b34a9f743c))
* **cli:** restart cli for manual update ([595986a](https://github.com/continuedev/continue/commit/595986a6fb46ccd4e023078e9e3a8aeb911629c7))
* **cli:** use logger.info instead of console.log for consistency ([00b665f](https://github.com/continuedev/continue/commit/00b665f089e1b1c1166bf8c7d275465b6fb8f5e2))
* Constrain root eslint to v8 to match core dependency ([ad6ab80](https://github.com/continuedev/continue/commit/ad6ab8024b888816dcf0c8eb39921a98777ec5ab))
* context length fixes, truncation, etc ([613ffb8](https://github.com/continuedev/continue/commit/613ffb8ca9847fcb3ff99beec6f191b25cd85f9b))
* Correct import order for eslint compliance ([657c5fe](https://github.com/continuedev/continue/commit/657c5fe023cf25473d4365112f0162af38922d50))
* don't fallback to relative path if not markdown file ([d93b432](https://github.com/continuedev/continue/commit/d93b4321a550acf7151949d1fee1c436945e2ee0))
* ensure cross-target LanceDB binaries are correctly copied ([#9100](https://github.com/continuedev/continue/issues/9100)) ([291f8f5](https://github.com/continuedev/continue/commit/291f8f5dd2efec7a53e49cc7e2a1b7e6a0833466))
* env stubs for cli platform tests ([6b3c0be](https://github.com/continuedev/continue/commit/6b3c0be2f1443e47db3e985560cb859b8e42f6a9))
* fix lint error and update tests for markdown-only fallback ([4c0c532](https://github.com/continuedev/continue/commit/4c0c53257baf7edb943c76155fa6b0bde79b554f))
* handle JSON contents of create_new_file ([5f14a2f](https://github.com/continuedev/continue/commit/5f14a2fa664f3c9b0df23eb01c2f774a69cfd764)), closes [#8972](https://github.com/continuedev/continue/issues/8972)
* Initialize usage field in createSession and startNewSession ([5c50e91](https://github.com/continuedev/continue/commit/5c50e911d203fc0a7ae6407f84bdfafd8c1f19f4))
* inject blocks tests for cli secret resolution ([219f566](https://github.com/continuedev/continue/commit/219f5661c9999daa5e185740dd2fa1d24f0187b2))
* **intellij:** Prevent ConcurrentModificationException in keymap access ([5d1cd00](https://github.com/continuedev/continue/commit/5d1cd001039eb2b8b037db7dbdeaf91a11be59b0))
* lint and tests ([3adcac2](https://github.com/continuedev/continue/commit/3adcac22bbe34748126e54bd22207a135807416a))
* make tree-sitter lookup in .js and .ts files pick up only last preceding comment before code block ([cb4db87](https://github.com/continuedev/continue/commit/cb4db878b89828d01880251cb490af50d15dbd44))
* merge main ([48c7616](https://github.com/continuedev/continue/commit/48c76160d05563b1aebe18ae53eea61cb0f5d614))
* my config not myproject ([23b359a](https://github.com/continuedev/continue/commit/23b359aab0dc964d6e96a2bb641538d13b285e7f))
* **openai-adapters:** Add defensive type checks for stream.usage Promise ([7d3fa6d](https://github.com/continuedev/continue/commit/7d3fa6daa97519df87c70b32fbbe1f46e6fa3bc7))
* **openai-adapters:** Add fallback to stream.usage Promise for usage tokens ([bbeec4b](https://github.com/continuedev/continue/commit/bbeec4b1bf7225c0159cccb5562ff2c7701e356e))
* **openai-adapters:** Address 4 PR review issues ([93d9c12](https://github.com/continuedev/continue/commit/93d9c123d348a1a79829299b9756781a8839b1ae))
* **openai-adapters:** Don't emit usage from fullStream finish event ([a89187b](https://github.com/continuedev/continue/commit/a89187b409314fc4e502290b41d0071d459102ac))
* **openai-adapters:** Fix multi-turn tools test API initialization timing ([75044d4](https://github.com/continuedev/continue/commit/75044d4cdc498fe7ca1a1f656d4e1ef6f24b1209))
* **openai-adapters:** Fix tool_choice format and usage token handling ([aaa973a](https://github.com/continuedev/continue/commit/aaa973ab7a1b48f5c9b751cb5b9b6c29891a752b))
* **openai-adapters:** Fix usage token double-emission in Vercel SDK streams ([64f4924](https://github.com/continuedev/continue/commit/64f4924984d34c5bb11cc7b91a132dc576f9eb10))
* **openai-adapters:** Fix Vercel SDK test API initialization timing ([d2afc5c](https://github.com/continuedev/continue/commit/d2afc5cd934724b5cdca8334e5d04bf1ffca4519))
* **openai-adapters:** Remove token count validation in finish event handler ([6e656f9](https://github.com/continuedev/continue/commit/6e656f9a2e3ba77f4ba44b14fc825f833a537644))
* **openai-adapters:** Revert to using finish event usage from fullStream ([3d21467](https://github.com/continuedev/continue/commit/3d21467adfbd3e641d0827a341c4ec40b4804e70))
* **openai-adapters:** Temporarily disable usage assertions for Vercel SDK tests ([06bcf60](https://github.com/continuedev/continue/commit/06bcf605757f9c818282c2c2ccf41411a93f6317))
* **openai-adapters:** Use stream.usage Promise exclusively for usage tokens ([df143e7](https://github.com/continuedev/continue/commit/df143e7f279ea84579c65deba5537e136e065e69))
* packages/continue-sdk/package.json & packages/continue-sdk/package-lock.json to reduce vulnerabilities ([2f128be](https://github.com/continuedev/continue/commit/2f128beb2ce1c69097a5eb21e1a2d7834fc16d41))
* packages/continue-sdk/python/api/requirements.txt to reduce vulnerabilities ([df86ba8](https://github.com/continuedev/continue/commit/df86ba82973919703b5dc2d6dd8702003865bd8e))
* prevent string interpolation issues in remaining workflow steps ([2d21472](https://github.com/continuedev/continue/commit/2d2147230c28fc8d91a0d4df8a27fbb88c6b0ed5))
* prompt tweak ([41c4f29](https://github.com/continuedev/continue/commit/41c4f297f3bef3a43f12833d3d2e0d6c84888ec7))
* re-throw hub error for non-markdown hub slugs ([f644c88](https://github.com/continuedev/continue/commit/f644c8873e09f8efa912eefeb1a03e5d8708f24f))
* refactor handleToolCalls to use options object to satisfy max-params lint rule ([2ae2f80](https://github.com/continuedev/continue/commit/2ae2f80af6b52922d94bc7db7495de9e74b0671e))
* Regenerate CLI package-lock.json to resolve dependency mismatches ([32326eb](https://github.com/continuedev/continue/commit/32326ebf1e53aae26ccebd0e540d7ed8d347864a))
* regenerate package-lock.json to include missing @types/node@25.0.3 ([10b457b](https://github.com/continuedev/continue/commit/10b457b0eae361ed18f9128980f5f6bfb1c9ff1a))
* Regenerate package-lock.json to resolve dependency mismatches ([c2bf023](https://github.com/continuedev/continue/commit/c2bf0231e7c2dd842c33a0a9f4022429f4738ded))
* Remove invalid totalCost property and update test mocks ([2e9a0f0](https://github.com/continuedev/continue/commit/2e9a0f0b9176a7b9fde45c5c13134e20e7470c9e))
* Remove symlink logic from production blueprint template ([a396ed2](https://github.com/continuedev/continue/commit/a396ed2acccfa523c64a45a94428c3698fdf9601))
* Remove symlink logic from staging blueprint template ([ce07084](https://github.com/continuedev/continue/commit/ce07084d2dcfddebf7e28b6193ecf660b84bfd09))
* Replace console.log with logger.info in exit.ts ([bfd2f01](https://github.com/continuedev/continue/commit/bfd2f016c02faa36eee3597b9ad81a3408061272))
* resolve lint issues in vscode extension files ([887410e](https://github.com/continuedev/continue/commit/887410e5b2506cd39571b8ba9ee9842587107efa)), closes [#9077](https://github.com/continuedev/continue/issues/9077)
* **runloop:** hardcode amd64 architecture and update blueprint name to cn-test ([d10594f](https://github.com/continuedev/continue/commit/d10594f6cda0dea50e1acd03e7af82da0b874e5e))
* save session ([454da90](https://github.com/continuedev/continue/commit/454da90e15568f0d6727bd188f1dc508021192c8))
* show new rule once created ([bf6ee2f](https://github.com/continuedev/continue/commit/bf6ee2f71da3008bf01bd5be030f5bff62410d0e))
* show the correct number of pending tools ([3d7be8a](https://github.com/continuedev/continue/commit/3d7be8a55a31ff32de19452572d512e96b3a901e))
* sync package-lock.json with npm registry ([c36dcb1](https://github.com/continuedev/continue/commit/c36dcb1c0fbba3b260a553351b03bf6e96c9917a))
* tests and cubic feedback ([d7b91f8](https://github.com/continuedev/continue/commit/d7b91f884c2be22fb6805dbcc5a9ad738bb443ee))
* tests for windows ([6419b44](https://github.com/continuedev/continue/commit/6419b4402959025af52603695abf5ae615941ec8))
* update package-lock.json for @tiptap/extension-image upgrade ([8f28688](https://github.com/continuedev/continue/commit/8f28688651ba9453ccf5a07d8076aa7b77d74bb5))
* upgrade @aws-sdk/client-bedrock-runtime from 3.925.0 to 3.929.0 ([983ab2b](https://github.com/continuedev/continue/commit/983ab2b69b155c6aa4f094e0ee55c98aa82ffba2))
* upgrade @aws-sdk/credential-providers from 3.925.0 to 3.929.0 ([d48b40a](https://github.com/continuedev/continue/commit/d48b40a28697d5af325473dbd169f44629a9d639))
* upgrade @tiptap/extension-history from 2.26.1 to 2.27.1 ([a9e7f33](https://github.com/continuedev/continue/commit/a9e7f3311ee190eebee44cd2ad8630de7973651b))
* upgrade @tiptap/extension-image from 2.26.1 to 2.27.1 ([d159f9f](https://github.com/continuedev/continue/commit/d159f9fdf79d4f278cb0bff4b7b7d1951776dde6))
* upgrade mocha from 11.7.1 to 11.7.5 ([c65d6df](https://github.com/continuedev/continue/commit/c65d6dfb9ac9daac866fc55b62a55de6fd9a402c))
* use env vars for safe string handling in continue-agents workflow ([fe1a35a](https://github.com/continuedev/continue/commit/fe1a35a33e0a54ae32a2fc97991a26a21b53ea09))
* use more intuitive envvars to manage OTLP and PostHog telemetry settings ([b985c1a](https://github.com/continuedev/continue/commit/b985c1a32d98b8d3343ca5a742d32e76fdad2586))
* Use named import for find-up v8 ([499b672](https://github.com/continuedev/continue/commit/499b672d7ec4e66d35816188a92e41b1959337a2))
* use proxy for unrendered injected block secrets ([91ddbb8](https://github.com/continuedev/continue/commit/91ddbb8c2e6686f91595132c42fafc6c7518e930))


### Features

* Add reusable Continue Agents workflow ([526b0b6](https://github.com/continuedev/continue/commit/526b0b6672abe22567a7f54ed8274e00db19824e))
* Add staging blueprint (cn-staging) for isolated testing ([3dc36ba](https://github.com/continuedev/continue/commit/3dc36ba00ea14ec939b34ed841c436fdca43c582))
* allow selecting images using cmd+a ([e31605a](https://github.com/continuedev/continue/commit/e31605aaf06353dfbf34559595b4664b576fd5d6))
* **assets:** add Xiaomi MiMo logo ([3f61af5](https://github.com/continuedev/continue/commit/3f61af520d43e949ef77821f56558cb3d15cc76b))
* auto approve parallel read only builtin tools ([d207d40](https://github.com/continuedev/continue/commit/d207d4012c693c2f0b5d13edf780ed55bd478a69))
* capture and attach usage metadata to assistant messages ([7f9ef36](https://github.com/continuedev/continue/commit/7f9ef3694d7b47f7cebec9090c2de0e8740fc68d))
* CLI tool truncation and docs ([34537d9](https://github.com/continuedev/continue/commit/34537d926fca7017c748fe69c9bf888aee0d8b95))
* **cli:** add session ID support for serve command to persist chat history ([09deed4](https://github.com/continuedev/continue/commit/09deed45dd252ad5d9abee478ac120551a41699f))
* **cli:** prevent initial prompt replay on devbox resume ([2e2fc51](https://github.com/continuedev/continue/commit/2e2fc51082ce8fe18fa40887876ce0869999d497))
* **new model:** adding MiMo-V2-Flash ([a2d8443](https://github.com/continuedev/continue/commit/a2d8443a35b90cc909e888e2e4d503c1525ff9da))
* refined cli bash tool truncation ([9a630a0](https://github.com/continuedev/continue/commit/9a630a025de85dd11069afb04a37f6295aca8029))
* simplify onboarding ([e8a5ac5](https://github.com/continuedev/continue/commit/e8a5ac55d039adb965eea2e363508e0f6a2c6a51))
* simplify onboarding card ([e0fa577](https://github.com/continuedev/continue/commit/e0fa57749d41b86f78f2f4071cea9811af6c1742))
* submit slash command in one enter ([191006d](https://github.com/continuedev/continue/commit/191006d5de83a903b7ec3bf79978300039886b16))
* use google/genai sdk for streaming gemini & vertex responses ([#8907](https://github.com/continuedev/continue/issues/8907)) ([61f0ba0](https://github.com/continuedev/continue/commit/61f0ba011c0c4d661831da6c1edb62f3c838dc13))




