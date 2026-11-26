---
product: anthropic-sdk-csharp
version: "Anthropic-v13.10.0"
released_at: "2026-11-17"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v13.10.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Anthropic-v13.10.0

### Features

* **api:** add beta support for the billing_policy request parameter
* **api:** add contract_spend_limit_reached error code to messages
* **api:** add error codes for linked billing refusals
* **api:** add the user_profile_billing_not_authorized error code
* **api:** add webhook events for external key failure and recovery


### Bug Fixes

* **client:** encode spaces in query strings as %20

  The AWS SigV4 signature of a request now matches its query string when a parameter contains a space.


### Performance Improvements

* **client:** allocate less memory for large image and PDF requests

  Request bodies no longer escape `+`, `<`, `>`, `&`, `'`, backticks or most non-ASCII text as `\uXXXX`. A body that the SDK rewrites stays escaped: requests through `AnthropicVertexClient` and `AnthropicBedrockClient`, and some requests through `AnthropicBedrockMantleClient` and `BetaRefusalFallbackHandler`. The JSON means the same, but custom HTTP handlers now see non-ASCII UTF-8 bytes. The raw JSON text that models and unions keep (`GetRawText()`) changes in the same way; `ToString()` does not.

* **client:** allocate less memory to send each JSON request

  Custom HTTP handlers now see the request body as `ByteArrayContent`, not `StringContent`. The bytes and headers are the same.


### Chores

* **docs:** clarify which AWS KMS keys a workspace can use on Claude Platform on AWS
* **docs:** clarify which credential work get, update and list accept
* **docs:** clarify which uploads a plugin pin holds back
* **docs:** note that a plugin scan's reason also covers errored scans

  `content_scan.reason` on an errored scan now says why there is no verdict. It is not a security finding, so code that treats any `reason` as a concern should also check `status`.
