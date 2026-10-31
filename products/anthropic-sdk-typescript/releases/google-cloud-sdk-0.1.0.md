---
product: anthropic-sdk-typescript
version: "google-cloud-sdk-v0.1.0"
released_at: "2026-10-14"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/google-cloud-sdk-v0.1.0"
fetched_at: "2026-10-31"
---

# anthropic-sdk-typescript google-cloud-sdk-v0.1.0

### Features

* **api:** add execution_identity to Managed Agents agents
* **client:** add native support for OpenTelemetry tracing

  If your app registers a global tracer provider, the SDK will create spans with it after upgrading, and they'll be exported with the rest of your traces. Requests will also get trace context headers from the global propagator. To disable, pass `openTelemetry: false` to the client or set `ANTHROPIC_OPEN_TELEMETRY=false`. Learn more in the [documentation](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk).


### Chores

* include the license files in the published packages
* **internal:** strip `@internal` declarations from published types
