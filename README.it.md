<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="docs/logo.png" alt="Claude Synergy" width="280"></p>

# Claude Synergy

Uno specchio locale e interrogabile di tutte le modifiche apportate a Anthropic e agli strumenti di sviluppo AI correlati, oltre a un livello curato di **Synergy** che descrive i flussi di lavoro tra i diversi prodotti, in modo che l'agente LLM all'interno del sistema sappia cosa può fare il sistema stesso.

<!-- Nota: il testo del logo potrebbe apparire sbiadito con il tema scuro di GitHub -->
[![tests](https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg)](https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml) [![npm](https://img.shields.io/npm/v/@mcptoolshop/claude-synergy)](https://www.npmjs.com/package/@mcptoolshop/claude-synergy) [![license](https://img.shields.io/badge/license-MIT-blue)](#license)

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```

**Una singola query FTS (Full-Text Search) rivela una correzione di sicurezza coordinata tra diversi SDK che non era stata segnalata come CVE (Common Vulnerabilities and Exposures) in nessun singolo changelog.** Questo è l'esempio più efficace: emergono dei modelli quando tutti i changelog sono visualizzati fianco a fianco.

Repo: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## Il problema

Claude Code CLI viene rilasciato quasi quotidianamente. L'API di Claude viene rilasciata con una frequenza simile. Gli SDK vengono rilasciati ad ogni nuova versione della CLI. Claude Design, Cowork, Chat e Mobile vengono aggiornati tramite un centro di assistenza unificato. L'ecosistema MCP rilascia circa 200-300 nuovi server a settimana. Inoltre, ci sono 7 principali piattaforme di sviluppo AI (Cursor, Aider, Continue, Copilot, Cody, Windsurf) che rilasciano i propri changelog con cadenze diverse.

L'agente LLM all'interno di uno di questi sistemi ha un limite di aggiornamento delle informazioni. Questo divario si allarga ogni giorno. Vengono introdotte funzionalità di cui l'agente non è a conoscenza. Vengono corretti bug che l'agente continua a "aggirare". Vengono aggiunte variabili d'ambiente e flag che l'agente non suggerisce mai. I flussi di lavoro che coinvolgono più piattaforme rimangono sconosciuti.

**Questo repository colma questo divario.** La sezione "Synergy" lo trasforma da un semplice specchio in un prodotto.

---

## Cosa c'è qui

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

**Dati aggiornati (alla versione v0.7.2):** 44 prodotti / 1.186 file di rilascio / 6.042 modifiche / 1.225 entità / 12 sinergie / 382 test.

---

## Stato — tutti i livelli implementati

| Livello | Stato | Cosa c'è |
|------|--------|--------------|
| **1 — bootstrap (corpus in formato Markdown)** | ✅ implementato | Study-swarm ha analizzato 706 file di rilascio da gennaio a maggio 2026; il numero è stato esteso a 1.186 con il livello 4. |
| **2a — SQLite + FTS5 + CLI** | ✅ implementato | CLI `hk`; 15 sottocomandi; ingestione inferiore a 300 ms. |
| **2b — sqlite-vec + Recupero contestuale** | ✅ implementato | Provider pluggable (nessuno/strutturato/ollama/claude-haiku contesto × ollama/voyage embed × nessuno/ollama-judge/voyage/cohere rerank). |
| **3 — sincronizzazione + server MCP** | ✅ implementato | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` espone 8 strumenti tramite stdio. |
| **4a — estensione oltre Anthropic** | ✅ implementato | +15 SDK MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtrato). |
| **4b — fetcher di pagine HTML** | ✅ implementato | GitHub Copilot + VS Code Chat (Windsurf richiede Playwright — v0.7). |
| **4c — ingestione di HTML in Markdown con turndown** | ✅ implementato | I corpi HTML (Copilot/VS Code/Cursor) ora generano righe separate per ogni elemento per FTS5 + estrazione di entità. |
| **4d — Playwright + registro MCP + configurazione YAML** | ✅ implementato | Windsurf tramite Playwright; Smithery + registro ufficiale MCP come cataloghi del livello 4; i prodotti sono consolidati in `products.yaml`. |

Roadmap per la versione 0.8+: disponibile in [URGENT_FINDINGS.md](URGENT_FINDINGS.md) e nella sezione issues.

---

## Installazione

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

Per lo sviluppo senza compilazione, utilizzare `npx tsx src/cli.ts ...` direttamente. **Attenzione: quirk di pnpm 10:** `pnpm dev` ignora i flag della CLI dopo `--`; utilizzare `npx tsx` per lo sviluppo.

---

## Interfaccia a riga di comando (CLI) — 15 comandi

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

## Esempi di flussi di lavoro

**Come scoprire quando è stata introdotta una variabile d'ambiente di Claude Code:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Monitorare modifiche incompatibili tra diversi SDK:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Pianificare una migrazione di un modello:**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**Ricerca semantica su tutto il corpus di dati:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

La query non utilizza mai "env_scrub"; viene visualizzata tramite somiglianza semantica. La ricerca FTS5 pura non la trova affatto.

---

## Server MCP: concedere ai propri agenti l'accesso a questo corpus di dati

`claude-synergy-mcp` espone 8 strumenti tramite stdio. Integrare con Claude Code (o qualsiasi host MCP) tramite `~/.claude/.mcp.json` o il file `.mcp.json` del proprio progetto:

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

Per il file `.vscode/mcp.json` di GitHub Copilot, utilizzare il wrapper `servers` invece di `mcpServers` (vedere [synergy 12](synergies/12-mcp-config-format-gotcha.md)).

Strumenti disponibili:

| Strumento | Scopo |
|---|---|
| `search` | FTS5 + ricerca vettoriale; opzionale riordinamento. Modalità predefinita per le query in linguaggio naturale. |
| `lookup_entity` | Cronologia esatta delle entità: variabili d'ambiente, comandi, ID dei modelli, CVE, ecc. |
| `latest_releases` | Rilasci recenti in tutti i prodotti (o in uno). |
| `get_release` | Contenuto completo di un rilascio. |
| `list_products` | Elenco con conteggi + ultima versione. |
| `top_entities` | Entità più menzionate per tipo. |
| `list_synergies` | Flussi di lavoro curati tra diversi prodotti. |
| `read_synergy` | Testo completo di un file di integrazione. |

---

## Origini dati: 5 livelli, 6 strategie di acquisizione

Panoramica completa in [SOURCES.md](SOURCES.md).

- **Livello 1 (Rilasci di GitHub)** — `gh api repos/<owner>/<repo>/releases` per 22 prodotti, inclusi gli SDK di Anthropic (7 lingue), gli SDK per agenti (2), l'interfaccia a riga di comando ant, claude-code-action, claude-code-security-review e 15 SDK dell'ecosistema MCP.
- **Livello 2 (markdown grezzo)** — `anthropics/claude-code/CHANGELOG.md` + `Aider-AI/aider/HISTORY.md`
- **Livello 3 (HTML / RSS)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtrato), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **Livello 4 (catalogo)** — `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`
- **Livello 5 (consigli)** — Account X `@ClaudeCodeLog`; mirror del changelog di marckrenn.

Strategie di acquisizione: `gh-releases | rss | raw-changelog | html-scrape | catalog | playwright`. Nuovo prodotto = una voce in `products.yaml`.

---

## Integrazioni: cosa viene sbloccato

12 flussi di lavoro curati tra diversi prodotti. Ognuno descrive un modello di composizione, il trigger che lo rende la risposta corretta e le evidenze del changelog che lo consentono. Esempi:

- **08 — Universal SKILL.md format** (Code + Cursor + Codex): un autore di skill, tre agenti lo leggono.
- **09 — MCP across seven surfaces** (Code + Cursor + Continue + Copilot + Windsurf + Cody + API): un binario, ogni agente.
- **10 — Anthropic BYOK across surfaces**: una chiave API abilita Claude in 7 editor con fatturazione unificata.
- **11 — Claude Code orchestrates Aider**: sposta le modifiche pesanti su un modello economico mentre Claude pianifica.
- **12 — MCP config format gotcha**: Copilot utilizza `servers`; tutti gli altri utilizzano `mcpServers`.

Indice completo in [synergies/INDEX.md](synergies/INDEX.md).

---

## Test

La suite Vitest copre i livelli di test unitari, di integrazione, di regressione e di test preliminari. **[test-spec-3.md](test-spec-3.md) è l'autorità attuale** a partire dalla versione v0.7.0; [test-spec.md](test-spec.md) (v1) e [test-spec-2.md](test-spec-2.md) (v2) rimangono nella repository come registro storico della progettazione.

```bash
pnpm test               # unit + integration + regression (~16s, 382 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Struttura:

| Directory | Cosa copre |
|-----|----------------|
| `test/unit/` | per-module — estrazione, acquisizione, query, database, incorporamento, ricerca ibrida, acquisizione + ogni provider + acquisizione-rss/changelog/html + acquisizione-mcp-registry + acquisizione-playwright + configurazione dei prodotti. |
| `test/integration/` | end-to-end — pipeline, sincronizzazione, server MCP (stdio JSON-RPC), interfaccia a riga di comando. |
| `test/regression/` | §8.1–§8.18: ciascuna sezione protegge da un bug reale corretto durante lo sviluppo. |
| `test/smoke/` | Test completo su un insieme di dati simulato, che rappresenta i veri prodotti (1.143 file). |
| `test/fixtures/` | 3 prodotti fittizi + risposte HTTP simulate (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Registro ufficiale di MCP). |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**Nessuna connessione di rete nei test, di default** — il provider HTTP è simulato tramite `vi.spyOn(global, 'fetch')`. SQLite reale in file temporanei (non `:memory:`) perché le modalità di caricamento dell'estensione `sqlite-vec` variano a seconda delle versioni e il percorso on-disk è quello canonico. Playwright viene caricato tramite importazione dinamica e simulato tramite `vi.doMock('playwright', ...)` in modo che i test passino senza l'installazione di un browser reale.

CI: `.github/workflows/test.yml` esegue `pnpm test:coverage` ad ogni commit e pull request.

---

## Risoluzione dei problemi

**"Database bloccato" o errori WAL**

Un altro processo `hk` (o un server MCP obsoleto) sta mantenendo il database SQLite aperto. Chiudere gli altri processi `hk` e riprovare. Se il problema persiste, verificare la presenza di file `-wal` o `-shm` accanto a `data/claude-synergy.db`: si tratta di file normali in modalità WAL e verranno eliminati quando l'ultima connessione si chiuderà. Non eliminarli mentre un altro processo ha il database aperto.

**"Estensione sqlite-vec non trovata" / caricamento di sqlite-vec fallito**

Il caricamento dell'estensione nativa `sqlite-vec` è fallito. Cause comuni:

1. **Versione di Node troppo vecchia** — `claude-synergy` richiede Node 22 o superiore. Verificare con `node -v`.
2. **Modulo nativo che necessita di essere ricostruito** — eseguire `npm rebuild better-sqlite3` (o `pnpm rebuild better-sqlite3`).
3. **Incompatibilità di piattaforma** — su Windows/ARM, `better-sqlite3` necessita di una toolchain di compilazione C++. Installare [windows-build-tools](https://github.com/nicedoc/windows-build-tools) o Visual Studio Build Tools con "Sviluppo desktop con C++".

Nota: `sqlite-vec` è opzionale. La ricerca per parole chiave FTS5 (`hk query`) funziona senza di essa. Solo `hk embed` e `hk hybrid` richiedono l'estensione vettoriale.

**"Sincronizzazione fallita per il prodotto X" / errori di fetch**

`hk fetch` e `hk sync` chiamano API esterne. Cause comuni:

- **Limite di richieste di GitHub** — la strategia `gh-releases` richiama `gh api`, che utilizza il tuo `GITHUB_TOKEN`. Le richieste non autenticate raggiungono un limite di 60 richieste/ora; autenticati con `gh auth login` o imposta `GITHUB_TOKEN` nell'ambiente.
- **Rete / proxy** — i fetcher RSS e HTML utilizzano `fetch()`. Verificare la connettività e eventuali impostazioni proxy aziendali (`HTTPS_PROXY`).
- **Prodotto sconosciuto** — `hk fetch --product foo` funziona solo per i prodotti elencati in `products.yaml`. Eseguire `hk products` per visualizzare tutti i nomi disponibili.

La sincronizzazione è idempotente: è sicuro rieseguirla anche in caso di un errore parziale. Le release già scaricate vengono ignorate.

**"Provider di embedding non risponde"**

`hk embed` chiama un servizio di embedding esterno:

- **Ollama (predefinito)** — assicurarsi che Ollama sia in esecuzione (`ollama serve`) e che il modello di embedding sia stato scaricato (`ollama pull nomic-embed-text`).
- **Voyage** — impostare `VOYAGE_API_KEY` nell'ambiente. Controllare la chiave API su [dash.voyageai.com](https://dash.voyageai.com).

**Incompatibilità di versione dello schema / database corrotto**

Se il database è stato creato con una versione precedente dello schema e la migrazione fallisce, oppure se i dati sembrano errati dopo un crash:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

Questo è sicuro: il database è una cache derivata. Tutti i dati originali si trovano nei file `products/*/releases/*.md`.

---

## File correlati

- [CONTRIBUTING.md](CONTRIBUTING.md) — come aggiungere prodotti, eseguire test, inviare richieste di modifica (PR).
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 elementi che richiedono un'azione immediata (vulnerabilità di sicurezza, dismissioni di modelli, modifiche incompatibili, problemi di configurazione).
- [SOURCES.md](SOURCES.md) — panorama delle fonti suddiviso in 5 livelli, con strategie di acquisizione.
- [synergies/INDEX.md](synergies/INDEX.md) — 12 flussi di lavoro trasversali tra diversi prodotti, selezionati con cura.
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — schemi SQLite e sqlite-vec.
- [test-spec-3.md](test-spec-3.md) (attuale) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (storico) — specifiche della suite di test.

---

## Licenza

MIT. Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
