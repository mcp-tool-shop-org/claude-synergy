<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#许可证"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

这是一个本地的、可查询的 Anthropic 及其相关 AI 开发工具变更日志的镜像——此外，还有一个精选的“协同”层，用于描述跨产品的流程——这样，位于框架中的 LLM 代理就能知道该框架可以做什么。

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


**通过一次 FTS 查询，可以找到一个协调的跨 SDK 安全修复，而单个变更日志中并没有将其标记为 CVE。** 这就是最具吸引力的演示：当所有变更日志并排显示时，模式就会显现。

仓库：[github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## 问题

Claude Code CLI 每天发布一次。Claude API 的发布频率几乎相同。SDK 的发布频率与 CLI 的发布频率一致。Claude Design、Cowork、Chat 和 Mobile 通过统一的帮助中心进行更新。MCP 生态系统每周发布约 200-300 个新服务器。此外，还有 7 个主要的 AI 开发工具（Cursor、Aider、Continue、Copilot、Cody、Windsurf），它们各自以自己的节奏发布自己的变更日志。

这些工具中的任何一个，其内部的 LLM 代理都有一个固定的训练截止日期。差距每天都在扩大。发布了代理不知道存在的功能。修复了代理仍然会绕过的错误。添加了代理从未建议过的环境变量和标志。由多个工具组成的跨产品流程仍然未被发现。

**此仓库弥合了差距。** “协同”部分使其成为一个产品，而不仅仅是一个镜像。

---

## 这里有什么

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

---

## 状态——所有层级均已发布

| 层级 | 状态 | 内容 |
|------|--------|--------------|
| **1 — 启动（markdown 语料库）** | ✅ 已发布 | 研究团队在 2026 年 1 月至 5 月期间收集了 706 个发布文件；扩展到 1,186 个，直至第 4d 层。 |
| **2a — SQLite + FTS5 + CLI** | ✅ 已发布 | `hk` CLI；15 个子命令；sub-300ms 导入 |
| **2b — sqlite-vec + 上下文检索** | ✅ 已发布 | 可插拔的提供程序（无/结构化/ollama/claude-haiku 上下文 × ollama/voyage 嵌入 × 无/ollama-judge/voyage/cohere 重新排序） |
| **3 — 同步 + MCP 服务器** | ✅ 已发布 | `hk fetch / sync / seed-markers`；`claude-synergy-mcp` 通过 stdio 暴露 14 个工具（最初的第 3 层级发布时为 8 个，在 v1.1 中添加了 3 个，在 v1.2 中添加了 2 个，以及 1 个工作区相关性工具） |
| **4a — 扩展到 Anthropic 之外** | ✅ 已发布 | +15 个 MCP SDK、Cursor（RSS）、Aider（HISTORY.md）、Continue.dev、Cody Enterprise（过滤后的 RSS） |
| **4b — HTML 抓取提取器** | ✅ 已发布 | GitHub Copilot + VS Code Chat（Windsurf 需要 Playwright — v0.7） |
| **4c — turndown HTML→markdown 导入** | ✅ 已发布 | HTML 内容（Copilot/VS Code/Cursor）现在为 FTS5 + 实体提取生成逐条显示的内容。 |
| **4d — Playwright + MCP 注册表 + YAML 配置文件** | ✅ 已发布 | Windsurf 通过 Playwright；Smithery + 官方 MCP 注册表作为第 4 层目录；产品合并到 `products.yaml` 中。 |
| **5 — v1.1 窗口浏览 + OpenAI 嵌入** | ✅ 已发布 | `hk diff` / `hk breaking`，所有浏览命令的日期范围，3 个新的 MCP 工具（总共 11 个），OpenAI 嵌入提供程序，可配置的嵌入维度，`claude-code` 自动同步，通用的 `keep-a-changelog` 解析器。 |
| **6 — v1.2 从 MCP 同步** | ✅ 已发布 | `sync_status`（每个产品的最新状态、从不/过时检测）和 `sync_now`（按需提取 → 导入 → 使用 `dry_run` 预览进行嵌入 + 进程内并发锁）。解决了调用代理可以查询语料库但无法刷新它的问题。**同时修复了：**标记擦除错误，该错误导致 `INSERT OR REPLACE INTO products` 级联地对 `markers` 外键执行 DELETE 操作，从而在每次导入时静默地重置每个产品的 `since` 光标（回归 §8.20）。 |
| **6.1 — v1.2.1 提取器-标记集中化** | ✅ 已发布 | 将 `writeMarker` 集中化到 `fetchOne` 中，以便每次成功的提取都更新标记——在修复之前，返回 0 个窗口内日期条目的策略（最明显的是 `aider` 原始变更日志）从未写入标记，并且在每次同步时重新提取 `HISTORY.md`。将未实现的 `webfetch` 策略重命名为 `manual`，用于 `claude-api` + `anthropic-apps`；`sync_status` 现在将手动产品渲染为“手动”，而不是“从不”，并且将其排除在 `stale_only` 之外（回归 §8.21）。 |
| **7 — v1.3 cs-actions:v1 微调合成器** | ✅ 已发布 | 第一个在语料库上训练的下游模型。将一个变更日志条目转换为一个严格的 JSON 操作项 `{kind, severity, subject, action_text, deadline, tags}`。Qwen2.5-7B + LoRA 在 242 个来自 `dataset/changelog-actions/v1/` 的条目上进行，q8_0 GGUF，Ollama 部署。发布门控评估：**88.1% 类型 / 79.7% 严重程度 / 0.842 macro-F1** 与 59 个条目的分层保留集上的真实值进行比较（比 qwen3:8b 基线高 10.1 个百分点 / 27.2 个百分点 / 0.041）。标记了 `cs-actions-v1`；评估报告附加到 [GitHub 发布](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) 中，作为一个单独的文件进行下载。**记录了 v1 限制：**反 `unknown` 偏差（准确率 1.000 / 召回率 0.286）——模型对模棱两可的输入标记不足。请参阅 [手册 → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) + [`dataset/README.md`](dataset/README.md) + [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) + [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md)。 |

v1.3 之后的路线图：在 [URGENT_FINDINGS.md](URGENT_FINDINGS.md) 和问题中跟踪。

---

## 安全性和数据模型

此工具在本地运行。**涉及的数据：**一个派生的 SQLite 数据库和 markdown 发布文件——所有这些都可以重新创建。工作区相关性最多读取调用者命名的目录顶部的七个命名锁文件。**网络：**在您运行 `hk fetch`/`hk sync` 时，在代理调用 MCP `sync_now` 工具时，以及首次使用时：一个查询命令或 MCP 工具对空存储的运行会自行同步（`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` 会关闭该功能）。目标是 GitHub API、RSS 订阅源、变更日志页面和 MCP 注册表，以及远程 AI 提供程序（仅在您选择时）：`hk embed`（Voyage 嵌入，Anthropic 用于上下文生成），或 `hk hybrid -e voyage` / `-r voyage|cohere`。否则，混合搜索，包括 MCP `search` 工具的默认模式，会在本地调用 localhost 上的 Ollama 来嵌入查询。**密钥：**从环境变量中读取 `GITHUB_TOKEN`、`VOYAGE_API_KEY`、`COHERE_API_KEY`、`ANTHROPIC_API_KEY`——绝不会记录，绝不会存储到磁盘。**没有遥测数据。**请参阅 [SECURITY.md](SECURITY.md) 以了解报告策略。

**供应商文本：** 第三方发布说明和目录条目被严格视为引用的数据，绝不能作为指令使用。发布文本会在摄取时进行确定性筛选（删除隐藏的 Unicode 控制字符，消除图像/不安全的链接，删除电子邮件和家庭路径，并标记类似指令的模式），由返回发布文本的七个 MCP 工具将其封装在一个固定的数据框架中，并带有内联 `[flagged: …]` 标记，并且绝不会写入指令文件。

---

## 安装

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

或者在安装 `@mcptoolshop/claude-synergy` 后直接运行。 `hk` 和 `claude-synergy-mcp` 都使用相同的四步顺序来解析本地存储：

1. `CLAUDE_SYNERGY_DB` 环境变量
2. 显式 `--db <path>`（CLI）或位置参数 argv 路径（MCP）
3. `<cwd>/data/claude-synergy.db` **仅当该文件已存在时**（保留 repo-clone 的用法）
4. `<home>/.claude-synergy/data/claude-synergy.db`（包含 `<home>/.claude-synergy/products` 下的产品）

`CLAUDE_SYNERGY_PRODUCTS_ROOT` 覆盖产品目录。

**自动首次使用同步：** 当查询命令或 MCP 工具针对缺失或空的存储运行时，它会初始化模式并自动运行 `fetch` → `ingest`（不进行嵌入步骤，受超时限制，跳过任何无法访问的源），并为每个答案添加 `data as of: …` 标记。将 `CLAUDE_SYNERGY_NO_AUTO_SYNC=1` 设置为禁用自动首次使用同步，并使用空语料库指令来失败/发出警告。

如果要在不进行构建的情况下进行开发，请直接使用 `npx tsx src/cli.ts ...`。**pnpm 10 的特殊之处：** `pnpm dev` 在 `--` 之后会忽略 CLI 标志；请使用 `npx tsx` 进行开发。

---

## CLI 界面 — 18 个命令

```
# DB lifecycle
hk init                              # create DB with schema
hk ingest                            # parse products/*/releases/*.md → DB (idempotent)
hk embed                             # generate chunks + embeddings (sqlite-vec)
hk fetch [--product X]               # incremental pull from sources
hk sync                              # combined fetch → ingest → embed (cron-friendly)
hk seed-markers                      # one-time setup after initial corpus

# Search
hk query "managed agents"            # FTS5 keyword search (+ --package, --until)
hk hybrid "credential exfiltration"  # FTS5 + vec hybrid via RRF (+ --package, --rerank, --until)

# Windowed change browsing
hk diff [product] --since 7d         # what changed in a window (+ --package; grouped per package on multi-package products)
hk breaking --since 30d              # filter-browse of breaking changes (+ --package; grouped per package when omitted)

# Entity lookups
hk env-var CLAUDE_CODE_WORKFLOWS     # when introduced + history
hk command code-review               # slash command + rename history
hk model claude-opus-4-7             # model launch + mentions across products
hk cve CVE-2025-66414                # CVE references in corpus

# Browsing
hk latest [--product X] [--limit N]  # recent releases (+ --package, --since; grouped per package when --package omitted)
hk products                          # list all 44 with counts
hk top env_var                       # most-mentioned by entity type
                                     # (env_var, slash_command, cli_option,
                                     #  model_id, beta_header, cve, ghsa,
                                     #  hook_event, setting_key)
hk relevance <dir> [--all] [--json]  # check which mirrored products matter to a workspace
```

**v1.1 中的新功能：** `hk diff` 和 `hk breaking` 可以回答“最近有什么变化？”，而无需搜索词。日期范围是统一的：每个浏览命令都接受 `--since` 和 `--until`（在 `YYYY-MM-DD` 中，或使用完整的 ISO 8601 格式），或者使用相对形式（`7d`、`2w`、`3m`、`1y`）。

---

## 示例工作流程

**查找 Claude Code 环境变量何时引入：**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**跟踪跨 SDK 的破坏性变更：**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**规划模型迁移：**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**在整个语料库中进行语义搜索：**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

查询中绝不会出现“env_scrub”——vec 通过语义相似度来呈现它。纯粹的 FTS5 完全忽略它。

**本周 claude-code 有哪些变化：**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**浏览语料库中的破坏性变更：**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

无需搜索词——`hk breaking` 是对“最近是否有任何关键部分发生变化？”的答案。

---

## MCP 服务器 — 为您的代理提供访问此语料库的权限

`claude-synergy-mcp` 通过 stdio 暴露 14 个工具。通过 `~/.claude/.mcp.json` 或您的项目的 `.mcp.json` 将其连接到 Claude Code（或任何 MCP 主机）：

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp"
    }
  }
}
```

如果您希望使用自定义存储路径，请在 `env` 中设置 `CLAUDE_SYNERGY_DB`；否则，如果 `./data/claude-synergy.db` 已存在则使用它，否则使用 `~/.claude-synergy/data/claude-synergy.db`，并在首次使用工具时自动同步（`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` 禁用此功能）。每个工具的响应都以 `data as of:` 新鲜度戳结尾（在 7 天后，前缀为 `STALE:`）。

对于 GitHub Copilot 的 `.vscode/mcp.json`，请使用 `servers` 包装，而不是 `mcpServers`（参见 [synergy 12](synergies/12-mcp-config-format-gotcha.md)）。

公开的工具：

| 工具 | 用途 |
|---|---|
| `search` | 混合 FTS5 + vec；可选的重新排序。接受 `package?`（如果省略，则对多包产品中的每个包进行分组），并使用 `product (package)@version` 标记多包结果。 |
| `lookup_entity` | 精确的实体历史记录：环境变量、斜杠命令、模型 ID、CVE 等。 |
| `latest_releases` | 跨产品（或单个产品）的最新发布。接受 `package?` 和 `since?`；如果省略 `package`，则对多包产品中的每个包进行分组。 |
| `get_release` | 单个发布（多包产品需要 `package`）的完整内容。 |
| `list_products` | 带有计数和最新版本的枚举 |
| `top_entities` | 按类型排序的最常提及的实体 |
| `list_synergies` | 策划的跨产品工作流程。（+ 可选的 `product` 过滤器） |
| `read_synergy` | 单个协同效应文件的完整文本 |
| `get_changes_since` | 在时间窗口内发生的变化，按发布（以及多包产品中的每个包）进行分组。输入：`since`（必需）、`until?`、`product?`、`package?`、`kind?`、`limit?`。 |
| `search_breaking_changes` | 没有搜索词的破坏性变更。输入：`product?`、`package?`、`since?`、`until?`、`limit?`（如果省略 `package`，则对多包产品中的每个包进行分组）。 |
| `compare_versions` | 单个包/产品的两个版本之间的所有更改。输入：`product`、`package?`（多包产品需要）、`from_version`、`to_version`。 |
| `sync_status` | **v1.2。** 每个产品的同步新鲜度——上次提取的时间戳、距离上次提取的小时数、提取的发布数量。输入：`product?`、`stale_only?`、`stale_hours?`。在使用 `latest_releases` 之前，请使用此功能来确定语料库是否过时。 |
| `sync_now` | **v1.2。** 按照需求进行刷新（镜像 `hk sync`）。输入：`product?`、`dry_run?`、`include_ingest?`、`include_embed?`、`timeout_ms?`。如果另一个 `sync_now` 已经开始执行，则会拒绝，并显示 `InvalidParams`。不会提交到 git。 |
| `workspace_relevance` | 将工作区目录的顶级 lockfile 与镜像的发布进行匹配。输入：`workspace_path`（必需，绝对目录路径）、`include_all?`（布尔值，列出未使用的产品名称）。只读；以需要操作的产品开头，并优先列出破坏性变更。 |

**匹配方式：** `hk relevance` 和 `workspace_relevance` 仅读取命名目录（`package-lock.json`、`pnpm-lock.yaml`、`uv.lock`、`poetry.lock`、`requirements.txt`、`Cargo.lock`、`go.mod`）顶部的精确的、已知的 lockfile 名称，不进行递归、通配符匹配或运行外部命令。“无操作”是默认答案，适用于工作区不使用或已运行最新镜像发布的产品；只有较旧的已安装版本才会返回操作列表，按最新版本优先排序，破坏性变更优先。检查是只读的（不会向数据库写入任何内容），并且是确定性的（不进行模型调用）。

v1.1 工具可以模拟 `hk diff` / `hk breaking` 的功能，并实现之前需要通过编写脚本才能完成的版本比较流程。 v1.2 同步工具弥合了数据查询与数据刷新之间的差距——`sync_status` 会报告数据陈旧，`sync_now` 会运行流水线。 请参阅[手册 → MCP 服务器](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/)，以获取完整的输入模式。

---

## 来源 — 5 个层级，7 种提取策略

完整的概览请参见 [SOURCES.md](SOURCES.md)。

- **第一层（GitHub 次发布）**——针对 23 种产品，包括 Anthropic SDK（7 种语言）、Agent SDK（2 种）、ant CLI、《**claude-code**》（现在通过 gh-releases 自动同步，自 v1.1 起——之前是手动同步）、claude-code-action、claude-code-security-review 以及 15 个 MCP 生态系统 SDK，提供 `gh api repos/<owner>/<repo>/releases`。
- **第二层（原始 Markdown）**——`Aider-AI/aider/HISTORY.md`。通用的 `keep-a-changelog` 解析器（v1.1+）也可用于任何其源代码为 Keep-a-Changelog 格式的 CHANGELOG.md 文件的产品——通过 `products.yaml` 中的一个条目进行配置。
- **第三层（HTML / RSS）**——`platform.claude.com/docs/release-notes`、`support.claude.com/articles/12138966`、`cursor.com/changelog/rss.xml`、`sourcegraph.com/changelog/featured.rss`（已筛选）、`github.blog/changelog/label/copilot/`、`code.visualstudio.com/updates/v1_NNN`
- **第四层（目录）**——`anthropics/skills`、`claude-plugins-{official,community}`、`knowledge-work-plugins`
- **第五层（公告）**——`@ClaudeCodeLog` X 账号；marckrenn changelog 镜像

提取策略：`gh-releases | rss | raw-changelog | keep-a-changelog | html-scrape | catalog | playwright`。新产品 = `products.yaml` 中的一个条目。

---

## 协同效应 — 可以解锁的内容

12 个策划的跨产品工作流程。每个工作流程都描述了一种组合模式、触发该模式的条件以及支持该模式的变更日志证据。示例：

- **08 — 通用 SKILL.md 格式**（代码 + 游标 + Codex）：一位技能作者，三位代理读取
- **09 — 跨越七个表面的 MCP**（代码 + 游标 + 继续 + Copilot + Windsurf + Cody + API）：一个二进制文件，每个代理
- **10 — Anthropic BYOK 跨越多个表面**：一个 API 密钥为 7 个编辑器中的 Claude 提供支持，并采用统一的计费方式
- **11 — Claude Code 协调 Aider**：将耗时的编辑操作转移到廉价模型，同时 Claude 进行规划
- **12 — MCP 配置格式注意事项**：Copilot 使用 `servers`；其他所有程序使用 `mcpServers`

完整索引位于 [synergies/INDEX.md](synergies/INDEX.md)。

---

## 数据集和微调模型

该语料库具有下游层：从变更要点中提取的精选**数据集**，以及在这些数据集上训练的**微调模型**。数据集是此存储库中的工件；模型是下游产品。

### `dataset/changelog-actions/v1` — 301 条条目

每个条目将语料库中的一个变更要点与手动编写的操作项配对：`{kind, severity, subject, action_text, deadline, tags}`。8 种枚举 `kind` 分类法（`breaking | deprecation | security | feature | fix | performance | docs | unknown`），分层 80/20 训练/保留集，A3c-reviewed 由人工进行，并由跨领域的 qwen3:8b 评审者进行交叉评审（92.4% 的一致性）。有关分布表的详细信息，请参阅 [`dataset/README.md`](dataset/README.md)；有关逐字段的契约，请参阅 [`SCHEMA.md`](dataset/changelog-actions/SCHEMA.md)；有关 `action_text` 写作规则，请参阅 [`STYLE.md`](dataset/changelog-actions/STYLE.md)。

### `cs-actions:v1` — 微调合成器

第一个在数据集上训练的模型。Qwen2.5-7B-Instruct + LoRA（秩 256 / 全线性，100 步 QLoRA，基于 242 个训练条目），q8_0 GGUF，通过两阶段 Ollama Modelfile 进行部署（`cs-actions-base` + `cs-actions:v1`）。

**发布门控评估**（59 个条目的分层保留集，三次运行，全部通过，零解析错误）：

| 指标 | qwen3:8b 基准 | cs-actions:v1 | 增量 |
|---|---|---|---|
| 与真实情况相比，分类一致性 | 78.0% | **88.1%** | +10.1 个百分点 |
| 与真实情况相比，严重性一致性 | 52.5% | **79.7%** | +27.2 个百分点 |
| Macro-F1（类别数量充足） | 0.801 | **0.854** | +0.053 |
| 第 3 次运行 — 类别提示消融（带提示 / 不带提示） | — | 0.842 / 0.777 | 6.5 分 → 目标区域 |

发布通过标准 `qwen3-vs-cs-actions ≥ qwen3-vs-GT`（`0.780 ≥ 0.780`）— 通过 ✓。完整的逐条目结果位于 [`eval-report.v1.json`](dataset/changelog-actions/v1/eval-report.v1.json) 中，并作为单个文件附加到 [GitHub 发布](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) 中。

**记录的 v1 限制 — 反 `unknown` 偏差。** `unknown` 是唯一一个 cs-actions:v1 表现不如 qwen3:8b 的类别（F1 0.444 与 0.545）。精确度 1.000 / 召回率 0.286 — 当输入确实存在歧义时，模型会选择一个特定的类别，而不是保持中立。继承了 qwen 系列的先验知识，但未完全被 LoRA 覆盖。下游用户应将低于预期的 `kind: "unknown"` 速率视为一个信号，以便将批次路由到人工审核。 [v2 计划](dataset/README.md) 通过未知类别增强和提示随机化来解决此问题。

**未通过此存储库分发** — q8_0 GGUF 约为 5 GB，合并后的检查点约为 15 GB。发布的是数据集和构建流水线；模型会根据 [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md)（4 阶段手动链，在配备 16 GB VRAM 的 RTX 5080 笔记本电脑上进行热身，大约需要 88 分钟）在本地重建。三次运行的发布门控契约位于 [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md) 中。

完整的用法说明 — 包括本地 Ollama 调用、`format: "json"` 每请求调用程序的要求以及重建流水线 — 位于 [手册 → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) 页面上。

---

## 测试

Vitest 套件涵盖单元/集成/回归/冒烟测试层级。**[test-spec-3.md](test-spec-3.md) 是截至 v0.7.0 的最新权威版本**；[test-spec.md](test-spec.md)（v1）和 [test-spec-2.md](test-spec-2.md)（v2）仍保留在存储库中，作为设计演变的历史记录。

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

布局：

| 目录 | 它涵盖的内容 |
|-----|----------------|
| `test/unit/` | per-module — 提取、摄取、查询（包括 `until` / 浏览 / 自 / 比较）、数据库（包括 dim-config v3 迁移）、嵌入、混合、获取 + 每个提供程序（Ollama / Voyage / **OpenAI**）+ fetch-rss/changelog（包括 **keep-a-changelog** 解析器）/html + fetch-mcp-registry + fetch-playwright + products-config + synergy ingest/query |
| `test/integration/` | 端到端 — 流水线、同步、MCP 服务器（stdio JSON-RPC，14 个工具，包括 `sync_status` / `sync_now` / `workspace_relevance`）、CLI（包括 `hk diff`、`hk breaking`、`hk relevance`） |
| `test/regression/` | §8.1–§8.19 — 每个部分都防止在开发过程中修复的实际错误（§8.19：ghReleases 早期退出分页可保留窗口内的项目） |
| `test/smoke/` | 选择性地针对真实的 `products/`（1,143 个文件）进行全面测试 |
| `test/fixtures/` | 3 个虚假产品 + 模拟 HTTP 响应（RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / 官方 MCP 注册表） |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**默认情况下，测试中没有网络** — 提供程序 HTTP 通过 `vi.spyOn(global, 'fetch')` 进行模拟。真实的 SQLite 位于临时文件中（而不是 `:memory:`），因为 sqlite-vec 扩展的加载语义在不同版本之间以及在磁盘上的路径有所不同。Playwright 通过动态导入加载，并通过 `vi.doMock('playwright', ...)` 进行模拟，因此测试可以在没有实际浏览器安装的情况下通过。

CI：`.github/workflows/test.yml` 在推送和 PR 时运行 `pnpm test:coverage`。

---

## 故障排除

**“数据库已锁定”或 WAL 错误**

另一个 `hk` 进程（或过时的 MCP 服务器）正在打开 SQLite 数据库。关闭其他 `hk` 进程，然后重试。如果问题仍然存在，请检查 `data/claude-synergy.db` 旁边是否有 `-wal` 或 `-shm` 文件 — 这些是正常的 WAL 模式文件，当最后一个连接关闭时会被清理。不要在另一个进程打开数据库时删除它们。

**“未找到 sqlite-vec 扩展”/sqlite-vec 加载失败**

`sqlite-vec` 本地扩展加载失败。常见原因：

1. **Node 版本过旧** — `claude-synergy` 需要 Node 22.12 或更高版本，可在 Windows、macOS 或 Linux（glibc 或 musl）的 x64 或 arm64 上运行；不支持 32 位 ARM。请使用 `node -v` 检查。
2. **需要重新构建本机模块** — 运行 `npm rebuild better-sqlite3`（或 `pnpm rebuild better-sqlite3`）。
3. **平台不匹配** — 在 Windows/ARM 上，`better-sqlite3` 需要 C++ 构建工具链。安装 [windows-build-tools](https://github.com/nicedoc/windows-build-tools) 或带有“使用 C++ 进行桌面开发”的 Visual Studio Build Tools。

注意：`sqlite-vec` 是可选的。FTS5 关键字搜索（`hk query`）无需它即可工作。只有 `hk embed` 和 `hk hybrid` 才需要矢量扩展。

**“产品 X 的同步失败”/获取错误**

`hk fetch` 和 `hk sync` 调用外部 API。常见原因：

- **GitHub 速率限制** — `gh-releases` 策略调用 `gh api`，后者使用您的 `GITHUB_TOKEN`。未经身份验证的请求达到每小时 60 个请求；使用 `gh auth login` 进行身份验证，或在您的环境中设置 `GITHUB_TOKEN`。
- **网络/代理** — RSS 和 HTML 获取器使用 `fetch()`。检查连接性和任何公司代理设置（`HTTPS_PROXY`）。
- **未知产品** — `hk fetch --product foo` 仅适用于 `products.yaml` 中列出的产品。运行 `hk products` 以查看所有可用名称。

同步是幂等的——在部分失败后可以安全地重新运行。已获取的发布将被跳过。

**“嵌入提供程序未响应”**

`hk embed` 调用外部嵌入服务：

- **Ollama（默认，768 维）** — 确保 Ollama 正在运行（`ollama serve`），并且已拉取嵌入模型（`ollama pull nomic-embed-text`）。
- **Voyage（1024 维）** — 在您的环境中设置 `VOYAGE_API_KEY`。在 [dash.voyageai.com](https://dash.voyageai.com) 处检查您的 API 密钥。
- **OpenAI（默认 1536 维，可配置）** — 设置 `OPENAI_API_KEY`。默认模型为 `text-embedding-3-small`；使用 `OPENAI_EMBED_MODEL` 覆盖（例如，使用 `text-embedding-3-large` 获取 3072 维）。通过 `hk hybrid --embed openai` 或 `hk embed --embed openai` 使用。

**提供程序切换时嵌入维度不匹配**

每个提供程序都会生成具有固定维度的向量（Ollama 768，Voyage 1024，默认情况下 OpenAI 为 1536——OpenAI 支持在模型本机大小内配置维度）。数据库在 `schema_meta.embedding_dim` 中存储活动维度。在存在分块的情况下，在不同维度之间切换提供程序会引发 `EMBEDDING_DIM_MISMATCH`（`AppError`），而不是静默地破坏向量表。要切换：

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --embed openai     # new provider, new dim, fresh chunks_vec
```

对于 OpenAI Matryoshka 截断（小于本机维度），设置 `OPENAI_EMBED_MODEL`，并通过 `hk embed` 的提供程序构造传递所需的维度——有关详细信息，请参阅 [手册嵌入部分](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions)。

**模式版本不匹配/数据库已损坏**

如果数据库使用较旧的模式版本创建并且迁移失败，或者在崩溃后数据看起来不正确：

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --context structured --embedding ollama   # optional, for vector search
```

这是安全的——数据库是一个派生的缓存。所有源数据都位于 `products/*/releases/*.md` 文件中。

---

## 相关文件

- [CONTRIBUTING.md](CONTRIBUTING.md) — 如何添加产品、运行测试、提交 PR
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 个可操作的项目（安全 CVE、模型停用、重大更改、配置注意事项）
- [SOURCES.md](SOURCES.md) — 具有获取策略的五层源环境
- [synergies/INDEX.md](synergies/INDEX.md) — 12 个精选的跨产品工作流程
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — SQLite + sqlite-vec 模式
- [test-spec-3.md](test-spec-3.md)（当前）+ [test-spec-2.md](test-spec-2.md)，[test-spec.md](test-spec.md)（历史）— 测试套件规范

---

## 许可证

MIT。由 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> 构建。
