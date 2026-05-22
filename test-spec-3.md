# Claude Synergy — Test Specification v3 (FINAL)

**Status:** authoritative — reflects the actual code at v0.7.0
**Supersedes:** `test-spec.md` (v1) + `test-spec-2.md` (v2) as the single source of truth going forward
**State at writing:** 35 products / 1,143 release files / 6,042 changes / 1,225 entities / 12 synergies / 291 tests / 85% coverage / **6 commits ahead of v0.6.1 pushed**

This document **describes the final state** of the test suite for Claude Synergy through Phase 4d. The earlier specs (v1, v2) remain in the repo as **historical record of what was planned and why** — they're useful context but not load-bearing for new contributors. Read v3 to understand the current state; read v1/v2 to understand the design lineage.

---

## 1. Scope summary

| Tier | Tests | Pattern |
|------|-------|---------|
| Unit | 28 files | per-module — extract, ingest, query, db, embed, hybrid, fetch + fetch-rss/changelog/html + every provider |
| Integration | 4 files | pipeline, sync, MCP server (stdio JSON-RPC), CLI happy-path + error-path |
| Regression | 1 file (§8.1–§8.18) | each protects against a real bug fixed during dev |
| Smoke | 1 file (opt-in) | full-corpus sanity check against the real `products/` |
| Helpers | 5 files | temp-db, fetch-mock, mcp-client, seed-corpus, golden-vectors |
| Fixtures | 3 product fixtures + 8 mock-response JSONs + 5 markdown edge cases | tiny, deterministic |

**Coverage at v0.7.0** (after Phase 4d):
- All files: 85.09% stmts
- ingest.ts: 92.13% (the v0.6.0 commit-dump filter + v0.5.1 turndown lifted this from 86%)
- query.ts: 100%
- extract.ts: 100%
- Most providers: 100%
- fetch.ts: 58.43% (orchestrator paths under-tested; flagged for v0.8)
- fetch-rss / fetch-changelog / fetch-html: covered in v0.6.1 catch-up

---

## 2. What's NEW in v0.7.0 (Phase 4d)

Four new code modules landed; their test coverage status is logged here:

### 2.1 `src/products-config.ts` — YAML config loader

**Status: covered by integration use** — every test that touches fetch.ts or ingest.ts exercises the loader (it runs at module init). No dedicated unit tests yet; **add to test/unit/products-config.test.ts**.

Suggested tests (per test-spec-2.md §2.3):
- Load + parse `products.yaml` round-trip
- Required fields validation (name, display_name)
- Strategy-specific validation (gh-releases needs repo; rss needs url; etc.)
- Missing-file fallback (returns null + warns once)
- BOM handling
- Malformed YAML throws with line number where possible
- Schema forward-compat (unknown top-level keys don't fail)

### 2.2 `src/fetch-mcp-registry.ts` — MCP registry catalogs

**Status: smoke-tested by manual fetch (1,918 official entries + 200 Smithery entries produced clean CATALOG.md files)**. No unit tests yet; **add to test/unit/fetch-mcp-registry.test.ts**.

Suggested tests:
- `fetchOfficialMcpRegistry` paginates via cursor; deduplicates by isLatest=true
- `fetchSmitheryRegistry` paginates by page; caps at maxEntries; sorts by useCount desc
- Both return `CatalogEntry[]` with consistent shape regardless of source
- `writeCatalog` produces a Markdown table with header rows + columns
- `fetchCatalog` dispatcher routes correctly to each implementation
- Slugification handles unicode + special characters (e.g. `@scope/name`)
- Non-200 responses throw with status code
- Empty response from registry returns `[]` cleanly

### 2.3 `src/fetch-playwright.ts` — CSR fetcher (Windsurf)

**Status: validated by real fetch (42 Windsurf entries pulled with correct dates)**. No unit tests yet; **add to test/unit/fetch-playwright.test.ts**.

This module is HARD to unit-test because it loads playwright via dynamic import. Suggested approach:
- Mock `playwright` via `vi.doMock('playwright', () => ({...}))` BEFORE the dynamic import resolves
- Mock browser + context + page; have `page.evaluate(...)` return canned entry arrays
- Test: lazy-import fails → throws clear "playwright not installed" error
- Test: happy path returns HtmlItem[] with proper shape
- Test: timeout is respected (mock `goto` to reject after the configured timeoutMs)
- Test: browser.close() runs even when `page.evaluate` throws (verify with a spy)
- Test: entries with no date are skipped (not crashed on)
- Test: sinceIso filter applies

Integration test (opt-in via `RUN_PLAYWRIGHT_E2E=1`): one real fetch against windsurf.com expecting ≥ 1 entry. Default-skipped in CI.

### 2.4 Updated regression cases

**Status:** unchanged from v0.6.1 (§8.1–§8.18 still pass). Phase 4d found no new bugs requiring regression tests. If any surface during the test-writing session, append them as §8.19+ per the convention.

---

## 3. Test additions needed (estimated count)

| Module | Estimated tests | Priority |
|---|---|---|
| `test/unit/products-config.test.ts` | ~12 | high (low-risk pure parser; easy win) |
| `test/unit/fetch-mcp-registry.test.ts` | ~12 | medium (uses real fetch mocks; well-understood) |
| `test/unit/fetch-playwright.test.ts` | ~10 | medium (dynamic-import mocking is finicky) |
| Optional integration: `test/integration/yaml-config.test.ts` | ~3 | low (parity check that hardcoded fallback == YAML path) |

**Total new tests: ~37.** Brings suite from 291 → ~328 tests. Stays well under the 60s SLA.

---

## 4. Acceptance criteria

When this spec is implemented:

1. `pnpm test` exits 0 with ~328 tests passing
2. Coverage thresholds met (80/75/85/80 from v1; products-config.ts at 95%+; fetch-mcp-registry at 90%+; fetch-playwright at 80%+ given dynamic-import quirks)
3. No regression in existing 291 tests
4. CI runs cleanly without playwright installed (the dynamic-import path is exercised, but the mock substitutes for the real lib)
5. README's `## Testing` section updated to mention test-spec-3 as the current authority

---

## 5. Conventions (unchanged from v1)

- **vitest** as the framework
- **No network** in tests by default (mock `fetch` via `vi.spyOn(global, 'fetch')`)
- **Real SQLite** on-disk via `test/helpers/temp-db.ts` (not `:memory:`)
- **Provider keys**: tests must pass even when `OLLAMA_HOST` / `VOYAGE_API_KEY` / etc. are set in env
- **Assertions on substrings**, not full snapshots, for CLI prose output
- **Regression-first**: any bug caught during impl gets a §8.X case BEFORE the fix is merged

---

## 6. Phase 4d state on disk (for reference)

The implementer of this spec will be working in a repo that contains:

```
src/
├── cli.ts, mcp-server.ts            # CLI + MCP server entrypoints
├── db.ts, query.ts, ingest.ts       # Tier 2a foundations
├── embed.ts, hybrid.ts              # Tier 2b semantic layer
├── extract.ts                       # Entity regex extractors
├── fetch.ts                         # Strategy dispatcher (6 strategies now)
├── fetch-rss.ts                     # Tier 4a — RSS feeds
├── fetch-changelog.ts               # Tier 4a — Aider HISTORY.md
├── fetch-html.ts                    # Tier 4b — HTML scrape
├── fetch-mcp-registry.ts            # Tier 4d — MCP registry catalogs (NEW v0.7.0)
├── fetch-playwright.ts              # Tier 4d — Windsurf CSR (NEW v0.7.0)
├── products-config.ts               # Tier 4d — YAML config loader (NEW v0.7.0)
└── providers/
    ├── context/{none,structured,ollama,claude-haiku}.ts
    ├── embedding/{ollama,voyage}.ts
    └── rerank/{none,ollama-judge,voyage,cohere}.ts

products.yaml                         # Single source of truth (NEW v0.7.0)
schema.sql, schema-vec.sql            # SQLite + sqlite-vec schemas
products/                             # 35 products, 1,143 release files + 2 catalogs
synergies/                            # 12 curated cross-product workflows
test/                                 # 28 test files, 291 tests
```

---

## 7. Kickoff prompt for the next test-writing session

```
You are picking up Claude Synergy after Phase 4d. The 4 new features
(YAML config, MCP registries, Windsurf Playwright, README) are committed
as v0.7.0. Your job is to write the remaining tests per test-spec-3.md
(in repo root). v1 and v2 specs are historical context — work from v3.

Run `pnpm test` to see what's passing (291 tests currently). Add the
estimated ~37 new tests from §3. Run `pnpm test:coverage` to check
thresholds. Use the existing patterns:
  - test/helpers/temp-db.ts for SQLite
  - test/helpers/fetch-mock.ts for HTTP mocking
  - test/helpers/seed-corpus.ts for fixture data
  - vi.doMock('playwright', ...) for the dynamic-import fetcher

Acceptance: §4 of test-spec-3.md. No network in tests by default.
```

---

## 8. Open follow-ups (separate from this spec — for future versions)

These were noted in v1/v2 but NOT yet addressed:

1. **`src/fetch.ts` orchestrator integration tests** (currently 58% coverage) — close via mocked fetch + execSync + temp filesystem; routes through every strategy
2. **README integration test** (parse code blocks, spawn CLI commands from README, assert exit 0) — catches doc-rot
3. **Test for `claude-haiku` context provider** with real API key path — currently shape-only

Not blocking v0.7.0 acceptance. Carry forward as candidates for v0.8.
