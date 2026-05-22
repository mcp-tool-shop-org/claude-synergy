# Claude Synergy — Test Specification v2

**Status:** spec for a NEW Claude session to implement (after Phase 4d work lands)
**Builds on:** `test-spec.md` (the v1 spec — 239 tests already shipped through v0.6.1)
**Owner:** the test-writing session (use the same kickoff pattern as v1)
**Goal:** cover the four Phase 4d features about to land: Playwright Windsurf fetcher, MCP registry catalogs, YAML-driven products config, and any regressions caught during implementation.

---

## 1. What's already covered (v1 spec, already in repo)

The 239-test suite from v0.6.1 covers:

- Unit: extract / ingest / query / db / embed / hybrid / fetch + every provider (context, embedding, rerank)
- Unit (4b/4c): fetch-rss / fetch-changelog / fetch-html
- Integration: pipeline / sync / mcp-server / cli
- Regression §8.1–§8.18 — 23 bug regression cases
- Smoke (opt-in): full-corpus

**Do not re-write these.** This spec is additive.

---

## 2. New surface to test (Phase 4d)

### 2.1 Playwright fetcher for Windsurf (`src/fetch-playwright.ts`)

Why: Windsurf's changelog is a fully client-rendered Next.js app. Static HTML carries no entries; the v0.5.0 best-effort cheerio scraper returns []. The fix is to run a headless browser to evaluate JS, then extract entries from the rendered DOM.

**File: `test/unit/fetch-playwright.test.ts`** — `~10 tests`

- **module export shape**: `fetchWindsurfWithPlaywright(sinceIso)` returns `Promise<HtmlItem[]>`
- **Playwright is treated as an OPTIONAL dependency** — the module loads `playwright` lazily via dynamic import; if the package is missing, the function throws a clear "playwright not installed; run `pnpm add playwright && npx playwright install chromium`" error rather than crashing
- **Headless launch** uses `chromium.launch({ headless: true })`; `userAgent: claude-synergy/0.1.0`
- **Page wait strategy**: `page.goto(url, { waitUntil: 'networkidle' })` OR explicit `page.waitForSelector('h1, h2, [class*="changelog"]')` — assert the chosen primitive is exercised
- **Entry extraction**: tests can mock `page.evaluate(...)` to return canned entry arrays; verify items map to `{slug, title, pubDate, link, body}` shape
- **Date filtering**: items at or before `sinceIso` are dropped (same as RSS/HTML parsers)
- **Browser lifecycle**: `browser.close()` is always called, including on extractor throw (use try/finally)
- **Timeout handling**: long-running page loads get a configurable timeout (default 30s); timeout exceptions are caught and surface as Error with helpful message

**Mocking approach:** since Playwright requires Chromium, tests must NOT spawn a real browser. Use `vi.doMock('playwright', () => ({ chromium: { launch: vi.fn().mockResolvedValue(mockBrowser) } }))` to stub the launch path. mockBrowser exposes `newPage()` → `page` with mocked `goto`, `evaluate`, `close`. Pattern is similar to vitest's docs on dynamic-import mocking.

**Integration test (opt-in via env var):** if `RUN_PLAYWRIGHT_E2E=1` and playwright is actually installed locally, run one real fetch against windsurf.com and assert > 0 entries. Default-skipped — never runs in CI.

### 2.2 MCP registry catalogs (`src/fetch-mcp-registry.ts`)

Two registries land in v0.7.0: **Smithery** and **official MCP Registry**. Glama + GitHub MCP Registry deferred to a later phase.

**File: `test/unit/fetch-mcp-registry.test.ts`** — `~12 tests`

- **`fetchSmithery(sinceIso)`** mocks Smithery's documented Registry API:
  - GET `https://registry.smithery.ai/servers?page=1&pageSize=100`
  - response shape: `{ servers: [{ qualifiedName, displayName, description, homepage, createdAt }], pagination: { ... } }`
  - tests: single page parsed correctly; pagination follows next-page links; filters by `createdAt > sinceIso`; returns `RegistryEntry[]`
- **`fetchOfficialMcpRegistry(sinceIso)`** mocks `https://registry.modelcontextprotocol.io/v0/servers`:
  - response shape: `{ servers: [...], next_cursor }`
  - tests: pagination via cursor; entry shape; date filter
- **Error paths**: non-200 → throws; malformed JSON → throws; empty response → returns []
- **Output adapter**: each fetched entry produces a CATALOG.md row + writes a per-entry markdown file at `products/<catalog-name>/entries/<entry-slug>.md` (like the `skills` catalog pattern from Tier 1)
- **Activity diff**: when called with an existing CATALOG.md, generate an ACTIVITY.md entry listing what was added/removed/updated since last sync

**Storage shape:** catalogs follow the existing `skills` / `plugins-*` pattern — top-level `CATALOG.md` + `ACTIVITY.md` + optional `entries/*.md` per-server. No `releases/` subdir.

### 2.3 YAML-driven products config (`products.yaml` + `src/products-config.ts`)

The hardcoded `TARGETS` array in `src/fetch.ts` and `PRODUCT_META` map in `src/ingest.ts` move to a single YAML file at repo root. Adding a new product becomes a YAML edit, not a code edit.

**File: `test/unit/products-config.test.ts`** — `~10 tests`

- **Load + parse**: `loadProductsConfig(path)` returns typed `ProductConfig[]`
- **Required fields validation**: each entry must have `name` (string), `display_name` (string), `strategy` ('gh-releases' | 'rss' | 'raw-changelog' | 'html-scrape' | 'catalog'), and strategy-specific fields
- **Strategy-specific validation**:
  - `gh-releases` requires `repo`
  - `rss` requires `rss_url`; optional `rss_title_filter`
  - `raw-changelog` requires `raw_url` and `parser`
  - `html-scrape` requires `html_parser`
  - `catalog` requires `api_url` and `catalog_type`
- **Malformed YAML**: clear error with line/column where possible
- **Backwards compatibility**: if `products.yaml` is missing, fall back to hardcoded TARGETS (warn once on stderr)
- **Round-trip**: dump→load round-trips identity (verify YAML serializer is stable)
- **Schema validation**: unknown top-level keys produce a warning, not a fatal error (forward-compat)

**Refactor verification**: existing `test/unit/fetch.test.ts` and `test/unit/ingest.test.ts` continue to pass — the YAML config replaces hardcoded data but doesn't change API shape.

### 2.4 README refresh (no tests — documentation only)

README rewrite reflects:
- 34 products / 1,101 releases / 5,957 changes / 1,225 entities / 12 synergies (CURRENT state, not "Tier 2b planned")
- All 5 tiers shipped through 4c
- Public GitHub link
- Live MCP server with `.mcp.json` snippet
- Testing section (already exists)
- Phase 4d additions (Playwright, MCP registries, YAML config) once shipped

No unit tests required. **One integration test** in `test/integration/readme.test.ts` verifies the README's `hk` CLI command snippets actually work (parse them out of code blocks, spawn, assert exit 0). Catches doc-rot.

---

## 3. Regression cases for bugs caught during Phase 4d impl

To be added by the implementer of this spec as they're discovered. **Reserve §8.19–§8.30 for these.** Examples of likely candidates:

- **§8.19** Playwright dynamic-import error path on missing dep (clear actionable message, not `Cannot find module 'playwright'` raw)
- **§8.20** MCP registry pagination terminates (don't infinite-loop on cursor=cursor responses)
- **§8.21** YAML config tolerates BOM / mixed line endings on Windows
- **§8.22** YAML missing-file fallback warns ONCE, not every fetch call
- **§8.23** Refactor parity: hardcoded-TARGETS path and YAML-loaded path produce byte-identical fetch results

Add specific cases as you find them. **The implementer should write these PROACTIVELY for each bug they encounter during impl** — that's how the regression suite stays load-bearing.

---

## 4. Test infrastructure additions

### New helpers

- **`test/helpers/playwright-mock.ts`** — exposes `makeMockPlaywright(entries: CannedEntry[])` that returns a `{ chromium }` shape compatible with `vi.doMock('playwright', ...)`. Captures `goto`, `evaluate`, `close` calls.
- **`test/helpers/yaml-fixtures.ts`** — exposes `validProductsYaml()`, `invalidProductsYaml()`, `legacyProductsYaml()` (the YAML equivalent of the hardcoded TARGETS) as strings.

### New fixtures

- `test/fixtures/mock-responses/smithery-servers.json` — sample Smithery API response (5-10 servers)
- `test/fixtures/mock-responses/official-mcp-registry.json` — sample official Registry response
- `test/fixtures/sample-products.yaml` — valid YAML config covering all 5 strategies
- `test/fixtures/sample-products-malformed.yaml` — invalid YAML for error-path tests

---

## 5. Coverage targets (additive over v1)

After Phase 4d:
- `src/fetch-playwright.ts`: 90%+ stmt (mock path is the main path; only the dynamic-import-fail branch and try/finally close get edge-case tests)
- `src/fetch-mcp-registry.ts`: 90%+ stmt (most logic is HTTP + JSON traversal, easy to mock)
- `src/products-config.ts`: 95%+ stmt (pure parse/validate; low complexity)

Global threshold stays at 80/75/85/80 from v1. The Phase 4d additions should NOT regress the global number.

---

## 6. Test runtime budget

- Unit + integration + regression: stay under **60s total** (v1 SLA)
- Playwright tests use mocks; should add <2s
- MCP registry tests use mocks; should add <1s
- YAML config tests are pure; <0.5s

If runtime exceeds 75s, profile and either shard or skip slow tests behind opt-in flags.

---

## 7. Acceptance criteria

When this spec is implemented:

1. `pnpm test` exits 0 with **~280 tests passing** (v1's 239 + ~40 from Phase 4d additions)
2. Coverage thresholds met; new modules at 90%+
3. All regression cases §8.19+ pass (one per impl-discovered bug)
4. `test/helpers/playwright-mock.ts` exposes a clean reusable mock factory
5. README integration test (§2.4) passes — `hk` CLI snippets in README still execute correctly
6. `.github/workflows/test.yml` continues to run `pnpm test` on push (no Playwright in CI by default)
7. Test-spec-3.md exists with the FINAL state of all 3 spec generations (v1 + v2 + any v3 discoveries)

---

## 8. Implementation order recommendation

1. **YAML config first** (cheapest; touches many things downstream — get the foundation right before adding new fetchers on top of the old hardcoded shape)
2. **README integration test** (quick win; catches doc-rot during the rest of the work)
3. **MCP registry fetchers** (well-defined APIs; medium complexity)
4. **Playwright Windsurf** (last — most risk; if it doesn't ship cleanly, the rest still lands)
5. **Regression cases as they emerge during impl** — never bundle these to the end; capture each one when you hit it

---

## 9. Kickoff prompt for the test-writing session

When ready to dispatch a separate Claude Code session to knock this out, use a prompt like:

```
You are picking up Claude Synergy after Phase 4d implementation. The 4 new
features (Playwright fetcher, MCP registries, YAML config, README refresh)
are committed. Your job is to write the tests per test-spec-2.md (in repo
root). All conventions from test-spec.md (the v1 spec) still apply. Run
`pnpm test` to see what's currently passing; add tests until the suite hits
the targets in §5 and the regression cases in §3 are all green.
```

Same conventions as test-spec.md's kickoff: vitest, mocked HTTP, real on-disk SQLite, no network in default tests, regression-first.
