# Claude Synergy

A local, queryable mirror of every Anthropic product's release notes — plus a curated **Synergy** layer describing cross-product workflows — so the LLM agent inside the harness knows what the harness can do.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

5 results
```

A single FTS query surfaces a coordinated cross-SDK security fix that no individual changelog flagged as a CVE. **This is the killer demo: patterns emerge when every changelog is side-by-side.**

## The problem

The Claude Code CLI ships ~daily (404 releases through v2.1.147). The Anthropic API ships almost as often. SDKs ship per-CLI-release. Claude Design, Cowork, Chat, and Mobile all ship features through the unified Help Center feed. Plugin marketplaces and the Skills catalog grow continuously.

The LLM agent running inside any one of these surfaces has a frozen training cutoff. The gap widens every day. Features ship that the agent doesn't know exist. Bugs get fixed that the agent still works around. Env vars and flags get added that the agent never suggests. Cross-product workflows that compose multiple surfaces remain undiscovered.

This repo closes the gap. The Synergy section makes it a product instead of a mirror.

## Status (2026-05-21)

| Tier | Status | What's there |
|------|--------|--------------|
| 1 — bootstrap (markdown corpus) | ✅ done | 747 markdown files across 18 product sources, Jan→May 2026 |
| 2a — SQLite + FTS5 + CLI | ✅ done | `hk` CLI; 14 products / 706 releases / 3,954 changes / 957 entities ingested in 224ms |
| 2b — sqlite-vec + Contextual Retrieval | opt-in, deferred | Anthropic's pattern with Voyage 3 OR Ollama nomic-embed-text |
| 3 — sync mechanism + MCP server | deferred | GH Action / Claude Routine; MCP server exposes hk's queries to other agents |
| 4 — extend beyond Anthropic | future | Cursor / Aider / MCP server changelogs use the same shape |

## What's here

```
claude-synergy/
├── products/                # 18 product directories (706 release files + 17 skill entries + 6 catalog files)
├── synergies/               # 7 curated cross-product workflows (Skill portability, MCP portability, ...)
├── data/claude-synergy.db   # SQLite database (created by `hk init`)
├── schema.sql               # DB schema (products, releases, changes, entities, FTS5, synergies)
├── src/                     # TypeScript CLI implementation
├── SOURCES.md               # 5-tier source landscape with fetch strategies
└── URGENT_FINDINGS.md       # 19 actionable items surfaced from the corpus
```

## Install

```bash
git clone <repo>
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js
npm link         # makes `hk` available globally (or `npm install -g .`)
```

For dev without building, use `npx tsx src/cli.ts ...` directly. **`pnpm dev` swallows CLI flags after `--` (pnpm 10 quirk); use `npx tsx` for development.**

## CLI surface

```
hk init                              # create DB with schema
hk ingest                            # parse products/*/releases/*.md → DB (idempotent)

# Search
hk query "managed agents"            # FTS5 across all change bullets
hk query workflow --product claude-code --since 2026-05-01 --limit 10
hk query "TodoWrite" --kind breaking

# Entity lookups (using extracted entities)
hk env-var CLAUDE_CODE_WORKFLOWS     # when introduced + history
hk command code-review               # slash command + rename history
hk model claude-opus-4-7             # model launch + mentions across products
hk cve CVE-2025-66414                # CVE references in corpus

# Browsing
hk latest [--product X] [--limit N]  # recent releases across products
hk products                          # list all products + release counts
hk top env_var                       # most-mentioned env vars (or slash_command, cli_option, model_id, beta_header, cve, ghsa, hook_event, setting_key)
```

## Example workflows

**Find when a Claude Code env var was introduced:**
```bash
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration. It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Track a cross-SDK breaking change:**
```bash
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Plan a model migration:**
```bash
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  We announced the deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model, with retirement on the Claude API scheduled for June 15, 2026...
```

## Sources

Full source landscape in [SOURCES.md](SOURCES.md). Headlines:

- **Tier 1 (best):** `gh api repos/anthropics/<repo>/releases` for `claude-agent-sdk-*`, `anthropic-cli`, `anthropic-sdk-*` (7 languages), `claude-code-action`, `claude-code-security-review`
- **Tier 2:** GitHub CHANGELOG.md for `anthropics/claude-code` (mirrored to docs.claude.com)
- **Tier 3:** HTML pages — `platform.claude.com/docs/release-notes` (API), `support.claude.com/articles/12138966` (Apps unified feed)
- **Tier 4:** Catalog repos for Skills, plugins (official + community + knowledge-work), vertical marketplaces

## Tier 2b — opt-in vector search (planned)

Tier 2a uses FTS5 only (zero deps beyond SQLite). Tier 2b adds vector search via `sqlite-vec` for semantic queries that FTS5 misses (paraphrases, conceptual matches).

Architecture follows [Anthropic's Contextual Retrieval pattern](https://www.anthropic.com/news/contextual-retrieval):
- 50–100 token context prefix generated per chunk
- Contextual + BM25 + reranking → 67% retrieval failure reduction vs naive RAG

Provider choices, all configurable:

| Layer | Free default | Paid opt-in |
|-------|--------------|-------------|
| Context generation | Local Ollama (`llama3.2:3b`) OR Claude Routine | Claude Haiku 4.5 with prompt caching |
| Embeddings | Ollama `nomic-embed-text` (768-d) | Voyage 3 (1024-d, Anthropic-recommended) |

## Tier 3 — sync (planned)

`.github/workflows/sync.yml` scaffold included. Free path: GitHub Action with Ollama on the ubuntu runner runs daily, fetches new releases, regenerates the DB, commits back to the repo. Alternative: Claude Routine on a cron schedule using your existing plan quota.

## Testing

Vitest suite covers unit / integration / regression / smoke tiers. See [test-spec.md](test-spec.md) for the full specification.

```bash
pnpm test               # unit + integration + regression (~10s, 205 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 80/75/85/80)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1; needs products/ on disk)
```

Layout:

| Dir | What it covers |
|-----|----------------|
| `test/unit/` | per-module unit tests — extract, ingest, query, db, embed, hybrid, fetch, + every provider |
| `test/integration/` | end-to-end — full pipeline, sync, MCP server (spawns over stdio), CLI |
| `test/regression/` | named bug-regression tests (§8 of [test-spec.md](test-spec.md)) — each protects against a real bug |
| `test/smoke/` | opt-in full-corpus check against the real `products/` (706 files) |
| `test/fixtures/` | 3 fake products + mock HTTP responses |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts` |

No network in tests by default — provider HTTP is mocked via `vi.spyOn(global, 'fetch')` (helper at `test/helpers/fetch-mock.ts`). Real SQLite in temp files (not `:memory:`) because sqlite-vec extension load behaves differently across versions and on-disk is the canonical path.

CI: `.github/workflows/test.yml` runs `pnpm test:coverage` on push / PR.

## Related files

- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 19 actionable items surfaced from the corpus
- [SOURCES.md](SOURCES.md) — 5-tier source landscape
- [synergies/INDEX.md](synergies/INDEX.md) — 7 curated cross-product workflows
- [schema.sql](schema.sql) — current SQLite schema
- [test-spec.md](test-spec.md) — test suite specification

## License

MIT. Author: mcp-tool-shop.
