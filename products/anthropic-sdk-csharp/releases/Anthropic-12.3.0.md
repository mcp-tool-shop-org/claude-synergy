---
product: anthropic-sdk-csharp
version: "Anthropic-12.3.0"
released_at: "2026-01-29"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v12.3.0"
fetched_at: "2026-05-21"
---

# anthropic-sdk-csharp vAnthropic-12.3.0

## 12.3.0 (2026-01-29)

Full Changelog: [Anthropic-v12.2.0...Anthropic-v12.3.0](https://github.com/anthropics/anthropic-sdk-csharp/compare/Anthropic-v12.2.0...Anthropic-v12.3.0)

### Features

* **api:** add support for Structured Outputs in the Messages API ([6d3d655](https://github.com/anthropics/anthropic-sdk-csharp/commit/6d3d655e52c43c91e8837dda186e04984d5dcf62))
* **api:** migrate sending message format in output_config rather than output_format ([e24676b](https://github.com/anthropics/anthropic-sdk-csharp/commit/e24676bda5b1409059c65064d1bf52d09973d884))
* **client:** add `ToString` and `Equals` methods ([91fe9dd](https://github.com/anthropics/anthropic-sdk-csharp/commit/91fe9dd6ff1f17e1fb1347a749e08722e9d3565e))
* **client:** add `ToString` to `ApiEnum` ([6c1887d](https://github.com/anthropics/anthropic-sdk-csharp/commit/6c1887d3e5ae0f0744bb67a455b7c2dd066884ce))
* **client:** add Equals and ToString to params ([3be5397](https://github.com/anthropics/anthropic-sdk-csharp/commit/3be53975b406cca32cb0cd311a0cf684863855a8))


### Bug Fixes

* **client:** handle unions containing unknown types properly ([9dc5b92](https://github.com/anthropics/anthropic-sdk-csharp/commit/9dc5b92ae074c54e9287f6e7179a4b5c1dfe02b1))


### Chores

* change visibility of QueryString() and AddDefaultHeaders ([38a18f9](https://github.com/anthropics/anthropic-sdk-csharp/commit/38a18f9cb6a258a8c59c1478e001ce4ede35af52))
* **internal:** add copy constructor tests ([5915cfe](https://github.com/anthropics/anthropic-sdk-csharp/commit/5915cfe6b9a0df56b5acda9ac7cef0d89ae4dbe1))
* **internal:** codegen related update ([7b0a0e8](https://github.com/anthropics/anthropic-sdk-csharp/commit/7b0a0e862ac2adcdf05be8635662ca2f01b93ca9))
* **internal:** codegen related update ([fc997b8](https://github.com/anthropics/anthropic-sdk-csharp/commit/fc997b8829b7a6a89d9e52695a6f919a45f771ef))
* **internal:** codegen related update ([5e32bb5](https://github.com/anthropics/anthropic-sdk-csharp/commit/5e32bb5ed0488321c6809aab25c72a85a0296aa6))
* **internal:** improve HttpResponse qualification ([8b4d892](https://github.com/anthropics/anthropic-sdk-csharp/commit/8b4d892a18d6b05ed031bfecb1e78bfc0094cf47))
* **internal:** simplify imports ([8324572](https://github.com/anthropics/anthropic-sdk-csharp/commit/8324572350d980ea4695f2830320b4c70bd9125c))
* **internal:** version bump ([4e6f6dd](https://github.com/anthropics/anthropic-sdk-csharp/commit/4e6f6ddd0cfff4d301f7adf608256480e5d3703c))
* **readme:** remove beta warning now that we're in ga ([0738e65](https://github.com/anthropics/anthropic-sdk-csharp/commit/0738e6548fefbd207b016a3b05b45448ff71896e))
* **readme:** remove beta warning now that we're in ga ([7c4b745](https://github.com/anthropics/anthropic-sdk-csharp/commit/7c4b7457f7d32da04cf21865f8daff626901f286))
