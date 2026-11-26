<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#licença"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

Um espelho local e pesquisável de todos os registros de alterações das ferramentas de desenvolvimento de IA da Anthropic e de ferramentas relacionadas — além de uma camada **Synergy** selecionada que descreve fluxos de trabalho entre produtos — para que o agente LLM dentro do sistema saiba o que o sistema pode fazer.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


**Uma única consulta FTS revela uma correção de segurança coordenada entre vários SDKs, algo que nenhum registro de alterações individual identificou como uma CVE.** Essa é a demonstração crucial: padrões emergem quando todos os registros de alterações são comparados lado a lado.

Repositório: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## O problema

O Claude Code CLI é lançado aproximadamente diariamente. A API do Claude é lançada quase com a mesma frequência. Os SDKs são lançados a cada atualização do CLI. O Claude Design, Cowork, Chat e Mobile são integrados ao Centro de Ajuda unificado. O ecossistema MCP lança cerca de 200 a 300 novos servidores por semana. Além disso, existem 7 ferramentas de desenvolvimento de IA importantes (Cursor, Aider, Continue, Copilot, Cody, Windsurf), todas lançando seus próprios registros de alterações em seus próprios ritmos.

O agente LLM em qualquer uma dessas ferramentas tem um limite de treinamento fixo. A lacuna aumenta a cada dia. Novos recursos são lançados, mas o agente não sabe que eles existem. Erros são corrigidos, mas o agente ainda tenta contorná-los. Variáveis de ambiente e flags são adicionadas, mas o agente nunca as sugere. Fluxos de trabalho entre produtos que combinam várias ferramentas permanecem desconhecidos.

**Este repositório fecha a lacuna.** A seção Synergy transforma o sistema em um produto, em vez de apenas um espelho.

---

## O que está aqui

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

**Dados em tempo real (a partir de v1.2.1):** 44 produtos / 1.171 arquivos de lançamento / 6.573 alterações / 1.260 entidades / 12 sinergias / 519 testes / 13 ferramentas MCP / 17 comandos CLI. (O corpus é atualizado via `sync_now` em 24 de maio de 2026.)

---

## Status — todas as camadas foram lançadas

| Camada | Status | O que há |
|------|--------|--------------|
| **1 — bootstrap (corpus markdown)** | ✅ lançado | Um conjunto de 706 arquivos de lançamento foi criado de janeiro a maio de 2026; expandido para 1.186 na Camada 4d |
| **2a — SQLite + FTS5 + CLI** | ✅ lançado | CLI `hk`; 15 subcomandos; ingestão sub-300ms |
| **2b — sqlite-vec + Recuperação Contextual** | ✅ lançado | Adaptável ao provedor (nenhum/estruturado/ollama/contexto claude-haiku × incorporação ollama/voyage × nenhum/ollama-judge/voyage/cohere rerank) |
| **3 — sincronização + servidor MCP** | ✅ lançado | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` expõe 13 ferramentas via stdio (8 no lançamento original da Camada 3, 3 adicionadas em v1.1, 2 adicionadas em v1.2) |
| **4a — expansão além da Anthropic** | ✅ lançado | +15 SDKs MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtrado) |
| **4b — coletor de raspagem HTML** | ✅ lançado | GitHub Copilot + VS Code Chat (Windsurf precisa de Playwright — v0.7) |
| **4c — ingestão de conversão de HTML para markdown** | ✅ lançado | Os corpos HTML (Copilot/VS Code/Cursor) agora produzem linhas por item para FTS5 + extração de entidades |
| **4d — Playwright + registro MCP + configuração YAML** | ✅ lançado | Windsurf via Playwright; Smithery + registro oficial MCP como catálogos da Camada 4; produtos consolidados em `products.yaml` |
| **5 — navegação v1.1 com janela + incorporação OpenAI** | ✅ lançado | `hk diff` / `hk breaking`, limites de data em todos os comandos de navegação, 3 novas ferramentas MCP (11 no total), OpenAI provedor de incorporação, dimensão de incorporação configurável, `claude-code` sincronização automática, analisador genérico `keep-a-changelog` |
| **6 — sincronização v1.2 a partir do MCP** | ✅ lançado | `sync_status` (atualização da informação por produto, detecção de dados desatualizados) e `sync_now` (recuperação sob demanda → ingestão → incorporação com `dry_run` visualização prévia + bloqueio de concorrência em processo). Elimina a lacuna onde um agente solicitante poderia consultar o corpus, mas não atualizá-lo. **Também corrige:** o erro de remoção de marcadores, onde `INSERT OR REPLACE INTO products` propagava uma operação DELETE na chave estrangeira `markers`, redefinindo silenciosamente o `since` cursor de cada produto em cada ingestão (regressão §8.20). |
| **6.1 — centralização do coletor de marcadores v1.2.1** | ✅ lançado | Centralização de `writeMarker` em `fetchOne` para que cada coleta bem-sucedida atualize o marcador — antes da correção, as estratégias que retornavam 0 itens com data dentro do período (principalmente `aider` raw-changelog) nunca gravavam um marcador e faziam uma nova coleta de `HISTORY.md` em cada sincronização. A estratégia não implementada `webfetch` foi renomeada para `manual` para `claude-api` + `anthropic-apps`; `sync_status` agora renderiza produtos manuais como "manuais" em vez de "nunca" e os exclui de `stale_only` (regressão §8.21). |
| **7 — sintetizador v1.3 cs-actions:v1 ajustado** | ✅ lançado | Primeiro modelo downstream treinado no corpus. Converte uma entrada de registro de alterações em um item de ação estrito em JSON `{kind, severity, subject, action_text, deadline, tags}`. Qwen2.5-7B + LoRA em 242 entradas de `dataset/changelog-actions/v1/`, q8_0 GGUF, implantado no Ollama. Avaliação do lançamento: **88,1% de tipo / 79,7% de gravidade / 0,842 macro-F1** em comparação com a verdade fundamental em 59 entradas estratificadas (+10,1 pp / +27,2 pp / +0,041 em relação a qwen3:8b). Marcado como `cs-actions-v1`; relatório de avaliação anexado ao [Lançamento GitHub](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) como um download de arquivo único. **Limitação documentada v1:** viés anti-`unknown` (precisão 1,000 / recall 0,286) — o modelo subestima as entradas ambíguas. Consulte [manual → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) + [`dataset/README.md`](dataset/README.md) + [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) + [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md). |

Roteiro além de v1.3: rastreado em [URGENT_FINDINGS.md](URGENT_FINDINGS.md) e problemas.

---

## Segurança e modelo de dados

Esta ferramenta é executada localmente. **Dados acessados:** um banco de dados derivado SQLite e arquivos de lançamento markdown — todos podem ser recriados. **Rede:** HTTPS de saída quando você executa `hk fetch`/`hk sync`, quando um agente chama a ferramenta MCP `sync_now` e no primeiro uso: um comando de consulta ou uma ferramenta MCP executados em um armazenamento vazio sincronizam por conta própria (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` desativa isso). Os destinos são a API do GitHub, feeds RSS, páginas de changelog e registros MCP, além de um provedor de IA remoto apenas quando você escolhe um: `hk embed` (embeddings Voyage, Anthropic para geração de contexto) ou `hk hybrid -e voyage` / `-r voyage|cohere`. Caso contrário, a busca híbrida, incluindo o modo padrão da ferramenta MCP `search`, chama um Ollama local em localhost para gerar o embedding da consulta. **Segredos:** lê `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` de variáveis de ambiente — nunca são registrados, nunca são armazenados em disco. **Sem telemetria.** Consulte [SECURITY.md](SECURITY.md) para obter a política de relatórios.

**Texto do fornecedor:** As notas de lançamento e as entradas do catálogo de terceiros são tratadas estritamente como dados citados, nunca como instruções permanentes. O texto do lançamento é examinado de forma determinística durante a ingestão (removendo controles Unicode ocultos, neutralizando links de imagem/não seguros, removendo endereços de e-mail e caminhos de diretório, e marcando padrões semelhantes a instruções), encapsulado em uma estrutura de dados fixa pelas seis ferramentas MCP que retornam o texto do lançamento, com marcadores `[flagged: …]` embutidos, e nunca gravado em arquivos de instrução.

---

## Instalar

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

Ou executar diretamente após a instalação de `@mcptoolshop/claude-synergy`. Tanto `hk` quanto `claude-synergy-mcp` resolvem o armazenamento local usando a mesma sequência de 4 etapas:

1. Variável de ambiente `CLAUDE_SYNERGY_DB`
2. `--db <path>` explícito (CLI) ou caminho argv posicional (MCP)
3. `<cwd>/data/claude-synergy.db` **apenas se esse arquivo já existir** (preserva o uso de clone do repositório)
4. `<home>/.claude-synergy/data/claude-synergy.db` (com produtos em `<home>/.claude-synergy/products`)

`CLAUDE_SYNERGY_PRODUCTS_ROOT` substitui o diretório de produtos.

**Sincronização automática no primeiro uso:** Quando um comando de consulta ou uma ferramenta MCP é executada em um armazenamento ausente ou vazio, ela inicializa o esquema e executa automaticamente `fetch` → `ingest` (sem etapa de incorporação, limitada por um tempo limite, ignorando qualquer feed inacessível) e marca cada resposta com `data as of: …`. Defina `CLAUDE_SYNERGY_NO_AUTO_SYNC=1` para desativar a sincronização automática no primeiro uso e falhar/alertar com instruções de corpus vazio.

Para desenvolvimento sem compilação, use `npx tsx src/cli.ts ...` diretamente. **Particularidade do pnpm 10:** `pnpm dev` ignora as flags da CLI após `--`; use `npx tsx` para desenvolvimento.

---

## Interface da CLI — 17 comandos

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

**Novo em v1.1:** `hk diff` e `hk breaking` respondem a "o que mudou recentemente?" sem precisar de um termo de pesquisa. Os limites de data são uniformes: cada comando de navegação recebe `--since` e `--until` em `YYYY-MM-DD` (ou ISO 8601 completo) ou uma forma relativa (`7d`, `2w`, `3m`, `1y`).

---

## Exemplos de fluxos de trabalho

**Encontre quando uma variável de ambiente Claude Code foi introduzida:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Acompanhe uma alteração incompatível entre SDKs:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Planeje uma migração de modelo:**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**Pesquisa semântica em todo o corpus:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

A consulta nunca diz "env_scrub" — vec a apresenta por similaridade semântica. FTS5 puro a ignora completamente.

**O que mudou em claude-code nesta semana:**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**Navegue pelas alterações incompatíveis em todo o corpus:**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

Nenhum termo de pesquisa é necessário — `hk breaking` é a resposta para "alguma coisa importante mudou recentemente?".

---

## Servidor MCP — dê aos seus agentes acesso a este corpus

`claude-synergy-mcp` expõe 13 ferramentas via stdio. Integre ao Claude Code (ou qualquer host MCP) via `~/.claude/.mcp.json` ou o `.mcp.json` do seu projeto:

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp"
    }
  }
}
```

Defina `CLAUDE_SYNERGY_DB` em `env` se você quiser um caminho de armazenamento personalizado; caso contrário, ele usa `./data/claude-synergy.db` se esse arquivo já existir, ou então `~/.claude-synergy/data/claude-synergy.db`, e sincroniza automaticamente no primeiro uso da ferramenta (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` desativa isso). Cada resposta da ferramenta termina com um carimbo de data de atualização `data as of:` (prefixado com `STALE:` após 7 dias).

Para o `.vscode/mcp.json` do GitHub Copilot, use o invólucro `servers` em vez de `mcpServers` (veja [synergy 12](synergies/12-mcp-config-format-gotcha.md)).

Ferramentas expostas:

| Ferramenta | Finalidade |
|---|---|
| `search` | Híbrido FTS5 + vec; reclassificação opcional. Modo padrão para consultas em linguagem natural. (+ limite superior de data `until`) |
| `lookup_entity` | Histórico exato de entidades: variáveis de ambiente, comandos de barra, IDs de modelo, CVEs, etc. |
| `latest_releases` | Lançamentos recentes em produtos (ou um). (+ limite inferior de data `since`) |
| `get_release` | Conteúdo completo de um lançamento |
| `list_products` | Enumeração com contagens + versão mais recente |
| `top_entities` | Entidades mais mencionadas por tipo |
| `list_synergies` | Fluxos de trabalho selecionados entre produtos. (+ filtro opcional `product`) |
| `read_synergy` | Texto completo de um arquivo de sinergia |
| `get_changes_since` | **Novo.** Alterações em uma janela de tempo, agrupadas por produto+versão. Entradas: `since` (obrigatório), `until?`, `product?`, `kind?`, `limit?`. |
| `search_breaking_changes` | **Novo.** Lista simples de alterações incompatíveis — nenhum termo de pesquisa é necessário. Entradas: `product?`, `since?`, `until?`, `limit?`. |
| `compare_versions` | **v1.1.** Todas as alterações entre duas versões de um produto. Entradas: `product`, `from_version`, `to_version`. |
| `sync_status` | **v1.2.** Sincronização por produto — último carimbo de data de busca, horas desde a busca, contagem de lançamentos ingeridos. Entradas: `product?`, `stale_only?`, `stale_hours?`. Use ANTES de confiar em `latest_releases` para saber se o corpus está desatualizado. |
| `sync_now` | **v1.2.** Atualização sob demanda (espelha `hk sync`). Entradas: `product?`, `dry_run?`, `include_ingest?`, `include_embed?`, `timeout_ms?`. Rejeita com `InvalidParams` se outra `sync_now` já estiver em andamento. NÃO se compromete com o git. |

As v1.1 ferramentas espelham `hk diff` / `hk breaking` e o fluxo de trabalho de comparação de versões que anteriormente exigia scripts. As ferramentas de sincronização v1.2 fecham a lacuna onde uma sessão poderia consultar o corpus, mas não atualizá-lo — `sync_status` relata a desatualização, `sync_now` executa o pipeline. Consulte [manual → servidor MCP](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/) para os esquemas de entrada completos.

---

## Fontes — 5 níveis, 7 estratégias de busca

Visão geral completa em [SOURCES.md](SOURCES.md).

- **Nível 1 (GitHub Lançamentos)** — `gh api repos/<owner>/<repo>/releases` para 23 produtos, incluindo os SDKs da Anthropic (7 idiomas), SDKs de Agente (2), CLI ant, **claude-code** (agora sincronizado automaticamente via gh-releases a partir de v1.1 — anteriormente, inserido manualmente), claude-code-action, claude-code-security-review e 15 SDKs do ecossistema MCP
- **Nível 2 (markdown bruto)** — `Aider-AI/aider/HISTORY.md`. O analisador genérico `keep-a-changelog` (v1.1+) também está disponível para qualquer produto cuja fonte seja um arquivo CHANGELOG.md no formato Keep-a-Changelog — configure por meio de uma entrada em `products.yaml`.
- **Nível 3 (HTML / RSS)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtrado), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **Nível 4 (catálogo)** — `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`
- **Nível 5 (avisos)** — `@ClaudeCodeLog` conta X; espelho do changelog de marckrenn

Estratégias de busca: `gh-releases | rss | raw-changelog | keep-a-changelog | html-scrape | catalog | playwright`. Novo produto = uma entrada em `products.yaml`.

---

## Sinergias — o que é desbloqueado

12 fluxos de trabalho selecionados entre produtos. Cada um descreve um padrão de composição, o gatilho que o torna a resposta certa e a evidência do changelog que o possibilita. Exemplos:

- **08 — Formato universal SKILL.md** (Código + Cursor + Codex): um autor de skill, três agentes o utilizam.
- **09 — MCP em sete superfícies** (Código + Cursor + Continuar + Copilot + Windsurf + Cody + API): um binário, todos os agentes.
- **10 — BYOK da Anthropic em várias superfícies**: uma chave de API alimenta o Claude em 7 editores com faturamento unificado.
- **11 — O Claude Code orquestra o Aider**: transfere edições complexas para um modelo mais barato enquanto o Claude planeja.
- **12 — Formato de configuração MCP: pontos importantes**: o Copilot usa `servers`; todos os outros usam `mcpServers`.

Índice completo em [synergies/INDEX.md](synergies/INDEX.md).

---

## Conjuntos de dados e modelos ajustados

O corpus possui uma camada de nível inferior: **conjuntos de dados** selecionados derivados de itens de mudança e **modelos ajustados** treinados nesses conjuntos de dados. O conjunto de dados é o artefato neste repositório; o modelo é de nível inferior.

### `dataset/changelog-actions/v1` — 301 entradas

Cada entrada associa um item de mudança do corpus a um item de ação escrito manualmente: `{kind, severity, subject, action_text, deadline, tags}`. Taxonomia de 8 enumerações `kind` (`breaking | deprecation | security | feature | fix | performance | docs | unknown`), estratificada em 80/20 para treinamento/teste, A3c-reviewed por avaliação humana + entre famílias qwen3:8b (92,4% de concordância). Consulte [`dataset/README.md`](dataset/README.md) para a tabela de distribuição, [`SCHEMA.md`](dataset/changelog-actions/SCHEMA.md) para o contrato campo a campo e [`STYLE.md`](dataset/changelog-actions/STYLE.md) para as regras de redação `action_text`.

### `cs-actions:v1` — sintetizador ajustado

Primeiro modelo treinado no conjunto de dados. Qwen2.5-7B-Instruct + LoRA (rank-256 / totalmente linear, 100 etapas QLoRA em 242 entradas de treinamento), q8_0 GGUF, implantado por meio de um arquivo Modelfile de duas etapas do Ollama (`cs-actions-base` + `cs-actions:v1`).

**Avaliação de liberação** (teste estratificado de 59 entradas, três execuções, todas aprovadas, zero erros de análise):

| Métrica | qwen3:8b base | cs-actions:v1 | Delta |
|---|---|---|---|
| Concordância de tipo em relação à verdade fundamental | 78.0% | **88.1%** | +10,1 pontos percentuais |
| Concordância de gravidade em relação à verdade fundamental | 52.5% | **79.7%** | +27,2 pontos percentuais |
| Macro-F1 (classes bem representadas) | 0.801 | **0.854** | +0.053 |
| Execução 3 — ablação de dica de tipo (com dica / sem dica) | — | 0.842 / 0.777 | 6,5 pontos → zona de destino |

Critério de aprovação de lançamento `qwen3-vs-cs-actions ≥ qwen3-vs-GT` (`0.780 ≥ 0.780`) — APROVADO ✓. Resultados detalhados por entrada em [`eval-report.v1.json`](dataset/changelog-actions/v1/eval-report.v1.json), também anexados ao [GitHub Lançamento](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) como um download de arquivo único.

**Limitação documentada v1 — viés anti-`unknown`.** `unknown` é a única classe em que cs-actions:v1 tem desempenho inferior a qwen3:8b (F1 0,444 contra 0,545). Precisão 1,000 / revocação 0,286 — quando a entrada é genuinamente ambígua, o modelo se compromete com um tipo específico em vez de se abster. Prioridade herdada da família qwen, não totalmente substituída pelo LoRA. Os consumidores de nível inferior devem tratar uma taxa `kind: "unknown"` menor do que o esperado como um sinal para direcionar lotes para revisão humana. O [plano v2](dataset/README.md) aborda isso com a adição de uma classe desconhecida e a randomização de dicas.

**Não distribuído por meio deste repositório** — o q8_0 GGUF tem cerca de 5 GB e o checkpoint mesclado tem cerca de 15 GB. O conjunto de dados e o pipeline de construção são o que é publicado; o modelo é reconstruído localmente por [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) (cadeia manual de 4 etapas, ~88 minutos de aquecimento em RTX 5080 Laptop 16 GB VRAM). O contrato de aprovação de lançamento de três execuções está em [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md).

Demonstração completa de uso — incluindo a invocação local do Ollama, o requisito `format: "json"` por solicitação e o pipeline de reconstrução — está na página [manual → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/).

---

## Testes

O conjunto de testes Vitest cobre os níveis de unidade / integração / regressão / teste de fumaça. **[test-spec-3.md](test-spec-3.md) é a autoridade atual** em v0.7.0; [test-spec.md](test-spec.md) (v1) e [test-spec-2.md](test-spec-2.md) (v2) permanecem no repositório como registro histórico da linhagem do projeto.

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Layout:

| Diretório | O que ele cobre |
|-----|----------------|
| `test/unit/` | por módulo — extração, ingestão, consulta (incluindo `until` / navegação / desde / comparação), banco de dados (incluindo migração de configuração de dimensão v3), incorporação, híbrido, busca + todos os provedores (Ollama / Voyage / **OpenAI**) + busca-rss/changelog (incluindo o analisador **keep-a-changelog**) / html + busca-registro-mcp + busca-playwright + configuração de produtos + ingestão/consulta de sinergia |
| `test/integration/` | de ponta a ponta — pipeline, sincronização, servidor MCP (stdio JSON-RPC, 13 ferramentas incluindo `sync_status` / `sync_now`), CLI (incluindo `hk diff`, `hk breaking`) |
| `test/regression/` | §8.1–§8.19 — cada um protege contra um bug real corrigido durante o desenvolvimento (§8.19: a paginação de saída antecipada ghReleases preserva os itens na janela) |
| `test/smoke/` | opcional, corpus completo contra `products/` real (1.143 arquivos) |
| `test/fixtures/` | 3 produtos falsos + respostas HTTP simuladas (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Registro oficial do MCP) |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**Sem rede nos testes por padrão** — o HTTP do provedor é simulado por meio de `vi.spyOn(global, 'fetch')`. SQLite real em arquivos temporários (não `:memory:`) porque a semântica de carregamento da extensão sqlite-vec difere entre as versões e o disco é o caminho canônico. O Playwright é carregado por meio de importação dinâmica e simulado por meio de `vi.doMock('playwright', ...)` para que os testes passem sem uma instalação real do navegador.

CI: `.github/workflows/test.yml` executa `pnpm test:coverage` no envio e na solicitação de pull.

---

## Solução de problemas

**"Banco de dados bloqueado" ou erros WAL**

Outro processo `hk` (ou um servidor MCP obsoleto) mantém o banco de dados SQLite aberto. Feche outros processos `hk` e tente novamente. Se o problema persistir, verifique se há um arquivo `-wal` ou `-shm` ao lado de `data/claude-synergy.db` — esses são arquivos normais do modo WAL e serão limpos quando a última conexão for fechada. Não os exclua enquanto outro processo tiver o banco de dados aberto.

**"Extensão sqlite-vec não encontrada" / falha no carregamento do sqlite-vec**

A extensão nativa `sqlite-vec` falhou ao carregar. Causas comuns:

1. **Versão do Node muito antiga** — `claude-synergy` requer Node 22.12 ou mais recente no Windows, macOS ou Linux (glibc ou musl), x64 ou arm64; ARM de 32 bits não é suportado. Verifique com `node -v`.
2. **O módulo nativo precisa ser reconstruído** — execute `npm rebuild better-sqlite3` (ou `pnpm rebuild better-sqlite3`).
3. **Incompatibilidade de plataforma** — no Windows/ARM, `better-sqlite3` precisa de uma cadeia de ferramentas de compilação C++. Instale o [windows-build-tools](https://github.com/nicedoc/windows-build-tools) ou o Visual Studio Build Tools com "Desenvolvimento para desktop com C++".

Observação: `sqlite-vec` é opcional. A pesquisa de palavras-chave FTS5 (`hk query`) funciona sem ele. Apenas `hk embed` e `hk hybrid` exigem a extensão vetorial.

**"Falha na sincronização para o produto X" / erros de busca**

`hk fetch` e `hk sync` chamam APIs externas. Causas comuns:

- **Limite de taxa GitHub** — a estratégia `gh-releases` utiliza `gh api`, que usa sua `GITHUB_TOKEN`. Solicitações não autenticadas atingem 60 req/hr; autentique com `gh auth login` ou defina `GITHUB_TOKEN` em seu ambiente.
- **Rede / proxy** — os mecanismos de busca RSS e HTML usam `fetch()`. Verifique a conectividade e quaisquer configurações de proxy corporativas (`HTTPS_PROXY`).
- **Produto desconhecido** — `hk fetch --product foo` funciona apenas para produtos listados em `products.yaml`. Execute `hk products` para ver todos os nomes disponíveis.

A sincronização é idempotente — é seguro executar novamente após uma falha parcial. As versões já obtidas são ignoradas.

**"O provedor de incorporação não está respondendo"**

`hk embed` chama um serviço de incorporação externo:

- **Ollama (padrão, 768 dimensões)** — certifique-se de que o Ollama está em execução (`ollama serve`) e que o modelo de incorporação foi baixado (`ollama pull nomic-embed-text`).
- **Voyage (1024 dimensões)** — defina `VOYAGE_API_KEY` em seu ambiente. Verifique sua chave de API em [dash.voyageai.com](https://dash.voyageai.com).
- **OpenAI (1536 dimensões por padrão, configurável)** — defina `OPENAI_API_KEY`. O modelo padrão é `text-embedding-3-small`; substitua com `OPENAI_EMBED_MODEL` (por exemplo, `text-embedding-3-large` para 3072 dimensões). Use via `hk hybrid --embed openai` ou `hk embed --embed openai`.

**Incompatibilidade de dimensão de incorporação na troca de provedor**

Cada provedor produz vetores de uma dimensão fixa (Ollama 768, Voyage 1024, OpenAI 1536 por padrão — OpenAI suporta dimensão configurável dentro do tamanho nativo do modelo). O banco de dados armazena a dimensão ativa em `schema_meta.embedding_dim`. A troca de provedores com dimensões diferentes enquanto existem fragmentos gera `EMBEDDING_DIM_MISMATCH` (`AppError`) em vez de corromper silenciosamente a tabela de vetores. Para trocar:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --embed openai     # new provider, new dim, fresh chunks_vec
```

Para OpenAI, truncamento Matryoshka (dimensão menor que a nativa), defina `OPENAI_EMBED_MODEL` e passe a dimensão desejada através da construção do provedor `hk embed` — consulte a [seção de incorporação do manual](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) para obter detalhes.

**Incompatibilidade da versão do esquema / banco de dados corrompido**

Se o banco de dados foi criado com uma versão de esquema mais antiga e a migração falha, ou se os dados parecem incorretos após uma falha:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --context structured --embedding ollama   # optional, for vector search
```

Isso é seguro — o banco de dados é um cache derivado. Todos os dados de origem estão nos arquivos `products/*/releases/*.md`.

---

## Arquivos relacionados

- [CONTRIBUTING.md](CONTRIBUTING.md) — como adicionar produtos, executar testes, enviar solicitações de pull
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 itens acionáveis (CVEs de segurança, descontinuação de modelos, alterações significativas, problemas de configuração)
- [SOURCES.md](SOURCES.md) — cenário de origem de 5 níveis com estratégias de busca
- [synergies/INDEX.md](synergies/INDEX.md) — 12 fluxos de trabalho inter-produto selecionados
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — esquemas SQLite + sqlite-vec
- [test-spec-3.md](test-spec-3.md) (atual) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (histórico) — especificações do conjunto de testes

---

## Licença

MIT. Criado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
