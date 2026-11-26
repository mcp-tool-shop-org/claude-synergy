---
product: anthropic-sdk-typescript
version: "sdk-v1.7.0"
released_at: "2026-11-09"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v1.7.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-typescript sdk-v1.7.0

### Features

* **api:** accept user_profile.program_status_updated on organization webhook endpoints
* **api:** add claude-fable-5-2 and claude-mythos-5-2
* **api:** add parent organization filtering and grouping to the usage and cost reports
* **api:** add the sandbox_egress_restricted error to Admin API write methods
* **api:** add the user_profile.program_status_updated webhook event


### Bug Fixes

* **client:** include the body of a failed response in debug logs
* **helpers:** keep const and enum in structured output schemas


### Chores

* **api:** remove some error detail types and update descriptions
* **docs:** say when a work heartbeat does not compare its value
* **internal:** add this repository's review rules


### Documentation

* **client:** list error code types in api.md
* **client:** say where the default logger writes and how to log to stderr
* **helpers:** import from zod/v4 in the examples, for Zod 3.25 users


### Refactors

* **client:** declare the name of every AnthropicError subclass the same way
