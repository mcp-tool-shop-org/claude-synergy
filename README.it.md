<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

Un mirror locale e interrogabile di tutte le modifiche apportate a Anthropic e agli strumenti di sviluppo AI correlati, oltre a un livello curato di **"Synergy"** che descrive i flussi di lavoro tra i diversi prodotti, in modo che l'agente LLM all'interno del sistema sappia cosa può fare il sistema stesso.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


**Una singola query FTS (Full-Text Search) rivela una correzione di sicurezza coordinata tra diversi SDK che non era stata segnalata come CVE (Common Vulnerabilities and Exposures) in nessuna delle singole liste di modifiche.** Questo è l'esempio più efficace: emergono dei modelli quando tutte le liste di modifiche sono confrontate fianco a fianco.

Repository: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## Il problema

Claude Code CLI viene aggiornato quasi quotidianamente. L'API di Claude viene aggiornata con la stessa frequenza. Gli SDK vengono aggiornati ad ogni rilascio della CLI. Claude Design, Cowork, Chat e la versione mobile vengono aggiornati tramite un unico centro di assistenza. L'ecosistema MCP introduce circa 200-300 nuovi server ogni settimana. Inoltre, ci sono 7 principali piattaforme di sviluppo AI (Cursor, Aider, Continue, Copilot, Cody, Windsurf) che pubblicano le proprie liste di modifiche con cadenze diverse.

L'agente LLM all'interno di uno di questi sistemi ha un limite di aggiornamento delle informazioni. Questo divario si allarga ogni giorno. Vengono introdotte funzionalità di cui l'agente non è a conoscenza. Vengono corretti bug che l'agente continua a "aggirare". Vengono aggiunte variabili d'ambiente e flag che l'agente non suggerisce. I flussi di lavoro che coinvolgono più piattaforme rimangono sconosciuti.

**Questo repository colma questo divario.** La sezione "Synergy" lo trasforma in un prodotto, invece di essere solo un mirror.

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
├── test/                    # 508 tests (unit, integration, regression, smoke)
├── data/claude-synergy.db   # SQLite database (created by `hk init`)
├── schema.sql               # Tier 2a tables (products, releases, changes, entities, FTS5, …)
├── schema-vec.sql           # Tier 2b tables (chunks, chunks_vec, chunks_fts)
├── SOURCES.md               # 5-tier source landscape with fetch strategies
└── URGENT_FINDINGS.md       # 23 actionable items surfaced from the corpus
```

**Dati aggiornati (alla versione v1.2.0):** 44 prodotti / 1.171 file di rilascio / 6.573 modifiche / 1.260 entità / 12 sinergie / 517 test / 13 strumenti MCP / 17 comandi CLI. (Il database è stato aggiornato tramite `sync_now` il 24 maggio 2026.)

---

## Stato — tutti i livelli implementati

| Livello | Stato | Cosa c'è |
|------|--------|--------------|
| **1 — corpus in formato Markdown (bootstrap)** | ✅ implementato | Study-swarm ha inserito 706 file di rilascio da gennaio a maggio 2026; ampliato a 1.186 con il livello 4. |
| **2a — SQLite + FTS5 + CLI** | ✅ implementato | CLI `hk`; 15 sottocomandi; ingestione inferiore a 300ms. |
| **2b — sqlite-vec + Recupero contestuale** | ✅ implementato | Provider pluggable (nessuno/strutturato/ollama/claude-haiku contesto × ollama/voyage embed × nessuno/ollama-judge/voyage/cohere rerank). |
| **3 — sincronizzazione + server MCP** | ✅ implementato | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` espone 13 strumenti tramite stdio (8 nella versione originale, 3 aggiunti nella v1.1, 2 aggiunti nella v1.2). |
| **4a — estensione oltre Anthropic** | ✅ implementato | +15 SDK MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtrato). |
| **4b — fetcher per l'estrazione da HTML** | ✅ implementato | GitHub Copilot + VS Code Chat (Windsurf richiede Playwright — v0.7). |
| **4c — ingestione da HTML a Markdown con turndown** | ✅ implementato | I corpi HTML (Copilot/VS Code/Cursor) ora generano righe separate per ogni elemento per FTS5 + estrazione di entità. |
| **4d — Playwright + registro MCP + configurazione YAML** | ✅ implementato | Windsurf tramite Playwright; Smithery + registro ufficiale MCP come cataloghi del livello 4; prodotti consolidati in `products.yaml`. |
| **5 — v1.1: navigazione con finestre + integrazione OpenAI** | ✅ implementato | `hk diff` / `hk breaking`, limiti di data per tutti i comandi di navigazione, 3 nuovi strumenti MCP (totale di 11), provider di embedding OpenAI, dimensione dell'embedding configurabile, sincronizzazione automatica di `claude-code`, parser generico `keep-a-changelog`. |
| **6 — v1.2: sincronizzazione da MCP** | ✅ implementato | `sync_status` (freschezza per prodotto, rilevamento di dati obsoleti) e `sync_now` (recupero su richiesta → ingestione → embedding con anteprima `dry_run` + blocco di concorrenza in-process). Risolve il problema in cui un'applicazione poteva interrogare il database ma non aggiornarlo. **Corregge anche:** un bug che causava la cancellazione di tutti i marker quando `INSERT OR REPLACE INTO products` propagava una cancellazione sulla chiave esterna `markers`, reimpostando silenziosamente il cursore `since` di ogni prodotto ad ogni ingestione (regressione §8.20). |

Roadmap per la versione 0.8+: disponibile in [URGENT_FINDINGS.md](URGENT_FINDINGS.md) e nella sezione issues.

---

## Sicurezza e modello dei dati

Questo strumento viene eseguito localmente. **Dati utilizzati:** un database SQLite derivato e file di rilascio in formato Markdown, tutti ricostruibili. **Rete:** connessioni HTTPS in uscita solo quando si eseguono i comandi `hk fetch`/`hk sync` (API di GitHub, feed RSS, pagine di changelog, registri MCP) o `hk embed` con un provider remoto (Voyage, Cohere). **Segreti:** legge le variabili d'ambiente `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` e non le registra né le memorizza su disco. **Nessuna telemetria.** Consultare il file [SECURITY.md](SECURITY.md) per le informazioni sulla politica di segnalazione.

---

## Installazione

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

Per lo sviluppo senza compilazione, utilizzare direttamente `npx tsx src/cli.ts ...`. **Avviso pnpm 10:** `pnpm dev` ignora i flag della CLI dopo `--`; utilizzare `npx tsx` per lo sviluppo.

---

## Interfaccia della CLI: 15 comandi

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

**Novità nella v1.1:** `hk diff` e `hk breaking` rispondono alla domanda "cosa è cambiato di recente?" senza richiedere un termine di ricerca. I limiti di data sono uniformi: ogni comando di navigazione accetta `--since` e `--until` in formato `YYYY-MM-DD` (o ISO 8601 completo), oppure in formato relativo (`7d`, `2w`, `3m`, `1y`).

---

## Esempi di flussi di lavoro

**Trovare quando è stata introdotta una variabile d'ambiente Claude Code:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Tracciare una modifica incompatibile tra SDK:**
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

**Ricerca semantica su tutto il corpus:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

La query non utilizza mai "env_scrub"; l'interfaccia utente lo presenta tramite somiglianza semantica. La ricerca FTS5 pura non lo trova affatto.

**Cosa è cambiato in claude-code questa settimana:**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**Esplora le modifiche che interrompono il funzionamento in tutto il database:**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

Non è necessario un termine di ricerca — `hk breaking` è la risposta alla domanda "è cambiato qualcosa di importante di recente?".

---

## Server MCP: fornisce ai tuoi agenti l'accesso a questo corpus

`claude-synergy-mcp` espone 8 strumenti tramite stdin. Integra con Claude Code (o qualsiasi host MCP) tramite `~/.claude/.mcp.json` o il file `.mcp.json` del tuo progetto:

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

Strumenti esposti:

| Strumento | Scopo |
|---|---|
| `search` | FTS5 + vettoriale; opzionale riordinamento. Modalità predefinita per le query in linguaggio naturale. (+ limite superiore di data `until`) |
| `lookup_entity` | Cronologia esatta delle entità: variabili d'ambiente, comandi, ID dei modelli, CVE, ecc. |
| `latest_releases` | Rilasci recenti per prodotto (o per uno specifico). (+ limite inferiore di data `since`) |
| `get_release` | Contenuto completo di un rilascio. |
| `list_products` | Elenco con conteggi + ultima versione. |
| `top_entities` | Entità più menzionate per tipo. |
| `list_synergies` | Flussi di lavoro curati tra prodotti. (+ filtro opzionale per `prodotto`) |
| `read_synergy` | Testo completo di un file di sinergia. |
| `get_changes_since` | **Nuovo.** Modifiche in un intervallo di tempo, raggruppate per prodotto+versione. Input: `since` (obbligatorio), `until?`, `product?`, `kind?`, `limit?`. |
| `search_breaking_changes` | **Nuovo.** Elenco piatto delle modifiche che interrompono il funzionamento — non è necessario un termine di ricerca. Input: `product?`, `since?`, `until?`, `limit?`. |
| `compare_versions` | **v1.1.** Tutte le modifiche tra due versioni dello stesso prodotto. Input: `product`, `from_version`, `to_version`. |
| `sync_status` | **v1.2.** Freschezza della sincronizzazione per prodotto — ultimo timestamp di recupero, ore dall'ultimo recupero, numero di rilasci ingeriti. Input: `product?`, `stale_only?`, `stale_hours?`. Utilizzare PRIMA di fidarsi di `latest_releases` per sapere se il database è obsoleto. |
| `sync_now` | **v1.2.** Aggiornamento su richiesta (simile a `hk sync`). Input: `product?`, `dry_run?`, `include_ingest?`, `include_embed?`, `timeout_ms?`. Rifiuta con `InvalidParams` se un altro `sync_now` è già in corso. NON commette le modifiche nel repository git. |

Gli strumenti della v1.1 replicano `hk diff` / `hk breaking` e il flusso di lavoro di confronto delle versioni che in precedenza richiedeva script. Gli strumenti di sincronizzazione della v1.2 colmano la lacuna in cui una sessione poteva interrogare il database ma non aggiornarlo — `sync_status` segnala l'obsolescenza, `sync_now` esegue la pipeline. Consultare [handbook → server MCP](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/) per gli schemi di input completi.

---

## Fonti: 5 livelli, 6 strategie di acquisizione

Panoramica completa in [SOURCES.md](SOURCES.md).

- **Livello 1 (GitHub Releases)** — `gh api repos/<owner>/<repo>/releases` per 23 prodotti, tra cui gli SDK di Anthropic (7 lingue), gli SDK per agenti (2), l'interfaccia a riga di comando di ant, **claude-code** (ora sincronizzato automaticamente tramite gh-releases dalla versione 1.1 – precedentemente configurato manualmente), claude-code-action, claude-code-security-review e 15 SDK dell'ecosistema MCP.
- **Livello 2 (markdown grezzo)** — `Aider-AI/aider/HISTORY.md`. È disponibile anche il parser generico `keep-a-changelog` (versione 1.1+) per qualsiasi prodotto il cui sorgente sia un file CHANGELOG.md nel formato Keep-a-Changelog; la configurazione avviene tramite una voce in `products.yaml`.
- **Livello 3 (HTML / RSS)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtrato), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`.
- **Livello 4 (catalogo)** — `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`.
- **Livello 5 (informativo)** — Account X `@ClaudeCodeLog`; mirror del changelog di marckrenn.

Strategie di acquisizione: `gh-releases | rss | raw-changelog | html-scrape | catalog | playwright`. Nuovo prodotto = una voce in `products.yaml`.

---

## Sinergie: cosa viene sbloccato

12 flussi di lavoro curati tra prodotti. Ognuno descrive un modello di composizione, il trigger che lo rende la risposta corretta e la prova del changelog che lo rende possibile. Esempi:

- **08 — Formato SKILL universale .md** (Codice + Puntatore + Codex): un autore di competenze, tre agenti lo leggono.
- **09 — MCP su sette superfici** (Codice + Puntatore + Continua + Copilot + Windsurf + Cody + API): un binario, ogni agente.
- **10 — Anthropic BYOK su diverse superfici**: una chiave API alimenta Claude in 7 editor con fatturazione unificata.
- **11 — Claude Code orchestra Aider**: sposta le modifiche più pesanti a un modello economico, mentre Claude pianifica.
- **12 — Formato di configurazione MCP: attenzione!** Copilot utilizza `servers`; tutti gli altri utilizzano `mcpServers`.

Indice completo in [synergies/INDEX.md](synergies/INDEX.md).

---

## Test

La suite di test Vitest copre i livelli di unità, integrazione, regressione e test preliminari. **[test-spec-3.md](test-spec-3.md) è la documentazione di riferimento corrente** a partire dalla versione 0.7.0; [test-spec.md](test-spec.md) (versione 1) e [test-spec-2.md](test-spec-2.md) (versione 2) rimangono nel repository come documentazione storica della progettazione.

```bash
pnpm test               # unit + integration + regression (~36s, 517 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Layout:

| Directory | Cosa copre |
|-----|----------------|
| `test/unit/` | per modulo: estrazione, acquisizione, interrogazione (inclusi `until` / navigazione / da / confronto), database (inclusa la migrazione della configurazione dimensionale v3), incorporamento, ibrido, acquisizione + ogni provider (Ollama / Voyage / **OpenAI**) + acquisizione-RSS/changelog (incluso il parser **keep-a-changelog**) / HTML + acquisizione-registro-MCP + acquisizione-playwright + configurazione-prodotti + acquisizione/interrogazione sinergica. |
| `test/integration/` | end-to-end: pipeline, sincronizzazione, server MCP (JSON-RPC standard input/output, 13 strumenti inclusi `sync_status` / `sync_now`), interfaccia a riga di comando (inclusi `hk diff`, `hk breaking`). |
| `test/regression/` | §8.1–§8.19 — ciascuno protegge da un reale bug corretto durante lo sviluppo (§8.19: la paginazione early-exit di ghReleases preserva gli elementi all'interno dell'intervallo). |
| `test/smoke/` | Test completo con l'intero corpus rispetto alla directory `products/` (1.143 file). |
| `test/fixtures/` | 3 prodotti fittizi + risposte HTTP simulate (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Registro MCP ufficiale). |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**Nessuna connessione di rete nei test per impostazione predefinita** — le chiamate HTTP ai provider sono simulate tramite `vi.spyOn(global, 'fetch')`. SQLite reale in file temporanei (non `:memory:`) perché la semantica di caricamento dell'estensione `sqlite-vec` varia tra le versioni e il percorso on-disk è quello canonico. Playwright viene caricato tramite importazione dinamica e simulato tramite `vi.doMock('playwright', ...)` in modo che i test passino senza l'installazione di un browser reale.

CI: `.github/workflows/test.yml` esegue `pnpm test:coverage` ad ogni commit e pull request.

---

## Risoluzione dei problemi

**"Database bloccato" o errori WAL**

Un altro processo `hk` (o un server MCP obsoleto) sta mantenendo il database SQLite aperto. Chiudere gli altri processi `hk`, quindi riprovare. Se il problema persiste, verificare la presenza di file `-wal` o `-shm` accanto a `data/claude-synergy.db`: si tratta di file normali in modalità WAL e verranno eliminati quando l'ultima connessione si chiuderà. Non eliminarli mentre un altro processo ha il database aperto.

**"Estensione sqlite-vec non trovata" / caricamento di sqlite-vec non riuscito**

L'estensione nativa `sqlite-vec` non è riuscita a caricarsi. Cause comuni:

1. **Versione di Node troppo vecchia** — `claude-synergy` richiede Node 22 o superiore. Verificare con `node -v`.
2. **Modulo nativo che deve essere ricostruito** — eseguire `npm rebuild better-sqlite3` (o `pnpm rebuild better-sqlite3`).
3. **Incompatibilità di piattaforma** — su Windows/ARM, `better-sqlite3` richiede una toolchain di compilazione C++. Installare gli [strumenti di compilazione di Windows](https://github.com/nicedoc/windows-build-tools) o gli strumenti di compilazione di Visual Studio con "Sviluppo desktop con C++".

Nota: `sqlite-vec` è opzionale. La ricerca di parole chiave FTS5 (`hk query`) funziona senza di essa. Solo `hk embed` e `hk hybrid` richiedono l'estensione vettoriale.

**"Sincronizzazione non riuscita per il prodotto X" / errori di recupero**

`hk fetch` e `hk sync` chiamano API esterne. Cause comuni:

- **Limite di richieste di GitHub:** la strategia `gh-releases` utilizza `gh api`, che a sua volta utilizza il tuo `GITHUB_TOKEN`. Le richieste non autenticate hanno un limite di 60 richieste all'ora; autenticati con `gh auth login` oppure imposta la variabile d'ambiente `GITHUB_TOKEN`.
- **Rete / proxy:** i servizi di recupero RSS e HTML utilizzano `fetch()`. Verifica la connettività e le eventuali impostazioni del proxy aziendale (`HTTPS_PROXY`).
- **Prodotto sconosciuto:** il comando `hk fetch --product foo` funziona solo per i prodotti elencati in `products.yaml`. Esegui `hk products` per visualizzare tutti i nomi disponibili.

La sincronizzazione è idempotente: è sicuro rieseguirla anche in caso di un errore parziale. Le release già scaricate vengono saltate.

**"Il provider di embedding non risponde"**

Il comando `hk embed` chiama un servizio esterno di embedding:

- **Ollama (predefinito, 768 dimensioni)** — assicurarsi che Ollama sia in esecuzione (`ollama serve`) e che il modello di incorporamento sia stato scaricato (`ollama pull nomic-embed-text`).
- **Voyage (1024 dimensioni)** — impostare `VOYAGE_API_KEY` nell'ambiente. Controllare la chiave API su [dash.voyageai.com](https://dash.voyageai.com).
- **OpenAI (1536 dimensioni predefinite, configurabili)** — impostare `OPENAI_API_KEY`. Il modello predefinito è `text-embedding-3-small`; sovrascriverlo con `OPENAI_EMBED_MODEL` (ad esempio, `text-embedding-3-large` per 3072 dimensioni). Utilizzare tramite `hk hybrid --embed openai` o `hk embed --embed openai`.

**Incompatibilità della dimensione dell'incorporamento durante la modifica del provider**

Ogni provider produce vettori di una dimensione fissa (Ollama 768, Voyage 1024, OpenAI 1536 per impostazione predefinita; OpenAI supporta dimensioni configurabili all'interno delle dimensioni native del modello). Il database memorizza la dimensione attiva in `schema_meta.embedding_dim`. La modifica del provider con dimensioni diverse mentre esistono chunk genera un errore `EMBEDDING_DIM_MISMATCH` (`AppError`) anziché corrompere silenziosamente la tabella dei vettori. Per cambiare provider:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --embed openai     # new provider, new dim, fresh chunks_vec
```

Per la troncatura Matryoshka di OpenAI (dimensione inferiore a quella nativa), impostare `OPENAI_EMBED_MODEL` e passare la dimensione desiderata tramite la costruzione del provider in `hk embed`; consultare la [sezione sull'incorporamento della guida](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) per i dettagli.

**Incompatibilità di versione dello schema / database corrotto**

Se il database è stato creato con una versione precedente dello schema e la migrazione fallisce, oppure se i dati appaiono errati dopo un crash:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

Questo non è un problema grave: il database è una cache derivata. Tutti i dati originali si trovano nei file `products/*/releases/*.md`.

---

## File correlati

- [CONTRIBUTING.md](CONTRIBUTING.md) — come aggiungere prodotti, eseguire test, inviare richieste di modifica (PR)
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 elementi che richiedono un'azione (vulnerabilità di sicurezza, modelli obsoleti, modifiche incompatibili, problemi di configurazione)
- [SOURCES.md](SOURCES.md) — panorama delle fonti a 5 livelli con strategie di recupero
- [synergies/INDEX.md](synergies/INDEX.md) — 12 flussi di lavoro trasversali curati
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — schemi SQLite + sqlite-vec
- [test-spec-3.md](test-spec-3.md) (attuale) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (storici) — specifiche della suite di test

---

## Licenza

MIT. Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
