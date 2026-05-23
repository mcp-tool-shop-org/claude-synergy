# Contributing to Claude Synergy

Thanks for your interest in contributing. This guide covers adding new products, running tests, and submitting PRs.

## Prerequisites

- **Node >= 22** (`node -v` to check)
- **pnpm >= 10** (`pnpm -v` to check)
- **gh CLI** (optional, for testing `gh-releases` fetcher locally)

## Adding a new product

1. Open `products.yaml` at the repo root.
2. Append an entry under `products:`. The minimum required fields are:

```yaml
- name: my-new-tool          # slug: lowercase alphanumeric + hyphens only
  display_name: My New Tool   # human-readable name (shown in CLI output)
  tier: 1                     # source tier (1-5, see below)
  source_url: https://github.com/org/repo  # canonical URL for the source
  fetch_strategy: gh-releases # must match the fetch.type below
  fetch:
    type: gh-releases
    repo: org/repo            # owner/repo for GitHub Releases API
```

3. Pick the right fetch strategy for your source:

| Strategy | When to use | Required `fetch:` fields |
|---|---|---|
| `gh-releases` | Repo publishes GitHub Releases | `repo` (owner/repo). Optional: `multi_package: true` for monorepos with scoped tags. |
| `rss` | Source has an RSS feed | `url` (feed URL). Optional: `title_filter` (regex to filter entries). |
| `raw-changelog` | Source is a raw CHANGELOG/HISTORY.md file (aider-style only) | `url` (raw file URL), `parser` (currently only `aider-history`). |
| `keep-a-changelog` | Source is a CHANGELOG.md in [Keep-a-Changelog](https://keepachangelog.com/) format | `url` (raw file URL). |
| `html-scrape` | Source is a blog/changelog page | `parser` (`github-copilot-blog`, `vscode-updates`). |
| `playwright` | Source is client-rendered (no SSR) | No extra fields. Currently hardcoded to Windsurf. |
| `catalog` | Source is an MCP registry | `catalog_type` (`official-mcp-registry` or `smithery`). Optional: `max_entries`. |

4. Test your entry:

```bash
pnpm build
hk init
hk fetch --product my-new-tool
hk ingest
hk products                   # should list your product with release count
hk query "some keyword"       # verify releases appear in search
```

## Tier semantics

| Tier | Meaning | Examples |
|------|---------|---------|
| 1 | Structured API (GitHub Releases) — highest fidelity | SDKs, MCP ecosystem, claude-code (since v1.1) |
| 2 | Raw markdown changelog | aider |
| 3 | HTML/RSS scrape | Cursor, Copilot, Cody |
| 4 | Catalog snapshot (not versioned releases) | Skills, plugins, MCP registries |
| 5 | Advisory / manual | X accounts, community mirrors |

## Running tests

```bash
pnpm test               # unit + integration + regression (~18s, 508 tests)
pnpm test:watch         # interactive mode (re-runs on file change)
pnpm test:coverage      # generates coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke test (set RUN_SMOKE=1)
```

Tests use real SQLite temp files (not `:memory:`) and mock all HTTP calls. No network access, no API keys needed.

## Adding a new fetcher strategy

1. Create `src/fetch-<name>.ts` with the parsing/fetching logic.
2. Wire it into `src/fetch.ts` — add a case in the `fetchOne` switch statement.
3. Add the type to `FetchType` in `src/products-config.ts`.
4. Add test fixtures in `test/fixtures/` and unit tests in `test/unit/`.

## PR guidelines

- **Tests required** — `pnpm test` must pass. New code should have unit tests.
- **No network in tests** — mock HTTP calls via `vi.spyOn(global, 'fetch')`. See existing tests for patterns.
- **No source file edits without tests** — if you touch `src/*.ts`, add or update a test in `test/`.
- **products.yaml only for new products** — adding a product needs no code change if an existing strategy fits.
- **Keep commits focused** — one logical change per PR.

## Local development

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build               # compiles to dist/

# Run CLI without building (dev mode):
npx tsx src/cli.ts init
npx tsx src/cli.ts query "some term"

# Run MCP server (dev mode):
npx tsx src/mcp-server.ts
```

**pnpm 10 quirk:** `pnpm dev` swallows CLI flags after `--`. Use `npx tsx src/cli.ts ...` directly during development.
