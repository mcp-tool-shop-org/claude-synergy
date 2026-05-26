<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

A local, queryable mirror of every Anthropic + adjacent AI dev tool changelog — plus a curated **Synergy** layer describing cross-product workflows — so the LLM agent inside the harness knows what the harness can do.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


**A single FTS query surfaces a coordinated cross-SDK security fix that no individual changelog flagged as a CVE.** That's the killer demo: patterns emerge when every changelog is side-by-side.

Repo: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## The problem

Claude Code CLI ships ~daily. Claude API ships almost as often. SDKs ship per-CLI-release. Claude Design, Cowork, Chat, and Mobile feed through the unified Help Center. The MCP ecosystem ships ~200-300 new servers per week. Plus there are 7 major AI dev tool surfaces (Cursor, Aider, Continue, Copilot, Cody, Windsurf) all shipping their own changelogs at their own cadences.

The LLM agent inside any one of these has a frozen training cutoff. The gap widens every day. Features ship that the agent doesn't know exist. Bugs get fixed that the agent still works around. Env vars and flags get added that the agent never suggests. Cross-product workflows that compose multiple surfaces remain undiscovered.

**This repo closes the gap.** The Synergy section makes it a product instead of a mirror.

---

## What's here

```
claude-synergy/
├── products/                # 44 product directories (1,186 release files)
│   ├── claude-code/             # Anthropic CLI — 117 releases
│   ├── claude-agent-sdk-{python,typescript}/  # Agent SDKs
│   ├── anthropic-sdk-{python,typescript,go,java,csharp,ruby,php}/  # 7 language SDKs
│   ├── claude-api/              # Platform release notes
│   ├── anthropic-apps/          # Design / Cowork / Chat / Mobile (Help Center feed)
│   ├── claude-code-action/      # GitHub Action
│   ├── anthropic-cli/           # `ant` CLI
│   ├── mcp-{python,typescript,go,java,csharp,kotlin,ruby,swift,rust,php}-sdk/
│   ├── mcp-{spec,inspector,registry,mcpb,conformance}/
│   ├── cursor/                  # RSS feed
│   ├── aider/                   # raw HISTORY.md
│   ├── continue-{dev,cli}/      # GH releases
│   ├── cody-enterprise/         # filtered Sourcegraph RSS
│   ├── github-copilot/          # HTML scrape (github.blog)
│   ├── vscode-copilot-chat/     # HTML scrape (code.visualstudio.com)
│   ├── windsurf/                # Playwright fetcher (CSR-only changelog)
│   ├── skills/                  # Anthropic Skills catalog
│   └── plugins-{official,community,knowledge-work}/  # Plugin marketplaces
├── synergies/               # 12 curated cross-product workflows
├── src/                     # TypeScript implementation
├── test/                    # 508 tests (unit, integration, regression, smoke)
├── data/claude-synergy.db   # SQLite database (created by `hk init`)
├── schema.sql               # Tier 2a tables (products, releases, changes, entities, FTS5, …)
├── schema-vec.sql           # Tier 2b tables (chunks, chunks_vec, chunks_fts)
├── SOURCES.md               # 5-tier source landscape with fetch strategies
└── URGENT_FINDINGS.md       # 23 actionable items surfaced from the corpus
```

**Live numbers (as of v1.2.1):** 44 products / 1,171 release files / 6,573 changes / 1,260 entities / 12 synergies / 519 tests / 13 MCP tools / 17 CLI commands. (Corpus refreshed via `sync_now` on 2026-05-24.)

---

## Status — all tiers shipped

| Tier | Status | What's there |
|------|--------|--------------|
| **1 — bootstrap (markdown corpus)** | ✅ shipped | Study-swarm seeded 706 release files Jan→May 2026; extended to 1,186 by Tier 4d |
| **2a — SQLite + FTS5 + CLI** | ✅ shipped | `hk` CLI; 15 subcommands; sub-300ms ingest |
| **2b — sqlite-vec + Contextual Retrieval** | ✅ shipped | Provider-pluggable (none/structured/ollama/claude-haiku context × ollama/voyage embed × none/ollama-judge/voyage/cohere rerank) |
| **3 — sync + MCP server** | ✅ shipped | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` exposes 13 tools over stdio (8 at original Tier-3 ship, 3 added in v1.1, 2 added in v1.2) |
| **4a — extend beyond Anthropic** | ✅ shipped | +15 MCP SDKs, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtered) |
| **4b — HTML-scrape fetcher** | ✅ shipped | GitHub Copilot + VS Code Chat (Windsurf needs Playwright — v0.7) |
| **4c — turndown HTML→markdown ingest** | ✅ shipped | HTML bodies (Copilot/VS Code/Cursor) now produce per-bullet rows for FTS5 + entity extraction |
| **4d — Playwright + MCP registry + YAML config** | ✅ shipped | Windsurf via Playwright; Smithery + official MCP Registry as Tier-4 catalogs; products consolidated into `products.yaml` |
| **5 — v1.1 windowed browsing + OpenAI embed** | ✅ shipped | `hk diff` / `hk breaking`, date bounds across all browsing commands, 3 new MCP tools (11 total), OpenAI embedding provider, configurable embedding dimension, `claude-code` auto-sync, generic `keep-a-changelog` parser |
| **6 — v1.2 sync-from-MCP** | ✅ shipped | `sync_status` (per-product freshness, never/stale detection) and `sync_now` (on-demand fetch → ingest → embed with `dry_run` preview + in-process concurrency lock). Closes the seam where a calling agent could query the corpus but not refresh it. **Also fixes:** marker-wipe bug where `INSERT OR REPLACE INTO products` cascaded a DELETE on the `markers` FK, silently resetting every product's `since` cursor on each ingest (regression §8.20). |
| **6.1 — v1.2.1 fetcher-marker centralization** | ✅ shipped | Centralized `writeMarker` in `fetchOne` so every successful fetch updates the marker — pre-fix, strategies that returned 0 in-window dated items (most notably `aider` raw-changelog) never wrote a marker and re-pulled `HISTORY.md` on every sync. Renamed unimplemented `webfetch` strategy to `manual` for `claude-api` + `anthropic-apps`; `sync_status` now renders manual products as "manual" instead of "never" and excludes them from `stale_only` (regression §8.21). |
| **7 — v1.3 cs-actions:v1 fine-tuned synthesizer** | ✅ shipped | First downstream model trained on the corpus. Converts one changelog entry → one strict-JSON action item `{kind, severity, subject, action_text, deadline, tags}`. Qwen2.5-7B + LoRA on 242 entries from `dataset/changelog-actions/v1/`, q8_0 GGUF, Ollama-deployed. Release-gate eval: **88.1% kind / 79.7% severity / 0.842 macro-F1** vs ground truth on 59-entry stratified holdout (+10.1pp / +27.2pp / +0.041 over qwen3:8b base). Tagged `cs-actions-v1`; eval report attached to the [GitHub Release](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) as a single-file download. **Documented v1 limitation:** anti-`unknown` bias (precision 1.000 / recall 0.286) — model under-flags ambiguous inputs. See [handbook → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) + [`dataset/README.md`](dataset/README.md) + [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) + [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md). |

Roadmap beyond v1.3: tracked in [URGENT_FINDINGS.md](URGENT_FINDINGS.md) and issues.

---

## Security & data model

This tool runs locally. **Data touched:** a derived SQLite database and markdown release files — all re-creatable. **Network:** outbound HTTPS only when you run `hk fetch`/`hk sync` (GitHub API, RSS feeds, changelog pages, MCP registries) or `hk embed` with a remote provider (Voyage, Cohere). **Secrets:** reads `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` from env vars — never logged, never stored to disk. **No telemetry.** See [SECURITY.md](SECURITY.md) for reporting policy.

---

## Install

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

For dev without building, use `npx tsx src/cli.ts ...` directly. **pnpm 10 quirk:** `pnpm dev` swallows CLI flags after `--`; use `npx tsx` for development.

---

## CLI surface — 17 commands

```
# DB lifecycle
hk init                              # create DB with schema
hk ingest                            # parse products/*/releases/*.md → DB (idempotent)
hk embed                             # generate chunks + embeddings (sqlite-vec)
hk fetch [--product X]               # incremental pull from sources
hk sync                              # combined fetch → ingest → embed (cron-friendly)
hk seed-markers                      # one-time setup after initial corpus

# Search
hk query "managed agents"            # FTS5 keyword search (+ --until <date>)
hk hybrid "credential exfiltration"  # FTS5 + vec hybrid via RRF (+ --rerank, --until)

# Windowed change browsing
hk diff [product] --since 7d         # what changed in a window, grouped by product+version
hk breaking --since 30d              # filter-browse of breaking changes (no search term)

# Entity lookups
hk env-var CLAUDE_CODE_WORKFLOWS     # when introduced + history
hk command code-review               # slash command + rename history
hk model claude-opus-4-7             # model launch + mentions across products
hk cve CVE-2025-66414                # CVE references in corpus

# Browsing
hk latest [--product X] [--limit N]  # recent releases (+ --since <date>)
hk products                          # list all 44 with counts
hk top env_var                       # most-mentioned by entity type
                                     # (env_var, slash_command, cli_option,
                                     #  model_id, beta_header, cve, ghsa,
                                     #  hook_event, setting_key)
```

**New in v1.1:** `hk diff` and `hk breaking` answer "what changed lately?" without needing a search term. Date bounds are uniform: every browsing command takes `--since` and `--until` in `YYYY-MM-DD` (or full ISO 8601), or a relative form (`7d`, `2w`, `3m`, `1y`).

---

## Example workflows

**Find when a Claude Code env var was introduced:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Track a cross-SDK breaking change:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Plan a model migration:**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**Semantic search across the whole corpus:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

The query never says "env_scrub" — vec surfaces it by semantic similarity. Pure FTS5 misses it entirely.

**What changed in claude-code this week:**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**Browse breaking changes across the corpus:**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

No search term needed — `hk breaking` is the answer to "did anything load-bearing change recently?"

---

## MCP server — give your agents access to this corpus

`claude-synergy-mcp` exposes 13 tools over stdio. Wire into Claude Code (or any MCP host) via `~/.claude/.mcp.json` or your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp",
      "env": {
        "CLAUDE_SYNERGY_DB": "/path/to/claude-synergy/data/claude-synergy.db"
      }
    }
  }
}
```

For GitHub Copilot's `.vscode/mcp.json`, use the `servers` wrapper instead of `mcpServers` (see [synergy 12](synergies/12-mcp-config-format-gotcha.md)).

Tools exposed:

| Tool | Purpose |
|---|---|
| `search` | Hybrid FTS5 + vec; optional rerank. Default mode for natural-language queries. (+ `until` date upper bound) |
| `lookup_entity` | Exact entity history: env vars, slash commands, model IDs, CVEs, etc. |
| `latest_releases` | Recent releases across products (or one). (+ `since` date lower bound) |
| `get_release` | Full content of one release |
| `list_products` | Enumeration with counts + latest version |
| `top_entities` | Most-mentioned entities by type |
| `list_synergies` | Curated cross-product workflows. (+ optional `product` filter) |
| `read_synergy` | Full text of one synergy file |
| `get_changes_since` | **New.** Changes in a time window, grouped by product+version. Inputs: `since` (required), `until?`, `product?`, `kind?`, `limit?`. |
| `search_breaking_changes` | **New.** Flat list of breaking changes — no search term needed. Inputs: `product?`, `since?`, `until?`, `limit?`. |
| `compare_versions` | **v1.1.** All changes between two versions of one product. Inputs: `product`, `from_version`, `to_version`. |
| `sync_status` | **v1.2.** Per-product sync freshness — last fetch timestamp, hours since fetch, ingested release count. Inputs: `product?`, `stale_only?`, `stale_hours?`. Use BEFORE trusting `latest_releases` to know if the corpus is stale. |
| `sync_now` | **v1.2.** On-demand refresh (mirrors `hk sync`). Inputs: `product?`, `dry_run?`, `include_ingest?`, `include_embed?`, `timeout_ms?`. Rejects with `InvalidParams` if another `sync_now` is already in flight. Does NOT commit to git. |

The v1.1 tools mirror `hk diff` / `hk breaking` and the version-comparison workflow that previously required scripting. The v1.2 sync tools close the seam where a session could query the corpus but not refresh it — `sync_status` reports staleness, `sync_now` runs the pipeline. See [handbook → MCP server](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/) for full input schemas.

---

## Sources — 5 tiers, 7 fetcher strategies

Full landscape in [SOURCES.md](SOURCES.md).

- **Tier 1 (GitHub Releases)** — `gh api repos/<owner>/<repo>/releases` for 23 products including Anthropic SDKs (7 languages), Agent SDKs (2), ant CLI, **claude-code** (now auto-synced via gh-releases as of v1.1 — previously manually seeded), claude-code-action, claude-code-security-review, and 15 MCP ecosystem SDKs
- **Tier 2 (raw markdown)** — `Aider-AI/aider/HISTORY.md`. The generic `keep-a-changelog` parser (v1.1+) is also available for any product whose source is a CHANGELOG.md in Keep-a-Changelog format — configure via one entry in `products.yaml`.
- **Tier 3 (HTML / RSS)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtered), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **Tier 4 (catalog)** — `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`
- **Tier 5 (advisory)** — `@ClaudeCodeLog` X account; marckrenn changelog mirror

Fetch strategies: `gh-releases | rss | raw-changelog | keep-a-changelog | html-scrape | catalog | playwright`. New product = one entry in `products.yaml`.

---

## Synergies — what gets unlocked

12 curated cross-product workflows. Each describes a composition pattern, the trigger that makes it the right answer, and the changelog evidence that enables it. Examples:

- **08 — Universal SKILL.md format** (Code + Cursor + Codex): one skill author, three agents read it
- **09 — MCP across seven surfaces** (Code + Cursor + Continue + Copilot + Windsurf + Cody + API): one binary, every agent
- **10 — Anthropic BYOK across surfaces**: one API key powers Claude in 7 editors with unified billing
- **11 — Claude Code orchestrates Aider**: cost-shift heavy edits to a cheap model while Claude plans
- **12 — MCP config format gotcha**: Copilot uses `servers`; everyone else uses `mcpServers`

Full index in [synergies/INDEX.md](synergies/INDEX.md).

---

## Datasets and fine-tuned models

The corpus has a downstream layer: curated **datasets** derived from change bullets, and **fine-tuned models** trained on those datasets. The dataset is the artifact in this repo; the model is downstream.

### `dataset/changelog-actions/v1` — 301 entries

Each entry pairs one change bullet from the corpus with a hand-written action item: `{kind, severity, subject, action_text, deadline, tags}`. 8-enum `kind` taxonomy (`breaking | deprecation | security | feature | fix | performance | docs | unknown`), stratified 80/20 train/holdout, A3c-reviewed by human + cross-family qwen3:8b judge (92.4% agreement). See [`dataset/README.md`](dataset/README.md) for the distribution table, [`SCHEMA.md`](dataset/changelog-actions/SCHEMA.md) for the field-by-field contract, and [`STYLE.md`](dataset/changelog-actions/STYLE.md) for the `action_text` writing rules.

### `cs-actions:v1` — fine-tuned synthesizer

First model trained on the dataset. Qwen2.5-7B-Instruct + LoRA (rank-256 / all-linear, 100 steps QLoRA on 242 training entries), q8_0 GGUF, deployed via two-stage Ollama Modelfile (`cs-actions-base` + `cs-actions:v1`).

**Release-gate eval** (59-entry stratified holdout, three runs, all passed, zero parse errors):

| Metric | qwen3:8b base | cs-actions:v1 | Delta |
|---|---|---|---|
| Kind agreement vs ground truth | 78.0% | **88.1%** | +10.1pp |
| Severity agreement vs ground truth | 52.5% | **79.7%** | +27.2pp |
| Macro-F1 (well-populated classes) | 0.801 | **0.854** | +0.053 |
| Run 3 — kind-hint ablation (with hint / without) | — | 0.842 / 0.777 | 6.5pt → target zone |

Release pass criterion `qwen3-vs-cs-actions ≥ qwen3-vs-GT` (`0.780 ≥ 0.780`) — PASS ✓. Full per-entry verdicts in [`eval-report.v1.json`](dataset/changelog-actions/v1/eval-report.v1.json), also attached to the [GitHub Release](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) as a single-file download.

**Documented v1 limitation — anti-`unknown` bias.** `unknown` is the only class where cs-actions:v1 underperforms qwen3:8b (F1 0.444 vs 0.545). Precision 1.000 / recall 0.286 — when input is genuinely ambiguous, the model commits to a specific kind rather than abstain. Inherited qwen-family prior, not fully overridden by the LoRA. Downstream consumers should treat a lower-than-expected `kind: "unknown"` rate as a signal to route batches to human review. The [v2 plan](dataset/README.md) addresses this with unknown-class augmentation plus hint-randomization.

**Not distributed through this repo** — the q8_0 GGUF is ~5 GB and the merged checkpoint is ~15 GB. The dataset and the build pipeline are what's published; the model rebuilds locally per [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) (4-stage manual chain, ~88 min warm on RTX 5080 Laptop 16 GB VRAM). The three-run release-gate contract lives in [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md).

Full usage walkthrough — including local Ollama invocation, the `format: "json"` per-request caller requirement, and the rebuild pipeline — is on the [handbook → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) page.

---

## Testing

Vitest suite covers unit / integration / regression / smoke tiers. **[test-spec-3.md](test-spec-3.md) is the current authority** as of v0.7.0; [test-spec.md](test-spec.md) (v1) and [test-spec-2.md](test-spec-2.md) (v2) remain in the repo as historical record of the design lineage.

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Layout:

| Dir | What it covers |
|-----|----------------|
| `test/unit/` | per-module — extract, ingest, query (incl. `until` / browse / since / compare), db (incl. dim-config v3 migration), embed, hybrid, fetch + every provider (Ollama / Voyage / **OpenAI**) + fetch-rss/changelog (incl. **keep-a-changelog** parser)/html + fetch-mcp-registry + fetch-playwright + products-config + synergy ingest/query |
| `test/integration/` | end-to-end — pipeline, sync, MCP server (stdio JSON-RPC, 13 tools incl. `sync_status` / `sync_now`), CLI (incl. `hk diff`, `hk breaking`) |
| `test/regression/` | §8.1–§8.19 — each protects against a real bug fixed during development (§8.19: ghReleases early-exit pagination preserves in-window items) |
| `test/smoke/` | opt-in full-corpus against real `products/` (1,143 files) |
| `test/fixtures/` | 3 fake products + mock HTTP responses (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Official MCP Registry) |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**No network in tests by default** — provider HTTP is mocked via `vi.spyOn(global, 'fetch')`. Real SQLite in temp files (not `:memory:`) because sqlite-vec extension load semantics differ across versions and on-disk is the canonical path. Playwright is loaded via dynamic import and mocked via `vi.doMock('playwright', ...)` so tests pass without a real browser install.

CI: `.github/workflows/test.yml` runs `pnpm test:coverage` on push and PR.

---

## Troubleshooting

**"Database locked" or WAL errors**

Another `hk` process (or a stale MCP server) is holding the SQLite database open. Close other `hk` processes, then retry. If the issue persists, check for a `-wal` or `-shm` file alongside `data/claude-synergy.db` — these are normal WAL-mode files and will be cleaned up when the last connection closes. Do not delete them while another process has the DB open.

**"sqlite-vec extension not found" / sqlite-vec load failed**

The `sqlite-vec` native extension failed to load. Common causes:

1. **Node version too old** — `claude-synergy` requires Node 22+. Check with `node -v`.
2. **Native module needs rebuild** — run `npm rebuild better-sqlite3` (or `pnpm rebuild better-sqlite3`).
3. **Platform mismatch** — on Windows/ARM, `better-sqlite3` needs a C++ build toolchain. Install the [windows-build-tools](https://github.com/nicedoc/windows-build-tools) or Visual Studio Build Tools with "Desktop development with C++".

Note: `sqlite-vec` is optional. FTS5 keyword search (`hk query`) works without it. Only `hk embed` and `hk hybrid` require the vector extension.

**"Sync failed for product X" / fetch errors**

`hk fetch` and `hk sync` call external APIs. Common causes:

- **GitHub rate limit** — the `gh-releases` strategy shells out to `gh api`, which uses your `GITHUB_TOKEN`. Unauthenticated requests hit 60 req/hr; authenticate with `gh auth login` or set `GITHUB_TOKEN` in your environment.
- **Network / proxy** — RSS and HTML fetchers use `fetch()`. Check connectivity and any corporate proxy settings (`HTTPS_PROXY`).
- **Unknown product** — `hk fetch --product foo` only works for products listed in `products.yaml`. Run `hk products` to see all available names.

Sync is idempotent — safe to re-run after a partial failure. Already-fetched releases are skipped.

**"Embedding provider not responding"**

`hk embed` calls an external embedding service:

- **Ollama (default, 768-dim)** — ensure Ollama is running (`ollama serve`) and the embedding model is pulled (`ollama pull nomic-embed-text`).
- **Voyage (1024-dim)** — set `VOYAGE_API_KEY` in your environment. Check your API key at [dash.voyageai.com](https://dash.voyageai.com).
- **OpenAI (1536-dim default, configurable)** — set `OPENAI_API_KEY`. Default model is `text-embedding-3-small`; override with `OPENAI_EMBED_MODEL` (e.g. `text-embedding-3-large` for 3072-dim). Use via `hk hybrid --embed openai` or `hk embed --embed openai`.

**Embedding dimension mismatch on provider switch**

Each provider produces vectors of a fixed dimension (Ollama 768, Voyage 1024, OpenAI 1536 by default — OpenAI supports configurable dim within the model's native size). The DB stores the active dimension in `schema_meta.embedding_dim`. Switching providers across different dimensions while chunks exist raises `EMBEDDING_DIM_MISMATCH` (`AppError`) rather than silently corrupting the vector table. To switch:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --embed openai     # new provider, new dim, fresh chunks_vec
```

For OpenAI Matryoshka truncation (smaller-than-native dim), set `OPENAI_EMBED_MODEL` and pass the desired dim through `hk embed`'s provider construction — see the [handbook embedding section](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) for details.

**Schema version mismatch / corrupted database**

If the DB was created with an older schema version and migration fails, or if data looks wrong after a crash:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

This is safe — the DB is a derived cache. All source data lives in `products/*/releases/*.md` files.

---

## Related files

- [CONTRIBUTING.md](CONTRIBUTING.md) — how to add products, run tests, submit PRs
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 actionable items (security CVEs, model retirements, breaking changes, config gotchas)
- [SOURCES.md](SOURCES.md) — 5-tier source landscape with fetch strategies
- [synergies/INDEX.md](synergies/INDEX.md) — 12 curated cross-product workflows
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — SQLite + sqlite-vec schemas
- [test-spec-3.md](test-spec-3.md) (current) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (historical) — test suite specs

---

## License

MIT. Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
