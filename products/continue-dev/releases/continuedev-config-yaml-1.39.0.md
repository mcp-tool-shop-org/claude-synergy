---
product: continue-dev
version: "@continuedev/config-yaml@1.39.0"
released_at: "2026-01-15"
source_url: "https://github.com/continuedev/continue/releases/tag/%40continuedev/config-yaml%401.39.0"
fetched_at: "2026-05-24"
---

# continue-dev @continuedev/config-yaml@1.39.0

# [1.39.0](https://github.com/continuedev/continue/compare/@continuedev/config-yaml@1.38.0...@continuedev/config-yaml@1.39.0) (2026-01-15)


### Bug Fixes

* add GH_TOKEN to continue-agents workflow ([dd93919](https://github.com/continuedev/continue/commit/dd939190701be55917d4d224f012017e8ea17be9)), closes [#9493](https://github.com/continuedev/continue/issues/9493)
* break circular dependency by extracting tool names ([6a5f80b](https://github.com/continuedev/continue/commit/6a5f80b0fc739ed36448b62bd036c01476b91d49))
* **cli:** compaction for missing tool results ([0792b94](https://github.com/continuedev/continue/commit/0792b949bdf629fd14dac45478b2027962b77454))
* context length error detection ([1bfb72e](https://github.com/continuedev/continue/commit/1bfb72edf3f6c0eccb66454eb9e3ad423f58bee5))
* correct built-in tool names list ([26bef77](https://github.com/continuedev/continue/commit/26bef77a8859788b870e42036e0958bdbaa9d93a))
* correct import order in ToolPermissionService ([2003128](https://github.com/continuedev/continue/commit/2003128f084517bdf5343d6e2205edc85db8ff64))
* decode URI-encoded pathname for WSL workspace paths ([074a6c7](https://github.com/continuedev/continue/commit/074a6c74baf35b98e0092f0e6b37027bb6561eba))
* merge yaml.schemas settings ([a0729bd](https://github.com/continuedev/continue/commit/a0729bd6ec7f5a7b8cdf187baac8abf3156b9f75)), closes [#7080](https://github.com/continuedev/continue/issues/7080)
* properly resolve WSL2 workspace paths in runTerminalCommand ([eab2ac1](https://github.com/continuedev/continue/commit/eab2ac1e045f2e4ba994cb7371b8e3a8e8aaf4b7))
* resolve circular dependency in subagent executor ([87fd9b6](https://github.com/continuedev/continue/commit/87fd9b67df4661a261881a2cb028ab651c695128))
* resolve circular dependency in subagent tool ([1c448c4](https://github.com/continuedev/continue/commit/1c448c479d1e2f4c50c586d494288d6b8889c178))
* upgrade @sentry/profiling-node from 9.46.0 to 9.47.1 ([9448930](https://github.com/continuedev/continue/commit/9448930f6094cf46dff5001664c9033312072edc))
* upgrade lru-cache from 11.0.2 to 11.2.4 ([269be8b](https://github.com/continuedev/continue/commit/269be8bb5fdb4651a2e52f832e92f5dc8b250b55))
* upgrade monaco-editor from 0.45.0 to 0.55.1 ([cc1c70d](https://github.com/continuedev/continue/commit/cc1c70d246b124a592cf94b17cb1fe7ba8fa2bc2))
* use try/finally for env cleanup in test ([27adb1d](https://github.com/continuedev/continue/commit/27adb1d677653904c8a2efad1fc1065deb7993e7))
* wrap fileURLToPath in try-catch for WSL2 compatibility ([788e253](https://github.com/continuedev/continue/commit/788e25338a1f21fe0b15db92397cb7fc1c236c6a)), closes [#8091](https://github.com/continuedev/continue/issues/8091)


### Features

* subagents ([32af25f](https://github.com/continuedev/continue/commit/32af25fc9980c505c16889b47e78feb7feafbc95))




