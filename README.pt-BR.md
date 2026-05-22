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
├── test/                    # 382 tests (unit, integration, regression, smoke)
├── data/claude-synergy.db   # SQLite database (created by `hk init`)
├── schema.sql               # Tier 2a tables (products, releases, changes, entities, FTS5, …)
├── schema-vec.sql           # Tier 2b tables (chunks, chunks_vec, chunks_fts)
├── SOURCES.md               # 5-tier source landscape with fetch strategies
└── URGENT_FINDINGS.md       # 23 actionable items surfaced from the corpus
```

**Números atualizados (a partir da versão 1.0.0):** 44 produtos / 1.186 arquivos de lançamento / 6.042 alterações / 1.225 entidades / 12 sinergias / 382 testes.

---

## Status — todas as etapas foram implementadas

| Etapa | Status | O que está incluído |
|------|--------|--------------|
| **1 — corpus em Markdown (base)** | ✅ implementado | O "Study-swarm" indexou 706 arquivos de lançamento de janeiro a maio de 2026; expandido para 1.186 na etapa 4. |
| **2a — SQLite + FTS5 + CLI** | ✅ implementado | CLI `hk`; 15 subcomandos; ingestão em menos de 300ms. |
| **2b — sqlite-vec + Recuperação Contextual** | ✅ implementado | Fornecedor plugável (nenhum/estruturado/ollama/claude-haiku contexto × ollama/voyage embed × nenhum/ollama-judge/voyage/cohere rerank). |
| **3 — sincronização + servidor MCP** | ✅ implementado | `hk fetch / sync / seed-markers`; o `claude-synergy-mcp` expõe 8 ferramentas via stdio. |
| **4a — expansão para além do Anthropic** | ✅ implementado | +15 SDKs MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtrado). |
| **4b — coletor de HTML** | ✅ implementado | GitHub Copilot + VS Code Chat (Windsurf precisa do Playwright — v0.7). |
| **4c — ingestão de HTML para Markdown (turndown)** | ✅ implementado | Corpos de HTML (Copilot/VS Code/Cursor) agora geram linhas individuais para o FTS5 e extração de entidades. |
| **4d — Playwright + registro MCP + configuração YAML** | ✅ implementado | Windsurf via Playwright; Smithery + registro oficial MCP como catálogos da etapa 4; produtos consolidados em `products.yaml`. |

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
| `search` | FTS5 + busca vetorial; reclassificação opcional. Modo padrão para consultas em linguagem natural. |
| `lookup_entity` | Histórico completo de entidades: variáveis de ambiente, comandos, IDs de modelos, CVEs, etc. |
| `latest_releases` | Lançamentos recentes em todos os produtos (ou em um). |
| `get_release` | Conteúdo completo de um lançamento. |
| `list_products` | Enumeração com contagens + versão mais recente. |
| `top_entities` | Entidades mais mencionadas por tipo. |
| `list_synergies` | Fluxos de trabalho entre produtos, selecionados. |
| `read_synergy` | Texto completo de um arquivo de sinergia. |

---

## Fontes — 5 níveis, 6 estratégias de busca

Visão geral completa em [SOURCES.md](SOURCES.md).

- **Nível 1 (Lançamentos do GitHub)** — `gh api repos/<owner>/<repo>/releases` para 22 produtos, incluindo SDKs da Anthropic (7 linguagens), SDKs de Agentes (2), ant CLI, claude-code-action, claude-code-security-review e 15 SDKs do ecossistema MCP.
- **Nível 2 (markdown bruto)** — `anthropics/claude-code/CHANGELOG.md` + `Aider-AI/aider/HISTORY.md`
- **Nível 3 (HTML / RSS)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtrado), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **Nível 4 (catálogo)** — `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`
- **Nível 5 (consultoria)** — Conta X `@ClaudeCodeLog`; espelho de changelog do marckrenn.

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

## Testes

O conjunto de testes Vitest cobre os níveis de unidade / integração / regressão / teste rápido. **[test-spec-3.md](test-spec-3.md) é a documentação atual** a partir da versão v0.7.0; [test-spec.md](test-spec.md) (v1) e [test-spec-2.md](test-spec-2.md) (v2) permanecem no repositório como registro histórico da linhagem do design.

```bash
pnpm test               # unit + integration + regression (~16s, 382 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Estrutura:

| Diretório | O que ele cobre |
|-----|----------------|
| `test/unit/` | por módulo — extração, ingestão, consulta, banco de dados, incorporação, busca híbrida, busca + todos os provedores + busca-rss/changelog/html + busca-mcp-registry + busca-playwright + configuração de produtos. |
| `test/integration/` | teste de ponta a ponta — pipeline, sincronização, servidor MCP (stdio JSON-RPC), CLI. |
| `test/regression/` | §8.1–§8.18 — cada um protege contra um erro real corrigido durante o desenvolvimento. |
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

- **Ollama (padrão)** — certifique-se de que o Ollama está em execução (`ollama serve`) e que o modelo de incorporação foi baixado (`ollama pull nomic-embed-text`).
- **Voyage** — defina `VOYAGE_API_KEY` no seu ambiente. Verifique sua chave de API em [dash.voyageai.com](https://dash.voyageai.com).

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
