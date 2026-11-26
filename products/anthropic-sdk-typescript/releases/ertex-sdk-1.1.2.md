---
product: anthropic-sdk-typescript
version: "ertex-sdk-v1.1.2"
released_at: "2026-11-04"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/vertex-sdk-v1.1.2"
fetched_at: "2026-11-26"
---

# anthropic-sdk-typescript vertex-sdk-v1.1.2

### Bug Fixes

* **vertex:** percent-encode the project ID, region and model in the request path, so a `/` in the model can't move the request outside `/publishers/anthropic/models/`, and throw an `AnthropicError` for an empty `model` or a project ID or region of `.` or `..`
