---
product: anthropic-sdk-typescript
version: "sdk-v1.2.0"
released_at: "2026-10-23"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v1.2.0"
fetched_at: "2026-10-31"
---

# anthropic-sdk-typescript sdk-v1.2.0

### Features

* **api:** add support for message threads
* **api:** add usage and cost reports by dimension, mark older reports legacy


### Bug Fixes

* **tools:** copy the messages a tool runner is created with again
* **tools:** restore what the tool runner does after setMessagesParams() or pushMessages() in the loop body


### Chores

* **docs:** clarify plugin content scan and validation descriptions
* **docs:** clarify plugin served_version_pinned and updated_at
* **docs:** fix usage and cost report examples and ending_at docs
* **docs:** rate limit model lists vary by organization and workspace
* **internal:** rename the version manifest to .version-manifest.json
* **tests:** fix a retry count header test that could never fail
