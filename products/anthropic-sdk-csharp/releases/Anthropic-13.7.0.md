---
product: anthropic-sdk-csharp
version: "Anthropic-v13.7.0"
released_at: "2026-11-09"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v13.7.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Anthropic-v13.7.0

### Features

* **api:** accept user_profile.program_status_updated on organization webhook endpoints
* **api:** add claude-fable-5-2 and claude-mythos-5-2
* **api:** add parent organization filtering and grouping to the usage and cost reports
* **api:** add the sandbox_egress_restricted error to Admin API write methods
* **api:** add the user_profile.program_status_updated webhook event


### Bug Fixes

* **api:** type the per-user analytics report actor as a union
* **client:** return null when an API error has no InnerException
* **meai:** send the output format for a JSON schema with no required array


### Chores

* **api:** remove some error detail types and update descriptions
* **docs:** say when a work heartbeat does not compare its value
* **docs:** update model descriptions
* **internal:** read OpenTelemetry span attributes from generated tables


### Refactors

* **client:** move the retry loop into an internal RetryingExecutor
