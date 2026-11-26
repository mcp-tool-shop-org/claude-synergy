---
product: anthropic-sdk-typescript
version: "sdk-v1.5.0"
released_at: "2026-11-04"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v1.5.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-typescript sdk-v1.5.0

### Features

* **api:** add error details types and new error type values
* **api:** add ids filter to list workspaces
* **client:** add error classes for HTTP statuses and API error codes, and apiMessage, errorCode and details on APIError


### Bug Fixes

* **api:** capitalize CMEK in error details type names
* **api:** move some error details types to the resource they describe
* **client:** reject path parameters like ";x", ".;x" and "..;x"
* **tools:** keep the memory tool from renaming or deleting the /memories directory


### Performance Improvements

* **streaming:** decode server-sent events once per chunk


### Chores

* **api:** update example values for pattern-constrained string fields
* **docs:** clarify plugin reach values
* **docs:** clarify plugin version description and plugin reach
* **docs:** clarify plugin version description length
* **docs:** clarify some API field descriptions
* **docs:** clarify three error descriptions
* **docs:** clarify which blocks to send back around a fallback block
* **docs:** correct Claude Tag direct message notes in usage reports
* **docs:** reword Dream and RBAC role permission descriptions
* **docs:** update the telemetry destination headers description
* **docs:** use the Claude Platform name in analytics filter docs
* **internal:** accept changelog entry files in the changelog check
* **internal:** ignore changelog entry files
* **internal:** simplify how error classes read the response body


### Documentation

* **api:** show each field's own description for `speed`
* clean up escapes and code spans in doc comments
* fix examples that leave out a required params argument
