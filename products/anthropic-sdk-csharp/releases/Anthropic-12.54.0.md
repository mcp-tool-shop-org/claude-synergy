---
product: anthropic-sdk-csharp
version: "Anthropic-v12.54.0"
released_at: "2026-10-07"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.54.0"
fetched_at: "2026-10-10"
---

# anthropic-sdk-csharp Anthropic-v12.54.0

## 12.54.0 (2026-10-07)

Full Changelog: [Anthropic-v12.53.0...Anthropic-v12.54.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.53.0...Anthropic-v12.54.0)

### Features

* **api:** add claude-haiku-5-5 and typed computer and browser toolset tool calls ([bca56de](https://github.com/anthropics/anthropic-sdk-csharp/commit/bca56de999f39d664e9fc84673adcb8f7a2d0803))
* **api:** add disabled to thinking types in model capabilities ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **api:** add display_name to RBAC roles and deprecate name ([d2f6d96](https://github.com/anthropics/anthropic-sdk-csharp/commit/d2f6d961e1fed1864d35801846a058a8e07170eb))
* **api:** add include_default parameter to list workspaces ([502f752](https://github.com/anthropics/anthropic-sdk-csharp/commit/502f752d7c006552fbe51e4cb9fcb1c9c59efb25))
* **api:** add lifecycle stage fields and filter to /v1/models ([05c792c](https://github.com/anthropics/anthropic-sdk-csharp/commit/05c792c03b8e590866145303fe502538583ffa57))
* **api:** add line to model objects ([df91307](https://github.com/anthropics/anthropic-sdk-csharp/commit/df9130728f66cd7f0662f71eea7d5d04eaf13f3a))
* **api:** add url_sources to the Managed Agents web_fetch tool config ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **api:** add web search and code execution support to model capabilities ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **client:** add union accessors for list properties shared by variants ([a19f2a5](https://github.com/anthropics/anthropic-sdk-csharp/commit/a19f2a54eace7522ccab81d8a6de2402c0d59991))


### Bug Fixes

* **api:** send the beta header by default when listing spend limits ([ec16f74](https://github.com/anthropics/anthropic-sdk-csharp/commit/ec16f74b981337286cc0ae99019f57b531e6fd18))
* **client:** return null when a nullable response body is null ([5122a30](https://github.com/anthropics/anthropic-sdk-csharp/commit/5122a3058bb43a73c929d7b2da5756e45b754f6f))
* **client:** send array header params as a single comma-separated header ([bac1eb7](https://github.com/anthropics/anthropic-sdk-csharp/commit/bac1eb753349aa4caa59a8e205678a56e1b99d13))
* **client:** send default and caller-provided array header values in a single header ([5020471](https://github.com/anthropics/anthropic-sdk-csharp/commit/502047174ecd2ab059980b3fedd9156feb532b4c))
* **client:** send numbers inside query and header array params ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **client:** unset optional properties assigned null in with expressions ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **tests:** read the hosted tools beta header as a comma-separated value ([#270](https://github.com/anthropics/anthropic-sdk-csharp/issues/270)) ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))


### Performance Improvements

* **client:** allocate less memory per model and params object ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))


### Chores

* **api:** mark the Text Completions API as deprecated ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **docs:** correct example groups in rate limit list description ([74bde4d](https://github.com/anthropics/anthropic-sdk-csharp/commit/74bde4d194ae25e17fca08a824e69e964977ff8f))
* **docs:** correct when usage and cost report data becomes final ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **docs:** describe a federation rule's target by its type ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **docs:** fix example IDs in sessions, agents and vault credentials ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **docs:** update Managed Agents multiagent and thread descriptions ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **docs:** update the activity summaries endpoint description ([f8b02c9](https://github.com/anthropics/anthropic-sdk-csharp/commit/f8b02c983f2df564f97b2562b3cc29d1efb10ed6))
* **docs:** update the description of the Model line field ([7b99cc0](https://github.com/anthropics/anthropic-sdk-csharp/commit/7b99cc08c056ced597b1b69f44bf66d57dc5ab61))
* **internal:** add REVIEW.md with review instructions ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **internal:** set the API key in a generated retry test ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **tests:** remove redundant union constructors from examples and tests ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
* **tests:** run the multi-client service tests ([#269](https://github.com/anthropics/anthropic-sdk-csharp/issues/269)) ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))


### Documentation

* **api:** state the agent tools limit as 256 ([e311735](https://github.com/anthropics/anthropic-sdk-csharp/commit/e311735bebf5f977dd20b92eb3ef1069387c408c))
* remove a stray ">" from doc comments of union enum variants ([ced04c8](https://github.com/anthropics/anthropic-sdk-csharp/commit/ced04c899972e41217b9d7044fa78749d8f96076))
