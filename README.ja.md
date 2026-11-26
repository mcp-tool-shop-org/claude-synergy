<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#ライセンス"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

ローカルで検索可能な、Anthropicおよび関連するAI開発ツールのすべての変更履歴のミラー。さらに、クロスプロダクトのワークフローを記述したキュレーションされた「Synergy」レイヤーも含まれており、これにより、ハネスの内部にあるLLMエージェントは、ハネスが何を実行できるかを把握できます。

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


単一のFTSクエリにより、個々の変更履歴ではCVEとしてフラグが立てられていなかった、調整されたクロスSDKのセキュリティ修正が明らかになります。これが最大のデモです。すべての変更履歴を並べて比較すると、パターンが見えてきます。

リポジトリ：[github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## 問題点

Claude Code CLIはほぼ毎日リリースされます。Claude APIもほぼ同じ頻度でリリースされます。SDKはCLIリリースごとにリリースされます。Claude Design、Cowork、Chat、およびMobileは、統合されたヘルプセンターを通じて提供されます。MCPエコシステムは、週に約200〜300個の新しいサーバーをリリースします。さらに、Cursor、Aider、Continue、Copilot、Cody、Windsurfなど、7つの主要なAI開発ツールがあり、それぞれが独自のペースで独自の変更履歴をリリースしています。

これらのツールのいずれか1つに搭載されているLLMエージェントは、トレーニングのカットオフ日が固定されています。そのギャップは日々広がっています。エージェントが認識していない機能がリリースされたり、エージェントがまだ回避策を講じているバグが修正されたりします。エージェントが提案することのない環境変数やフラグが追加されます。複数のコンポーネントを組み合わせたクロスプロダクトのワークフローは、まだ発見されていません。

**このリポジトリは、そのギャップを解消します。** Synergyセクションにより、これは単なるミラーではなく、製品になります。

---

## ここに何があるか

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

**最新の数値（v1.2.1時点）：** 44個の製品/1,171個のリリースファイル/6,573個の変更/1,260個のエンティティ/12個のシナジー/519個のテスト/13個のMCPツール/17個のCLIコマンド。（2026年5月24日に`sync_now`を通じて更新されたコーパス。）

---

## ステータス - すべての階層がリリース済み

| 階層 | ステータス | そこに何があるか |
|------|--------|--------------|
| **1 - ブートストラップ（マークダウンコーパス）** | ✅ リリース済み | Study-swarmは、2026年1月から5月にかけて706個のリリースファイルを収集し、Tier 4dで1,186個に拡張しました。 |
| **2a - SQLite + FTS5 + CLI** | ✅ リリース済み | `hk` CLI、15個のサブコマンド、sub-300ms インジェスト |
| **2b - sqlite-vec + コンテキスト検索** | ✅ リリース済み | プロバイダープラグ可能（なし/構造化/ollama/claude-haikuコンテキスト × ollama/voyage埋め込み × なし/ollama-judge/voyage/cohere再ランキング） |
| **3 - 同期 + MCPサーバー** | ✅ リリース済み | `hk fetch / sync / seed-markers`、`claude-synergy-mcp`は、標準出力経由で13個のツールを公開します（元のTier-3リリース時の8個、v1.1で3個追加、v1.2で2個追加） |
| **4a - Anthropicを超えて拡張** | ✅ リリース済み | +15個のMCP SDK、Cursor（RSS）、Aider（HISTORY.md）、Continue.dev、Cody Enterprise（RSSでフィルタリング） |
| **4b - HTMLスクレイプフェッチャー** | ✅ リリース済み | GitHub Copilot + VS Code Chat（WindsurfにはPlaywrightが必要 - v0.7） |
| **4c - HTMLからマークダウンへの変換によるインジェスト** | ✅ リリース済み | HTML本文（Copilot/VS Code/Cursor）は、現在、FTS5とエンティティ抽出のために、箇条書きごとの行を生成します。 |
| **4d - Playwright + MCPレジストリ + YAML構成** | ✅ リリース済み | WindsurfはPlaywright経由、Smitheryと公式のMCPレジストリをTier-4カタログとして使用、製品は`products.yaml`に統合されます。 |
| **5 - v1.1 ウィンドウ化されたブラウジング + OpenAI 埋め込み** | ✅ リリース済み | `hk diff` / `hk breaking`、すべてのブラウジングコマンドにわたる日付範囲、3つの新しいMCPツール（合計11個）、OpenAI埋め込みプロバイダー、構成可能な埋め込み次元、`claude-code`自動同期、汎用的な`keep-a-changelog`パーサー。 |
| **6 - v1.2 MCPからの同期** | ✅ リリース済み | `sync_status`（製品ごとの鮮度、存在しない/古い状態の検出）と`sync_now`（オンデマンドフェッチ → インジェスト → `dry_run`プレビュー + インプロセス同時実行ロックによる埋め込み）。呼び出しエージェントがコーパスをクエリできるが、更新できないという問題を解決します。**また、次の問題を修正します。** `INSERT OR REPLACE INTO products`が`markers`の外部キーに対してDELETEをカスケードし、すべての製品の`since`カーソルを各インジェストでサイレントにリセットするマーカー消去バグ（回帰 §8.20）。 |
| **6.1 - v1.2.1 フェッチャーマーカーの中央化** | ✅ リリース済み | `fetchOne`に`writeMarker`を集中化することで、すべての正常なフェッチがマーカーを更新します。修正前は、ウィンドウ内に日付の項目が0個返された戦略（特に`aider`の生の変更履歴）は、マーカーを書き込まず、各同期で`HISTORY.md`を再プルしていました。実装されていない`webfetch`戦略を`claude-api`と`anthropic-apps`のために`manual`に変更しました。`sync_status`は、手動で追加された製品を「手動」としてレンダリングし、「存在しない」とは表示せず、`stale_only`から除外します（回帰 §8.21）。 |
| **7 - v1.3 cs-actions:v1 微調整された合成器** | ✅ リリース済み | コーパスでトレーニングされた最初のダウンストリームモデル。1つの変更履歴エントリを1つの厳密なJSONアクションアイテム`{kind, severity, subject, action_text, deadline, tags}`に変換します。Qwen2.5-7BとLoRAを242個のエントリ（`dataset/changelog-actions/v1/`から）に適用し、q8_0 GGUFをOllamaにデプロイします。リリースゲート評価：**88.1%の種類 / 79.7%の重大度 / 0.842 macro-F1** vs 59個のエントリの層化されたホールドアウトにおける真の値（+10.1pp / +27.2pp / +0.041 over qwen3:8bベース）。`cs-actions-v1`としてタグ付けし、評価レポートを[GitHub リリース](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1)に単一のファイルとしてダウンロードできるように添付しました。**文書化されたv1の制限事項：** `unknown`に対するバイアス（精度1.000 / リコール0.286） - モデルは曖昧な入力を過小評価します。[ハンドブック → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) + [`dataset/README.md`](dataset/README.md) + [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) + [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md)を参照してください。 |

v1.3以降のロードマップ：[URGENT_FINDINGS.md](URGENT_FINDINGS.md)と課題で追跡します。

---

## セキュリティとデータモデル

このツールはローカルで実行されます。**アクセスするデータ:** 派生したSQLiteデータベースと、リリース用のマークダウンファイル。これらはすべて再作成可能です。**ネットワーク:** `hk fetch`/`hk sync`を実行する場合、エージェントがMCP`sync_now`ツールを呼び出す場合、および初回使用時に、アウトバウンドHTTPS通信が発生します。空のストアに対してクエリコマンドまたはMCPツールを実行すると、自動的に同期されます（`CLAUDE_SYNERGY_NO_AUTO_SYNC=1`でこれを無効にできます）。宛先は、GitHub API、RSSフィード、変更履歴ページ、およびMCPレジストリです。さらに、リモートプロバイダーを使用する`hk embed`の場合に限り、VoyageまたはCohereも使用されます。**機密情報:** 環境変数から`GITHUB_TOKEN`、`VOYAGE_API_KEY`、`COHERE_API_KEY`、`ANTHROPIC_API_KEY`を読み込みます。ログに記録したり、ディスクに保存したりすることはありません。**テレメトリーは行いません。**報告ポリシーについては、[SECURITY.md](SECURITY.md)を参照してください。

**ベンダーのテキスト:** サードパーティのリリースノートとカタログエントリは、引用されたデータとして厳密に扱われ、指示として解釈されることはありません。リリーステキストは、取り込み時に決定的にスクリーニングされます（隠された Unicode 制御文字の削除、画像/安全でないリンクの中和、メールアドレスとホームパスの削除、および指示のようなパターンにフラグを立てる）。その後、6 つの MCP ツールによって固定データフレームにラップされ、リリーステキストが返され、インラインの `[flagged: …]` マーカーが追加されます。リリーステキストは、指示ファイルには書き込まれません。

---

## インストール

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

または、`@mcptoolshop/claude-synergy` をインストールした後に直接実行します。 `hk` と `claude-synergy-mcp` の両方で、ローカルストアは同じ 4 段階の順序で解決されます。

1. `CLAUDE_SYNERGY_DB` 環境変数
2. 明示的な `--db <path>` (CLI) または位置引数の argv パス (MCP)
3. `<cwd>/data/claude-synergy.db` **（ただし、そのファイルがすでに存在する場合のみ）**（リポジトリクローンでの使用を維持）
4. `<home>/.claude-synergy/data/claude-synergy.db`（`<home>/.claude-synergy/products` の下にある製品を含む）

`CLAUDE_SYNERGY_PRODUCTS_ROOT` は、製品ディレクトリを上書きします。

**初回使用時の自動同期:** クエリコマンドまたは MCP ツールが、存在しない、または空のストアに対して実行された場合、スキーマを初期化し、自動的に `fetch` → `ingest` を実行します（埋め込みステップは行わず、タイムアウトによって制限され、到達不能なフィードはスキップします）。そして、すべての応答に `data as of: …` を付与します。 `CLAUDE_SYNERGY_NO_AUTO_SYNC=1` を設定すると、初回使用時の自動同期が無効になり、代わりに空のコーパスの指示で失敗/警告が表示されます。

ビルドなしで開発を行う場合は、`npx tsx src/cli.ts ...` を直接使用します。 **pnpm 10 の特異性:** `pnpm dev` は、`--` の後の CLI フラグを無視します。開発には `npx tsx` を使用してください。

---

## CLI のインターフェース — 17 個のコマンド

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

**v1.1 での新機能:** `hk diff` と `hk breaking` は、検索語句を必要とせずに、「最近何が変わったのか？」に答えます。日付の範囲は一貫しています。すべてのブラウジングコマンドは、`--since` と `--until` を `YYYY-MM-DD` (または完全な ISO 8601) で受け取るか、相対的な形式 (`7d`、`2w`、`3m`、`1y`) を受け取ります。

---

## 例：ワークフロー

**Claude Code 環境変数がいつ導入されたか:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**クロス SDK の破壊的変更を追跡:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**モデルの移行を計画:**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**全体的なコーパスでセマンティック検索:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

クエリは「env_scrub」とは言いません。セマンティックな類似性によって、vec がそれを表示します。純粋な FTS5 では、完全に見逃されます。

**claude-code で今週何が変わったか:**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**コーパス全体で破壊的変更を閲覧:**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

検索語句は必要ありません。`hk breaking` は、「最近、重要な変更はありましたか？」に対する答えです。

---

## MCP サーバー — エージェントにこのコーパスへのアクセス権を与えます

`claude-synergy-mcp` は、stdio を介して 13 個のツールを公開します。Claude Code (または任意の MCP ホスト) に、`~/.claude/.mcp.json` またはプロジェクトの `.mcp.json` を介して接続します。

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp"
    }
  }
}
```

カスタムストアパスが必要な場合は、`env` で `CLAUDE_SYNERGY_DB` を設定します。そうでない場合は、既存の `./data/claude-synergy.db` または `~/.claude-synergy/data/claude-synergy.db` を使用し、最初のツールの使用時に自動的に同期します (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` はこれを無効にします)。すべてのツールの応答の最後には、`data as of:` の鮮度スタンプが付加されます (7 日後には `STALE:` がプレフィックスとして付加されます)。

GitHub Copilotの`.vscode/mcp.json`については、`mcpServers`の代わりに`servers`ラッパーを使用してください（[synergy 12](synergies/12-mcp-config-format-gotcha.md)を参照）。

公開されるツール：

| ツール | 目的 |
|---|---|
| `search` | ハイブリッド FTS5 + vec。オプションのリランキング。自然言語クエリのデフォルトモード。（+ `until` 上限日付） |
| `lookup_entity` | 正確なエンティティ履歴：環境変数、スラッシュコマンド、モデル ID、CVE など。 |
| `latest_releases` | 製品（または 1 つの製品）における最近のリリース。（+ `since` 下限日付） |
| `get_release` | 1 つのリリースの完全なコンテンツ |
| `list_products` | カウントと最新バージョンを含む列挙 |
| `top_entities` | タイプ別の最も頻繁に言及されるエンティティ |
| `list_synergies` | キュレーションされたクロス製品のワークフロー。（+ オプションの `product` フィルター） |
| `read_synergy` | 1 つのシナジーファイルの完全なテキスト |
| `get_changes_since` | **新機能。** 時間ウィンドウ内の変更を、製品とバージョンごとにグループ化します。入力：`since`（必須）、`until?`、`product?`、`kind?`、`limit?`。 |
| `search_breaking_changes` | **新機能。** 破壊的変更のフラットリスト — 検索語句は必要ありません。入力：`product?`、`since?`、`until?`、`limit?`。 |
| `compare_versions` | **v1.1。** 1 つの製品の 2 つのバージョン間のすべての変更。入力：`product`、`from_version`、`to_version`。 |
| `sync_status` | **v1.2。** 製品ごとの同期の鮮度 — 最後のフェッチのタイムスタンプ、フェッチからの経過時間、取り込まれたリリースの数。入力：`product?`、`stale_only?`、`stale_hours?`。コーパスが古いかどうかを確認するために `latest_releases` を信頼する前に使用してください。 |
| `sync_now` | **v1.2.** 必要に応じて更新（`hk sync`をミラーリング）。入力：`product?`、`dry_run?`、`include_ingest?`、`include_embed?`、`timeout_ms?`。別の`sync_now`がすでに実行中の場合、`InvalidParams`で拒否します。Gitにはコミットしません。 |

v1.1のツールは、以前はスクリプトが必要だった`hk diff`/`hk breaking`の機能を再現し、バージョン比較のワークフローを実現します。v1.2の同期ツールは、セッションがコーパスを検索できるものの、更新できないという問題を解決します。具体的には、`sync_status`がデータの古さを検出し、`sync_now`がパイプラインを実行します。完全な入力スキーマについては、[ハンドブック → MCPサーバー](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/)を参照してください。

---

## ソース — 5 つの階層、7 つのフェッチャー戦略

完全な概要は、[SOURCES.md](SOURCES.md) を参照してください。

- **ティア1（GitHubのリリース）** — Anthropic SDK（7言語）、Agent SDK（2）、ant CLI、**claude-code**（現在はv1.1以降、gh-releasesを通じて自動的に同期される。以前は手動で更新していた）、claude-code-action、claude-code-security-review、および15のMCPエコシステムSDKを含む23製品に対して、`gh api repos/<owner>/<repo>/releases`を適用。
- **ティア2（生のマークダウン）** — `Aider-AI/aider/HISTORY.md`。ソースがKeep-a-Changelog形式のCHANGELOG.mdである製品であれば、汎用の`keep-a-changelog`パーサー（v1.1以降）も利用可能。`products.yaml`の1つのエントリで設定。
- **ティア3（HTML / RSS）** — `platform.claude.com/docs/release-notes`、`support.claude.com/articles/12138966`、`cursor.com/changelog/rss.xml`、`sourcegraph.com/changelog/featured.rss`（フィルタリング済み）、`github.blog/changelog/label/copilot/`、`code.visualstudio.com/updates/v1_NNN`
- **ティア4（カタログ）** — `anthropics/skills`、`claude-plugins-{official,community}`、`knowledge-work-plugins`
- **ティア5（アドバイザリー）** — `@ClaudeCodeLog`のXアカウント；marckrennの変更履歴ミラー

フェッチャー戦略：`gh-releases | rss | raw-changelog | keep-a-changelog | html-scrape | catalog | playwright`。新しい製品 = `products.yaml` の 1 つのエントリ。

---

## シナジー — 何が実現されるか

12 個のキュレーションされたクロス製品のワークフロー。それぞれは、構成パターン、それが適切な答えとなるトリガー、およびそれを実現する変更ログの証拠を記述します。例：

- **08 — 汎用 SKILL.md 形式** (コード + カーソル + Codex): 1 人のスキル作成者、3 人のエージェントがそれを読み取る
- **09 — 7 つの表面にわたる MCP** (コード + カーソル + Continue + Copilot + Windsurf + Cody + API): 1 つのバイナリ、すべてのエージェント
- **10 — 表面にわたる Anthropic BYOK**: 1 つの API キーが、7 つのエディターで Claude を動作させ、統一された課金システムを使用
- **11 — Claude Code が Aider をオーケストレーション**: コストのかかる編集を安価なモデルに移行し、Claude が計画を立てる
- **12 — MCP 構成形式の注意点**: Copilot は `servers` を使用。他のすべてのエージェントは `mcpServers` を使用。

完全なインデックスは [synergies/INDEX.md](synergies/INDEX.md) にあります。

---

## データセットとファインチューニングされたモデル

このコーパスには、変更箇条書きから派生したキュレーションされた **データセット** と、それらのデータセットでトレーニングされた **ファインチューニングされたモデル** という、下位レイヤーがあります。このリポジトリの成果物はデータセットであり、モデルは下位レイヤーです。

### `dataset/changelog-actions/v1` — 301 件のエントリー

各エントリーは、コーパスからの 1 つの変更箇条書きと、手書きのアクションアイテムをペアにします: `{kind, severity, subject, action_text, deadline, tags}`。8 種類の `kind` タクソノミー (`breaking | deprecation | security | feature | fix | performance | docs | unknown`)、80/20 のトレーニング/ホールドアウトで層別化、A3c-reviewed による人間による評価 + クロスファミリー qwen3:8b による評価 (92.4% の合意)。分布表については [`dataset/README.md`](dataset/README.md)、フィールドごとの契約については [`SCHEMA.md`](dataset/changelog-actions/SCHEMA.md)、`action_text` の記述ルールについては [`STYLE.md`](dataset/changelog-actions/STYLE.md) を参照してください。

### `cs-actions:v1` — ファインチューニングされたシンセサイザー

最初にデータセットでトレーニングされたモデル。Qwen2.5-7B-Instruct + LoRA (ランク 256 / すべて線形、100 ステップ QLoRA、242 件のトレーニングエントリー)、q8_0 GGUF、2 段階の Ollama Modelfile (`cs-actions-base` + `cs-actions:v1`) を介してデプロイ。

**リリースゲート評価** (59 件のエントリーの層別化されたホールドアウト、3 回の実行、すべてパス、パースエラーはゼロ):

| メトリック | qwen3:8b ベース | cs-actions:v1 | デルタ |
|---|---|---|---|
| 種類の一致 vs 正解 | 78.0% | **88.1%** | +10.1pp |
| 重大度の一致 vs 正解 | 52.5% | **79.7%** | +27.2pp |
| Macro-F1 (十分にデータのあるクラス) | 0.801 | **0.854** | +0.053 |
| 実行 3 — 種類ヒントの除去 (ヒントあり / ヒントなし) | — | 0.842 / 0.777 | 6.5pt → ターゲットゾーン |

リリースパス基準 `qwen3-vs-cs-actions ≥ qwen3-vs-GT` (`0.780 ≥ 0.780`) — PASS ✓。エントリーごとの完全な結果は [`eval-report.v1.json`](dataset/changelog-actions/v1/eval-report.v1.json) にあり、[GitHub リリース](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) にも単一ファイルとして添付されています。

**文書化された v1 の制限 — `unknown` へのバイアスに対する対策。** `unknown` は、cs-actions:v1 が qwen3:8b よりもパフォーマンスが低い唯一のクラスです (F1 0.444 vs 0.545)。精度 1.000 / リコール 0.286 — 入力が本質的に曖昧な場合、モデルは特定の種類の選択にコミットし、中立的な選択をしません。qwen ファミリーの事前知識が継承されており、LoRA によって完全に上書きされていません。下位のコンシューマーは、期待よりも低い `kind: "unknown"` のレートを、バッチを人間のレビューにルーティングするためのシグナルとして扱う必要があります。[v2 の計画](dataset/README.md) では、未知のクラスの拡張とヒントのランダム化によって、この問題を解決します。

**このリポジトリを通じて配布されない** — q8_0 GGUF は約 5 GB で、マージされたチェックポイントは約 15 GB です。データセットとビルドパイプラインが公開されるものであり、モデルは [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) (4 段階の手動チェーン、RTX 5080 Laptop 16 GB VRAM で約 88 分のウォームアップ) に従ってローカルで再構築されます。3 回の実行によるリリースゲート契約は [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md) にあります。

完全な使用方法の説明 — ローカルの Ollama 呼び出し、`format: "json"` 単位のリクエストごとの呼び出し要件、およびビルドパイプラインを含む — は、[ハンドブック → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) ページにあります。

---

## テスト

Vitest スイートは、ユニット / 統合 / 回帰 / スモークの各層をカバーします。**[test-spec-3.md](test-spec-3.md) が v0.7.0 の時点での最新の権威**です。[test-spec.md](test-spec.md) (v1) および [test-spec-2.md](test-spec-2.md) (v2) は、設計の経緯の歴史的記録としてリポジトリに残っています。

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

レイアウト:

| ディレクトリ | 対象範囲 |
|-----|----------------|
| `test/unit/` | モジュールごと — 抽出、取り込み、クエリ (`until` / 参照 / 以降 / 比較を含む)、データベース (次元構成 v3 の移行を含む)、埋め込み、ハイブリッド、フェッチ + すべてのプロバイダー (Ollama / Voyage / **OpenAI**) + フェッチ RSS/変更ログ (keep-a-changelog パーサーを含む) / HTML + フェッチ MCP レジストリ + フェッチ Playwright + 製品構成 + シナジー取り込み/クエリ |
| `test/integration/` | エンドツーエンド — パイプライン、同期、MCP サーバー (stdio JSON-RPC、13 のツールを含む `sync_status` / `sync_now`)、CLI (`hk diff`、`hk breaking` を含む) |
| `test/regression/` | §8.1–§8.19 — それぞれは、開発中に修正された実際のバグに対する保護を提供します (§8.19: ghReleases の早期終了ページネーションにより、ウィンドウ内のアイテムが保持されます) |
| `test/smoke/` | 実際の `products/` (1,143 ファイル) に対して、オプトインで完全なコーパスを使用 |
| `test/fixtures/` | 3 つの偽の製品 + モック HTTP レスポンス (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / 公式 MCP レジストリ) |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**デフォルトではテストにネットワークは使用しない** — プロバイダーの HTTP は `vi.spyOn(global, 'fetch')` を介してモックされます。sqlite-vec 拡張機能のロードのセマンティクスはバージョンによって異なり、ディスク上の状態が標準的なパスであるため、実際の SQLite は一時ファイル (`:memory:` ではない) にあります。Playwright は動的インポートを介してロードされ、`vi.doMock('playwright', ...)` を介してモックされるため、実際のブラウザのインストールなしにテストがパスします。

CI: `.github/workflows/test.yml` は、プッシュ時と PR 時には `pnpm test:coverage` を実行します。

---

## トラブルシューティング

**「データベースがロックされています」または WAL エラー**

別の `hk` プロセス (または古い MCP サーバー) が SQLite データベースを開いたままにしています。他の `hk` プロセスを閉じ、再試行してください。問題が解決しない場合は、`data/claude-synergy.db` の横に `-wal` または `-shm` ファイルがないか確認してください。これらは通常の WAL モードのファイルであり、最後の接続が閉じられるとクリーンアップされます。別のプロセスがデータベースを開いている間に削除しないでください。

**「sqlite-vec 拡張機能が見つかりません」/ sqlite-vec のロードに失敗しました**

`sqlite-vec` ネイティブ拡張機能のロードに失敗しました。一般的な原因:

1. **Nodeのバージョンが古い** — `claude-synergy`は、WindowsではNode 22.12以降、macOSまたはLinux（glibcまたはmusl）、x64またはarm64が必要です。32ビットARMはサポートされていません。`node -v`で確認してください。
2. **ネイティブモジュールを再ビルドする必要がある** — `npm rebuild better-sqlite3`（または`pnpm rebuild better-sqlite3`）を実行してください。
3. **プラットフォームの不一致** — Windows/ARMでは、`better-sqlite3`にC++のビルドツールチェーンが必要です。[windows-build-tools](https://github.com/nicedoc/windows-build-tools)または「C++によるデスクトップ開発」を含むVisual Studio Build Toolsをインストールしてください。

注: `sqlite-vec` はオプションです。FTS5 キーワード検索 (`hk query`) は、これなしでも機能します。`hk embed` と `hk hybrid` のみでベクター拡張機能が必要です。

**「製品 X の同期に失敗しました」/ フェッチエラー**

`hk fetch`と`hk sync`は、外部APIを呼び出します。一般的な原因：

- **GitHubレート制限** — `gh-releases`の戦略は、あなたの`GITHUB_TOKEN`を使用する`gh api`に処理を委譲します。認証されていないリクエストは1時間に60リクエストまでです。`gh auth login`で認証するか、環境で`GITHUB_TOKEN`を設定してください。
- **ネットワーク/プロキシ** — RSSとHTMLフェッチャーは`fetch()`を使用します。接続性と、企業プロキシの設定（`HTTPS_PROXY`）を確認してください。
- **不明な製品** — `hk fetch --product foo`は、`products.yaml`にリストされている製品でのみ機能します。利用可能なすべての名前を確認するには、`hk products`を実行してください。

同期はべき等です。部分的な失敗の後でも、安全に再実行できます。すでに取得済みのリリースはスキップされます。

**「埋め込みプロバイダーが応答しません」**

`hk embed`は、外部の埋め込みサービスを呼び出します。

- **Ollama（デフォルト、768次元）** — Ollamaが実行されている（`ollama serve`）こと、および埋め込みモデルがダウンロードされている（`ollama pull nomic-embed-text`）ことを確認してください。
- **Voyage（1024次元）** — 環境で`VOYAGE_API_KEY`を設定します。APIキーを[dash.voyageai.com](https://dash.voyageai.com)で確認してください。
- **OpenAI（デフォルトは1536次元、設定可能）** — `OPENAI_API_KEY`を設定します。デフォルトのモデルは`text-embedding-3-small`です。`OPENAI_EMBED_MODEL`（例：3072次元の場合は`text-embedding-3-large`）でオーバーライドできます。`hk hybrid --embed openai`または`hk embed --embed openai`を介して使用します。

**プロバイダーの切り替え時に埋め込み次元が一致しない**

各プロバイダーは、固定次元のベクトルを生成します（Ollamaは768、Voyageは1024、OpenAIはデフォルトで1536 — OpenAIは、モデルのネイティブサイズ内で設定可能な次元をサポートします）。DBは、アクティブな次元を`schema_meta.embedding_dim`に保存します。チャンクが存在する状態で、異なる次元のプロバイダーに切り替えると、ベクトルテーブルがサイレントに破損するのではなく、`EMBEDDING_DIM_MISMATCH`（`AppError`）が発生します。切り替えるには：

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --embed openai     # new provider, new dim, fresh chunks_vec
```

OpenAI Matryoshka切り捨て（ネイティブ次元よりも小さい）の場合、`OPENAI_EMBED_MODEL`を設定し、目的の次元を`hk embed`のプロバイダーの構築時に渡します。詳細は、[ハンドブックの埋め込みセクション](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions)を参照してください。

**スキーマバージョンが一致しない/データベースが破損している**

DBが古いスキーマバージョンで作成され、移行が失敗した場合、またはクラッシュ後にデータがおかしいように見える場合：

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --context structured --embedding ollama   # optional, for vector search
```

これは安全です。DBは派生キャッシュです。すべてのソースデータは、`products/*/releases/*.md`ファイルに保存されます。

---

## 関連ファイル

- [CONTRIBUTING.md](CONTRIBUTING.md) — 製品の追加、テストの実行、PRの送信の方法
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23の実行可能な項目（セキュリティCVE、モデルの廃止、破壊的な変更、設定の注意点）
- [SOURCES.md](SOURCES.md) — 5階層のソース環境とフェッチ戦略
- [synergies/INDEX.md](synergies/INDEX.md) — 12の厳選されたクロス製品ワークフロー
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — SQLite + sqlite-vecスキーマ
- [test-spec-3.md](test-spec-3.md)（最新）+ [test-spec-2.md](test-spec-2.md)、[test-spec.md](test-spec.md)（過去）— テストスイートの仕様

---

## ライセンス

MIT。MCP Tool Shopによって作成されました。<a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>。
