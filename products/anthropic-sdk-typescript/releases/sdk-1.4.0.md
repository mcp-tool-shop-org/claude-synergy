---
product: anthropic-sdk-typescript
version: "sdk-v1.4.0"
released_at: "2026-11-02"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v1.4.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-typescript sdk-v1.4.0

### Features

* **api:** add GA methods for analytics, spend limits and RBAC
* **api:** add named beta types for unified metrics and RBAC delete responses
* **api:** add shared analytics order and increase request actor types
* **api:** add tool_use_limit_reached_error and compaction_limit_reached_error session error types
* **api:** add types for analytics group_by and spend limit period filters
* **api:** add user_profile_id to External Keys and Workspaces


### Bug Fixes

* **api:** make spend_limit nullable in the spend limit increase request approve response
* **api:** require always-sent analytics fields and drop the unused project product field


### Chores

* **ci:** install only the headless Chromium shell in the browser ecosystem tests
* **ci:** remove unused build upload steps
* **docs:** clarify the Slack channel id description
* **docs:** clarify what disabling the Compliance API stops
* **docs:** clarify what the capability_access_all role action grants
* **docs:** link Dreams model fields to the supported models section
* **docs:** update example user ID in Admin API examples
* **internal:** add a section for each repository's own review rules
* **internal:** plainer wording in worker comments
* **internal:** type-check the published declarations of every subpackage

### Documentation

* add a description to the AnthropicBeta type
* **examples:** keep the message threads example valid on Sonnet 5.5
* **examples:** use current model IDs
* **readme:** point to the docs site for documentation
