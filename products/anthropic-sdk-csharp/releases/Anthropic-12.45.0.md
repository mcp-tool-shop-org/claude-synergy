---
product: anthropic-sdk-csharp
version: "Anthropic-v12.45.0"
released_at: "2026-09-01"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.45.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-csharp Anthropic-v12.45.0

## 12.45.0 (2026-09-01)

Full Changelog: [Anthropic-v12.44.0...Anthropic-v12.45.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.44.0...Anthropic-v12.45.0)

### Features

* **api:** add external_user_onboarded_at to user profiles ([41cc8b1](https://github.com/anthropics/anthropic-sdk-csharp/commit/41cc8b1d7ea7b5af0d161a97de6156437e88c3a9))
* **api:** add support for claude-fable-5-1 and claude-mythos-5-1 ([80e4311](https://github.com/anthropics/anthropic-sdk-csharp/commit/80e4311a07a84cdda2e8eba939061b6e1f7015b8))
* **api:** add support for organization compliance settings in the Admin API ([7b89777](https://github.com/anthropics/anthropic-sdk-csharp/commit/7b89777cae3f4d2412e7afcf157cadb81e94a090))
* **api:** support pagination on organization rate limit list endpoints ([41cc8b1](https://github.com/anthropics/anthropic-sdk-csharp/commit/41cc8b1d7ea7b5af0d161a97de6156437e88c3a9))
* **user_profiles:** sort the user profile list by name with order_by=name ([ddeda3c](https://github.com/anthropics/anthropic-sdk-csharp/commit/ddeda3c5adb0c425fdc68cf02abce137b34d2474))


### Bug Fixes

* **api:** remove unsupported allowed_callers from the toolset entries ([53eaf40](https://github.com/anthropics/anthropic-sdk-csharp/commit/53eaf40403efb26bf042da76f893c4dd69427c89))
* **client:** default BinaryContent.FileName to the file's base name for any FileStream ([59ad939](https://github.com/anthropics/anthropic-sdk-csharp/commit/59ad939dca435b4fed7e9debc65d678e79730dfa))
* **client:** omit trailing newline in API error message for empty bodies ([09d8bdb](https://github.com/anthropics/anthropic-sdk-csharp/commit/09d8bdb3feeb0610758d959160ca68dbcf95d966))


### Chores

* **api:** remove unreleased thinking prefix_mismatched_behavior param ([8b1490d](https://github.com/anthropics/anthropic-sdk-csharp/commit/8b1490d234eb5206666bac499e12ec4840dcce84))
* **api:** remove user profile relationship in favor of access_type ([8b1490d](https://github.com/anthropics/anthropic-sdk-csharp/commit/8b1490d234eb5206666bac499e12ec4840dcce84))
* **docs:** clarify disallowed characters in memory paths ([7e78962](https://github.com/anthropics/anthropic-sdk-csharp/commit/7e789623c08852ac6261aef5eb64c688e447892e))
* **internal:** add browser-stubbed internal/node module and lint rule for Node built-in imports ([41cc8b1](https://github.com/anthropics/anthropic-sdk-csharp/commit/41cc8b1d7ea7b5af0d161a97de6156437e88c3a9))
* **internal:** pin JAVA_HOME for detekt-rules tests and relax UnusedPrivateProperty for tests/examples ([41cc8b1](https://github.com/anthropics/anthropic-sdk-csharp/commit/41cc8b1d7ea7b5af0d161a97de6156437e88c3a9))
* **internal:** read the request id shown in Terraform error diagnostics from the response header ([41cc8b1](https://github.com/anthropics/anthropic-sdk-csharp/commit/41cc8b1d7ea7b5af0d161a97de6156437e88c3a9))
* **internal:** remove discriminator support from PropertyInfo ([7b89777](https://github.com/anthropics/anthropic-sdk-csharp/commit/7b89777cae3f4d2412e7afcf157cadb81e94a090))


### Documentation

* **api:** backtick identifiers in managed-agents API descriptions ([0195119](https://github.com/anthropics/anthropic-sdk-csharp/commit/01951193210f280e9b469aa3beebd1e325166ba9))
* **api:** describe external_key_id and compartment_id behavior on Claude Platform on AWS ([c87d043](https://github.com/anthropics/anthropic-sdk-csharp/commit/c87d043fe4d283b4c7cc84b76e9ecba3dc9677f6))
* **changelog:** detail the beta files/skills GA-shape change ([#254](https://github.com/anthropics/anthropic-sdk-csharp/issues/254)) ([87e59bc](https://github.com/anthropics/anthropic-sdk-csharp/commit/87e59bccda51f2566b49e956c780b64c06f0f938))
