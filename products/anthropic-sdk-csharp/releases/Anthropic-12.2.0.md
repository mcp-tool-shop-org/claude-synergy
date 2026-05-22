---
product: anthropic-sdk-csharp
version: "Anthropic-12.2.0"
released_at: "2026-01-14"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.2.0"
fetched_at: "2026-05-21"
---

# anthropic-sdk-csharp vAnthropic-12.2.0

## 12.2.0 (2026-01-14)

Full Changelog: [Anthropic-v12.1.0...Anthropic-v12.2.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.1.0...Anthropic-v12.2.0)

### Features

* **client:** add helper functions for raw messages ([c38e0f1](https://github.com/anthropics/anthropic-sdk-csharp/commit/c38e0f12290a08e6cabd3648aafdb9ff6805ef1b))
* **client:** add more `ToString` implementations ([ebebe2a](https://github.com/anthropics/anthropic-sdk-csharp/commit/ebebe2a91c38de423dd1c8c66f458e18ddfefb99))
* **client:** add strong naming ([4feeae5](https://github.com/anthropics/anthropic-sdk-csharp/commit/4feeae5326bdafe703446ea9d7d59998e75b44a2))
* **client:** support `WithRawResponse` in Foundry client ([#92](https://github.com/anthropics/anthropic-sdk-csharp/issues/92)) ([39ffeb2](https://github.com/anthropics/anthropic-sdk-csharp/commit/39ffeb28ba31d8d6efd419e70399ef40c5a821bf))
* **client:** support accessing raw responses ([81ad4fe](https://github.com/anthropics/anthropic-sdk-csharp/commit/81ad4febea7ad4d467e551ac1105ccbdb7e6f936))


### Bug Fixes

* **client:** add missing serializer options ([f08055c](https://github.com/anthropics/anthropic-sdk-csharp/commit/f08055c4c414f5a0178403236d93ed332e8f67e0))
* **client:** copy path params in params copy constructors ([23fd7c6](https://github.com/anthropics/anthropic-sdk-csharp/commit/23fd7c6f9d073f5178d4762add1586a11a165a15))
* **client:** ensure deep immutability for deep array/dict structures ([d9385f7](https://github.com/anthropics/anthropic-sdk-csharp/commit/d9385f70245608f7aaf79b799e6a2837e8b1f692))
* **client:** freeze models on property access ([4aec2c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/4aec2c8efd1b7be8736bc4ee374c0a2e2c9af565))
* **client:** throw api enum errors as invalid data exception ([6028977](https://github.com/anthropics/anthropic-sdk-csharp/commit/60289772157c9644f3f3c39cdbc20d468916c351))
* **client:** union switch method type checks ([e0c4fcb](https://github.com/anthropics/anthropic-sdk-csharp/commit/e0c4fcb5f379210c52549a3ebf0a0648ca186946))
* **client:** use readonly type for param ([b00209c](https://github.com/anthropics/anthropic-sdk-csharp/commit/b00209c458cae1609354d1c1a87a463b0fd7c421))
* **internal:** accidental custom code ([2025fbb](https://github.com/anthropics/anthropic-sdk-csharp/commit/2025fbb9472bee6bbf84db2f17e3509a31cc8eae))
* **internal:** build ([74ac455](https://github.com/anthropics/anthropic-sdk-csharp/commit/74ac455672b22d37973b92400578a32b30196f1f))
* **internal:** remove redundant line ([ed85010](https://github.com/anthropics/anthropic-sdk-csharp/commit/ed8501035c018797edadcb2c2bfecdb4a08d6fff))
* **internal:** remove roundtrip tests for multipart params ([1e3f6e1](https://github.com/anthropics/anthropic-sdk-csharp/commit/1e3f6e15792b9aa8ce9cd9b210af1484c0909be8))
* use Properties initializer for InputSchema in IChatClient extensions ([#83](https://github.com/anthropics/anthropic-sdk-csharp/issues/83)) ([b4d9faf](https://github.com/anthropics/anthropic-sdk-csharp/commit/b4d9faf036c145727a722ba586bbb38d692b8464))


### Performance Improvements

* **client:** add json deserialization caching ([d9385f7](https://github.com/anthropics/anthropic-sdk-csharp/commit/d9385f70245608f7aaf79b799e6a2837e8b1f692))


### Chores

* **client:** consistently use serializer options ([d02b2fa](https://github.com/anthropics/anthropic-sdk-csharp/commit/d02b2faac56aa4ebaaf7d018f87c68f804e56f49))
* **client:** mark claude-3-5-haiku as deprecated ([b5f147c](https://github.com/anthropics/anthropic-sdk-csharp/commit/b5f147c4ea57e8932a1bfb4dd93cdca23cb7d23e))
* **client:** use mutable collections for union deserialization ([bd75f30](https://github.com/anthropics/anthropic-sdk-csharp/commit/bd75f309274287c39b9bd3a6cf4a40220387267d))
* **internal:** codegen related update ([8565b06](https://github.com/anthropics/anthropic-sdk-csharp/commit/8565b06cac5d068ff9ada0b6dd46dcbf26f183f9))
* **internal:** codegen related update ([df7fd3c](https://github.com/anthropics/anthropic-sdk-csharp/commit/df7fd3c77ddbb9f94e0419e6759b24c30e45dffb))
* **internal:** format ([3af90a7](https://github.com/anthropics/anthropic-sdk-csharp/commit/3af90a7314837e1ff517454abf502b340f4ce86a))
* **internal:** use better namespace aliases ([16b810a](https://github.com/anthropics/anthropic-sdk-csharp/commit/16b810aa749bbc6d83e15730548183fa2a4d8ea2))


### Refactors

* **client:** add `JsonDictionary` identity methods ([2c26557](https://github.com/anthropics/anthropic-sdk-csharp/commit/2c265578de729bbc17ee4df21119aaf965a1d5b0))
* **client:** make unions implement `ModelBase` ([8500f1e](https://github.com/anthropics/anthropic-sdk-csharp/commit/8500f1e194d94965cb06d7b2bbf39c6430e8bfbe))
* **internal:** `JsonElement` constant construction ([bb19b2b](https://github.com/anthropics/anthropic-sdk-csharp/commit/bb19b2b59c1af409b393af06c39fb67371f763d1))
* **internal:** unnest constant converter ([65a1eec](https://github.com/anthropics/anthropic-sdk-csharp/commit/65a1eec251d0080a4336a3236c83f0a59aa91be6))
