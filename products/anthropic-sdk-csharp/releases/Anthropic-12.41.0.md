---
product: anthropic-sdk-csharp
version: "Anthropic-v12.41.0"
released_at: "2026-08-19"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.41.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-csharp Anthropic-v12.41.0

## 12.41.0 (2026-08-19)

Full Changelog: [Anthropic-v12.40.0...Anthropic-v12.41.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.40.0...Anthropic-v12.41.0)

### Features

* **api:** add output_behavior to dream creation (create a new memory store or update the input store in place) ([4b31214](https://github.com/anthropics/anthropic-sdk-csharp/commit/4b3121446a4f83c90a3373c66ba6f4ef38512797))
* **api:** additions to files and memory stores ([9c9b7a6](https://github.com/anthropics/anthropic-sdk-csharp/commit/9c9b7a6515c022b598a523f75d65bdde4fccc84c))
* **api:** Files and Skills APIs are now GA; add computer use and browser use toolsets ([42206f3](https://github.com/anthropics/anthropic-sdk-csharp/commit/42206f355db7a557253a63307b102b2024561e23))
* **api:** updates to skill, files, and user profiles ([d34d983](https://github.com/anthropics/anthropic-sdk-csharp/commit/d34d983cec61383f84259b20f3bc69180c851ed4))
* **client:** add helpers for accessing the workspace ID in response headers ([d53e6f3](https://github.com/anthropics/anthropic-sdk-csharp/commit/d53e6f3f0761649638198e5ff3e9b3a75bffecda))
* **meai:** map mid-conversation system messages in place ([#207](https://github.com/anthropics/anthropic-sdk-csharp/issues/207)) ([fd9aa60](https://github.com/anthropics/anthropic-sdk-csharp/commit/fd9aa6065cfa9b7d216d15439786a5484d944cd7))


### Bug Fixes

* **api:** remove unsupported mid_conv_system content block ([851b4ff](https://github.com/anthropics/anthropic-sdk-csharp/commit/851b4ff50f721c5586d0e6ebf60b76b7941825ab))
* **client:** add models ([46c211c](https://github.com/anthropics/anthropic-sdk-csharp/commit/46c211caf9c5eecbe2d8b4a258afa68012020e73))
* **client:** don't hand responses the token of a disposed cancellation source ([#150](https://github.com/anthropics/anthropic-sdk-csharp/issues/150)) ([5c3fd9b](https://github.com/anthropics/anthropic-sdk-csharp/commit/5c3fd9b03c8e25b0cb2fb5c05206959db0367dbb))
* **client:** map stop reasons faithfully in IChatClient (pause_turn no longer reports Stop) ([#144](https://github.com/anthropics/anthropic-sdk-csharp/issues/144)) ([1a129de](https://github.com/anthropics/anthropic-sdk-csharp/commit/1a129de883e93f992f7111520fc3896b8c23a9c0))
* **client:** pass cache_control through AIFunction to Tool conversion in IChatClient ([#145](https://github.com/anthropics/anthropic-sdk-csharp/issues/145)) ([96cae05](https://github.com/anthropics/anthropic-sdk-csharp/commit/96cae05d4188f13432472d80684f893116bdc1db))
* **client:** retry HTTP 429 on all target frameworks ([#146](https://github.com/anthropics/anthropic-sdk-csharp/issues/146)) ([99e007f](https://github.com/anthropics/anthropic-sdk-csharp/commit/99e007f8ad8201b9d69e194be50c3f277d5c94a9))
* **client:** stop streaming aggregators throwing on server-tool blocks ([#148](https://github.com/anthropics/anthropic-sdk-csharp/issues/148)) ([5271dbd](https://github.com/anthropics/anthropic-sdk-csharp/commit/5271dbd45ebd55e6aea6df78ef5f165352486abe))
* **meai:** add context-management beta header when template carries context_management ([#236](https://github.com/anthropics/anthropic-sdk-csharp/issues/236)) ([eb297c0](https://github.com/anthropics/anthropic-sdk-csharp/commit/eb297c0dab40e7d3d34ef48d74710a8d6fe9480a))
* **streaming:** apply all message_delta fields when accumulating streamed messages ([#155](https://github.com/anthropics/anthropic-sdk-csharp/issues/155)) ([180eecf](https://github.com/anthropics/anthropic-sdk-csharp/commit/180eecfb311cc26e2c61f46bbcd2b836673507b7))
* **tool-runner:** reuse the response container on follow-up requests ([#172](https://github.com/anthropics/anthropic-sdk-csharp/issues/172)) ([87f332c](https://github.com/anthropics/anthropic-sdk-csharp/commit/87f332c6826a1836d6a6c147ab92f4d53f6c9c4f))


### Documentation

* **api:** clarify that user profile name is optional for resold profiles ([6f2a3b4](https://github.com/anthropics/anthropic-sdk-csharp/commit/6f2a3b4f2f1c5bcb43adac3c1929126171ba6f3c))
