<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.md">English</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

Um espelho local e pesquisável de todos os registros de alterações do Anthropic e de outras ferramentas de desenvolvimento de IA, além de uma camada de **Sinergia** que descreve fluxos de trabalho entre diferentes produtos, para que o agente LLM dentro do sistema saiba o que o sistema pode fazer.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


**Uma única consulta FTS (Full-Text Search) revela uma correção de segurança coordenada entre diferentes SDKs que não foi identificada como uma vulnerabilidade (CVE) em nenhum registro de alterações individual.** Esse é o exemplo mais impactante: padrões emergem quando todos os registros de alterações são exibidos lado a lado.

Repositório: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## O problema

O CLI do Claude Code é atualizado quase diariamente. A API do Claude é atualizada com a mesma frequência. Os SDKs são atualizados a cada nova versão do CLI. O Claude Design, Cowork, Chat e Mobile são integrados a um Centro de Ajuda unificado. O ecossistema MCP lança cerca de 200 a 300 novos servidores por semana. Além disso, existem 7 principais plataformas de desenvolvimento de IA (Cursor, Aider, Continue, Copilot, Cody, Windsurf), cada uma com seus próprios registros de alterações e ciclos de lançamento.

O agente LLM em qualquer uma dessas plataformas tem um limite de treinamento fixo. Essa diferença aumenta a cada dia. Recursos que o agente não conhece são lançados. Bugs são corrigidos, mas o agente ainda tenta contorná-los. Variáveis de ambiente e flags são adicionados, mas o agente nunca os sugere. Fluxos de trabalho que combinam diferentes plataformas permanecem desconhecidos.

**Este repositório fecha essa lacuna.** A seção "Sinergia" transforma o projeto em um produto, em vez de apenas um espelho.

---

## O que está incluído

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

**Números atualizados (versão 1.2.1):** 44 produtos / 1.171 arquivos de lançamento / 6.573 alterações / 1.260 entidades / 12 sinergias / 519 testes / 13 ferramentas MCP / 17 comandos de linha de comando. (O corpus foi atualizado via `sync_now` em 24 de maio de 2026.)

---

## Status — todas as etapas foram implementadas

| Etapa | Status | O que está incluído |
|------|--------|--------------|
| **1 — corpus em Markdown (base)** | ✅ implementado | O "Study-swarm" indexou 706 arquivos de lançamento de janeiro a maio de 2026; expandido para 1.186 na etapa 4. |
| **2a — SQLite + FTS5 + CLI** | ✅ implementado | CLI `hk`; 15 subcomandos; ingestão em menos de 300ms. |
| **2b — sqlite-vec + Recuperação Contextual** | ✅ implementado | Fornecedor plugável (nenhum/estruturado/ollama/claude-haiku contexto × ollama/voyage embed × nenhum/ollama-judge/voyage/cohere rerank). |
| **3 — sincronização + servidor MCP** | ✅ implementado | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` expõe 11 ferramentas via stdio (8 na versão original Tier-3, 3 adicionadas na v1.1). |
| **4a — expansão para além do Anthropic** | ✅ implementado | +15 SDKs MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtrado). |
| **4b — coletor de HTML** | ✅ implementado | GitHub Copilot + VS Code Chat (Windsurf precisa do Playwright — v0.7). |
| **4c — ingestão de HTML para Markdown (turndown)** | ✅ implementado | Corpos de HTML (Copilot/VS Code/Cursor) agora geram linhas individuais para o FTS5 e extração de entidades. |
| **4d — Playwright + registro MCP + configuração YAML** | ✅ implementado | Windsurf via Playwright; Smithery + registro oficial MCP como catálogos da etapa 4; produtos consolidados em `products.yaml`. |
| **5 — Navegação com janelas (v1.1) + incorporação da OpenAI** | ✅ implementado | `hk diff` / `hk breaking`, limites de data em todos os comandos de navegação, 3 novas ferramentas MCP (total de 11), provedor de incorporação da OpenAI, dimensão de incorporação configurável, sincronização automática do `claude-code`, analisador genérico `keep-a-changelog`. |
| **6 — v1.2 sync-from-MCP** | ✅ implementado | `sync_status` (frescor por produto, detecção de "obsoleto") e `sync_now` (busca sob demanda → ingestão → incorporação com visualização "dry_run" + bloqueio de concorrência em processo). Elimina a lacuna onde um agente poderia consultar o corpus, mas não atualizá-lo. **Corrige também:** um erro em que a exclusão de marcadores, ao usar `INSERT OR REPLACE INTO products`, causava uma exclusão em cascata na chave estrangeira `markers`, reiniciando silenciosamente o cursor "since" de cada produto a cada ingestão (regressão §8.20). |
| **6.1 — Centralização do marcador de recuperação (versão 1.2.1)** | ✅ implementado | Centralizei a função `writeMarker` em `fetchOne` para que cada recuperação bem-sucedida atualize o marcador. Estratégias que retornavam 0 itens datados dentro do período especificado (principalmente o "changelog" bruto do `aider`) nunca escreviam um marcador e, portanto, baixavam o arquivo `HISTORY.md` a cada sincronização. Renomeei a estratégia `webfetch` não implementada para `manual` para as APIs `claude-api` e `anthropic-apps`. Agora, o `sync_status` exibe os produtos configurados como "manual" em vez de "nunca" e os exclui do processo `stale_only` (regressão §8.21). |
| **7 — v1.3 cs-actions:v1, sintetizador ajustado** | ✅ implementado | Primeiro modelo derivado treinado no conjunto de dados. Converte uma entrada do changelog em um item de ação estrito em formato JSON: `{kind, severity, subject, action_text, deadline, tags}`. Qwen2.5-7B + LoRA em 242 entradas de `dataset/changelog-actions/v1/`, formato GGUF q8_0, implantado via Ollama. Avaliação para lançamento: **88,1% de precisão em "kind" / 79,7% de precisão em "severity" / 0,842 de macro-F1** em comparação com a referência em 59 entradas estratificadas (+10,1 pontos percentuais / +27,2 pontos percentuais / +0,041 em relação à versão base qwen3:8b). Marcado como `cs-actions-v1`; o relatório de avaliação está anexado à [versão do GitHub](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) como um arquivo único para download. **Limitação documentada da versão 1:** viés anti-"desconhecido" (precisão de 1,000 / revocação de 0,286) — o modelo classifica incorretamente entradas ambíguas. Consulte o [manual → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) + [`dataset/README.md`](dataset/README.md) + [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) + [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md). |

Roteiro para a versão 0.8+: acompanhado em [URGENT_FINDINGS.md](URGENT_FINDINGS.md) e nas issues.

---

## Segurança e modelo de dados

Esta ferramenta é executada localmente. **Dados acessados:** um banco de dados SQLite derivado e arquivos de lançamento em formato Markdown — todos podem ser recriados. **Rede:** apenas conexões HTTPS de saída quando você executa `hk fetch`/`hk sync` (API do GitHub, feeds RSS, páginas de histórico de alterações, registros MCP) ou `hk embed` com um provedor remoto (Voyage, Cohere). **Credenciais:** lê as variáveis de ambiente `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` — nunca são registradas e nunca são armazenadas em disco. **Não há telemetria.** Consulte [SECURITY.md](SECURITY.md) para obter informações sobre a política de relatórios.

---

## Instalação

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

Para desenvolvimento sem compilação, use `npx tsx src/cli.ts ...` diretamente. **Particularidade do pnpm 10:** `pnpm dev` ignora os flags do CLI após `--`; use `npx tsx` para desenvolvimento.

---

## Interface de linha de comando (CLI) — 15 comandos

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

**Novidades na v1.1:** `hk diff` e `hk breaking` respondem a "o que mudou recentemente?" sem a necessidade de um termo de pesquisa. Os limites de data são uniformes: todos os comandos de navegação aceitam `--since` e `--until` em formato `AAAA-MM-DD` (ou ISO 8601 completo), ou em formato relativo (`7d`, `2w`, `3m`, `1y`).

---

## Exemplos de fluxos de trabalho

**Como descobrir quando uma variável de ambiente do Claude Code foi introduzida:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Rastrear mudanças incompatíveis entre diferentes SDKs:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Planejar uma migração de modelo:**
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

A consulta nunca menciona "env_scrub" — o sistema o identifica por similaridade semântica. O sistema de busca tradicional (FTS5) não o encontra.

**O que mudou no claude-code esta semana:**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**Navegue pelas alterações significativas em todo o conjunto de dados:**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

Não é necessário um termo de pesquisa — `hk breaking` é a resposta para "alguma alteração importante ocorreu recentemente?".

---

## Servidor MCP — forneça acesso a este corpus para seus agentes

`claude-synergy-mcp` expõe 8 ferramentas via stdio. Conecte-se ao Claude Code (ou qualquer host MCP) através de `~/.claude/.mcp.json` ou do arquivo `.mcp.json` do seu projeto:

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

Para o arquivo `.vscode/mcp.json` do GitHub Copilot, use o wrapper `servers` em vez de `mcpServers` (veja [synergy 12](synergies/12-mcp-config-format-gotcha.md)).

Ferramentas disponíveis:

| Ferramenta | Propósito |
|---|---|
| `search` | FTS5 + vet híbrido; reclassificação opcional. Modo padrão para consultas em linguagem natural. (+ limite superior de data `until`) |
| `lookup_entity` | Histórico completo de entidades: variáveis de ambiente, comandos, IDs de modelos, CVEs, etc. |
| `latest_releases` | Lançamentos recentes em todos os produtos (ou em um). (+ limite inferior de data `since`) |
| `get_release` | Conteúdo completo de um lançamento. |
| `list_products` | Enumeração com contagens + versão mais recente. |
| `top_entities` | Entidades mais mencionadas por tipo. |
| `list_synergies` | Fluxos de trabalho entre produtos. (+ filtro de produto opcional) |
| `read_synergy` | Texto completo de um arquivo de sinergia. |
| `get_changes_since` | **Novo.** Alterações em uma janela de tempo, agrupadas por produto+versão. Entradas: `since` (obrigatório), `until?`, `product?`, `kind?`, `limit?`. |
| `search_breaking_changes` | **Novo.** Lista simples de alterações significativas — não é necessário um termo de pesquisa. Entradas: `product?`, `since?`, `until?`, `limit?`. |
| `compare_versions` | **Novo.** Todas as alterações entre duas versões de um produto. Entradas: `product`, `from_version`, `to_version`. |
| `sync_status` | **v1.2.** Frescor da sincronização por produto: última data de busca, horas desde a última busca, número de lançamentos ingeridos. Entradas: `product?`, `stale_only?`, `stale_hours?`. Use ANTES de confiar em `latest_releases` para saber se o corpus está desatualizado. |
| `sync_now` | **v1.2.** Atualização sob demanda (espelha `hk sync`). Entradas: `product?`, `dry_run?`, `include_ingest?`, `include_embed?`, `timeout_ms?`. Rejeita com `InvalidParams` se outro `sync_now` já estiver em execução. NÃO faz commit no Git. |

As ferramentas da versão 1.1 espelham `hk diff` / `hk breaking` e o fluxo de trabalho de comparação de versões que anteriormente exigia scripts. As ferramentas de sincronização da versão 1.2 eliminam a lacuna onde uma sessão poderia consultar o corpus, mas não atualizá-lo: `sync_status` informa sobre a obsolescência, `sync_now` executa o pipeline. Consulte [manual → servidor MCP](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/) para os esquemas de entrada completos.

---

## Fontes — 5 níveis, 6 estratégias de busca

Visão geral completa em [SOURCES.md](SOURCES.md).

- **Nível 1 (Lançamentos do GitHub)** — `gh api repos/<owner>/<repo>/releases` para 23 produtos, incluindo SDKs da Anthropic (7 linguagens), SDKs de Agentes (2), ant CLI, **claude-code** (agora sincronizado automaticamente via gh-releases a partir da v1.1 — anteriormente, a sincronização era manual), claude-code-action, claude-code-security-review e 15 SDKs do ecossistema MCP.
- **Nível 2 (markdown bruto)** — `Aider-AI/aider/HISTORY.md`. O analisador genérico `keep-a-changelog` (v1.1+) também está disponível para qualquer produto cujo código-fonte seja um arquivo CHANGELOG.md no formato Keep-a-Changelog — configure-o através de uma entrada em `products.yaml`.
- **Nível 3 (HTML / RSS)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtrado), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`.
- **Nível 4 (catálogo)** — `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`.
- **Nível 5 (aconselhamento)** — Conta X `@ClaudeCodeLog`; espelho de changelog de marckrenn.

Estratégias de busca: `gh-releases | rss | raw-changelog | html-scrape | catalog | playwright`. Novo produto = uma entrada em `products.yaml`.

---

## Sinergias — o que é desbloqueado

12 fluxos de trabalho entre produtos, selecionados. Cada um descreve um padrão de composição, o gatilho que o torna a resposta correta e a evidência do changelog que o possibilita. Exemplos:

- **08 — Universal SKILL.md format** (Code + Cursor + Codex): um autor de skill, três agentes o leem.
- **09 — MCP across seven surfaces** (Code + Cursor + Continue + Copilot + Windsurf + Cody + API): um binário, todos os agentes.
- **10 — Anthropic BYOK across surfaces**: uma chave de API alimenta o Claude em 7 editores com faturamento unificado.
- **11 — Claude Code orquestra Aider**: transfere edições pesadas para um modelo mais barato enquanto o Claude planeja.
- **12 — MCP config format gotcha**: o Copilot usa `servers`; todos os outros usam `mcpServers`.

Índice completo em [synergies/INDEX.md](synergies/INDEX.md).

---

## Conjuntos de dados e modelos ajustados

O conjunto de dados possui uma camada de aplicação: **conjuntos de dados** selecionados derivados de descrições de alterações e **modelos ajustados** treinados nesses conjuntos de dados. O conjunto de dados é o artefato neste repositório; o modelo é a aplicação.

### `dataset/changelog-actions/v1` — 301 entradas

Cada entrada associa uma descrição de alteração do conjunto de dados a um item de ação escrito manualmente: `{kind, severity, subject, action_text, deadline, tags}`. Taxonomia de 8 categorias para "kind" (`breaking | deprecation | security | feature | fix | performance | docs | unknown`), divisão estratificada de 80/20 para treinamento/validação, revisado por humanos e por um modelo de referência qwen3:8b (92,4% de concordância). Consulte [`dataset/README.md`](dataset/README.md) para a tabela de distribuição, [`SCHEMA.md`](dataset/changelog-actions/SCHEMA.md) para o contrato de campo a campo e [`STYLE.md`](dataset/changelog-actions/STYLE.md) para as regras de escrita de `action_text`.

### `cs-actions:v1` — sintetizador ajustado

Primeiro modelo treinado no conjunto de dados. Qwen2.5-7B-Instruct + LoRA (rank-256 / all-linear, 100 etapas de QLoRA em 242 entradas de treinamento), formato GGUF q8_0, implantado via Modelfile de duas etapas do Ollama (`cs-actions-base` + `cs-actions:v1`).

**Avaliação para lançamento** (59 entradas estratificadas, três execuções, todas aprovadas, sem erros de análise):

| Métrica | qwen3:8b base | cs-actions:v1 | Diferença |
|---|---|---|---|
| Precisão em "kind" vs. referência | 78.0% | **88.1%** | +10,1 pp |
| Precisão em "severity" vs. referência | 52.5% | **79.7%** | +27,2 pp |
| Macro-F1 (classes com muitos exemplos) | 0.801 | **0.854** | +0.053 |
| Execução 3 — ablação de "hint" (com "hint" / sem "hint") | — | 0.842 / 0.777 | 6,5 pontos → zona alvo |

Critério de aprovação para lançamento `qwen3-vs-cs-actions ≥ qwen3-vs-GT` (`0,780 ≥ 0,780`) — APROVADO ✓. Resultados detalhados para cada entrada em [`eval-report.v1.json`](dataset/changelog-actions/v1/eval-report.v1.json), também anexado à [versão do GitHub](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) como um arquivo único para download.

**Limitação documentada da versão 1 — viés anti-"desconhecido".** "desconhecido" é a única classe em que cs-actions:v1 tem desempenho inferior ao qwen3:8b (F1 de 0,444 vs 0,545). Precisão de 1,000 / revocação de 0,286 — quando a entrada é genuinamente ambígua, o modelo escolhe uma categoria específica em vez de abster-se. Herda o comportamento padrão da família qwen, que não foi totalmente substituído pelo LoRA. Os usuários devem tratar uma taxa de "kind: "desconhecido"" inferior ao esperado como um sinal para encaminhar lotes para revisão humana. O [plano da versão 2](dataset/README.md) aborda isso com a ampliação da classe "desconhecido" e a randomização de "hints".

**Não distribuído através deste repositório** — o arquivo GGUF q8_0 tem aproximadamente 5 GB e o checkpoint combinado tem aproximadamente 15 GB. O conjunto de dados e o processo de construção são o que está publicado; o modelo é reconstruído localmente, conforme descrito em [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) (processo manual em 4 etapas, leva cerca de 88 minutos para ser carregado em uma placa RTX 5080 para laptop com 16 GB de VRAM). O contrato de validação para a versão final está em [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md).

Um guia completo de uso — incluindo a invocação local via Ollama, a exigência de formatação "json" para cada requisição e o processo de reconstrução — está disponível na página do [manual → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/).

---

## Testes

O conjunto de testes Vitest cobre os níveis de unidade / integração / regressão / teste rápido. **[test-spec-3.md](test-spec-3.md) é a documentação atual** a partir da versão v0.7.0; [test-spec.md](test-spec.md) (v1) e [test-spec-2.md](test-spec-2.md) (v2) permanecem no repositório como registro histórico da linhagem do design.

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Estrutura:

| Diretório | O que ele cobre |
|-----|----------------|
| `test/unit/` | por módulo — extração, ingestão, consulta (incl. `until` / navegação / desde / comparação), banco de dados (incl. migração da configuração de dimensão v3), incorporação, híbrido, busca + todos os provedores (Ollama / Voyage / **OpenAI**) + busca-rss/changelog (incl. analisador **keep-a-changelog**)/html + busca-mcp-registry + busca-playwright + configuração de produtos + ingestão/consulta de sinergia. |
| `test/integration/` | fim a fim — pipeline, sincronização, servidor MCP (JSON-RPC padrão, 13 ferramentas, incluindo `sync_status` / `sync_now`), linha de comando (incluindo `hk diff`, `hk breaking`). |
| `test/regression/` | §8.1–§8.19 — cada um protege contra um bug real corrigido durante o desenvolvimento (§8.19: ghReleases preserva os itens dentro da janela durante a paginação inicial). |
| `test/smoke/` | Teste completo com um conjunto de dados simulado, representando os arquivos reais do diretório `products/` (1.143 arquivos). |
| `test/fixtures/` | 3 produtos simulados + respostas HTTP simuladas (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Registro oficial do MCP). |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**Sem conexão de rede nos testes por padrão** — o provedor HTTP é simulado usando `vi.spyOn(global, 'fetch')`. O SQLite real é usado em arquivos temporários (não `:memory:`) porque a forma como a extensão `sqlite-vec` é carregada varia entre as versões, e o armazenamento em disco é o caminho padrão. O Playwright é carregado dinamicamente e simulado usando `vi.doMock('playwright', ...)` para que os testes sejam executados sem a necessidade de instalar um navegador real.

CI: O arquivo `.github/workflows/test.yml` executa `pnpm test:coverage` a cada envio e solicitação de alteração.

---

## Solução de problemas

**"Banco de dados bloqueado" ou erros WAL**

Outro processo `hk` (ou um servidor MCP desatualizado) está mantendo o banco de dados SQLite aberto. Feche outros processos `hk` e tente novamente. Se o problema persistir, verifique se há arquivos `-wal` ou `-shm` próximos a `data/claude-synergy.db` — esses são arquivos normais do modo WAL e serão removidos quando a última conexão for fechada. Não os exclua enquanto outro processo tiver o banco de dados aberto.

**"Extensão sqlite-vec não encontrada" / falha ao carregar sqlite-vec**

A extensão nativa `sqlite-vec` falhou ao carregar. Causas comuns:

1. **Versão do Node muito antiga** — `claude-synergy` requer Node 22+. Verifique com `node -v`.
2. **Módulo nativo precisa ser recompilado** — execute `npm rebuild better-sqlite3` (ou `pnpm rebuild better-sqlite3`).
3. **Incompatibilidade de plataforma** — no Windows/ARM, `better-sqlite3` precisa de um conjunto de ferramentas de compilação C++. Instale o [windows-build-tools](https://github.com/nicedoc/windows-build-tools) ou as Ferramentas de Build do Visual Studio com "Desenvolvimento de desktop com C++".

Observação: `sqlite-vec` é opcional. A pesquisa de palavras-chave FTS5 (`hk query`) funciona sem ela. Apenas `hk embed` e `hk hybrid` requerem a extensão de vetor.

**"Falha na sincronização do produto X" / erros de fetch**

`hk fetch` e `hk sync` chamam APIs externas. Causas comuns:

- **Limite de taxa do GitHub** — a estratégia `gh-releases` chama `gh api`, que usa seu `GITHUB_TOKEN`. As solicitações não autenticadas atingem 60 requisições/hora; autentique-se com `gh auth login` ou defina `GITHUB_TOKEN` no seu ambiente.
- **Rede / proxy** — os buscadores RSS e HTML usam `fetch()`. Verifique a conectividade e quaisquer configurações de proxy corporativos (`HTTPS_PROXY`).
- **Produto desconhecido** — `hk fetch --product foo` funciona apenas para produtos listados em `products.yaml`. Execute `hk products` para ver todos os nomes disponíveis.

A sincronização é idempotente — é seguro executá-la novamente após uma falha parcial. As versões já baixadas são ignoradas.

**"Provedor de incorporação não responde"**

`hk embed` chama um serviço de incorporação externo:

- **Ollama (padrão, 768 dimensões)** — certifique-se de que o Ollama está em execução (`ollama serve`) e que o modelo de incorporação foi baixado (`ollama pull nomic-embed-text`).
- **Voyage (1024 dimensões)** — defina a variável de ambiente `VOYAGE_API_KEY`. Verifique sua chave de API em [dash.voyageai.com](https://dash.voyageai.com).
- **OpenAI (1536 dimensões por padrão, configurável)** — defina a variável `OPENAI_API_KEY`. O modelo padrão é `text-embedding-3-small`; você pode alterá-lo usando a variável `OPENAI_EMBED_MODEL` (por exemplo, `text-embedding-3-large` para 3072 dimensões). Use-o através de `hk hybrid --embed openai` ou `hk embed --embed openai`.

**Incompatibilidade de dimensões de incorporação ao alternar de provedor**

Cada provedor produz vetores de uma dimensão fixa (Ollama 768, Voyage 1024, OpenAI 1536 por padrão — o OpenAI suporta dimensões configuráveis dentro do tamanho nativo do modelo). O banco de dados armazena a dimensão ativa em `schema_meta.embedding_dim`. A alteração de provedores entre dimensões diferentes, enquanto existem fragmentos, gera um erro `EMBEDDING_DIM_MISMATCH` (um erro da aplicação) em vez de corromper silenciosamente a tabela de vetores. Para alterar:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --embed openai     # new provider, new dim, fresh chunks_vec
```

Para a truncagem Matryoshka do OpenAI (dimensão menor que a nativa), defina a variável `OPENAI_EMBED_MODEL` e passe a dimensão desejada através da construção do provedor no comando `hk embed` — consulte a [seção de incorporação do manual](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) para obter detalhes.

**Incompatibilidade de versão do esquema / banco de dados corrompido**

Se o banco de dados foi criado com uma versão de esquema mais antiga e a migração falha, ou se os dados parecem incorretos após uma falha:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

Isso é seguro — o banco de dados é um cache derivado. Todos os dados de origem estão nos arquivos `products/*/releases/*.md`.

---

## Arquivos relacionados

- [CONTRIBUTING.md](CONTRIBUTING.md) — como adicionar produtos, executar testes e enviar solicitações de alteração (PRs).
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 itens que exigem ação imediata (vulnerabilidades de segurança, descontinuação de modelos, alterações incompatíveis, problemas de configuração).
- [SOURCES.md](SOURCES.md) — panorama de fontes em 5 níveis, com estratégias de obtenção.
- [synergies/INDEX.md](synergies/INDEX.md) — 12 fluxos de trabalho entre produtos, selecionados e organizados.
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — esquemas SQLite e sqlite-vec.
- [test-spec-3.md](test-spec-3.md) (atual) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (histórico) — especificações do conjunto de testes.

---

## Licença

MIT. Desenvolvido por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
