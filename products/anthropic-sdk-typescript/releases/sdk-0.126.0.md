---
product: anthropic-sdk-typescript
version: "sdk-v0.126.0"
released_at: "2026-09-15"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.126.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.126.0

## 0.126.0 (2026-09-15)

Full Changelog: [sdk-v0.125.0...sdk-v0.126.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.125.0...sdk-v0.126.0)

### Features

* **api:** add auto mode tool permissions for Managed Agents ([7829b43](https://github.com/anthropics/anthropic-sdk-typescript/commit/7829b4302375a14db64d5536226768601f843233))
* **api:** add compaction parameter and signed compaction blocks (beta) ([05fd878](https://github.com/anthropics/anthropic-sdk-typescript/commit/05fd87804f1cb2db1ea94528ba3b5087403177ba))
* **api:** add enum types for workspace data-residency geo fields ([89c5920](https://github.com/anthropics/anthropic-sdk-typescript/commit/89c59203ec82987a500f8ab9ddf591d1ee6067ae))
* **api:** add thinking_mismatch_allowed entries to input_transformations (beta) ([1f32871](https://github.com/anthropics/anthropic-sdk-typescript/commit/1f32871253f8791de968bcc72e33cc0acf350811))
* **api:** add url_sources to the web fetch tool ([ee23dd2](https://github.com/anthropics/anthropic-sdk-typescript/commit/ee23dd2b1000499cdbe5dcce1c7487c6744d33d1))
* **api:** add workspace_id parameter to user profiles methods ([f5b9fb7](https://github.com/anthropics/anthropic-sdk-typescript/commit/f5b9fb74ec19e23cd19f6be5120d403a54e05515))


### Bug Fixes

* **api:** mark usage iteration model as nullable ([bec3bec](https://github.com/anthropics/anthropic-sdk-typescript/commit/bec3beca3c3b1111b078b9aaedc9791a7baf6b9e))
* **api:** use one input transformation type for message and delta event ([e016d25](https://github.com/anthropics/anthropic-sdk-typescript/commit/e016d25ee46611fb6e37d856e3c54f234ca04b27))
* **client:** ignore invalid Retry-After values and validate maxRetries ([7829b43](https://github.com/anthropics/anthropic-sdk-typescript/commit/7829b4302375a14db64d5536226768601f843233))
* **client:** retry connection errors in the async client and stop blocking in the coroutine retry loop ([7829b43](https://github.com/anthropics/anthropic-sdk-typescript/commit/7829b4302375a14db64d5536226768601f843233))
* **client:** stop waiting for a retry as soon as the request is aborted ([941aaea](https://github.com/anthropics/anthropic-sdk-typescript/commit/941aaea3ca9a42e00b1979f9eac8ca19ae9eb0dd))
* **client:** use the default backoff when Retry-After is out of range ([1090c44](https://github.com/anthropics/anthropic-sdk-typescript/commit/1090c44d11afa79316f68acd53392cbd1ad071ca))
* **internal:** stop a declaration file using a type that needs TypeScript 5.7 ([e32a956](https://github.com/anthropics/anthropic-sdk-typescript/commit/e32a956ec4fa40189579357dd2a3f090142cde0f))


### Performance Improvements

* add "sideEffects": false so bundlers can drop unused modules ([f804366](https://github.com/anthropics/anthropic-sdk-typescript/commit/f804366911e95fb15a73dc69f918d2ade3adfaf3))
* mark classes as pure so bundlers can drop unused ones ([f804366](https://github.com/anthropics/anthropic-sdk-typescript/commit/f804366911e95fb15a73dc69f918d2ade3adfaf3))


### Chores

* **docs:** clarify that session_thread_id on tool use events is informational ([a07ecf3](https://github.com/anthropics/anthropic-sdk-typescript/commit/a07ecf3e54502cc635c6a5a6ed790d4a2fd70b47))
* **docs:** correct the compaction beta's parameter descriptions ([eb9abd2](https://github.com/anthropics/anthropic-sdk-typescript/commit/eb9abd200de3a13098a796fa8482f2764df6bd98))
* **internal:** move the sub-packages off ts-node and modernise their tsconfig ([1d7cd91](https://github.com/anthropics/anthropic-sdk-typescript/commit/1d7cd915ab581332085f738d1eb5ed17464004d7))
* **internal:** move tsconfig off settings deprecated in TypeScript 6 ([e0d58f6](https://github.com/anthropics/anthropic-sdk-typescript/commit/e0d58f60a4261d5620af2a1496b0d9d5dc2d307c))
* **internal:** pin the pnpm version with an integrity hash ([f804366](https://github.com/anthropics/anthropic-sdk-typescript/commit/f804366911e95fb15a73dc69f918d2ade3adfaf3))
* **internal:** root package drops ts-node; repo root becomes ESM ([3f371a1](https://github.com/anthropics/anthropic-sdk-typescript/commit/3f371a1e11b66938914fbda6ee6d613b008716d1))
* **internal:** stop using ts-node for the publish script and the ecosystem test runner ([2e589c8](https://github.com/anthropics/anthropic-sdk-typescript/commit/2e589c87fe7f151960699112bd2b42de1c198f9a))
* **tests:** stop the mock server without failing a passing test run ([a364c12](https://github.com/anthropics/anthropic-sdk-typescript/commit/a364c123e19a19b343fb3a028d39d26065433929))


### Documentation

* **api:** clarify usage.iterations entry typing under server-side fallback ([c5f0ef3](https://github.com/anthropics/anthropic-sdk-typescript/commit/c5f0ef36fda2996081a9f9b6b931a07289199677))
* **api:** compaction instructions replace the server's summarization prompt ([941aaea](https://github.com/anthropics/anthropic-sdk-typescript/commit/941aaea3ca9a42e00b1979f9eac8ca19ae9eb0dd))
* **api:** fix typo in temperature deprecation message ([4a8b49b](https://github.com/anthropics/anthropic-sdk-typescript/commit/4a8b49be58c8c13d90c2cf63baeb38b0a9427c18))
* stop documenting unions with their first variant's description ([fa06caf](https://github.com/anthropics/anthropic-sdk-typescript/commit/fa06caf394f7683aaf0fdb1335276b75688798b4))
