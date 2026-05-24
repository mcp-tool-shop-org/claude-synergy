---
product: continue-dev
version: "@continuedev/config-yaml@1.40.0"
released_at: "2026-01-31"
source_url: "https://github.com/continuedev/continue/releases/tag/%40continuedev/config-yaml%401.40.0"
fetched_at: "2026-05-24"
---

# continue-dev @continuedev/config-yaml@1.40.0

# [1.40.0](https://github.com/continuedev/continue/compare/@continuedev/config-yaml@1.39.0...@continuedev/config-yaml@1.40.0) (2026-01-31)


### Bug Fixes

* account for different tokenizers ([b4bc3ae](https://github.com/continuedev/continue/commit/b4bc3aedaa2e44149a1898c609405ebb80ca91b2))
* add missing cancelStream call and return for non-retryable errors ([c391353](https://github.com/continuedev/continue/commit/c391353709ad4367fb333680190e0ba73c868ef0))
* also show underlying provider for open github issue ([0b7fe48](https://github.com/continuedev/continue/commit/0b7fe4813c996aa416843bbda7d1c784b49e65b4))
* **cli:** flaky hub loader tests ([2fb8830](https://github.com/continuedev/continue/commit/2fb88307caeb6e72979396f70de17af087a27536))
* command fixed in contributing file ([#9715](https://github.com/continuedev/continue/issues/9715)) ([a21eb15](https://github.com/continuedev/continue/commit/a21eb151d30969c292e290523941ebb520c61151))
* compact conversation with dangling tool calls ([b33b8a4](https://github.com/continuedev/continue/commit/b33b8a4dadb821cab67d517223cb9ab19268d173))
* compaction updates part 2 ([d18c6f0](https://github.com/continuedev/continue/commit/d18c6f04ad6ca518f849a78ab6cb8938e8ea1c24))
* core/package.json to reduce vulnerabilities ([8ca79b9](https://github.com/continuedev/continue/commit/8ca79b9a5adefa401b6bd7cc62e72e1597cb0012))
* duplicate tool messages ([77a2f12](https://github.com/continuedev/continue/commit/77a2f1274a6183bf43cb8df3d84e8e58762b1442))
* eslint ([50adea3](https://github.com/continuedev/continue/commit/50adea309b6635b125e55a13bb99b0a91827956f))
* eslint import unresolved ([ccd0b74](https://github.com/continuedev/continue/commit/ccd0b74dc544687b3ec9439ee9a814efbacc5752))
* linting issue mising parallel count ([c0a9309](https://github.com/continuedev/continue/commit/c0a930919fe93ce7ad6a0eaf3546a956dee02383))
* Local setup screen input text is black on dark background ([363292b](https://github.com/continuedev/continue/commit/363292bdef47b14857a5a4dfa6b3f5a115510c31))
* pass GITHUB_TOKEN to vscode e2e tests for ripgrep download ([b8586d6](https://github.com/continuedev/continue/commit/b8586d6d90a6ee76d7186f53ea6f6521aee680f5))
* pass pre-read content to RegistryClient for WSL compatibility ([#9739](https://github.com/continuedev/continue/issues/9739)) ([38aae62](https://github.com/continuedev/continue/commit/38aae62e56b1ffc48da626544bb512f03c19e8fe)), closes [#6242](https://github.com/continuedev/continue/issues/6242) [#7810](https://github.com/continuedev/continue/issues/7810)
* prevent waiting for the session to load from history ([9fcc332](https://github.com/continuedev/continue/commit/9fcc332a99095a2b5635eb786ea02ca73311803a))
* Replace console.debug with logger in exit tool ([b65f440](https://github.com/continuedev/continue/commit/b65f44027a9c36d02e930ed2be41bac274ceb312))
* resolve IDE Extensions tab navigation in docs ([7129415](https://github.com/continuedev/continue/commit/7129415db0a6609e126f464e3dfe0d92528fddf2))
* resolve MDX parsing error in run-agents-locally guide ([7074a50](https://github.com/continuedev/continue/commit/7074a50e4a39f5b29927c8c90a4fb52769b64dff))
* Set isComplete metadata when agents finish execution ([65a1e15](https://github.com/continuedev/continue/commit/65a1e1500b112de4e24364eff890bd9b4fcac895))
* show full right side gradient border ([7f46011](https://github.com/continuedev/continue/commit/7f46011e7c277d570907cfc733639f4a2f944d1d))
* simplify config error ([e3a8711](https://github.com/continuedev/continue/commit/e3a8711ed90b1c3026726c80fecff92e449bb79b))
* skip cmd.exe wrapping for MCP servers when Windows host connects to WSL ([1219985](https://github.com/continuedev/continue/commit/1219985ce13753b38747a0a258a39fbd0a5d1dd6)), closes [#9151](https://github.com/continuedev/continue/issues/9151) [#9679](https://github.com/continuedev/continue/issues/9679)
* support object-type arguments in tool call parsing ([82f6f69](https://github.com/continuedev/continue/commit/82f6f6952202924952af6b9c84df42e5fd204bc3))
* tool permissions for MCP and bash in headless ([998cb76](https://github.com/continuedev/continue/commit/998cb76a7128e47fc94dad7a282a578459ee8015))
* update ide-extensions link to point to quick-start page ([b73fefe](https://github.com/continuedev/continue/commit/b73fefe7000cedd45431ca4cdade539bee1d0832))
* upgrade @c15t/react from 1.8.1 to 1.8.2 ([9b192e4](https://github.com/continuedev/continue/commit/9b192e478420d9d21baee4da86e6fb95f91cfd36))
* upgrade @huggingface/jinja from 0.1.3 to 0.5.3 ([e5afc41](https://github.com/continuedev/continue/commit/e5afc41492f1c837156a37e3427c3cc27db93ab5))
* upgrade @tiptap/extension-mention from 2.26.1 to 2.27.1 ([8835b11](https://github.com/continuedev/continue/commit/8835b1107bdeb461302c8115b55c34f3405210c8))
* upgrade @tiptap/extension-paragraph from 2.26.1 to 2.27.1 ([43a759d](https://github.com/continuedev/continue/commit/43a759d72ded5c67eca9f175a83cc6579aba0c1f))
* upgrade @tiptap/extension-text from 2.26.1 to 2.27.1 ([aeee9b9](https://github.com/continuedev/continue/commit/aeee9b967016a9d9095e30c7026825ee28802f6f))
* upgrade posthog-js from 1.297.2 to 1.310.1 ([14a5336](https://github.com/continuedev/continue/commit/14a533617f4e0811e4f75a2652b44453c640f82e))
* upgrade react-hook-form from 7.62.0 to 7.69.0 ([5e9d88a](https://github.com/continuedev/continue/commit/5e9d88a8daa361c1d66485648144d3f957ec0ed2))
* upgrade systeminformation from 5.27.14 to 5.30.0 ([6516b9c](https://github.com/continuedev/continue/commit/6516b9c628bb6864923986c87325c666ecf21ac2))
* upgrade ws from 8.18.0 to 8.19.0 ([418fd03](https://github.com/continuedev/continue/commit/418fd0346ed44be93d9f5e3e6c741958bd168b1a))
* upgrade yaml from 2.8.1 to 2.8.2 ([810598b](https://github.com/continuedev/continue/commit/810598b8a72fd496d556f07e603afad4fb18bf92))
* use ide.runCommand when Windows host connects to WSL ([c565bdc](https://github.com/continuedev/continue/commit/c565bdc464bea6849f9c8cdba13249b7d2ccea3d)), closes [#9661](https://github.com/continuedev/continue/issues/9661)
* use underlying provider name for stream errors ([cb83600](https://github.com/continuedev/continue/commit/cb83600a40f8aa6dac23da9f5d70f55b0fa0bf43))


### Features

* Add new OVHcloud models ([9c2ffde](https://github.com/continuedev/continue/commit/9c2ffde418dfe180df93269bf4d6a5a8e6e99d90))
* **cli:** agent skills ([3ab5b59](https://github.com/continuedev/continue/commit/3ab5b5992bb7d8dc11e6589d97c435959de3d6bc))
* **cli:** detect wsl and spawn appropriate shell ([a9ae420](https://github.com/continuedev/continue/commit/a9ae4205e12c7974d5b6c0feea964af9b97e1630))
* Edit documentation ([a6e5ef4](https://github.com/continuedev/continue/commit/a6e5ef405ce21a26365fce263f510b54cef183c9))
* error for large files with informative message rather than truncating ([d87dd57](https://github.com/continuedev/continue/commit/d87dd573eff736bbfb2f499f49c044ba9488b08f))
* proportional output truncation for read and bash ([c754289](https://github.com/continuedev/continue/commit/c754289118dec863a1dc6f802ad5347c370d8796))
* retry overloaded errors ([2fccf3a](https://github.com/continuedev/continue/commit/2fccf3a3be37c33b92f587039b07b57be228a9c7))




