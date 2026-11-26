---
product: anthropic-sdk-csharp
version: "Anthropic-v13.13.0"
released_at: "2026-11-23"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v13.13.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Anthropic-v13.13.0

### Features

* **api:** add an error code to Message Batches creation
* **api:** add External Storage to the Admin API beta
* **api:** add webhook events for external storage failure and recovery


### Bug Fixes

* **api:** use 64-bit integers for Managed Agents usage token counts
* **client:** pick the right union variant when it holds unknown values


### Chores

* **api:** mark Claude Opus 4.5 as deprecated (end-of-life January 22, 2027)
* **docs:** clarify when plugin archive downloads are recorded and who gave a share
* **docs:** correct organization-type notes in usage and cost reports
* **docs:** describe the user profile endpoints and link to the guide


### Documentation

* **api:** shorten the human_review description


### Refactors

* **client:** move the retry customizations into RetryingExecutor
