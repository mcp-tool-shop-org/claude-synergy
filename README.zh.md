<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

一个本地、可查询的镜像，记录了 Anthropic 及其相关人工智能开发工具的所有更新日志，此外，还提供一个精心策划的“协同”层，描述了跨产品的工作流程，以便嵌入在系统中的大型语言模型（LLM）代理能够了解该系统的功能。

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


**通过一次完整的FTS查询，我们发现了一个跨SDK的安全修复方案，但单个版本的更新日志中并未将其标记为CVE漏洞。** 这就是最直观的演示：当所有更新日志并排比较时，隐藏的模式就会显现出来。

代码仓库：[github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## 问题

Claude Code 命令行工具大约每天都会有新版本发布。Claude API 的发布频率也几乎与之相同。SDK 的版本与命令行工具的发布同步。Claude Design、Cowork、Chat 和移动端应用通过统一的帮助中心进行更新。MCP 生态系统每周发布约 200-300 个新服务器。此外，还有 7 个主要的 AI 开发工具（Cursor、Aider、Continue、Copilot、Cody、Windsurf），它们各自按照自己的节奏发布更新日志。

这些系统中的大型语言模型（LLM）代理具有固定的训练截止时间，这意味着它们所掌握的知识存在滞后。 每天，这种差距都在扩大。 系统会不断推出新的功能，而这些功能可能超出了代理的知识范围。 即使错误被修复，代理仍然可能无法绕过这些问题。 还会添加新的环境变量和配置项，但代理可能永远不会建议使用它们。 涉及多个模块的复杂工作流程仍然未被发现。

**这个项目填补了空白。** “协同”部分使其成为一个产品，而不仅仅是一个镜像。

---

## 这里有什么？

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
├── test/                    # 382 tests (unit, integration, regression, smoke)
├── data/claude-synergy.db   # SQLite database (created by `hk init`)
├── schema.sql               # Tier 2a tables (products, releases, changes, entities, FTS5, …)
├── schema-vec.sql           # Tier 2b tables (chunks, chunks_vec, chunks_fts)
├── SOURCES.md               # 5-tier source landscape with fetch strategies
└── URGENT_FINDINGS.md       # 23 actionable items surfaced from the corpus
```

**实时数据（截至 v1.0.0 版本）：** 44 个产品 / 1,186 个发布文件 / 6,042 次变更 / 1,225 个实体 / 12 个协同关系 / 382 个测试。

---

## 状态：所有层级产品已发货

| 等级；层级。 | 状态。 | 有什么东西？ |
|------|--------|--------------|
| 1. -- bootstrap (Markdown 文档) | ✅ 已发货。 | “Study-swarm”项目在2026年1月至5月期间发布了706个文件，随后，在第四阶段的扩展中，该数量增加到1186个。 |
| 2a - SQLite + FTS5 + 命令行界面。 | ✅ 已发货。 | `hk` 命令行工具；包含 15 个子命令；数据摄取速度低于 300 毫秒。 |
| 2b — sqlite-vec + 上下文检索 | ✅ 已发货。 | 提供商接口（无/结构化/ollama/claude-haiku 上下文 × ollama/voyage 嵌入 × 无/ollama-judge/voyage/cohere 重新排序）。 |
| 3. 同步 + MCP 服务器。 | ✅ 已发货。 | `hk fetch / sync / seed-markers`；`claude-synergy-mcp` 通过标准输入/输出接口提供了 8 个工具。 |
| 4a — 扩展范围，超越 Anthropic 的范畴。 | ✅ 已发货。 | +15 个 MCP SDK，Cursor (RSS)，Aider (HISTORY.md)，Continue.dev，Cody Enterprise (已过滤的 RSS)。 |
| 4b — HTML 网页抓取工具。 | ✅ 已发货。 | GitHub Copilot + VS Code 聊天功能 (Windsurf 需要 Playwright — v0.7) |
| 4c - 将HTML内容转换为Markdown格式并导入。 | ✅ 已发货。 | HTML 代码块（在 Copilot、VS Code 或 Cursor 中）现在针对 FTS5 和实体提取功能，会生成每条要点对应的一行数据。 |
| 4d — playwright + MCP 注册 + YAML 配置文件。 | ✅ 已发货。 | 使用 Playwright 进行网页抓取；Smithery + 官方 MCP 注册信息作为第四级目录；产品信息已整合到 `products.yaml` 文件中。 |

v0.8 及后续版本的开发计划，请参考 [URGENT_FINDINGS.md](URGENT_FINDINGS.md) 文件以及相关问题列表。

---

## 安全与数据模型

这个工具在本地运行。**涉及的数据：** 一个派生的 SQLite 数据库和 markdown 发布文件，所有数据都可以重新生成。**网络：** 仅在您运行 `hk fetch`/`hk sync`（GitHub API、RSS 订阅源、变更日志页面、MCP 注册表）或 `hk embed` 并使用远程提供商（Voyage、Cohere）时，才会进行出站 HTTPS 请求。**安全：** 从环境变量中读取 `GITHUB_TOKEN`、`VOYAGE_API_KEY`、`COHERE_API_KEY`、`ANTHROPIC_API_KEY`，这些信息不会被记录，也不会存储到磁盘。**没有遥测功能。** 请参阅 [SECURITY.md](SECURITY.md) 了解报告政策。

---

## 安装

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

对于无需构建的开发，可以直接使用 `npx tsx src/cli.ts ...`。 **pnpm 10 的一个问题：** `pnpm dev` 会在 `--` 之后忽略 CLI 标志；对于开发，请使用 `npx tsx`。

---

## CLI 命令行界面 — 15 个命令

```
# DB lifecycle
hk init                              # create DB with schema
hk ingest                            # parse products/*/releases/*.md → DB (idempotent)
hk embed                             # generate chunks + embeddings (sqlite-vec)
hk fetch [--product X]               # incremental pull from sources
hk sync                              # combined fetch → ingest → embed (cron-friendly)
hk seed-markers                      # one-time setup after initial corpus

# Search
hk query "managed agents"            # FTS5 keyword search
hk hybrid "credential exfiltration"  # FTS5 + vec hybrid via RRF (+ optional --rerank)

# Entity lookups
hk env-var CLAUDE_CODE_WORKFLOWS     # when introduced + history
hk command code-review               # slash command + rename history
hk model claude-opus-4-7             # model launch + mentions across products
hk cve CVE-2025-66414                # CVE references in corpus

# Browsing
hk latest [--product X] [--limit N]  # recent releases
hk products                          # list all 44 with counts
hk top env_var                       # most-mentioned by entity type
                                     # (env_var, slash_command, cli_option,
                                     #  model_id, beta_header, cve, ghsa,
                                     #  hook_event, setting_key)
```

---

## 示例工作流程

**查找 Claude Code 环境变量的引入时间：**
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

**对整个语料库进行语义搜索：**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

查询中永远不会出现 "env_scrub"，vec 通过语义相似性将其呈现出来。 纯 FTS5 完全无法识别它。

---

## MCP 服务器 — 允许您的代理访问此语料库

`claude-synergy-mcp` 通过标准输入/输出 (stdio) 暴露 8 个工具。 通过 `~/.claude/.mcp.json` 或您项目的 `.mcp.json` 文件，将其连接到 Claude Code（或任何 MCP 主机）。

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

对于 GitHub Copilot 的 `.vscode/mcp.json`，请使用 `servers` 包装器，而不是 `mcpServers`（请参阅 [synergy 12](synergies/12-mcp-config-format-gotcha.md)）。

暴露的工具：

| 工具 | 用途 |
|---|---|
| `search` | 混合 FTS5 + vec；可选的重新排序。 默认模式用于自然语言查询。 |
| `lookup_entity` | 精确的实体历史记录：环境变量、斜杠命令、模型 ID、CVE 等。 |
| `latest_releases` | 产品（或单个产品）的最新发布版本 |
| `get_release` | 单个发布版本的完整内容 |
| `list_products` | 带有计数和最新版本的枚举 |
| `top_entities` | 按类型提及最多的实体 |
| `list_synergies` | 精心策划的跨产品工作流程 |
| `read_synergy` | 单个协同文件（synergy file）的完整文本 |

---

## 数据源 — 5 个层级，6 种抓取策略

完整的详细信息请参阅 [SOURCES.md](SOURCES.md)。

- **第一层级 (GitHub 发布):** `gh api repos/<owner>/<repo>/releases`，涵盖 22 个产品，包括 Anthropic SDK（7 种语言）、Agent SDK（2 个）、ant CLI、claude-code-action、claude-code-security-review 以及 15 个 MCP 生态系统 SDK。
- **第二层级 (原始 markdown):** `anthropics/claude-code/CHANGELOG.md` + `Aider-AI/aider/HISTORY.md`
- **第三层级 (HTML / RSS):** `platform.claude.com/docs/release-notes`、`support.claude.com/articles/12138966`、`cursor.com/changelog/rss.xml`（已过滤）、`sourcegraph.com/changelog/featured.rss`、`github.blog/changelog/label/copilot/`、`code.visualstudio.com/updates/v1_NNN`
- **第四层级 (目录):** `anthropics/skills`、`claude-plugins-{official,community}`、`knowledge-work-plugins`
- **第五层级 (建议):** `@ClaudeCodeLog` X 账号；marckrenn 变更日志镜像

抓取策略：`gh-releases | rss | raw-changelog | html-scrape | catalog | playwright`。 增加一个新产品，就在 `products.yaml` 文件中增加一条记录。

---

## 协同（Synergies） — 解锁的内容

12 个精心策划的跨产品工作流程。 每个工作流程都描述了一种组合模式、触发正确的答案的因素，以及启用它的变更日志证据。 示例：

- **08 — 通用 SKILL.md 格式** (代码 + 光标 + Codex)：一位技能作者，三个人工智能代理读取。
- **09 — MCP 在七个表面上的应用** (代码 + 光标 + 继续 + Copilot + Windsurf + Cody + API)：一个二进制文件，所有代理都使用。
- **10 — Anthropic BYOK 在各个表面上的应用**：一个 API 密钥，用于在 7 个编辑器中使用 Claude，并实现统一的计费。
- **11 — Claude Code 协调 Aider**：将成本较高的编辑任务转移到廉价模型，同时 Claude 进行规划。
- **12 — MCP 配置格式的常见问题**：Copilot 使用 `servers`，其他组件使用 `mcpServers`。

完整的索引请参考 [synergies/INDEX.md](synergies/INDEX.md)。

---

## 测试

Vitest 测试套件覆盖单元测试、集成测试、回归测试和初步测试。 **[test-spec-3.md](test-spec-3.md) 是当前版本 (v0.7.0) 的权威文档**；[test-spec.md](test-spec.md) (v1) 和 [test-spec-2.md](test-spec-2.md) (v2) 仍然保存在代码库中，作为设计演进的历史记录。

```bash
pnpm test               # unit + integration + regression (~16s, 382 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

布局：

| 目录 | 涵盖内容 |
|-----|----------------|
| `test/unit/` | 模块级别 — 提取、导入、查询、数据库、嵌入、混合、获取 + 所有提供商 + 获取 RSS/变更日志/HTML + 获取 MCP 注册表 + 获取 Playwright + 产品配置 |
| `test/integration/` | 端到端 — 流水线、同步、MCP 服务器 (stdio JSON-RPC)、命令行界面 |
| `test/regression/` | §8.1–§8.18 — 每个部分都用于防止开发过程中出现的实际错误。 |
| `test/smoke/` | 可选的完整语料库，用于测试 `products/` 目录下的文件 (1143 个文件)。 |
| `test/fixtures/` | 3 个模拟产品 + 模拟 HTTP 响应 (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / 官方 MCP 注册表) |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**默认情况下，测试中不使用网络** — 提供商的 HTTP 请求通过 `vi.spyOn(global, 'fetch')` 进行模拟。 使用真实的 SQLite 数据库，存储在临时文件中 (而不是 `:memory:`)，因为 `sqlite-vec` 扩展的加载方式在不同版本和磁盘上有所不同，磁盘是规范的存储路径。 Playwright 通过动态导入加载，并通过 `vi.doMock('playwright', ...)` 进行模拟，因此测试可以在不安装真实浏览器的情况下通过。

CI：`.github/workflows/test.yml` 在代码提交和拉取请求时运行 `pnpm test:coverage`。

---

## 故障排除

**"数据库已锁定" 或 WAL 错误**

另一个 `hk` 进程 (或一个过时的 MCP 服务器) 正在持有 SQLite 数据库的打开状态。 关闭其他 `hk` 进程，然后重试。 如果问题仍然存在，请检查 `data/claude-synergy.db` 旁边是否存在 `-wal` 或 `-shm` 文件，这些是正常的 WAL 模式文件，当最后一个连接关闭时，它们将被清理。 在其他进程打开数据库时，请勿删除这些文件。

**"找不到 sqlite-vec 扩展" / sqlite-vec 加载失败"**

`sqlite-vec` 原生扩展加载失败。 常见原因：

1. **Node 版本过旧** — `claude-synergy` 需要 Node 22+。 使用 `node -v` 检查版本。
2. **原生模块需要重新构建** — 运行 `npm rebuild better-sqlite3` (或 `pnpm rebuild better-sqlite3`)。
3. **平台不匹配** — 在 Windows/ARM 上，`better-sqlite3` 需要 C++ 编译工具链。 安装 [windows-build-tools](https://github.com/nicedoc/windows-build-tools) 或带有 "Desktop development with C++" 的 Visual Studio Build Tools。

注意：`sqlite-vec` 是可选的。 FTS5 关键字搜索 (`hk query`) 可以在没有它的情况下工作。 只有 `hk embed` 和 `hk hybrid` 需要向量扩展。

**"产品 X 同步失败" / 获取错误"**

`hk fetch` 和 `hk sync` 调用外部 API。 常见原因：

- **GitHub 速率限制** — `gh-releases` 策略会调用 `gh api`，该命令会使用您的 `GITHUB_TOKEN`。 未进行身份验证的请求的速率限制为每小时 60 次；请使用 `gh auth login` 进行身份验证，或在您的环境中设置 `GITHUB_TOKEN`。
- **网络/代理** — RSS 和 HTML 获取器使用 `fetch()` 函数。请检查网络连接以及任何企业代理设置（`HTTPS_PROXY`）。
- **未知产品** — `hk fetch --product foo` 只能用于 `products.yaml` 文件中列出的产品。 运行 `hk products` 以查看所有可用名称。

同步操作是幂等的，即使在部分失败后也可以安全地重新运行。 已经获取的发布内容将被跳过。

**“嵌入服务不可用”**

`hk embed` 命令会调用外部嵌入服务：

- **Ollama (默认)** — 确保 Ollama 正在运行 (`ollama serve`)，并且已下载嵌入模型 (`ollama pull nomic-embed-text`)。
- **Voyage** — 在您的环境中设置 `VOYAGE_API_KEY`。 检查您的 API 密钥，请访问 [dash.voyageai.com](https://dash.voyageai.com)。

**模式版本不匹配/数据库损坏**

如果数据库是使用较旧的模式版本创建的，并且迁移失败，或者在崩溃后数据看起来不正确：

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

这种情况是安全的，因为数据库是派生的缓存。 所有原始数据都位于 `products/*/releases/*.md` 文件中。

---

## 相关文件

- [CONTRIBUTING.md](CONTRIBUTING.md) — 如何添加产品、运行测试、提交拉取请求
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 项可执行的操作（安全漏洞、模型淘汰、破坏性更改、配置注意事项）
- [SOURCES.md](SOURCES.md) — 包含 5 级来源的文档，以及获取策略
- [synergies/INDEX.md](synergies/INDEX.md) — 12 个精选的跨产品工作流程
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — SQLite + sqlite-vec 模式
- [test-spec-3.md](test-spec-3.md) (当前) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (历史) — 测试套件规范

---

## 许可证

MIT。 由 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> 构建。
