---
product: anthropic-sdk-csharp
version: "Bedrock-v1.0.6"
released_at: "2026-11-20"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Bedrock-v1.0.6"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Bedrock-v1.0.6

### Bug Fixes

* **bedrock:** send the user profile ID in the request body

  Amazon Bedrock reads `user_profile_id` from the request body and ignores the `anthropic-user-profile-id` header, so a profile ID given to `AnthropicBedrockClient` was not applied. `AnthropicBedrockClient` now moves it into the body of Messages requests and no longer sends the header. A `user_profile_id` already in the body takes priority over the header.

  Some models on Bedrock do not support user profiles. A request to one of them with a profile ID now fails with a 400 error; before, the ID was ignored. Leave the ID off requests to those models.
