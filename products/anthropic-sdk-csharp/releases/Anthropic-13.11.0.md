---
product: anthropic-sdk-csharp
version: "Anthropic-v13.11.0"
released_at: "2026-11-19"
source_url: "https://github.com/anthropics/anthropic-sdk-csharp/releases/tag/Anthropic-v13.11.0"
fetched_at: "2026-11-26"
---

# anthropic-sdk-csharp Anthropic-v13.11.0

### Features

* **api:** add Claude Code managed settings to the Admin API
* **api:** add the sandbox_egress_restricted error to Admin API plugin methods
* **client:** throw if a library was built against another major version

  After you upgrade, building a client throws `AnthropicException` if your app has a library that was compiled against a different major version of `Anthropic`. Such a library can misbehave without an error. Upgrade the library or rebuild it. To turn off the check, call `AppContext.SetSwitch("Anthropic.CheckAssemblyVersionCompatibility", false)` before you build a client.


### Chores

* **docs:** explain how the input-token rate limit types differ
* **docs:** name Claude Security in the usage and cost report descriptions
* **docs:** note that a Google Cloud external key's provider and key_name can't be changed
* **internal:** add this repository's review rules
