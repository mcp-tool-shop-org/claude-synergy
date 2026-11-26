<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.md">English</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#licenza"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

Un mirror locale e consultabile di tutti i changelog degli strumenti di sviluppo AI di Anthropic e di prodotti correlati, oltre a un livello "Synergy" curato che descrive i flussi di lavoro tra diversi prodotti, in modo che l'agente LLM all'interno del sistema sappia cosa può fare.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


Una singola query FTS individua una correzione di sicurezza coordinata tra diversi SDK che nessun changelog ha segnalato come CVE. Questa è la dimostrazione più efficace: emergono schemi quando tutti i changelog sono affiancati.

Repository: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## Il problema

Claude Code CLI viene rilasciato quotidianamente. Claude API viene rilasciato quasi con la stessa frequenza. Gli SDK vengono rilasciati con ogni nuova versione della CLI. Claude Design, Cowork, Chat e Mobile vengono integrati tramite il Centro assistenza unificato. L'ecosistema MCP rilascia circa 200-300 nuovi server a settimana. Inoltre, ci sono 7 importanti strumenti di sviluppo AI (Cursor, Aider, Continue, Copilot, Cody, Windsurf), tutti con i propri changelog e con cadenze di rilascio diverse.

L'agente LLM all'interno di uno di questi ha un limite di addestramento fisso. Il divario si allarga ogni giorno. Vengono rilasciate funzionalità che l'agente non conosce. Vengono corretti bug per i quali l'agente continua a trovare soluzioni alternative. Vengono aggiunte variabili d'ambiente e flag che l'agente non suggerisce mai. I flussi di lavoro tra diversi prodotti, che combinano più elementi, rimangono non scoperti.

**Questo repository colma il divario.** La sezione Synergy lo trasforma in un prodotto anziché in un semplice mirror.

---

## Cosa contiene

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

**Dati aggiornati (al v1.2.1):** 44 prodotti / 1.171 file di rilascio / 6.573 modifiche / 1.260 entità / 12 sinergie / 519 test / 13 strumenti MCP / 17 comandi CLI. (Il corpus viene aggiornato tramite `sync_now` il 2026-05-24).

---

## Stato: tutti i livelli sono stati rilasciati

| Livello | Stato | Cosa contiene |
|------|--------|--------------|
| **1 — bootstrap (corpus markdown)** | ✅ rilasciato | Il "study-swarm" ha raccolto 706 file di rilascio da gennaio a maggio 2026; esteso a 1.186 nel livello 4d. |
| **2a — SQLite + FTS5 + CLI** | ✅ rilasciato | CLI `hk`; 15 sottocomandi; sub-300ms ingest |
| **2b — sqlite-vec + Recupero contestuale** | ✅ rilasciato | Fornitore pluggable (nessuno/strutturato/ollama/contesto claude-haiku × ollama/voyage embed × nessuno/ollama-judge/voyage/cohere rerank) |
| **3 — sync + server MCP** | ✅ rilasciato | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` espone 13 strumenti tramite stdio (8 nel rilascio originale del livello 3, 3 aggiunti in v1.1, 2 aggiunti in v1.2) |
| **4a — estensione oltre Anthropic** | ✅ rilasciato | +15 SDK MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtrato) |
| **4b — HTML-scrape fetcher** | ✅ rilasciato | GitHub Copilot + VS Code Chat (Windsurf richiede Playwright — v0.7) |
| **4c — turndown HTML→markdown ingest** | ✅ rilasciato | I corpi HTML (Copilot/VS Code/Cursor) ora producono righe per ogni punto elenco per FTS5 + estrazione di entità |
| **4d — Playwright + registro MCP + configurazione YAML** | ✅ rilasciato | Windsurf tramite Playwright; Smithery + registro MCP ufficiale come cataloghi di livello 4; i prodotti consolidati in `products.yaml` |
| **5 — v1.1 browsing a finestra + OpenAI embed** | ✅ rilasciato | `hk diff` / `hk breaking`, limiti di data per tutti i comandi di browsing, 3 nuovi strumenti MCP (11 in totale), OpenAI provider di embedding, dimensione di embedding configurabile, `claude-code` sincronizzazione automatica, parser generico `keep-a-changelog` |
| **6 — v1.2 sync-from-MCP** | ✅ rilasciato | `sync_status` (freschezza per prodotto, rilevamento di dati obsoleti o mancanti) e `sync_now` (recupero su richiesta → ingest → embed con `dry_run` anteprima + blocco di concorrenza in-process). Colma la lacuna in cui un agente chiamante può interrogare il corpus ma non aggiornarlo. **Risolve anche:** bug di cancellazione dei marker in cui `INSERT OR REPLACE INTO products` propagava un DELETE sulla `markers` chiave esterna, reimpostando silenziosamente il cursore di ogni prodotto su `since` ad ogni ingest (regressione §8.20). |
| **6.1 — v1.2.1 centralizzazione del fetcher-marker** | ✅ rilasciato | Centralizzazione di `writeMarker` in `fetchOne` in modo che ogni recupero riuscito aggiorni il marker: prima della correzione, le strategie che restituivano 0 elementi datati all'interno della finestra (in particolare `aider` raw-changelog) non scrivevano mai un marker e recuperavano nuovamente `HISTORY.md` ad ogni sincronizzazione. La strategia non implementata `webfetch` è stata rinominata in `manual` per `claude-api` + `anthropic-apps`; `sync_status` ora visualizza i prodotti manuali come "manuali" anziché "mai" e li esclude da `stale_only` (regressione §8.21). |
| **7 — v1.3 cs-actions:v1 sintetizzatore ottimizzato** | ✅ rilasciato | Primo modello downstream addestrato sul corpus. Converte una voce di changelog in un elemento di azione JSON rigoroso `{kind, severity, subject, action_text, deadline, tags}`. Qwen2.5-7B + LoRA su 242 voci da `dataset/changelog-actions/v1/`, q8_0 GGUF, distribuito su Ollama. Valutazione del rilascio: **88,1% tipo / 79,7% gravità / 0,842 macro-F1** rispetto alla verità di base su 59 voci di holdout stratificate (+10,1 punti percentuali / +27,2 punti percentuali / +0,041 rispetto a qwen3:8b). Tagged `cs-actions-v1`; il rapporto di valutazione è allegato al [Rilascio GitHub](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) come download di un singolo file. **Limitazione documentata v1:** bias anti-`unknown` (precisione 1,000 / richiamo 0,286): il modello sottostima gli input ambigui. Vedere [manuale → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) + [`dataset/README.md`](dataset/README.md) + [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) + [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md). |

Roadmap oltre v1.3: tracciata in [URGENT_FINDINGS.md](URGENT_FINDINGS.md) e nelle issue.

---

## Sicurezza e modello dei dati

Questo strumento viene eseguito localmente. **Dati interessati:** un database derivato SQLite e file di rilascio markdown, tutti ricreabili. **Rete:** HTTPS in uscita quando si esegue `hk fetch`/`hk sync`, quando un agente chiama lo strumento MCP `sync_now` e al primo utilizzo: un comando di query o uno strumento MCP eseguito su un archivio vuoto si sincronizza da solo (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` lo disattiva). Le destinazioni sono l'API di GitHub, i feed RSS, le pagine dei changelog e i registri MCP, più un provider di IA remoto solo quando lo si sceglie: `hk embed` (embedding Voyage o OpenAI, Anthropic per la generazione del contesto) oppure `hk hybrid -e voyage|openai` / `-r voyage|cohere`. Altrimenti la ricerca ibrida, compresa la modalità predefinita dello strumento MCP `search`, chiama un Ollama locale su localhost per l'embedding della query. **Segreti:** legge `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` dalle variabili d'ambiente: non vengono mai registrati, né memorizzati su disco. **Nessun telemetria.** Vedere [SECURITY.md](SECURITY.md) per la politica di segnalazione.

**Testo del fornitore:** Le note di rilascio e le voci del catalogo di terze parti sono trattate rigorosamente come dati citati, e non come istruzioni permanenti. Il testo del rilascio viene analizzato in modo deterministico al momento dell'inserimento (rimuovendo i caratteri di controllo Unicode nascosti, neutralizzando i collegamenti a immagini/non sicuri, eliminando gli indirizzi e-mail e i percorsi di sistema e contrassegnando i modelli simili a istruzioni), racchiuso in una struttura dati fissa dai sei strumenti MCP che restituiscono il testo del rilascio, con marcatori `[flagged: …]` incorporati, e non viene mai scritto in file di istruzioni.

---

## Installazione

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

Oppure, eseguirlo direttamente dopo aver installato `@mcptoolshop/claude-synergy`. Sia `hk` che `claude-synergy-mcp` risolvono l'archivio locale utilizzando lo stesso ordine di 4 passaggi:

1. Variabile d'ambiente `CLAUDE_SYNERGY_DB`
2. `--db <path>` esplicito (CLI) o percorso argv posizionale (MCP)
3. `<cwd>/data/claude-synergy.db` **solo se quel file esiste già** (mantiene l'utilizzo del clone del repository)
4. `<home>/.claude-synergy/data/claude-synergy.db` (con i prodotti in `<home>/.claude-synergy/products`)

`CLAUDE_SYNERGY_PRODUCTS_ROOT` sovrascrive la directory dei prodotti.

**Sincronizzazione automatica al primo utilizzo:** Quando un comando di query o uno strumento MCP viene eseguito su un archivio mancante o vuoto, inizializza lo schema ed esegue automaticamente `fetch` → `ingest` (nessun passaggio di incorporamento, limitato da un timeout, saltando qualsiasi feed irraggiungibile) e contrassegna ogni risposta con `data as of: …`. Impostare `CLAUDE_SYNERGY_NO_AUTO_SYNC=1` per disabilitare la sincronizzazione automatica al primo utilizzo e generare un errore/avviso con istruzioni per un corpus vuoto.

Per lo sviluppo senza compilazione, utilizzare `npx tsx src/cli.ts ...` direttamente. **Particolarità di pnpm 10:** `pnpm dev` ignora i flag CLI dopo `--`; utilizzare `npx tsx` per lo sviluppo.

---

## Interfaccia CLI: 17 comandi

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

**Novità in v1.1:** `hk diff` e `hk breaking` rispondono alla domanda "cosa è cambiato di recente?" senza la necessità di un termine di ricerca. I limiti di data sono uniformi: ogni comando di ricerca accetta `--since` e `--until` in `YYYY-MM-DD` (o in formato ISO 8601 completo) o in una forma relativa (`7d`, `2w`, `3m`, `1y`).

---

## Esempi di flussi di lavoro

**Trova quando è stata introdotta una variabile d'ambiente Claude Code:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Traccia una modifica incompatibile tra diversi SDK:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Pianifica una migrazione del modello:**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**Esegui una ricerca semantica sull'intero corpus:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

La query non indica mai "env_scrub": vec lo individua tramite similarità semantica. Unicamente FTS5 non lo individua affatto.

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

**Esplora le modifiche incompatibili nell'intero corpus:**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

Non è necessario alcun termine di ricerca: `hk breaking` è la risposta alla domanda "qualcosa di fondamentale è cambiato di recente?".

---

## Server MCP: fornisci ai tuoi agenti l'accesso a questo corpus

`claude-synergy-mcp` espone 13 strumenti tramite stdio. Collegalo a Claude Code (o a qualsiasi host MCP) tramite `~/.claude/.mcp.json` o `.mcp.json` del tuo progetto:

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp"
    }
  }
}
```

Imposta `CLAUDE_SYNERGY_DB` in `env` se desideri un percorso di archivio personalizzato; altrimenti, utilizzerà `./data/claude-synergy.db` se il file esiste già, o in caso contrario `~/.claude-synergy/data/claude-synergy.db`, ed eseguirà automaticamente la sincronizzazione al primo utilizzo dello strumento (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` disabilita questa funzione). Ogni risposta dello strumento termina con un timestamp di aggiornamento `data as of:` (preceduto da `STALE:` dopo 7 giorni).

Per il file `.vscode/mcp.json` di GitHub Copilot, usa il contenitore `servers` invece di `mcpServers` (vedi [synergy 12](synergies/12-mcp-config-format-gotcha.md)).

Strumenti esposti:

| Strumento | Scopo |
|---|---|
| `search` | Ibrido FTS5 + vec; riordinamento facoltativo. Modalità predefinita per le query in linguaggio naturale. (+ limite superiore della data `until`) |
| `lookup_entity` | Cronologia esatta delle entità: variabili d'ambiente, comandi a barra, ID modello, CVE, ecc. |
| `latest_releases` | Rilasci recenti tra i prodotti (o uno). (+ limite inferiore della data `since`) |
| `get_release` | Contenuto completo di un singolo rilascio |
| `list_products` | Enumerazione con conteggi + versione più recente |
| `top_entities` | Entità più citate per tipo |
| `list_synergies` | Flussi di lavoro curati tra più prodotti. (+ filtro facoltativo `product`) |
| `read_synergy` | Testo completo di un singolo file di sinergia |
| `get_changes_since` | **Novità.** Modifiche in un intervallo di tempo, raggruppate per prodotto+versione. Input: `since` (obbligatorio), `until?`, `product?`, `kind?`, `limit?`. |
| `search_breaking_changes` | **Novità.** Elenco semplice delle modifiche incompatibili: non è necessario alcun termine di ricerca. Input: `product?`, `since?`, `until?`, `limit?`. |
| `compare_versions` | **v1.1.** Tutte le modifiche tra due versioni di un singolo prodotto. Input: `product`, `from_version`, `to_version`. |
| `sync_status` | **v1.2.** Frequenza di sincronizzazione per prodotto: timestamp dell'ultima acquisizione, ore dall'acquisizione, numero di rilasci acquisiti. Input: `product?`, `stale_only?`, `stale_hours?`. Utilizzare PRIMA di affidarsi a `latest_releases` per sapere se il corpus è obsoleto. |
| `sync_now` | **v1.2.** Aggiornamento su richiesta (replica `hk sync`). Input: `product?`, `dry_run?`, `include_ingest?`, `include_embed?`, `timeout_ms?`. Rifiuta con `InvalidParams` se un altro `sync_now` è già in corso. NON si impegna a scrivere su git. |

I v1.1 strumenti replicano `hk diff` / `hk breaking` e il flusso di lavoro di confronto delle versioni che in precedenza richiedeva la scrittura di script. Gli strumenti di sincronizzazione v1.2 colmano il divario in cui una sessione potrebbe interrogare il corpus ma non aggiornarlo: `sync_status` segnala l'obsolescenza, `sync_now` esegue la pipeline. Consulta [manuale → server MCP](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/) per gli schemi di input completi.

---

## Origini: 5 livelli, 7 strategie di acquisizione

Panoramica completa in [SOURCES.md](SOURCES.md).

- **Livello 1 (GitHub Rilasci)**: `gh api repos/<owner>/<repo>/releases` per 23 prodotti, inclusi gli SDK di Anthropic (7 lingue), gli SDK di Agent (2), l'interfaccia a riga di comando ant, **claude-code** (ora sincronizzato automaticamente tramite gh-releases a partire da v1.1: in precedenza, era necessario inserire manualmente i dati), claude-code-action, claude-code-security-review e 15 SDK dell'ecosistema MCP
- **Livello 2 (markdown grezzo)**: `Aider-AI/aider/HISTORY.md`. L'analizzatore generico `keep-a-changelog` (v1.1+) è disponibile anche per qualsiasi prodotto la cui origine è un file CHANGELOG.md in formato Keep-a-Changelog: configurare tramite una voce in `products.yaml`.
- **Livello 3 (HTML / RSS)**: `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtrato), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **Livello 4 (catalogo)**: `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`
- **Livello 5 (avviso)**: `@ClaudeCodeLog` account X; mirror del changelog di marckrenn

Strategie di acquisizione: `gh-releases | rss | raw-changelog | keep-a-changelog | html-scrape | catalog | playwright`. Nuovo prodotto = una voce in `products.yaml`.

---

## Sinergie: cosa si ottiene

12 flussi di lavoro curati tra più prodotti. Ognuno descrive un modello di composizione, il trigger che lo rende la risposta corretta e le prove del changelog che lo consentono. Esempi:

- **08 — Formato universale SKILL.md** (Codice + Cursore + Codex): un autore per ogni skill, tre agenti lo leggono.
- **09 — MCP su sette superfici** (Codice + Cursore + Continue + Copilot + Windsurf + Cody + API): un binario, per ogni agente.
- **10 — BYOK di Anthropic su diverse superfici**: una chiave API alimenta Claude in 7 editor con fatturazione unificata.
- **11 — Claude Code orchestra Aider**: le modifiche più complesse vengono delegate a un modello economico, mentre Claude pianifica.
- **12 — Aspetti da tenere a mente nel formato di configurazione MCP**: Copilot utilizza `servers`; tutti gli altri utilizzano `mcpServers`.

Indice completo in [synergies/INDEX.md](synergies/INDEX.md).

---

## Set di dati e modelli ottimizzati

Il corpus ha un livello a valle: **set di dati** curati derivati dai punti elenco delle modifiche e **modelli ottimizzati** addestrati su tali set di dati. Il set di dati è l'artefatto in questo repository; il modello è a valle.

### `dataset/changelog-actions/v1` — 301 voci

Ogni voce associa un punto elenco delle modifiche del corpus a un elemento di azione scritto a mano: `{kind, severity, subject, action_text, deadline, tags}`. Tassonomia 8-enum `kind` (`breaking | deprecation | security | feature | fix | performance | docs | unknown`), stratificata 80/20 train/holdout, A3c-reviewed valutata da un essere umano + valutazione incrociata tra famiglie qwen3:8b (92,4% di accordo). Consultare [`dataset/README.md`](dataset/README.md) per la tabella di distribuzione, [`SCHEMA.md`](dataset/changelog-actions/SCHEMA.md) per il contratto campo per campo e [`STYLE.md`](dataset/changelog-actions/STYLE.md) per le regole di scrittura `action_text`.

### `cs-actions:v1` — sintetizzatore ottimizzato

Primo modello addestrato sul set di dati. Qwen2.5-7B-Instruct + LoRA (rank-256 / tutto lineare, 100 passaggi QLoRA su 242 voci di addestramento), q8_0 GGUF, distribuito tramite un file Modelfile Ollama a due fasi (`cs-actions-base` + `cs-actions:v1`).

**Valutazione di rilascio** (59 voci stratificate, tre esecuzioni, tutte superate, zero errori di analisi):

| Metrica | qwen3:8b base | cs-actions:v1 | Delta |
|---|---|---|---|
| Accordo sul tipo rispetto alla verità di riferimento | 78.0% | **88.1%** | +10,1 punti percentuali |
| Accordo sulla gravità rispetto alla verità di riferimento | 52.5% | **79.7%** | +27,2 punti percentuali |
| Macro-F1 (classi ben popolate) | 0.801 | **0.854** | +0.053 |
| Esecuzione 3 — ablazione dell'hint di tipo (con hint / senza) | — | 0.842 / 0.777 | 6,5 punti → zona di destinazione |

Criterio di superamento del rilascio `qwen3-vs-cs-actions ≥ qwen3-vs-GT` (`0.780 ≥ 0.780`) — SUPERATO ✓. Risultati dettagliati per ogni voce in [`eval-report.v1.json`](dataset/changelog-actions/v1/eval-report.v1.json), allegati anche al [GitHub Rilascio](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) come download in un unico file.

**Limitazione documentata v1 — bias anti-`unknown`.** `unknown` è l'unica classe in cui cs-actions:v1 ottiene risultati inferiori rispetto a qwen3:8b (F1 0,444 rispetto a 0,545). Precisione 1,000 / richiamo 0,286: quando l'input è genuinamente ambiguo, il modello si impegna su un tipo specifico anziché astenersi. Ereditato il bias della famiglia qwen, non completamente sovrascritto da LoRA. Gli utenti a valle dovrebbero considerare un tasso `kind: "unknown"` inferiore al previsto come un segnale per indirizzare i batch alla revisione umana. Il [piano v2](dataset/README.md) affronta questo problema con l'aumento della classe sconosciuta più la randomizzazione degli hint.

**Non distribuito tramite questo repository** — il q8_0 GGUF è di circa 5 GB e il checkpoint unito è di circa 15 GB. Il set di dati e la pipeline di creazione sono ciò che viene pubblicato; il modello viene ricostruito localmente in base a [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) (catena manuale a 4 fasi, circa 88 minuti di riscaldamento su RTX 5080 Laptop 16 GB VRAM). Il contratto di rilascio a tre esecuzioni è disponibile in [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md).

Guida completa all'utilizzo, inclusa l'invocazione locale di Ollama, il requisito `format: "json"` per chiamata e la pipeline di ricostruzione, è disponibile nella pagina [manuale → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/).

---

## Test

La suite Vitest copre i livelli di unità / integrazione / regressione / test di base. **[test-spec-3.md](test-spec-3.md) è l'autorità attuale** a partire da v0.7.0; [test-spec.md](test-spec.md) (v1) e [test-spec-2.md](test-spec-2.md) (v2) rimangono nel repository come registro storico della linea di progettazione.

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Layout:

| Dir | Cosa copre |
|-----|----------------|
| `test/unit/` | per-modulo — estrai, importa, interroga (incluso `until` / sfoglia / da / confronta), db (incluso migrazione della configurazione delle dimensioni v3), incorpora, ibrido, recupera + ogni provider (Ollama / Voyage / **OpenAI**) + recupera-rss/changelog (incluso parser **keep-a-changelog**)/html + recupera-registro-mcp + recupera-playwright + configurazione-prodotti + importazione/interrogazione delle sinergie |
| `test/integration/` | end-to-end — pipeline, sincronizzazione, server MCP (stdio JSON-RPC, 13 strumenti inclusi `sync_status` / `sync_now`), CLI (incluso `hk diff`, `hk breaking`) |
| `test/regression/` | §8.1–§8.19 — ciascuno protegge da un bug reale corretto durante lo sviluppo (§8.19: la paginazione ghReleases con uscita anticipata preserva gli elementi nella finestra) |
| `test/smoke/` | opt-in full-corpus contro `products/` reali (1.143 file) |
| `test/fixtures/` | 3 prodotti fittizi + risposte HTTP simulate (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Registro ufficiale MCP) |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**Nessuna rete nei test per impostazione predefinita** — l'HTTP del provider è simulato tramite `vi.spyOn(global, 'fetch')`. SQLite reali in file temporanei (non `:memory:`) perché la semantica del caricamento dell'estensione sqlite-vec differisce tra le versioni e su disco è il percorso canonico. Playwright viene caricato tramite importazione dinamica e simulato tramite `vi.doMock('playwright', ...)` in modo che i test vengano superati senza una vera installazione del browser.

CI: `.github/workflows/test.yml` esegue `pnpm test:coverage` al push e alla PR.

---

## Risoluzione dei problemi

**"Database bloccato" o errori WAL**

Un altro processo `hk` (o un server MCP obsoleto) mantiene aperto il database SQLite. Chiudere gli altri processi `hk`, quindi riprovare. Se il problema persiste, verificare la presenza di un file `-wal` o `-shm` accanto a `data/claude-synergy.db`: questi sono normali file in modalità WAL e verranno eliminati quando l'ultima connessione si chiuderà. Non eliminarli mentre un altro processo ha il database aperto.

**"estensione sqlite-vec non trovata" / caricamento di sqlite-vec non riuscito**

L'estensione nativa `sqlite-vec` non è stata caricata. Cause comuni:

1. **Versione di Node troppo vecchia** — `claude-synergy` richiede Node 22.12 o successivo su Windows, macOS o Linux (glibc o musl), x64 o arm64; 32 bit ARM non è supportato. Verificare con `node -v`.
2. **Il modulo nativo deve essere ricompilato** — eseguire `npm rebuild better-sqlite3` (o `pnpm rebuild better-sqlite3`).
3. **Incompatibilità della piattaforma** — su Windows/ARM, `better-sqlite3` richiede una toolchain di compilazione C++. Installare [windows-build-tools](https://github.com/nicedoc/windows-build-tools) o Visual Studio Build Tools con "Sviluppo desktop con C++".

Nota: `sqlite-vec` è facoltativo. La ricerca di parole chiave FTS5 (`hk query`) funziona senza. Solo `hk embed` e `hk hybrid` richiedono l'estensione vettoriale.

**"Sincronizzazione non riuscita per il prodotto X" / errori di recupero**

`hk fetch` e `hk sync` chiamano API esterne. Cause comuni:

- **Limite di richieste (GitHub)**: la strategia `gh-releases` utilizza `gh api`, che a sua volta utilizza il tuo `GITHUB_TOKEN`. Le richieste non autenticate sono limitate a 60 richieste all'ora; autenticati con `gh auth login` o imposta `GITHUB_TOKEN` nel tuo ambiente.
- **Rete/proxy**: i moduli per il recupero di RSS e HTML utilizzano `fetch()`. Verifica la connettività e le eventuali impostazioni del proxy aziendale (`HTTPS_PROXY`).
- **Prodotto sconosciuto**: `hk fetch --product foo` funziona solo per i prodotti elencati in `products.yaml`. Esegui `hk products` per visualizzare tutti i nomi disponibili.

La sincronizzazione è idempotente: è sicuro rieseguirla dopo un errore parziale. Le versioni già recuperate vengono saltate.

**"Il provider di embedding non risponde"**

`hk embed` chiama un servizio di embedding esterno:

- **Ollama (predefinito, 768 dimensioni)**: assicurati che Ollama sia in esecuzione (`ollama serve`) e che il modello di embedding sia stato scaricato (`ollama pull nomic-embed-text`).
- **Voyage (1024 dimensioni)**: imposta `VOYAGE_API_KEY` nel tuo ambiente. Verifica la tua chiave API all'indirizzo [dash.voyageai.com](https://dash.voyageai.com).
- **OpenAI (1536 dimensioni predefinite, configurabile)**: imposta `OPENAI_API_KEY`. Il modello predefinito è `text-embedding-3-small`; sovrascrivilo con `OPENAI_EMBED_MODEL` (ad esempio, `text-embedding-3-large` per 3072 dimensioni). Utilizzalo tramite `hk hybrid --embed openai` o `hk embed --embed openai`.

**Incompatibilità delle dimensioni dell'embedding durante il cambio di provider**

Ogni provider produce vettori con una dimensione fissa (Ollama 768, Voyage 1024, OpenAI 1536 per impostazione predefinita; OpenAI supporta dimensioni configurabili all'interno delle dimensioni native del modello). Il database memorizza la dimensione attiva in `schema_meta.embedding_dim`. Il passaggio a provider con dimensioni diverse quando esistono già dei blocchi genera `EMBEDDING_DIM_MISMATCH` (`AppError`) anziché corrompere silenziosamente la tabella dei vettori. Per effettuare il cambio:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --embed openai     # new provider, new dim, fresh chunks_vec
```

Per OpenAI, la troncatura Matryoshka (dimensione inferiore a quella nativa), imposta `OPENAI_EMBED_MODEL` e passa la dimensione desiderata durante la costruzione del provider tramite `hk embed`; consulta la [sezione sull'embedding del manuale](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) per i dettagli.

**Incompatibilità della versione dello schema / database corrotto**

Se il database è stato creato con una versione dello schema precedente e la migrazione fallisce, oppure se i dati sembrano errati dopo un arresto anomalo:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --context structured --embedding ollama   # optional, for vector search
```

Questo è sicuro: il database è una cache derivata. Tutti i dati di origine si trovano nei file `products/*/releases/*.md`.

---

## File correlati

- [CONTRIBUTING.md](CONTRIBUTING.md): come aggiungere prodotti, eseguire test, inviare PR
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md): 23 elementi di azione (vulnerabilità di sicurezza, dismissione di modelli, modifiche importanti, insidie nella configurazione)
- [SOURCES.md](SOURCES.md): panorama delle fonti a 5 livelli con strategie di recupero
- [synergies/INDEX.md](synergies/INDEX.md): 12 flussi di lavoro inter-prodotto curati
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql): SQLite + schemi sqlite-vec
- [test-spec-3.md](test-spec-3.md) (attuale) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (storici): specifiche della suite di test

---

## Licenza

MIT. Creato da <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
