---
product: anthropic-sdk-csharp
version: "Anthropic-v13.5.0"
released_at: "2026-11-04"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v13.5.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Anthropic-v13.5.0

### Features

* **api:** add error details types and new error type values
* **api:** add ids filter to list workspaces
* **client:** add exception classes for HTTP statuses and API error codes, and Body, Type, ApiMessage, ErrorCode and Details on AnthropicServiceException
* **client:** add RequestID and WorkspaceID to AnthropicApiException


### Bug Fixes

* **api:** move some error details types to the resource they describe
* **client:** send ; raw in path parameters and reject ";x" and "..;x"
* **client:** stop percent-encoding @ + & : ! $ ' ( ) * , = in path parameters
* **meai:** report thinking tokens in usage details


### Chores

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
* **internal:** share how exception members read the error body


### Documentation

* **api:** show each field's own description for `speed`
