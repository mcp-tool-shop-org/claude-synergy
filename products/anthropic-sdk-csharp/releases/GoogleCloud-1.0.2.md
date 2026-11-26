---
product: anthropic-sdk-csharp
version: "GoogleCloud-v1.0.2"
released_at: "2026-11-10"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/GoogleCloud-v1.0.2"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp GoogleCloud-v1.0.2

### Bug Fixes

* **google-cloud:** percent-encode the project, location and workspace ID in the derived base URL, so one with a `/` in it can't send the request to a different path, and throw on an empty value or one of `"."` or `".."`
