---
product: anthropic-sdk-csharp
version: "Aws-v0.6.0"
released_at: "2026-10-14"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Aws-v0.6.0"
fetched_at: "2026-10-24"
---

# anthropic-sdk-csharp Aws-v0.6.0

### Features

* **client:** add native support for OpenTelemetry tracing

  To get the SDK's spans, add the `com.anthropic.sdk.csharp*` source to your tracer provider. To disable, initialize the client with `OpenTelemetry = false` or set `ANTHROPIC_OPEN_TELEMETRY=false`. Learn more in the [documentation](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk).
