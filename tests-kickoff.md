# Kickoff prompt — Claude Synergy test writing

**Copy the prompt below into a fresh Claude Code session run from `E:\AI\claude-synergy\`.**

---

You are picking up a TypeScript codebase that needs a comprehensive test suite written from scratch. The full test specification is at `test-spec.md` in the repo root — **read it end-to-end before starting**.

## Project context (what already ships)

`@mcptoolshop/claude-synergy` is a local mirror of every Anthropic product's release notes (706 release files across 14 products, ~12MB SQLite DB) plus a curated synergies layer and an MCP server exposing 8 tools to other Claude agents over stdio.

Three tiers shipped:
- **Tier 2a:** SQLite + FTS5 + 15-command `hk` CLI (`init`, `ingest`, `query`, `env-var`, `command`, `model`, `cve`, `latest`, `products`, `top`, plus tier 2b/3 commands)
- **Tier 2b:** sqlite-vec + Contextual Retrieval pattern with pluggable providers (context: none/structured/ollama/claude-haiku; embedding: ollama/voyage; rerank: none/ollama-judge/voyage/cohere)
- **Tier 3:** `claude-synergy-mcp` server (8 tools over stdio) + incremental sync (`hk fetch`, `hk seed-markers`, `hk sync`)

Code in `src/`. Schema in `schema.sql` + `schema-vec.sql`. No tests exist yet — that's your job.

## What I need from you

Implement the full test suite per `test-spec.md`. The spec covers:

- **§3 file layout** — `test/unit/`, `test/integration/`, `test/regression/`, `test/smoke/`, `test/fixtures/`, `test/helpers/`
- **§4 unit tests** — every module (extract, ingest, query, db, embed, hybrid, fetch) + every provider
- **§5 integration tests** — full pipeline, sync, MCP server (spawn + JSON-RPC), CLI
- **§6 MCP testing strategy** — stdio-based; spawn via `npx tsx`, complete handshake, exercise tools
- **§7 fixtures** — 3 fake products with realistic-but-tiny markdown
- **§8 regression suite** — **CRITICAL** — 13 named bug regression tests. Each protects against a real bug fixed during dev. Read these carefully; they are documentation of how the system can fail.
- **§10 provider mock contract** — `vi.spyOn(global, 'fetch')` style; helper at `test/helpers/fetch-mock.ts`

## Conventions to follow

- **Vitest**, not Jest — already named as the framework in §2
- **No network** in tests by default — provider tests must pass even if `OLLAMA_HOST` / `VOYAGE_API_KEY` etc. are set. Mock `fetch` explicitly.
- **Real SQLite** in temp files, not `:memory:` — sqlite-vec extension load behaves differently across versions; exercise both is fine but the canonical mode is on-disk
- **Each regression test in §8 is independent** — no shared mutable state. If a test depends on another, you've done it wrong.
- **Don't snapshot CLI prose** — assert on substrings (`expect(stdout).toContain('706 releases')`). Snapshots make brittle.
- **Coverage targets** in §2: 80% statements, 75% branches, 85% functions, 80% lines. Use `@vitest/coverage-v8`.

## Acceptance — when you're done

1. `pnpm test` exits 0 with > 100 test cases passing
2. `pnpm test:coverage` meets thresholds in `vitest.config.ts` (which you also create)
3. All 13 regression cases in §8 are present, named, and pass
4. README has a `## Testing` section pointing here and at `test-spec.md`
5. `.github/workflows/test.yml` runs `pnpm test --coverage` on push (separate from `sync.yml`)
6. No test takes > 30s; total suite < 60s (smoke excluded)

## What NOT to do

- Don't refactor `src/` to make tests easier unless §8 requires it (regression tests should test the existing behavior; refactors are a separate concern)
- Don't add real API call paths "for completeness" — paid providers stay shape-only per spec §4.8-4.10
- Don't snapshot the full 706-file corpus — that's what `RUN_SMOKE=1` is for
- Don't skip §8 — those are the most valuable tests in the suite

## How to start

1. `pnpm install` — verify the existing deps installed
2. Add `vitest` + `@vitest/coverage-v8` to devDependencies, run `pnpm install` again
3. Create `vitest.config.ts` with coverage config + threshold
4. Create `test/helpers/` first (temp-db, fetch-mock, mcp-client) — everything else builds on these
5. Create `test/fixtures/` next per §7
6. Write tests module by module per §4 ordering (extract → ingest → query → db → embed → hybrid → fetch → providers)
7. Then §5 integration, then §8 regression
8. Run `pnpm test:coverage` and fill gaps to hit thresholds

## How to verify your work

After writing each module's tests, run `pnpm test path/to/that/test.ts` and confirm passing. When the full suite is in place, run `pnpm test:coverage` and inspect `coverage/index.html` for gaps.

For the MCP server integration test specifically, **manually verify the spawned server stays clean** — no orphan processes, no leaked file descriptors, no hung stdin. The helper at `test/helpers/mcp-client.ts` is responsible for cleanup; double-check the kill logic.

## Questions

If the spec is ambiguous on a specific case, prefer the more thorough interpretation (more test cases, not fewer). When in doubt about a regression test, look at the bug description in §8 and write the assertion that would have caught the original bug.

The goal is a test suite that makes it safe to refactor any part of the codebase. If you finish in fewer tests than expected, you probably missed cases.
