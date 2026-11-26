---
product: anthropic-sdk-csharp
version: "Anthropic-v13.4.0"
released_at: "2026-11-02"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v13.4.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Anthropic-v13.4.0

### Features

* **api:** add GA methods for analytics, spend limits and RBAC
* **api:** add named beta types for unified metrics and RBAC delete responses
* **api:** add shared analytics order and increase request actor types
* **api:** add tool_use_limit_reached_error and compaction_limit_reached_error session error types
* **api:** add types for analytics group_by and spend limit period filters
* **api:** add user_profile_id to External Keys and Workspaces

### Documentation

* **examples:** use current model IDs

### Bug Fixes

* **api:** make spend_limit nullable in the spend limit increase request approve response
* **api:** require always-sent analytics fields and drop the unused project product field
* **client:** throw the API exception for the status, not `InvalidOperationException`, when an error response or a stream's `error` event is JSON but not the expected object
* **client:** add missing ConfigureAwait(false) in Paginate


### Chores

* **docs:** clarify the Slack channel id description
* **docs:** clarify what disabling the Compliance API stops
* **docs:** clarify what the capability_access_all role action grants
* **docs:** link Dreams model fields to the supported models section
* **internal:** let releases set the version of Anthropic.Mcp


### Documentation

* add a description to the AnthropicBeta type
