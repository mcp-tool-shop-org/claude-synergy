<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.md">English</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="docs/logo.png" alt="Claude Synergy" width="280"></p>

# Claude Synergy

这是一个本地、可查询的镜像，包含了 Anthropic 以及相关 AI 开发工具的更新日志，并且还提供了一个名为 **Synergy** 的精选层，用于描述跨产品的流程，以便嵌入在系统中的 LLM 代理能够了解系统的功能。

<!-- 注意：在 GitHub 黑暗主题下，logo 文本可能显示不清晰 -->
[![tests](https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg)](https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml) [![npm](https://img.shields.io/npm/v/@mcptoolshop/claude-synergy)](https://www.npmjs.com/package/@mcptoolshop/claude-synergy) [![license](https://img.shields.io/badge/license-MIT-blue)](#license)

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```

**通过单个 FTS 查询，可以发现一个协调的跨 SDK 安全修复，而这些修复在单独的更新日志中并未被标记为 CVE。** 这就是关键的演示：当所有更新日志并排显示时，模式就会显现出来。

仓库：[github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## 问题

Claude Code CLI 几乎每天都会发布更新。Claude API 的发布频率也差不多。SDK 的发布与 CLI 的版本相关。Claude Design、Cowork、Chat 和 Mobile 产品通过统一的帮助中心进行更新。MCP 生态系统每周发布约 200-300 个新的服务器。此外，还有 7 个主要的 AI 开发工具（Cursor、Aider、Continue、Copilot、Cody、Windsurf），它们各自以不同的节奏发布更新日志。

嵌入在这些系统中的 LLM 代理具有固定的训练截止时间。差距每天都在扩大。系统会发布代理不知道的功能。会修复代理仍在处理的错误。会添加代理从未建议的环境变量和标志。跨产品的流程，即组合多个功能，仍然未被发现。

**这个仓库填补了这些差距。** Synergy 部分使其成为一个产品，而不是一个简单的镜像。

---

## 内容

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

**实时数据（截至 v0.7.2）：** 44 个产品 / 1,186 个发布文件 / 6,042 个变更 / 1,225 个实体 / 12 个协同关系 / 382 个测试。

---

## 状态 — 所有层级已发布

| 层级 | 状态 | 内容 |
|------|--------|--------------|
| **1 — 基础（Markdown 文档）** | ✅ 已发布 | Study-swarm 收集了 706 个发布文件，时间为 2026 年 1 月至 5 月；通过第 4 阶段扩展到 1,186 个。 |
| **2a — SQLite + FTS5 + CLI** | ✅ 已发布 | `hk` CLI；15 个子命令；导入速度小于 300 毫秒。 |
| **2b — sqlite-vec + 上下文检索** | ✅ 已发布 | 提供商可插拔（无/结构化/ollama/claude-haiku 上下文 × ollama/voyage 嵌入 × 无/ollama-judge/voyage/cohere 重新排序）。 |
| **3 — 同步 + MCP 服务器** | ✅ 已发布 | `hk fetch / sync / seed-markers`；`claude-synergy-mcp` 通过标准输入/输出暴露 8 个工具。 |
| **4a — 扩展到 Anthropic 之外** | ✅ 已发布 | +15 个 MCP SDK，Cursor (RSS)，Aider (HISTORY.md)，Continue.dev，Cody Enterprise (RSS 过滤)。 |
| **4b — HTML 抓取工具** | ✅ 已发布 | GitHub Copilot + VS Code Chat (Windsurf 需要 Playwright — v0.7)。 |
| **4c — turndown HTML→Markdown 导入** | ✅ 已发布 | HTML 内容（Copilot/VS Code/Cursor）现在生成每个条目的行，用于 FTS5 + 实体提取。 |
| **4d — Playwright + MCP 注册表 + YAML 配置文件** | ✅ 已发布 | Windsurf 通过 Playwright；Smithery + 官方 MCP 注册表作为第 4 阶段的目录；产品合并到 `products.yaml` 文件中。 |

v0.8+ 的路线图：跟踪在 [URGENT_FINDINGS.md](URGENT_FINDINGS.md) 和 issues 中。

---

## 安装

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

为了在不构建的情况下进行开发，请直接使用 `npx tsx src/cli.ts ...`。**pnpm 10 的一个问题：** `pnpm dev` 会在 `--` 之后吞噬 CLI 标志；对于开发，请使用 `npx tsx`。

---

## CLI 界面 — 15 个命令

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

**跟踪跨 SDK 的重大变更：**
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

查询中从未出现 "env_scrub"，而是通过语义相似性进行检索。纯 FTS5 完全无法找到它。

---

## MCP 服务器：为您的代理提供访问此语料库的权限

`claude-synergy-mcp` 通过标准输入/输出 (stdio) 暴露 8 个工具。通过 `~/.claude/.mcp.json` 或您的项目的 `.mcp.json` 文件连接到 Claude Code（或任何 MCP 主机）。

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

对于 GitHub Copilot 的 `.vscode/mcp.json` 文件，请使用 `servers` 包装器，而不是 `mcpServers`（请参阅 [synergy 12](synergies/12-mcp-config-format-gotcha.md)）。

暴露的工具：

| 工具 | 用途 |
|---|---|
| `search` | 混合 FTS5 + 向量检索；可选的重新排序。自然语言查询的默认模式。 |
| `lookup_entity` | 精确的实体历史记录：环境变量、命令、模型 ID、CVE 等。 |
| `latest_releases` | 产品（或单个产品）的最新发布版本。 |
| `get_release` | 单个发布版本的完整内容。 |
| `list_products` | 带有计数和最新版本的枚举。 |
| `top_entities` | 按类型提及次数最多的实体。 |
| `list_synergies` | 精心策划的跨产品工作流程。 |
| `read_synergy` | 单个协同文件（synergy file）的完整文本。 |

---

## 数据源：5 个层级，6 种数据获取策略

完整的概览请参见 [SOURCES.md](SOURCES.md)。

- **第一层级 (GitHub 发布)** — `gh api repos/<owner>/<repo>/releases`，涵盖 22 个产品，包括 Anthropic SDK（7 种语言）、Agent SDK（2 个）、ant CLI、claude-code-action、claude-code-security-review 以及 15 个 MCP 生态系统 SDK。
- **第二层级 (原始 Markdown)** — `anthropics/claude-code/CHANGELOG.md` + `Aider-AI/aider/HISTORY.md`
- **第三层级 (HTML / RSS)** — `platform.claude.com/docs/release-notes`、`support.claude.com/articles/12138966`、`cursor.com/changelog/rss.xml`（已过滤）、`sourcegraph.com/changelog/featured.rss`、`github.blog/changelog/label/copilot/`、`code.visualstudio.com/updates/v1_NNN`
- **第四层级 (目录)** — `anthropics/skills`、`claude-plugins-{official,community}`、`knowledge-work-plugins`
- **第五层级 (建议)** — `@ClaudeCodeLog` X 账号；marckrenn 的变更日志镜像。

数据获取策略：`gh-releases | rss | raw-changelog | html-scrape | catalog | playwright`。 新产品 = `products.yaml` 文件中的一个条目。

---

## 协同（Synergies）：解锁的内容

12 个精心策划的跨产品工作流程。每个工作流程都描述了一种组合模式、触发正确的答案的因素，以及支持它的变更日志证据。例如：

- **08 — Universal SKILL.md 格式** (Code + Cursor + Codex)：一个技能作者，三个代理读取。
- **09 — MCP 跨七个平台** (Code + Cursor + Continue + Copilot + Windsurf + Cody + API)：一个二进制文件，所有代理都使用。
- **10 — Anthropic BYOK 跨平台**：一个 API 密钥为 7 个编辑器提供 Claude 服务，并实现统一的计费。
- **11 — Claude Code 协调 Aider**：将重大的编辑工作转移到廉价模型，同时 Claude 进行规划。
- **12 — MCP 配置格式的注意事项**：Copilot 使用 `servers`；其他所有都使用 `mcpServers`。

完整的索引请参见 [synergies/INDEX.md](synergies/INDEX.md)。

---

## 测试

Vitest 测试套件涵盖单元测试/集成测试/回归测试/快速测试。**[test-spec-3.md](test-spec-3.md) 是当前权威版本**（截至 v0.7.0）；[test-spec.md](test-spec.md)（v1）和 [test-spec-2.md](test-spec-2.md)（v2）仍然保存在仓库中，作为设计演进的历史记录。

```bash
pnpm test               # unit + integration + regression (~16s, 382 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

目录结构：

| 目录 | 包含的内容 |
|-----|----------------|
| `test/unit/` | per-module：提取、导入、查询、数据库、嵌入、混合、数据获取 + 所有提供商 + 数据获取-RSS/变更日志/HTML + 数据获取-MCP 注册 + 数据获取-Playwright + 产品配置。 |
| `test/integration/` | end-to-end：流水线、同步、MCP 服务器（标准输入/输出 JSON-RPC）、命令行界面。 |
| `test/regression/` | §8.1–§8.18：每个部分都用于防止开发过程中出现的实际错误。 |
| `test/smoke/` | 针对真实 `products/` 目录（包含 1143 个文件）的完整语料库测试。 |
| `test/fixtures/` | 3 个模拟产品 + 模拟 HTTP 响应（RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / 官方 MCP 注册表）。 |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**默认情况下，测试环境不使用网络** — HTTP 请求通过 `vi.spyOn(global, 'fetch')` 进行模拟。使用真实的 SQLite 数据库存储在临时文件中（而不是 `:memory:`），因为 `sqlite-vec` 扩展的加载方式在不同版本和磁盘上有所不同，磁盘是标准的方式。Playwright 通过动态导入加载，并通过 `vi.doMock('playwright', ...)` 进行模拟，因此测试可以在没有实际浏览器安装的情况下通过。

CI：`.github/workflows/test.yml` 在代码提交和拉取请求时运行 `pnpm test:coverage`。

---

## 故障排除

**“数据库已锁定” 或 WAL 错误**

另一个 `hk` 进程（或一个过时的 MCP 服务器）正在保持对 SQLite 数据库的打开状态。关闭其他 `hk` 进程，然后重试。如果问题仍然存在，请检查 `data/claude-synergy.db` 旁边是否存在 `-wal` 或 `-shm` 文件，这些是正常的 WAL 模式文件，并且在最后一个连接关闭时会被清理。不要在其他进程打开数据库时删除它们。

**“未找到 sqlite-vec 扩展” / sqlite-vec 加载失败**

`sqlite-vec` 原生扩展加载失败。常见原因：

1. **Node 版本过旧** — `claude-synergy` 需要 Node 22+。使用 `node -v` 检查版本。
2. **原生模块需要重新构建** — 运行 `npm rebuild better-sqlite3`（或 `pnpm rebuild better-sqlite3`）。
3. **平台不匹配** — 在 Windows/ARM 上，`better-sqlite3` 需要 C++ 编译工具链。安装 [windows-build-tools](https://github.com/nicedoc/windows-build-tools) 或带有“C++ 桌面开发”的 Visual Studio Build Tools。

注意：`sqlite-vec` 是可选的。在没有它的情况下，可以使用 FTS5 关键字搜索 (`hk query`)。只有 `hk embed` 和 `hk hybrid` 需要向量扩展。

**“产品 X 同步失败” / fetch 错误**

`hk fetch` 和 `hk sync` 调用外部 API。常见原因：

- **GitHub 速率限制** — `gh-releases` 策略会调用 `gh api`，后者使用您的 `GITHUB_TOKEN`。未进行身份验证的请求受到 60 req/hr 的限制；使用 `gh auth login` 进行身份验证，或在您的环境中设置 `GITHUB_TOKEN`。
- **网络 / 代理** — RSS 和 HTML 获取器使用 `fetch()`。检查网络连接和任何企业代理设置（`HTTPS_PROXY`）。
- **未知产品** — `hk fetch --product foo` 仅适用于 `products.yaml` 中列出的产品。运行 `hk products` 查看所有可用名称。

同步是幂等的，即使部分失败，也可以安全地重新运行。已经获取的发布版本将被跳过。

**“嵌入提供程序未响应”**

`hk embed` 调用外部嵌入服务：

- **Ollama (默认)** — 确保 Ollama 正在运行 (`ollama serve`)，并且已下载嵌入模型 (`ollama pull nomic-embed-text`)。
- **Voyage** — 在您的环境中设置 `VOYAGE_API_KEY`。在 [dash.voyageai.com](https://dash.voyageai.com) 上检查您的 API 密钥。

**模式版本不匹配 / 数据库损坏**

如果数据库是使用较旧的模式版本创建的，并且迁移失败，或者在崩溃后数据看起来不正确：

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

这通常是安全的 — 数据库是一个派生的缓存。所有原始数据都位于 `products/*/releases/*.md` 文件中。

---

## 相关文件

- [CONTRIBUTING.md](CONTRIBUTING.md) — 如何添加产品、运行测试、提交拉取请求。
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23项可执行事项（安全漏洞、模型淘汰、重大变更、配置注意事项）。
- [SOURCES.md](SOURCES.md) — 五级来源体系，包含获取策略。
- [synergies/INDEX.md](synergies/INDEX.md) — 12个精选的跨产品工作流程。
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — SQLite 和 sqlite-vec 数据库模式。
- [test-spec-3.md](test-spec-3.md) (当前) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (历史) — 测试套件规范。

---

## 许可证

MIT。 由 <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a> 构建。
