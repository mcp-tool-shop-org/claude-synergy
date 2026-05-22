# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.1] - 2026-05-21

### Added
- Tests catch up to Phase 4d code: 52 new unit tests covering `products-config`, `fetch-mcp-registry`, and `fetch-playwright`. Suite now at 291 tests, all passing.

### Fixed
- CI: pinned pnpm to v10 in `test.yml` and `sync.yml`. `pnpm@latest` resolves to v11, which enforces a 24-hour `minimumReleaseAge` that blocked five consecutive release CI runs.

## [0.7.0] - 2026-05-21

### Added
- **Phase 4d** — full feature pass for v0.7 line:
  - README refresh — numbers, fetch strategies, and roadmap aligned with shipped reality.
  - YAML-driven products config — `TARGETS` and `PRODUCT_META` consolidated into `products.yaml`. Adding a product is now a one-entry YAML edit.
  - MCP registry catalogs — Smithery and the official MCP Registry now fetched as Tier 4 catalog sources.
  - Playwright fetcher — Windsurf changelog (CSR-only) now reachable via headless browser. Closes the v0.6 CSR-fallback gap.

## [0.6.1] - 2026-05-21

### Added
- Test suite caught up to Phase 4b/4c shipped code: 239 tests, all passing. Coverage ~85%.

### Fixed
- continue-cli release bodies now filtered to exclude raw git-commit dumps (cuts ~15k of 21k noisy changes).

## [0.6.0] - 2026-05-21

### Added
- **Phase 4c — continue-cli commit-dump filter**: detect-and-skip pattern for release bodies that are pure git-log dumps. Cleans the corpus without losing actual changelog entries.
- 12th synergy file curated.

### Changed
- Total change count dropped from 21,210 → 5,957 — the noise that was inflating Tier-4a counts is gone.

## [0.5.1] - 2026-05-21

### Added
- **Phase 4c — turndown HTML→markdown ingest**: HTML bodies (GitHub Copilot, VS Code Chat, Cursor) are now converted to markdown before per-bullet parsing, so FTS5 + entity extraction works end-to-end on HTML sources.

## [0.5.0] - 2026-05-21

### Added
- **Tier 4b — HTML-scrape fetcher** for products without a Releases API:
  - GitHub Copilot via `github.blog/changelog/label/copilot/`
  - VS Code Chat via `code.visualstudio.com/updates/v1_NNN`
  - Windsurf via CSR fallback (full Playwright fetch deferred to v0.7)
- Total: 34 products / 1,101 release files.

## [0.4.0] - 2026-05-21

### Added
- **Initial public release** through Tier 4a. Highlights:
  - 33 products covered: Anthropic SDKs (7 languages), Agent SDKs (2), `ant` CLI, claude-code-action, claude-code-security-review, 15 MCP ecosystem SDKs, plus Cursor (RSS), Aider (raw `HISTORY.md`), Continue.dev, Cody Enterprise (filtered RSS).
  - 1,057 release files / ~19,618 changes / 12 synergies.
  - Fetcher strategies: `gh-releases`, `rss`, `raw-changelog`.
  - SQLite + FTS5 corpus, sqlite-vec semantic search with Contextual Retrieval, `claude-synergy-mcp` MCP server exposing 8 tools over stdio.

[0.7.1]: https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/v0.7.1
[0.7.0]: https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/v0.7.0
[0.6.1]: https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/v0.6.1
[0.6.0]: https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/v0.6.0
[0.5.1]: https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/v0.5.1
[0.5.0]: https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/v0.5.0
[0.4.0]: https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/v0.4.0
