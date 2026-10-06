---
product: anthropic-sdk-typescript
version: "sdk-v0.101.0"
released_at: "2026-06-05"
source_url: "https://github.com/anthropics/anthropic-sdk-typescript/releases/tag/sdk-v0.101.0"
fetched_at: "2026-10-06"
---

# anthropic-sdk-typescript sdk-v0.101.0

## 0.101.0 (2026-06-05)

Full Changelog: [sdk-v0.100.1...sdk-v0.101.0](https://github.com/anthropics/anthropic-sdk-typescript/compare/sdk-v0.100.1...sdk-v0.101.0)

### Features

* **client:** add support for middleware ([9b01120](https://github.com/anthropics/anthropic-sdk-typescript/commit/9b011207965540211cefb19d44d758b7942aedab))


### Bug Fixes

* apply request timeout to inner fetch only, not middleware chain ([#40](https://github.com/anthropics/anthropic-sdk-typescript/issues/40)) ([25c13f6](https://github.com/anthropics/anthropic-sdk-typescript/commit/25c13f6183391f006396f16a9bd9a2c2f710d52c))
* **streaming:** carry stop_details through beta message_delta accumulation ([ed3fec7](https://github.com/anthropics/anthropic-sdk-typescript/commit/ed3fec7ace406fe4b0ca3494439061695dabf475))
* **streaming:** correctly parse json numbers with scientific notation ([#9](https://github.com/anthropics/anthropic-sdk-typescript/issues/9)) ([7d5e642](https://github.com/anthropics/anthropic-sdk-typescript/commit/7d5e6422dc5b58bc991c1587c4f1a0e8e753f2a5))


### Chores

* **internal:** fix artifact url ([925ec27](https://github.com/anthropics/anthropic-sdk-typescript/commit/925ec276fa97baf63d3643f24430bd2a8302c5dc))
* **internal:** fix branch names ([fa3cf2c](https://github.com/anthropics/anthropic-sdk-typescript/commit/fa3cf2c491f0ed274dc7839779f7fd91c15b5dbf))
* **internal:** update private repo name ([a8ac213](https://github.com/anthropics/anthropic-sdk-typescript/commit/a8ac213b8ce0955bd66f0b2f5bcecc2976867fb2))


### Documentation

* point security reports to Anthropic's HackerOne program ([#16](https://github.com/anthropics/anthropic-sdk-typescript/issues/16)) ([5c7912c](https://github.com/anthropics/anthropic-sdk-typescript/commit/5c7912c36e0210c6cbc773a32a7ba983aaf611df))
