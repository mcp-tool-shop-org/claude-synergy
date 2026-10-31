---
product: anthropic-sdk-typescript
version: "sdk-v0.134.0"
released_at: "2026-10-14"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.134.0"
fetched_at: "2026-10-31"
---

# anthropic-sdk-typescript sdk-v0.134.0

### Features

* **api:** add execution_identity to Managed Agents agents
* **api:** add organization_type_not_supported error to spend limit lists
* **api:** add telemetry destination test endpoint
* **api:** add telemetry destinations to the Admin API
* **client:** add native support for OpenTelemetry tracing

  If your app registers a global tracer provider, the SDK will create spans with it after upgrading, and they'll be exported with the rest of your traces. Requests will also get trace context headers from the global propagator. To disable, pass `openTelemetry: false` to the client or set `ANTHROPIC_OPEN_TELEMETRY=false`. Learn more in the [documentation](https://platform.claude.com/docs/en/manage-claude/opentelemetry/sdk).


### Bug Fixes

* **api:** rename telemetry destination test response model
* **client:** close an unread stream that was dropped while tracing is on
* **client:** don't follow redirects on token requests
* **client:** treat proxy-authorization as a sensitive header


### Bug Fixes

* **streaming:** tolerate unknown event types in MessageStream and BetaMessageStream
* **streaming:** stop throwing "Unexpected event order" for an event before message_start
* **streaming:** yield events that arrive before message_start when iterating MessageStream and BetaMessageStream


### Chores

* **docs:** correct prefill, thinking, fallback and model descriptions
* **docs:** document the scope required to assign the managed role
* **docs:** update model examples
* include the license files in the published packages
* **internal:** narrow the tripwire test rule in the contributor guides
* **internal:** remove `@internal` tag from a type that public types reference
* **internal:** remove file-level `@internal` tags from toolset modules
* **internal:** strip `@internal` declarations from published types
* **internal:** type-check the built declarations in lint


### Documentation

* **api:** clarify when custom tool results can be sent
* **api:** say is_enabled is always true for user spend limits
* move more shared rules into the shared part of CLAUDE.md
* show examples of streaming-only methods iterating the stream
