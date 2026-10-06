---
product: anthropic-sdk-typescript
version: "sdk-v0.122.0"
released_at: "2026-08-27"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.122.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.122.0

## 0.122.0 (2026-08-27)

Full Changelog: [sdk-v0.121.0...sdk-v0.122.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.121.0...sdk-v0.122.0)

### Features

* **api:** beta files/skills namespaces use GA shapes; drop dated beta header pins ([45d693a](https://github.com/anthropics/anthropic-sdk-typescript/commit/45d693a66bc7fb1af66d9c4e3625f6d6f64bae59))


### Bug Fixes

* **client:** classify cross-realm DOMException abort/timeout errors correctly ([1bd6395](https://github.com/anthropics/anthropic-sdk-typescript/commit/1bd639515e9948c1dc45047ce5cb4fcfc5c436b8))
* **client:** use configured logger for SSE parse errors ([80eeaf7](https://github.com/anthropics/anthropic-sdk-typescript/commit/80eeaf7b01b49ed83abd38bb6841b4ad25b06fe6))
* **sessions:** make event accumulator forward-compatible with new event types ([#410](https://github.com/anthropics/anthropic-sdk-typescript/issues/410)) ([2d084fd](https://github.com/anthropics/anthropic-sdk-typescript/commit/2d084fdaeb6b51a1613f321cd65e2184d55d8d1e))
* **tools:** let read return a view_range of a file over the size cap ([#427](https://github.com/anthropics/anthropic-sdk-typescript/issues/427)) ([56b3260](https://github.com/anthropics/anthropic-sdk-typescript/commit/56b32601f6b97a0d56450f2eba19e58d1bb0202e))
* **uploads:** default bare Blob filename on skills endpoints ([#422](https://github.com/anthropics/anthropic-sdk-typescript/issues/422)) ([e111649](https://github.com/anthropics/anthropic-sdk-typescript/commit/e1116491dd4021d0237d1bb440237677a03045f5))
* **webhooks:** require headers to be passed to `unwrap()` ([3230804](https://github.com/anthropics/anthropic-sdk-typescript/commit/3230804e63371f535a850d1df6752284643a01fe))


### Chores

* **internal:** codegen related update ([c2f327a](https://github.com/anthropics/anthropic-sdk-typescript/commit/c2f327a30d14a4b1ee4cc777a4d0b37f5d44f0af))


### Documentation

* **api:** clarify pagination on the organization rate-limit list endpoints ([d6015b9](https://github.com/anthropics/anthropic-sdk-typescript/commit/d6015b90b3e895cd173b7d71038ec71bf467a69b))
* document TypeScript 5.0 as the minimum supported version ([788e721](https://github.com/anthropics/anthropic-sdk-typescript/commit/788e7217937471e07af3800ab65172eafbf32e2a))
