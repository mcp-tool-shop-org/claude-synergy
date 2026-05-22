---
product: anthropic-sdk-csharp
version: "Anthropic-12.10.0"
released_at: "2026-03-31"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.10.0"
fetched_at: "2026-05-21"
---

# anthropic-sdk-csharp vAnthropic-12.10.0

## 12.10.0 (2026-03-31)

Full Changelog: [Anthropic-v12.9.0...Anthropic-v12.10.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.9.0...Anthropic-v12.10.0)

### Features

* add ErrorType property to API error exceptions ([#760](https://github.com/anthropics/anthropic-sdk-csharp/issues/760)) ([8f63a96](https://github.com/anthropics/anthropic-sdk-csharp/commit/8f63a9699edb0407d6abca37ff1fa3b9cec9fadd))
* **api:** GA thinking-display-setting ([b0f24aa](https://github.com/anthropics/anthropic-sdk-csharp/commit/b0f24aa6791c697d25b55ab7ca29b31e7aa121b2))
* **api:** manual updates ([e093d70](https://github.com/anthropics/anthropic-sdk-csharp/commit/e093d702f21caa56a275e420b8226d77f7f944d5))
* **api:** manual updates ([c9d41c1](https://github.com/anthropics/anthropic-sdk-csharp/commit/c9d41c1baf3a47acefc6972c6283d27b5a12d8ca))
* **client:** update to M.E.AI.Abstractions 10.4.0 and update with latest MEAI/Anthropic features ([#118](https://github.com/anthropics/anthropic-sdk-csharp/issues/118)) ([81ab1b8](https://github.com/anthropics/anthropic-sdk-csharp/commit/81ab1b8b59e9fd38fba438e9987040fccc7fa08e))


### Bug Fixes

* **client:** allow cancelling when enumerating over an http response ([d3e2312](https://github.com/anthropics/anthropic-sdk-csharp/commit/d3e2312ddfc187f12c32fc4d85762f962954a59c))
* **client:** don't overzealously validate union variants when deserializing ([1178915](https://github.com/anthropics/anthropic-sdk-csharp/commit/1178915fc59a6b2810bf89c0d894aadec97d60b8))
* **client:** handle empty messages properly in IChatClient when raw representation has messages ([#144](https://github.com/anthropics/anthropic-sdk-csharp/issues/144)) ([5268a2c](https://github.com/anthropics/anthropic-sdk-csharp/commit/5268a2cd1106f1943e510d7f4632ba5d477b0d4c))
* **client:** handle path params correctly in `FromRawUnchecked` ([9afe664](https://github.com/anthropics/anthropic-sdk-csharp/commit/9afe664c3874ba05618c48caf4e2dbb581c45c23))
* **client:** handle root bodies in requests properly ([56ab27b](https://github.com/anthropics/anthropic-sdk-csharp/commit/56ab27b439fe34febf4e1be695c54fd239d90dae))
