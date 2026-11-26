---
product: anthropic-sdk-csharp
version: "Bedrock-v1.0.2"
released_at: "2026-11-10"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Bedrock-v1.0.2"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Bedrock-v1.0.2

### Bug Fixes

* **bedrock:** throw on an empty model or one of `"."` or `".."`, and send the `/` in an inference profile's ARN as `%2F`, so the model can't change the request path
