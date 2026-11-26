---
product: anthropic-sdk-csharp
version: "Anthropic-v13.12.0"
released_at: "2026-11-20"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v13.12.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Anthropic-v13.12.0

### Features

* **api:** add the image_dimensions_too_large error code


### Bug Fixes

* **client:** keep enum member numbers stable across versions

  Enum members keep the numbers they had in 13.11.0. Recompile any library that was built against 13.10.0 or earlier.

* **client:** send one user profile ID when the request and the client both set one

  A user profile ID set on a request and another set in the client's `ExtraHeaders` were both sent, as `anthropic-user-profile-id: a, b`. The request's ID is now sent alone, as `anthropic-workspace-id` already was.


### Chores

* **docs:** clarify billing_policy in batches and two billing errors
