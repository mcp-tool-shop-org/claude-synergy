---
product: anthropic-sdk-csharp
version: "Anthropic-v12.48.0"
released_at: "2026-09-15"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.48.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-csharp Anthropic-v12.48.0

## 12.48.0 (2026-09-15)

Full Changelog: [Anthropic-v12.47.0...Anthropic-v12.48.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.47.0...Anthropic-v12.48.0)

### Features

* **api:** add auto mode tool permissions for Managed Agents ([0271c76](https://github.com/anthropics/anthropic-sdk-csharp/commit/0271c76f256f140dd9e65191cbaa0e83f46b6af3))
* **api:** add compaction parameter and signed compaction blocks (beta) ([8de3a4e](https://github.com/anthropics/anthropic-sdk-csharp/commit/8de3a4e675460be51a9c9892b44b760fb7d503e6))
* **api:** add enum types for workspace data-residency geo fields ([59cd52e](https://github.com/anthropics/anthropic-sdk-csharp/commit/59cd52ef786013f362d42bbb0c5c18cef8fdc274))
* **api:** add thinking_mismatch_allowed entries to input_transformations (beta) ([854c852](https://github.com/anthropics/anthropic-sdk-csharp/commit/854c8525232e2110346f2d065d08a20f167311ec))
* **api:** add url_sources to the web fetch tool ([136c43d](https://github.com/anthropics/anthropic-sdk-csharp/commit/136c43d40600541172b51d7978effa676fdfccbb))
* **api:** add workspace_id parameter to user profiles methods ([4147e37](https://github.com/anthropics/anthropic-sdk-csharp/commit/4147e376b5d9291b20935b68c0f0de4a1c7401d6))


### Bug Fixes

* **api:** mark usage iteration model as nullable ([0a48821](https://github.com/anthropics/anthropic-sdk-csharp/commit/0a48821d9c67e2700d63c7caba5c6771b5593292))
* **api:** use one input transformation type for message and delta event ([d289654](https://github.com/anthropics/anthropic-sdk-csharp/commit/d2896549ec6be563ca755610208a41bd4a72fd0f))
* **client:** format and parse headers culture-invariantly ([892e6c6](https://github.com/anthropics/anthropic-sdk-csharp/commit/892e6c6c799e5fb6a665ed0d9d59da0bdf391229))
* **client:** honor Retry-After values above 60 seconds ([892e6c6](https://github.com/anthropics/anthropic-sdk-csharp/commit/892e6c6c799e5fb6a665ed0d9d59da0bdf391229))
* **client:** ignore invalid Retry-After values and validate maxRetries ([0271c76](https://github.com/anthropics/anthropic-sdk-csharp/commit/0271c76f256f140dd9e65191cbaa0e83f46b6af3))
* **client:** retry connection errors in the async client and stop blocking in the coroutine retry loop ([0271c76](https://github.com/anthropics/anthropic-sdk-csharp/commit/0271c76f256f140dd9e65191cbaa0e83f46b6af3))
* **client:** retry requests that hit the client-side timeout ([892e6c6](https://github.com/anthropics/anthropic-sdk-csharp/commit/892e6c6c799e5fb6a665ed0d9d59da0bdf391229))


### Chores

* **docs:** clarify that session_thread_id on tool use events is informational ([1650c34](https://github.com/anthropics/anthropic-sdk-csharp/commit/1650c3428fef3e4360148f9c442a5bd987680e24))
* **docs:** correct the compaction beta's parameter descriptions ([d457980](https://github.com/anthropics/anthropic-sdk-csharp/commit/d45798001fdb3be0dcb543fbea886564b0ff5cda))
* **internal:** await the body read in HttpResponse.Deserialize ([0271c76](https://github.com/anthropics/anthropic-sdk-csharp/commit/0271c76f256f140dd9e65191cbaa0e83f46b6af3))


### Documentation

* **api:** clarify usage.iterations entry typing under server-side fallback ([885f75b](https://github.com/anthropics/anthropic-sdk-csharp/commit/885f75b95adda0392464db5e614264a14ee7dd0a))
* **api:** fix typo in temperature deprecation message ([68307ac](https://github.com/anthropics/anthropic-sdk-csharp/commit/68307ac30bd200569e680e88a86e8cb4a656a353))
* stop documenting unions with their first variant's description ([39560d6](https://github.com/anthropics/anthropic-sdk-csharp/commit/39560d64fecb9b19e34b4946642165a08ef21e90))
