<p align="center">
  <a href="README.md">English</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

Anthropic社および関連するAI開発ツールに関する変更履歴をローカルで検索可能なミラーとして提供します。さらに、複数の製品を組み合わせたワークフローを説明する**Synergy（連携）**レイヤーも搭載しており、これにより、ハネス（制御環境）内のLLMエージェントが、ハネスが何ができるかを理解できるようになります。

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


**単一のFTS（Full-Text Search）クエリで、個々の変更履歴ではCVE（Common Vulnerabilities and Exposures：共通脆弱性情報）として特定されなかった、複数のSDKにまたがるセキュリティ修正をまとめて表示できます。** これが最も効果的なデモです。すべての変更履歴を並べて比較することで、パターンが見えてきます。

リポジトリ：[github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## 問題点

Claude Code CLIはほぼ毎日、Claude APIはそれに近い頻度でリリースされます。SDKはCLIのリリースごとにリリースされます。Claude Design、Cowork、Chat、およびモバイル版は、統合されたヘルプセンターを通じて提供されます。MCPエコシステムでは、毎週約200〜300の新しいサーバーがリリースされます。さらに、Cursor、Aider、Continue、Copilot、Cody、Windsurfなど、7つの主要なAI開発ツールがあり、それぞれ独自の変更履歴を独自のペースで公開しています。

これらのいずれかにあるLLMエージェントは、学習データの更新が固定されています。その差は毎日広がります。エージェントが知らない機能が追加されたり、エージェントがまだ対応していないバグが修正されたり、エージェントが提案しない環境変数やフラグが追加されたりします。複数のツールを組み合わせたワークフローが発見されないままです。

**このリポジトリは、そのギャップを埋めます。** Synergyセクションは、単なるミラーではなく、製品としての価値を高めます。

---

## このリポジトリに含まれるもの

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

**現在の数値 (v1.1.0 時点):** 44製品 / 1,186リリースファイル / 6,042変更点 / 1,225エンティティ / 12の連携 / 508テスト / 11のMCPツール / 17のCLIコマンド。

---

## ステータス — すべてのティアがリリース済み

| ティア | ステータス | 内容 |
|------|--------|--------------|
| **1 — ブートストラップ（Markdownコーパス）** | ✅ リリース済み | Study-swarmが706のリリースファイルを2026年1月から5月までに収集し、Tier 4で1,186に拡張。 |
| **2a — SQLite + FTS5 + CLI** | ✅ リリース済み | `hk` CLI; 15のサブコマンド; 300ms未満のインジェスト速度 |
| **2b — sqlite-vec + コンテキスト検索** | ✅ リリース済み | プロバイダープラグ可能（なし/構造化/Ollama/Claude-Haiku コンテキスト × Ollama/Voyage埋め込み × なし/Ollama-Judge/Voyage/Cohere リランク） |
| **3 — 同期 + MCPサーバー** | ✅ リリース済み | `hk fetch / sync / seed-markers`; `claude-synergy-mcp`は、標準入出力経由で11のツールを提供します（v1.1で追加された3つを含む、元々のTier-3で提供されていた8つに加え）。 |
| **4a — Anthropic社以外の拡張** | ✅ リリース済み | +15のMCP SDK、Cursor（RSS）、Aider（HISTORY.md）、Continue.dev、Cody Enterprise（RSSフィルタリング） |
| **4b — HTMLスクレイピングフェッチャー** | ✅ リリース済み | GitHub Copilot + VS Code Chat（WindsurfはPlaywrightが必要 — v0.7） |
| **4c — turndown HTML→Markdownインジェスト** | ✅ リリース済み | HTMLの本文（Copilot/VS Code/Cursor）が、FTS5とエンティティ抽出のための、行ごとのリストを生成 |
| **4d — Playwright + MCPレジストリ + YAML設定** | ✅ リリース済み | WindsurfはPlaywright経由; Smitheryと公式MCPレジストリをTier-4カタログとして使用; 製品は`products.yaml`に統合 |
| **5 — v1.1：ウィンドウ表示機能 + OpenAIの埋め込み機能** | ✅ リリース済み | `hk diff` / `hk breaking`：すべての閲覧コマンドで日付範囲を指定可能。3つの新しいMCPツール（合計11個）、OpenAIの埋め込み機能、設定可能な埋め込み次元、`claude-code`の自動同期、汎用的な`keep-a-changelog`パーサー。 |

v0.8以降のロードマップ：[URGENT_FINDINGS.md](URGENT_FINDINGS.md)およびissueで追跡中。

---

## セキュリティとデータモデル

このツールはローカルで動作します。**アクセスするデータ：** 派生したSQLiteデータベースと、マークダウン形式のリリースファイル。これらはすべて再作成可能です。**ネットワーク：** `hk fetch` または `hk sync` コマンド（GitHub API、RSSフィード、変更履歴ページ、MCPレジストリ）、またはリモートプロバイダー（Voyage、Cohere）を使用する `hk embed` コマンドを実行する場合にのみ、HTTPS経由で外部サーバーと通信します。**機密情報：** `GITHUB_TOKEN`、`VOYAGE_API_KEY`、`COHERE_API_KEY`、`ANTHROPIC_API_KEY` を環境変数から読み込みます。これらの情報はログに記録されることも、ディスクに保存されることもありません。**テレメトリー機能はありません。** セキュリティに関するポリシーについては、[SECURITY.md](SECURITY.md) を参照してください。

---

## インストール

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

開発環境でビルドせずに使用するには、`npx tsx src/cli.ts ...`を直接実行します。**pnpm 10の注意点:** `pnpm dev`は、`--`以降のCLIフラグを無視します。開発には`npx tsx`を使用してください。

---

## CLIインターフェース — 15のコマンド

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

**v1.1の新機能:** `hk diff`と`hk breaking`は、検索語句なしで「最近何が変わったか」を教えてくれます。日付範囲はすべて統一されており、すべての閲覧コマンドで`--since`と`--until`を`YYYY-MM-DD`形式（または完全なISO 8601形式）、または相対形式（`7d`、`2w`、`3m`、`1y`）で指定できます。

---

## 例：ワークフロー

**Claude Codeの環境変数導入時期の特定:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**SDK全体に影響する破壊的変更の追跡:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**モデル移行計画の策定:**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**全ドキュメントに対する意味検索:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

この検索クエリは「env_scrub」という文字列を含みません。代わりに、意味的な類似性に基づいて表示されます。従来の完全一致検索では、該当する情報を見つけることができません。

**今週のclaude-codeの変更点:**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**コーパス全体における変更点を閲覧:**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

検索語句は不要 — `hk breaking`は「最近、重要な変更はありましたか？」という質問への答えです。

---

## MCPサーバー：エージェントがこのドキュメント群にアクセスできるようにします

`claude-synergy-mcp`は、標準入出力（stdio）を介して8つのツールを提供します。`~/.claude/.mcp.json`またはプロジェクトの`.mcp.json`ファイルを通じて、Claude Code（または任意のMCPホスト）に接続します。

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

GitHub Copilotの`.vscode/mcp.json`ファイルでは、`mcpServers`ではなく`servers`ラッパーを使用してください（[synergy 12](synergies/12-mcp-config-format-gotcha.md)を参照）。

提供されるツール：

| ツール | 目的 |
|---|---|
| `search` | ハイブリッドFTS5 + ベクトル; オプションで再ランキング。自然言語クエリのデフォルトモード。（`until`の日付上限付き） |
| `lookup_entity` | 環境変数、コマンド、モデルID、CVEなどのエンティティの履歴。 |
| `latest_releases` | 製品（または単一の製品）における最近のリリース。（`since`の日付下限付き） |
| `get_release` | 特定のリリースに関する完全な内容。 |
| `list_products` | カウント付きの列挙と最新バージョン。 |
| `top_entities` | 種類ごとの最も言及されているエンティティ。 |
| `list_synergies` | 複数の製品を横断したワークフロー。 （オプションで`product`フィルターを使用可能） |
| `read_synergy` | 特定のシナジーファイルの内容全体。 |
| `get_changes_since` | **新規。** 製品とバージョンごとにグループ化された、時間範囲内の変更点。入力：`since`（必須）、`until?`、`product?`、`kind?`、`limit?`。 |
| `search_breaking_changes` | **新規。** 検索語句不要の、変更点のフラットリスト。入力：`product?`、`since?`、`until?`、`limit?`。 |
| `compare_versions` | **新規。** 単一の製品の2つのバージョン間のすべての変更点。入力：`product`、`from_version`、`to_version`。 |

これらの3つの新しいツールは、`hk diff` / `hk breaking`と、以前はスクリプトが必要だったバージョン比較のワークフローを反映しています。入力スキーマの詳細については、[マニュアル → MCPサーバー](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/)を参照してください。

---

## データソース：5つのレベル、6つの取得戦略

データソースの詳細については、[SOURCES.md](SOURCES.md)を参照してください。

- **Tier 1 (GitHub Releases):** `gh api repos/<owner>/<repo>/releases`。Anthropic SDK（7言語）、Agent SDK（2）、ant CLI、**claude-code**（v1.1以降はgh-releasesで自動同期 — 以前は手動で初期化）、claude-code-action、claude-code-security-review、および15のMCPエコシステムSDKを含む、23製品。
- **Tier 2 (raw markdown):** `Aider-AI/aider/HISTORY.md`。汎用的な`keep-a-changelog`パーサー（v1.1以降）は、ソースコードがKeep-a-Changelog形式のCHANGELOG.mdファイルである製品にも利用可能です。`products.yaml`で設定します。
- **Tier 3 (HTML / RSS):** `platform.claude.com/docs/release-notes`、`support.claude.com/articles/12138966`、`cursor.com/changelog/rss.xml`、`sourcegraph.com/changelog/featured.rss`（フィルタリング済み）、`github.blog/changelog/label/copilot/`、`code.visualstudio.com/updates/v1_NNN`
- **Tier 4 (catalog):** `anthropics/skills`、`claude-plugins-{official,community}`、`knowledge-work-plugins`
- **Tier 5 (advisory):** `@ClaudeCodeLog`のXアカウント; marckrennの変更ログミラー

取得戦略：`gh-releases`、`rss`、`raw-changelog`、`html-scrape`、`catalog`、`playwright`。新しい製品ごとに、`products.yaml`に1つのエントリを追加します。

---

## シナジー：利用可能な機能

製品を横断した12のワークフローのコレクション。それぞれが、適切な回答となるパターン、トリガー、およびそれを可能にする変更履歴の証拠を説明します。例：

- **08 — Universal SKILL.md format** (Code + Cursor + Codex)：1人のスキル作成者が、3つのエージェントによって読み込まれる。
- **09 — MCP across seven surfaces** (Code + Cursor + Continue + Copilot + Windsurf + Cody + API)：1つのバイナリで、すべてのエージェントが利用可能。
- **10 — Anthropic BYOK across surfaces**: 1つのAPIキーで、Claudeが7つのエディタで動作し、統一された課金体系を実現。
- **11 — Claude Code orchestrates Aider**: Claudeが計画を立てている間、安価なモデルに編集作業を移す。
- **12 — MCP config format gotcha**: Copilotは`servers`を使用するが、他の環境では`mcpServers`を使用する。

詳細なインデックスは、[synergies/INDEX.md](synergies/INDEX.md)を参照してください。

---

## テスト

Vitestスイートは、ユニットテスト、統合テスト、回帰テスト、および初期動作確認（smoke）の各レベルをカバーします。**[test-spec-3.md](test-spec-3.md)が現在の仕様**です（v0.7.0時点）。[test-spec.md](test-spec.md)（v1）および[test-spec-2.md](test-spec-2.md)（v2）は、設計の経緯を示すための履歴として、リポジトリに残っています。

```bash
pnpm test               # unit + integration + regression (~18s, 508 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

構成：

| ディレクトリ | 内容 |
|-----|----------------|
| `test/unit/` | モジュールごと — 抽出、取り込み、クエリ（`until` / 閲覧 / `since` / 比較を含む）、データベース（次元設定v3移行を含む）、埋め込み、ハイブリッド、取り込み + すべてのプロバイダー（Ollama / Voyage / **OpenAI**）+ RSS/変更ログの取り込み（**keep-a-changelog**パーサーを含む）/HTML + MCPレジストリの取り込み + Playwrightの取り込み + 製品設定 + 連携の取り込み/クエリ |
| `test/integration/` | エンドツーエンド — パイプライン、同期、MCPサーバー（標準入出力JSON-RPC、11のツール）、CLI（`hk diff`、`hk breaking`を含む） |
| `test/regression/` | §8.1–§8.19 — それぞれが、開発中に修正された実際のバグに対する対策。（§8.19：ghReleasesの早期終了ページネーションは、指定範囲内のアイテムを保持します） |
| `test/smoke/` | 実際の`products/`ディレクトリ（1,143個のファイル）に対するフルコーパスのテスト。 |
| `test/fixtures/` | 3つのダミー製品と、モックHTTPレスポンス（RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / 公式MCPレジストリ）。 |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**デフォルトではネットワーク接続なし**：プロバイダーのHTTPは`vi.spyOn(global, 'fetch')`を使用してモックされています。一時ファイルには実際のSQLiteを使用します（`:memory:`ではありません）。これは、`sqlite-vec`拡張のロード動作がバージョンによって異なり、ディスク上のものが標準的な方法であるためです。Playwrightは動的なインポートでロードされ、`vi.doMock('playwright', ...)`を使用してモックされるため、実際のブラウザのインストールなしでテストがパスします。

CI：`.github/workflows/test.yml`は、`pnpm test:coverage`をpushおよびプルリクエスト時に実行します。

---

## トラブルシューティング

**「データベースがロックされています」またはWALエラー**

別の`hk`プロセス（または古いMCPサーバー）がSQLiteデータベースを開いている状態です。他の`hk`プロセスを閉じ、再度試してください。問題が解決しない場合は、`data/claude-synergy.db`の隣にある`-wal`または`-shm`ファイルがないか確認してください。これらは通常のWALモードのファイルで、最後の接続が閉じられるときに削除されます。別のプロセスがDBを開いている間は、これらのファイルを削除しないでください。

**「sqlite-vec拡張が見つかりません」/ sqlite-vecのロードに失敗しました**

`sqlite-vec`ネイティブ拡張のロードに失敗しました。一般的な原因：

1. **Nodeのバージョンが古い**：`claude-synergy`はNode 22以降が必要です。`node -v`で確認してください。
2. **ネイティブモジュールの再ビルドが必要**：`npm rebuild better-sqlite3`（または`pnpm rebuild better-sqlite3`）を実行してください。
3. **プラットフォームの不一致**：Windows/ARMでは、`better-sqlite3`にC++のビルドツールチェーンが必要です。 [windows-build-tools](https://github.com/nicedoc/windows-build-tools)またはVisual Studio Build Toolsを「C++によるデスクトップ開発」オプションでインストールしてください。

注：`sqlite-vec`はオプションです。FTS5キーワード検索（`hk query`）は、これなしでも動作します。`hk embed`と`hk hybrid`のみがベクトル拡張を必要とします。

**「製品Xの同期に失敗しました」/ fetchエラー**

`hk fetch`と`hk sync`は、外部APIを呼び出します。一般的な原因：

- **GitHubのレート制限**：`gh-releases`戦略は`gh api`を呼び出し、これはあなたの`GITHUB_TOKEN`を使用します。認証されていないリクエストは、1時間あたり60件までです。`gh auth login`で認証するか、環境変数に`GITHUB_TOKEN`を設定してください。
- **ネットワーク/プロキシ**：RSSとHTMLの取得には`fetch()`を使用します。ネットワーク接続と、企業プロキシの設定（`HTTPS_PROXY`）を確認してください。
- **不明な製品**：`hk fetch --product foo`は、`products.yaml`にリストされている製品のみで動作します。利用可能な名前を確認するには、`hk products`を実行してください。

同期は冪等です。部分的な失敗の後でも、再実行しても安全です。すでに取得済みのリリースはスキップされます。

**「埋め込みプロバイダーが応答していません」**

`hk embed`は、外部の埋め込みサービスを呼び出します。

- **Ollama (デフォルト、768次元)**：Ollamaが実行されていることを確認します (`ollama serve`)。また、埋め込みモデルをダウンロードします (`ollama pull nomic-embed-text`)。
- **Voyage (1024次元)**：環境変数 `VOYAGE_API_KEY` を設定します。APIキーは [dash.voyageai.com](https://dash.voyageai.com) で確認できます。
- **OpenAI (デフォルト1536次元、設定可能)**：`OPENAI_API_KEY` を設定します。デフォルトのモデルは `text-embedding-3-small` です。`OPENAI_EMBED_MODEL` で別のモデルを指定できます（例：3072次元の `text-embedding-3-large`）。`hk hybrid --embed openai` または `hk embed --embed openai` コマンドで利用できます。

**プロバイダーの切り替え時の埋め込み次元の不一致**

各プロバイダーは、固定の次元を持つベクトルを生成します（Ollama: 768、Voyage: 1024、OpenAI: デフォルト1536。OpenAIは、モデルのネイティブサイズ内で設定可能な次元をサポートしています）。データベースは、アクティブな次元を `schema_meta.embedding_dim` に保存します。チャンクが存在する状態で、次元が異なるプロバイダーに切り替えると、ベクトルテーブルが静かに破損するのではなく、`EMBEDDING_DIM_MISMATCH` (`AppError`) エラーが発生します。切り替えるには、以下の手順に従ってください。

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --embed openai     # new provider, new dim, fresh chunks_vec
```

OpenAIのMatryoshka切り詰め（ネイティブサイズよりも小さい次元を使用する場合）では、`OPENAI_EMBED_MODEL` を設定し、`hk embed` コマンドのプロバイダー設定を通じて、希望する次元を指定します。詳細は、[マニュアルの埋め込みに関するセクション](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) を参照してください。

**スキーマのバージョン不一致/データベースの破損**

DBが古いスキーマバージョンで作成され、移行が失敗した場合、またはクラッシュ後にデータが正しくない場合：

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

これは安全です。DBは派生キャッシュです。すべてのソースデータは`products/*/releases/*.md`ファイルにあります。

---

## 関連ファイル

- [CONTRIBUTING.md](CONTRIBUTING.md)：製品の追加方法、テストの実行方法、プルリクエストの送信方法
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md)：緊急度の高い問題点（セキュリティ上の脆弱性、モデルの廃止、互換性のない変更、設定に関する注意点など）、合計23項目
- [SOURCES.md](SOURCES.md)：5段階のソースコードの構成と、それらを取得するための戦略
- [synergies/INDEX.md](synergies/INDEX.md)：12種類の、複数の製品を連携させたワークフロー
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql)：SQLite および sqlite-vec のスキーマ定義ファイル
- [test-spec-3.md](test-spec-3.md)（現在） + [test-spec-2.md](test-spec-2.md)、[test-spec.md](test-spec.md)（過去のもの）：テストスイートの仕様

---

## ライセンス

MITライセンス。 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> が作成しました。
