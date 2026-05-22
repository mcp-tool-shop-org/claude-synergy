# Claude Synergy — Test Specification

**Status:** spec, not yet implemented
**Owner:** the test-writing session (see `tests-kickoff.md` for the prompt)
**Goal:** lock down behavior for the 15-command CLI + MCP server + 4-tier provider matrix shipped through Tier 3, including regression tests for every bug caught during initial development.

---

## 1. Philosophy

- **Regression-first.** Every bug fixed during initial dev gets a named test case so it never returns. See §8.
- **Real DB, mocked providers.** Use a temporary on-disk SQLite for each test suite (sqlite-vec needs an extension load — in-memory `:memory:` works too but exercise both). Provider HTTP calls (Ollama, Voyage, Cohere, Anthropic) are mocked via `undici` MockAgent or vitest's `vi.spyOn(global, 'fetch')`.
- **Fixtures are tiny.** A `test/fixtures/sample-products/` tree with 3 fake products × 3 fake releases is enough for parser correctness. The full 706-release corpus is exercised only in a single end-to-end smoke test (skipped by default; opt-in via `RUN_SMOKE=1`).
- **Provider tests don't hit network.** If `OLLAMA_HOST` / `VOYAGE_API_KEY` / `COHERE_API_KEY` / `ANTHROPIC_API_KEY` is set in the test environment, the test must still pass with mocks (not opportunistically hit the real API).
- **No flaky tests.** All time/date-sensitive code uses an injectable clock or `vi.useFakeTimers()`.

---

## 2. Tooling decisions

- **Framework:** [`vitest`](https://vitest.dev) (TypeScript-native, fast, vi.* mocks built in)
- **HTTP mocking:** `vi.spyOn(global, 'fetch')` returning a fake `Response`. Helper: `test/helpers/fetch-mock.ts`.
- **Process spawning** (for MCP server tests): Node's `child_process.spawn` + line-delimited JSON-RPC over stdio. Helper: `test/helpers/mcp-client.ts`.
- **Temp DB:** `test/helpers/temp-db.ts` exposes `withTempDb(fn)` that creates a fresh SQLite file under `os.tmpdir()`, runs the test, removes the file.
- **Snapshot tests:** allowed for stable structural output (e.g., schema introspection). Forbidden for free-form CLI prose output — assert on substrings instead.

**Add to `package.json` devDependencies:**
```
"vitest": "^2.1.0",
"@vitest/coverage-v8": "^2.1.0"
```

**Add to `package.json` scripts:**
```
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:smoke": "RUN_SMOKE=1 vitest run test/smoke"
```

**Coverage targets** (enforced via `vitest.config.ts` threshold):
- Statements ≥ 80%
- Branches ≥ 75%
- Functions ≥ 85%
- Lines ≥ 80%

Exempted from coverage (low ROI):
- `src/cli.ts` action handlers (covered by integration tests instead)
- `src/mcp-server.ts` connection wiring (covered by integration tests)
- Skeleton providers `claude-haiku`, `voyage`, `cohere` (paid; covered only by their API-call-shape test)

---

## 3. File layout

```
test/
├── unit/
│   ├── extract.test.ts                  § 4.1
│   ├── ingest.test.ts                   § 4.2
│   ├── ingest-frontmatter.test.ts       § 4.2
│   ├── query.test.ts                    § 4.3
│   ├── db.test.ts                       § 4.4
│   ├── embed.test.ts                    § 4.5
│   ├── hybrid.test.ts                   § 4.6
│   ├── fetch.test.ts                    § 4.7
│   └── providers/
│       ├── context-none.test.ts         § 4.8
│       ├── context-structured.test.ts   § 4.8
│       ├── context-ollama.test.ts       § 4.8
│       ├── context-claude-haiku.test.ts § 4.8 (shape only)
│       ├── embedding-ollama.test.ts     § 4.9
│       ├── embedding-voyage.test.ts     § 4.9 (shape only)
│       ├── rerank-none.test.ts          § 4.10
│       ├── rerank-ollama-judge.test.ts  § 4.10
│       ├── rerank-voyage.test.ts        § 4.10 (shape only)
│       └── rerank-cohere.test.ts        § 4.10 (shape only)
├── integration/
│   ├── pipeline.test.ts                 § 5.1
│   ├── sync.test.ts                     § 5.2
│   ├── mcp-server.test.ts               § 5.3
│   └── cli.test.ts                      § 5.4
├── regression/
│   └── bugs.test.ts                     § 8 (one describe block per bug)
├── smoke/
│   └── full-corpus.test.ts              § 9 (opt-in via RUN_SMOKE=1)
├── fixtures/
│   ├── sample-products/
│   │   ├── test-cli/
│   │   │   ├── releases/
│   │   │   │   ├── 1.0.0.md            # frontmatter + 3 bullets
│   │   │   │   ├── 1.0.1.md            # asterisk-bullet format
│   │   │   │   └── 1.1.0.md            # mixed dash + asterisk, fenced code block
│   │   │   └── INDEX.md
│   │   ├── test-sdk/
│   │   │   ├── releases/
│   │   │   │   ├── sdk-0.1.0.md        # multi-package shape
│   │   │   │   ├── sdk-0.1.1.md
│   │   │   │   └── vertex-sdk-0.2.0.md
│   │   │   └── INDEX.md
│   │   └── test-apps/                  # sub_product shape (multi-entry per date)
│   │       ├── releases/
│   │       │   ├── 2026-04-09-test-cowork.md
│   │       │   ├── 2026-04-09-test-design.md
│   │       │   └── 2026-04-10-test-chat.md
│   │       └── INDEX.md
│   ├── mock-responses/
│   │   ├── ollama-embed.json           # 768-d nomic-embed-text response
│   │   ├── ollama-generate-judge.json  # qwen3:8b rerank judge response
│   │   ├── ollama-generate-context.json
│   │   ├── voyage-embed.json
│   │   ├── voyage-rerank.json
│   │   ├── cohere-rerank.json
│   │   ├── anthropic-messages.json     # Haiku context call
│   │   └── gh-api-releases.json        # 5 sample releases
│   └── markdown-edge-cases/
│       ├── empty-body.md
│       ├── only-frontmatter.md
│       ├── nested-bullets.md
│       ├── code-blocks-with-fake-bullets.md
│       └── unicode-in-bullets.md
└── helpers/
    ├── temp-db.ts                       # withTempDb()
    ├── fetch-mock.ts                    # mockFetch() with route table
    ├── mcp-client.ts                    # spawn server, JSON-RPC helpers
    ├── seed-corpus.ts                   # ingest fixtures into a temp DB
    └── golden-vectors.ts                # deterministic Float32Array helpers
```

---

## 4. Unit tests

### 4.1 `extract.ts`

For each entity type pattern in `PATTERNS`:
- **`env_var`**
  - matches `CLAUDE_CODE_WORKFLOWS`, `ANTHROPIC_API_KEY`, `MCP_TOOL_TIMEOUT`, `GH_TOKEN`, `OLLAMA_HOST`
  - does NOT match lowercase or partial matches (e.g. `CLAUDE_CODE_workflows`)
  - does NOT match inside code-block fences (caller's responsibility, but verify regex word boundary)
- **`slash_command`**
  - matches `/code-review`, `/usage-credits`, `/ultrareview`
  - does NOT match URL paths (`/v1/messages`), file paths (`/home/foo`), or in-word slashes
  - normalizes leading-slash convention
- **`cli_option`**
  - matches `--config`, `--limit`, `--since`
  - does NOT match `--` separator or `---` rule
- **`beta_header`**
  - matches `fast-mode-2026-02-01`, `cache-diagnosis-2026-04-07`, `managed-agents-2026-04-01`
  - does NOT match plain dates
- **`model_id`**
  - matches `claude-opus-4-7`, `claude-sonnet-4-6-20250929`, `claude-haiku-4-5`, `claude-opus-4-20250514`
  - does NOT match `claude-code` or `claude-mythos-preview`
- **`hook_event`**
  - matches the 12 defined hook events
  - is case-sensitive
- **`setting_key`**
  - matches `permissions.ask`, `hooks.PreToolUse`, `worktree.bgIsolation`
- **`cve`**: `CVE-2025-66414`, `CVE-2026-12345`
- **`ghsa`**: `GHSA-9h52-p55h-vw2f`

Deduplication:
- A single text mentioning `CLAUDE_CODE_WORKFLOWS` twice produces ONE `env_var` entity row
- A text mentioning two different env vars produces TWO `env_var` entity rows

Empty / whitespace input → empty result.

### 4.2 `ingest.ts`

**Frontmatter parsing**:
- valid frontmatter with all fields → release row populated correctly
- frontmatter with only `version` → `released_at` is null, `source_url` is empty string
- no frontmatter → falls back to `basename(file, '.md')` for version
- frontmatter with `sub_product` → composite version `${date}-${sub_product}`
- frontmatter with `bundle_size_kb_delta` → `bundle_size_kb` populated

**Bullet parsing** (`parseBullets`):
- `- bullet` lines extracted in order
- `* bullet` lines extracted in order
- mixed `-` + `*` in same file → both extracted
- nested bullets (2-space indented) → joined as continuation to parent
- fenced code blocks containing `- foo` → NOT extracted as bullets
- blank lines → flush in-progress bullet
- heading lines (`#`) → flush in-progress bullet
- table rows (`|`) → flush in-progress bullet

**Idempotency**:
- ingest same fixture twice → same row counts (no duplicate changes)
- ingest after modifying one bullet → that release's changes are replaced (delete + reinsert), not appended
- ingest a release that no longer exists on disk → existing rows preserved (no delete cascade)

**Product registration**:
- known product slug → `PRODUCT_META` populated correctly (display_name, source_tier, fetch_strategy)
- unknown product slug → falls back to default tier=1, strategy='gh-releases'

**Stats**:
- `IngestStats.releasesAdded` == file count
- `IngestStats.changesAdded` == total bullets across files
- `IngestStats.entitiesAdded` >= 0
- `IngestStats.errors` empty on clean fixture

### 4.3 `query.ts`

**`searchChanges`**:
- empty query → returns empty array (no error)
- bare keyword match → finds chunk by FTS5
- phrase query `"managed agents"` → finds multi-word phrases
- `--product X` filter → results only from product X
- `--since 2026-05-01` filter → results dated >= 2026-05-01
- `--kind breaking` filter → only breaking changes
- `--limit 3` → exactly 3 results (or fewer)
- ordering: `released_at DESC, ordinal ASC`
- snippet contains `[[` `]]` highlighting markers

**`lookupEntity`**:
- existing entity → all mentions returned, ordered by `released_at ASC`
- nonexistent entity → empty array
- entity type filter is exact (case-sensitive)

**`recentReleases`**:
- no product filter → recent across all products
- product filter → only that product
- ordering: `released_at DESC`
- `change_count` aggregated correctly via LEFT JOIN (zero-change releases listed with count=0)

**`listProducts`**:
- returns one row per product
- `latest_version` matches max `released_at`
- ordered by `release_count DESC`

**`entityFrequency`**:
- ordered by count DESC, then `first_seen ASC` (oldest first within tied counts)
- count matches actual entities table count
- limit respected

### 4.4 `db.ts`

- `openDb(path)` creates parent directory if missing
- `openDb` enables WAL + foreign_keys pragmas
- `openDb({loadVec: false})` skips sqlite-vec load
- `openDb` default attempts sqlite-vec load; logs warning on failure but does not throw
- `initSchema` runs full schema on fresh DB
- `initSchema` is idempotent: second call is a no-op (checks for `products` table)
- `initSchema` resolves `schema.sql` from `__dirname/../schema.sql` first, then `cwd/schema.sql`, then throws if neither

### 4.5 `embed.ts`

Use mocked context + embedding providers (in-process stubs implementing `ContextProvider` / `EmbeddingProvider`).

- `embedAll` with `--limit 5` embeds 5 chunks, leaves rest unembedded
- `embedAll` is idempotent without `--force`: second call embeds 0 new chunks
- `embedAll --force` re-embeds existing chunks (chunks table count unchanged but `embedded_at` advances)
- `embedAll --product X` only embeds chunks for product X
- Chunks grouped by release for sibling context (verify `ReleaseContext.siblings` length matches release size)
- `contextualized` column = `${context}\n\n${original}` when context non-empty
- `contextualized` column = `original` when context empty (NoneContextProvider)
- `chunks_vec` row count == `chunks` row count after embed
- `chunks_fts` row count == `chunks` row count after embed
- `initVecSchema` is idempotent
- Batch size: with `--batch-size 7` and 23 chunks, embedding is called ceil(23/7)=4 times

### 4.6 `hybrid.ts`

Use mocked embedding provider returning deterministic vectors from a fixture.

- empty corpus → empty results
- FTS-only mode (vec channel empty) → returns BM25-ranked
- vec-only mode (FTS errors / no match) → returns cosine-ranked
- RRF math: candidate appearing in both channels has `score = 1/(60+r_fts) + 1/(60+r_vec)`
- FTS5 syntax error → caught, retried with sanitized query (regex strips `-:@/`)
- `--product` / `--since` / `--kind` filters apply to BOTH channels
- `--rerank none` → no reranker called, RRF ordering preserved
- `--rerank ollama-judge` → reranker called once with top-N candidates, results reordered by rerank score
- Mocked reranker returning all-zero scores → fall back to RRF order (deterministic)

### 4.7 `fetch.ts`

Use mocked `gh api releases?per_page=100` response from `fixtures/mock-responses/gh-api-releases.json`.

- `fetchAll` with no marker → pulls everything since 2026-01-01
- `fetchAll` with marker → filters server-side by `published_at > marker` (verify the JS filter)
- written file has correct frontmatter (product, version with `v` stripped, source_url, released_at)
- multi-package products (`anthropic-sdk-typescript`): filename keeps package prefix, strips v only from version portion (`sdk-v0.98.0` → `sdk-0.98.0.md`)
- Idempotency: existing `${filename}.md` AND `${tag}.md` both checked (dual-form existsSync)
- Marker written to DB with `ON CONFLICT(product, name) DO UPDATE` (upsert)
- Unknown product slug → throws with helpful error listing valid products
- `gh` CLI returning non-JSON / error → captured in `errors[]` array, doesn't crash
- `seedMarkersFromDb` populates markers from DB state; missing-product → seededTo=null

### 4.8 Context providers

**NoneContextProvider** → `contextFor()` returns `""` for any input.

**StructuredContextProvider** → returns:
```
In ${product} ${version} (${date}), ${kind} (change N of total):
```
- date null → `"unknown date"` substituted
- `kind` preserved verbatim

**OllamaContextProvider** (mock `fetch`):
- POSTs to `${host}/api/generate` with correct body shape (model, prompt, stream=false, think=false isn't here, but verify temperature=0 + num_predict=80)
- normalizes `OLLAMA_HOST=127.0.0.1:11434` → prepends `http://`
- prompt contains `<document>` block with siblings, `<chunk>` block with focus
- non-200 response → throws with status + body
- response.response field trimmed

**ClaudeHaikuContextProvider** (shape-only — paid):
- throws when `ANTHROPIC_API_KEY` missing
- request body has `system[0].cache_control = { type: 'ephemeral' }` for prompt caching
- model is `claude-haiku-4-5-20251001`
- assembles document from `release.siblings`
- caches document per release key (verify: 2 calls for same release reuse cached doc)

### 4.9 Embedding providers

**OllamaEmbeddingProvider** (mock `fetch`):
- POSTs to `${host}/api/embed` with `{model, input: string[]}`
- returns `Float32Array[]` with length = dimension (768)
- dimension mismatch in response → throws clear error naming the model
- empty input array → returns empty array without calling fetch
- normalizes host without protocol

**VoyageEmbeddingProvider** (shape-only — paid):
- throws when `VOYAGE_API_KEY` missing
- request body has `output_dimension: 768` (Matryoshka truncation)
- `input_type: 'document'` for embed calls
- correct endpoint, auth header shape

### 4.10 Rerank providers

**NoneRerankProvider**:
- N candidates → N results with monotonically decreasing scores (length - index)
- empty input → empty output

**OllamaJudgeRerankProvider** (mock `fetch`):
- Default model is `qwen3:8b` (NOT qwen2.5:7b — see §8.10)
- Request body has `think: false`
- Prompt asks for `EXACTLY ${candidates.length} integers`
- Parses score lines correctly:
  - `"8\n0\n7"` → [8, 0, 7]
  - `"Doc 1: 8\nDoc 2: 0"` → [8, 0] (regex extracts first integer per line)
  - `"  10  \n  5  "` → [10, 5] (whitespace tolerated)
  - `"abc"` → [] (no integers → padded with 0)
- Score clamped to [0, 10] (model returning 11 → 10; returning -3 → 0)
- Fewer scores than expected → padded with 0
- More scores than expected → truncated to N

**VoyageRerankProvider / CohereRerankProvider** (shape-only — paid):
- correct endpoint URLs
- correct request body shape
- maps `data[].index` / `results[].index` back to candidate IDs

---

## 5. Integration tests

### 5.1 Pipeline (`integration/pipeline.test.ts`)

Full sweep against fixtures (~10 files):

1. `initSchema` on temp DB
2. `ingestAll` on `fixtures/sample-products/`
3. Verify counts: 3 products, ~9 releases, ~25 changes, ~10 entities
4. `searchChanges("workflow")` → returns expected fixture entries
5. `lookupEntity("env_var", "TEST_FLAG")` → returns the seeded fixture
6. `embedAll({contextProvider:'structured', embeddingProvider: mocked})` → chunks populated
7. `hybridSearch("workflow")` → results combine FTS + vec channels
8. `hybridSearch("workflow", {rerankProviderName: 'ollama-judge'})` with mock judge → reordered

### 5.2 Sync (`integration/sync.test.ts`)

1. Seed temp DB with 3 fake products via ingest
2. Mock `gh api releases` for one product returning 2 new releases
3. Run `fetchAll` → 2 new files on disk, marker updated
4. Run again → 0 new (idempotent)
5. Run with `--since` override pre-dating the marker → would have re-pulled but existsSync skips → 0 new files written, marker advances to latest
6. Verify markers row count and values

### 5.3 MCP server (`integration/mcp-server.test.ts`)

Use `test/helpers/mcp-client.ts` to:

1. Spawn `npx tsx src/mcp-server.ts` with `CLAUDE_SYNERGY_DB=<temp>`
2. Send `initialize` → verify response includes `serverInfo` and `capabilities`
3. Send `notifications/initialized`
4. Send `tools/list` → verify exactly these 8 tools in the array: `search`, `lookup_entity`, `latest_releases`, `get_release`, `list_products`, `top_entities`, `list_synergies`, `read_synergy`
5. Verify each tool has `name`, `description`, `inputSchema.type === 'object'`
6. Send `tools/call` for each tool with valid args → verify `content[0].type === 'text'` and `content[0].text` non-empty
7. Send `tools/call` with invalid tool name → `McpError` with code `MethodNotFound`
8. Send `tools/call` for `search` with empty query → graceful response (not crash)
9. Kill server, verify clean exit

### 5.4 CLI (`integration/cli.test.ts`)

For each subcommand, spawn `tsx src/cli.ts <subcommand>` with a temp DB and verify:

- exit code 0 on success
- exit code 1 on documented errors (missing products dir, unknown product, etc.)
- stdout contains expected substrings (don't snapshot the whole thing — assert on key markers)
- positional options work: `tsx src/cli.ts query "managed agents" --limit 3` parses correctly
- `--db` flag overrides default location
- `hk fetch --product unknown-product` exits non-zero with helpful message listing valid products

---

## 6. MCP server testing strategy

The MCP server is stdio-driven. Tests must:

1. **NOT** require `pnpm build` (use `npx tsx src/mcp-server.ts` directly)
2. **NOT** depend on a running Ollama (mock `fetch` in the helper)
3. Use a temp DB pre-seeded by `seed-corpus.ts`

`test/helpers/mcp-client.ts` should expose:

```ts
export async function withMcpServer(opts: { dbPath: string }, fn: (client: McpClient) => Promise<void>): Promise<void>

export interface McpClient {
  initialize(): Promise<InitializeResult>
  listTools(): Promise<Tool[]>
  callTool(name: string, args: Record<string, unknown>): Promise<CallToolResult>
  close(): Promise<void>
}
```

The helper spawns the server, completes the handshake, and exposes typed methods. On test end, kills the process.

JSON-RPC error: malformed JSON line → log to stderr, do not assert (just ignore non-JSON lines).

---

## 7. Fixtures

**Sample products** — keep them tiny but realistic. Each `releases/*.md`:

```yaml
---
product: test-cli
version: "1.0.0"
released_at: "2026-01-15"
source_url: "https://example.test/v1.0.0"
fetched_at: "2026-05-21"
---

# test-cli v1.0.0

- Added `TEST_FLAG` environment variable for enabling experimental mode
- Fixed `/test-cmd` slash command crash when arguments contain spaces
- Renamed `--old-flag` to `--new-flag`
```

Cover specific cases:
- `1.0.0.md` — dash bullets, basic frontmatter
- `1.0.1.md` — asterisk bullets, no source_url
- `1.1.0.md` — mixed bullets, fenced code block with fake bullets inside, indented continuation
- `sdk-0.1.0.md` — `package: sdk` frontmatter
- `vertex-sdk-0.2.0.md` — `package: vertex-sdk` frontmatter
- `2026-04-09-test-cowork.md` — `sub_product: test-cowork`, version is the date

**Mock HTTP responses** — JSON files with golden response shapes:

```json
// fixtures/mock-responses/ollama-embed.json
{
  "model": "nomic-embed-text",
  "embeddings": [/* 768 floats, deterministic seeded values */]
}
```

For golden vectors: use `test/helpers/golden-vectors.ts` to generate seed-based Float32Arrays so identical inputs → identical vectors across runs.

---

## 8. Regression suite (`regression/bugs.test.ts`)

Each describe block represents a real bug fixed during dev. **DO NOT** delete these even if they look obvious — they are documentation of the failure mode.

### 8.1 `parseBullets handles asterisk markers`
- Input: markdown with `* Bullet one\n* Bullet two`
- Expected: 2 bullets extracted
- Bug: regex was `^- ` only; missed `claude-code-action`'s 1,138 bullets

### 8.2 `searchChanges does not error on FTS5 column ambiguity`
- Setup: ingest fixtures with text
- Query: `searchChanges(db, "test")` → returns rows, no `ambiguous column name: text` SQLite error
- Bug: `SELECT c.text` + `snippet(changes_fts, 0, ...)` triggered ambiguity; fixed by aliasing `c.text AS body` + remapping

### 8.3 `Commander variadic does not consume options`
- Invocation: `tsx src/cli.ts query foo --limit 3`
- Expected: `query='foo'`, `opts.limit='3'`
- Bug: `<text...>` variadic absorbed `--limit 3`; fixed by switching to single-arg `<text>`

### 8.4 `Sub-product composite versioning preserves 24 anthropic-apps entries`
- Setup: ingest fixtures with 2 files on the same date but different `sub_product` values
- Expected: 2 distinct `releases` rows
- Bug: composite PK `(product, version)` merged date-only versions; fixed by composing `${date}-${sub_product}`

### 8.5 `Idempotent schema init`
- Call: `initSchema(db)`, then `initSchema(db)` again
- Expected: second call is no-op, no `table already exists` error
- Bug: `CREATE TABLE` without IF NOT EXISTS + no idempotency check

### 8.6 `OLLAMA_HOST without protocol is normalized`
- Setup: `process.env.OLLAMA_HOST = '127.0.0.1:11434'`
- Expected: provider constructs `http://127.0.0.1:11434`
- Bug: bare host → fetch threw "Failed to parse URL"

### 8.7 `sqlite-vec accepts BigInt rowid + Float32Array embedding`
- Setup: insert into `chunks_vec` with `rowid = Number(123)` and `embedding = Buffer.from(...)`
- Expected: with Number + Buffer, throws `Only integers are allowed for primary key values`
- Expected: with `BigInt(123)` + raw `Float32Array`, succeeds
- Bug: must use BigInt for rowid and pass Float32Array directly (not Buffer.from(vec.buffer))

### 8.8 `OllamaJudgeRerankProvider passes think:false`
- Mock fetch, send rerank with `qwen3:8b`
- Expected: request body has `"think": false`
- Bug: qwen3's thinking mode ate `num_predict`, producing empty `response` + truncated `thinking` field. The fix is API param, NOT switching to older qwen2.5.

### 8.9 `OllamaJudgeRerankProvider default model is qwen3:8b`
- Construct without args, no env vars set
- Expected: `provider.model === 'qwen3:8b'`
- Bug doctrine ratchet: when newer model has config-fixable issue, fix the config — don't fall back to the older model

### 8.10 `fetch idempotency with v-prefix dual-form check`
- Setup: temp products dir with `v1.0.29.md` already present
- Mock `gh api` returning release `v1.0.29` with same content
- Run `fetchAll`
- Expected: 0 new files written, marker still advances
- Bug: previous fetch wrote `1.0.29.md` because filenameFor stripped `v`, ignoring the swarm's `v1.0.29.md` convention; fixed by dual-form existsSync

### 8.11 `gh api JSON parsing in JS, not shell jq`
- Mock `execSync` returning JSON array
- Run `ghReleases('foo/bar', '2026-01-01')`
- Expected: filters happen in JS, command does NOT contain `--jq`
- Bug: Windows `cmd.exe` interpreted `select(...)` inside `--jq` as a separate command

### 8.12 `Markers table upsert on (product, name) composite PK`
- Call `writeMarker(db, 'foo', '2026-01-01')` twice with different values
- Expected: row count stays at 1; version updated
- Bug: required `ON CONFLICT(product, name) DO UPDATE` explicit conflict target

### 8.13 `Ingest deletes prior changes for replaced version, FTS5 sync`
- Setup: ingest a fixture with 3 bullets, then modify to have 2 bullets, re-ingest
- Expected: changes table for that version has 2 rows (not 5); changes_fts has 2 rows matching
- Bug: without `deleteChanges.run(product, version)` we'd have appended duplicates

---

## 9. Smoke test (opt-in)

`test/smoke/full-corpus.test.ts` — runs against the real corpus on disk if `RUN_SMOKE=1`.

- ingest `products/` → expect 706 releases, ~3,954 changes, ~957 entities (allow ±5% drift)
- query `"managed agents"` → returns >= 5 results
- query `"AskUserQuestion"` → returns >= 12 results, top result is 2.1.147
- lookup_entity `cve CVE-2025-66414` → returns 1 mention from claude-code-action v1.0.29
- lookup_entity `env_var CLAUDE_CODE_WORKFLOWS` → returns 1 mention from claude-code v2.1.147
- top env_var, slash_command, model_id, cve → each returns expected top results

Skipped on regular `pnpm test` (CI runs unit + integration, not smoke).

---

## 10. Provider mock contract

All provider tests use the same fetch-mock helper:

```ts
// test/helpers/fetch-mock.ts
export interface MockRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  urlPattern: string | RegExp
  response: (req: Request) => Promise<Response> | Response
}

export function mockFetch(routes: MockRoute[]): () => void  // returns restore fn
```

Each provider test sets up its routes, runs the provider, asserts on captured requests + returned data.

Capture mode: a flag `RECORD_FIXTURES=1` lets you regenerate `fixtures/mock-responses/*.json` against real APIs. Default is replay only.

---

## 11. Coverage exemptions (justified)

Documented in `vitest.config.ts`:

- `src/cli.ts` — action handlers covered by `integration/cli.test.ts`
- `src/mcp-server.ts` — startup/connect logic covered by `integration/mcp-server.test.ts`
- `src/providers/context/claude-haiku.ts` — paid; shape-only test
- `src/providers/embedding/voyage.ts` — paid; shape-only test
- `src/providers/rerank/voyage.ts` — paid; shape-only test
- `src/providers/rerank/cohere.ts` — paid; shape-only test

---

## 12. Run instructions

```bash
pnpm install
pnpm test                  # unit + integration + regression
pnpm test:watch            # vitest interactive
pnpm test:coverage         # generate coverage/index.html
pnpm test:smoke            # opt-in full-corpus smoke (needs real DB at data/claude-synergy.db)
```

CI invocation: `pnpm test --reporter=verbose --coverage`

---

## 13. Deliverables for the implementer

When done:

1. All test files written per the layout in §3
2. All §4-5 cases implemented
3. All §8 regression cases implemented and PASSING (these protect against re-introducing the bugs)
4. Coverage report meets thresholds in §2
5. CI integration: GitHub Action that runs `pnpm test` on push (separate from `sync.yml`)
6. `README.md` updated with `## Testing` section pointing at this spec + how to run

---

## 14. Acceptance criteria

- `pnpm test` exits 0
- Coverage thresholds met (or explicit exemptions in config)
- All regression tests in §8 are independent assertions (not "should pass if X" — they assert the fixed behavior directly)
- No test depends on a running Ollama, real API keys, or network access (smoke test exempted)
- MCP server tests spawn the server in isolation and complete in < 30s total
- Test suite runs in < 60s on a typical dev machine (smoke excluded)
