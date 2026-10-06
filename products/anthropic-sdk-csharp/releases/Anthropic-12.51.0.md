---
product: anthropic-sdk-csharp
version: "Anthropic-v12.51.0"
released_at: "2026-09-28"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.51.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-csharp Anthropic-v12.51.0

## 12.51.0 (2026-09-28)

Full Changelog: [Anthropic-v12.50.0...Anthropic-v12.51.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.50.0...Anthropic-v12.51.0)

### Features

* **api:** add between_tools thinking type ([7cb59af](https://github.com/anthropics/anthropic-sdk-csharp/commit/7cb59af6e4ed43f9c812a8d3c87e720d46ee5fdd))
* **api:** add claude-sonnet-5-5 ([26ad891](https://github.com/anthropics/anthropic-sdk-csharp/commit/26ad89180b5c383fc8a28b65faf33aec97956433))
* **api:** add include_inherited and source to workspace rate limits ([bc781fc](https://github.com/anthropics/anthropic-sdk-csharp/commit/bc781fc9a8f202078416d2a92a159277de3ecebc))
* **api:** add typed event type values to the Managed Agents events list filter ([51c641e](https://github.com/anthropics/anthropic-sdk-csharp/commit/51c641e9bb68784bf9d732b060725efba268cd44))
* **api:** cache diagnostics GA — diagnostics on Message / MessageCreateParams ([005a47e](https://github.com/anthropics/anthropic-sdk-csharp/commit/005a47e033edeb8cb396a9ff635c08f8fd34876d))


### Bug Fixes

* **client:** accept an empty file name on file uploads ([70f0773](https://github.com/anthropics/anthropic-sdk-csharp/commit/70f07736fa38f88e8c343213ad9b7190a4379973))
* **client:** send multipart filenames as raw UTF-8 instead of RFC 2047/filename* ([5c42233](https://github.com/anthropics/anthropic-sdk-csharp/commit/5c42233f2df3e3743c1c00029f98e6dbd0dc0fb6))
* **helpers:** degrade between_tools thinking to disabled on fallback hops ([#259](https://github.com/anthropics/anthropic-sdk-csharp/issues/259)) ([f7f51b5](https://github.com/anthropics/anthropic-sdk-csharp/commit/f7f51b5d42c9aeb3d85024318d6b637494484e07))


### Chores

* **api:** deprecate the betas param on GA models and completions methods ([0d9b5bc](https://github.com/anthropics/anthropic-sdk-csharp/commit/0d9b5bc8a320889f1a9fd83383d6b9e272969ad9))
* **docs:** clarify that stream: true returns the raw event stream ([270aafd](https://github.com/anthropics/anthropic-sdk-csharp/commit/270aafdec8fe32d8f2ad8fca8efca20bac489463))
* **docs:** make Managed Agents actor descriptions resource-neutral ([ef5b868](https://github.com/anthropics/anthropic-sdk-csharp/commit/ef5b868a573457dddf699763076b95b28b63dfcd))
* **docs:** restore the research-preview notice on the Dream type ([5a5afae](https://github.com/anthropics/anthropic-sdk-csharp/commit/5a5afae313c8d541d70c3b2a6c2a26455d1ab9ad))


### Documentation

* **api:** prefer each field's own description over its shared type's ([20145a2](https://github.com/anthropics/anthropic-sdk-csharp/commit/20145a2e10454b91b18d13dc0e6f5f01f6ca90ed))
