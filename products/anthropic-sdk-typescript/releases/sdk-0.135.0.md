---
product: anthropic-sdk-typescript
version: "sdk-v0.135.0"
released_at: "2026-10-15"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.135.0"
fetched_at: "2026-10-31"
---

# anthropic-sdk-typescript sdk-v0.135.0

### Features

* **api:** add between_tools to thinking types in model capabilities
* **api:** add the speed parameter and usage.speed to Messages
* **api:** return a Console organization's usage-tier spend cap as a read-only spend limit


### Bug Fixes

* **client:** close streams dropped without being read to the end
* **client:** keep an unread JSONL response open while it is held


### Chores

* **ci:** speed up breaking change detection
* **docs:** describe headers on Managed Agents and telemetry endpoints


### Documentation

* **api:** note that some models need a beta header to use speed
