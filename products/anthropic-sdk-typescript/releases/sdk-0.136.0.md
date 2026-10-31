---
product: anthropic-sdk-typescript
version: "sdk-v0.136.0"
released_at: "2026-10-20"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.136.0"
fetched_at: "2026-10-31"
---

# anthropic-sdk-typescript sdk-v0.136.0

### Features

* **api:** add data_refreshed_at and has_more to analytics report pages
* **api:** add workspace rate-limit updates to the Admin API
* **api:** make User Profiles generally available
* **client:** yield server-sent events with unrecognized event names
* **tools:** accept every tool definition field in the tool helpers


### Bug Fixes

* **client:** treat x-amz-security-token as a sensitive header
* **tools:** keep $ sequences literal in memory tool str_replace


### Chores

* **ci:** skip the changelog check on draft pull requests
* **docs:** add credential expiry descriptions to the Managed Agents API reference
* **docs:** add Messages API request descriptions
* **docs:** correct plugin manifest_version and reach descriptions
* **docs:** improve Managed Agents memory store descriptions
* **docs:** improve Managed Agents vault and credential descriptions
* **internal:** bump playwright-core in the browser ecosystem tests
* **tests:** cover OpenTelemetry failures, propagation and environment variables
