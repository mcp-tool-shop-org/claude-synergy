---
product: anthropic-sdk-csharp
version: "Anthropic-v12.56.0"
released_at: "2026-10-14"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.56.0"
fetched_at: "2026-10-24"
---

# anthropic-sdk-csharp Anthropic-v12.56.0

### Features

* **api:** add execution_identity to Managed Agents agents
* **api:** add organization_type_not_supported error to spend limit lists
* **api:** add telemetry destination test endpoint
* **api:** add telemetry destinations to the Admin API
* **client:** add native support for OpenTelemetry tracing

  To get the SDK's spans, add the `com.anthropic.sdk.csharp*` source to your tracer provider. To disable, initialize the client with `OpenTelemetry = false` or set `ANTHROPIC_OPEN_TELEMETRY=false`. Learn more in the [documentation](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk).

* **client:** `Aggregate()` and `CollectAsync` now return when the response body ends, not at `message_stop`


### Bug Fixes

* **api:** rename telemetry destination test response model
* **client:** don't follow redirects on token requests
* **client:** leave the trace context headers unsigned with released `Anthropic.Aws` and `Anthropic.Bedrock` packages too


### Chores

* **docs:** correct prefill, thinking, fallback and model descriptions
* **docs:** document the scope required to assign the managed role
* **docs:** update model examples


### Documentation

* **api:** clarify when custom tool results can be sent
* **api:** say is_enabled is always true for user spend limits
