<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

Un miroir local et consultable de tous les journaux de modifications d'Anthropic et des outils de développement d'IA associés, ainsi qu'une couche **Synergy** organisée décrivant les flux de travail inter-produits, afin que l'agent LLM intégré à l'outil sache ce que l'outil peut faire.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


Une seule requête FTS révèle une correction de sécurité coordonnée entre les SDK qui n'est signalée par aucun journal de modifications individuel comme une CVE. C'est la démonstration clé : des schémas émergent lorsque tous les journaux de modifications sont côte à côte.

Repo: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## Le problème

Claude Code CLI est publié quotidiennement. L'API Claude est publiée presque aussi souvent. Les SDK sont publiés à chaque nouvelle version de l'CLI. Claude Design, Cowork, Chat et Mobile sont intégrés dans le centre d'aide unifié. L'écosystème MCP publie environ 200 à 300 nouveaux serveurs par semaine. De plus, il existe 7 plateformes majeures d'outils de développement d'IA (Cursor, Aider, Continue, Copilot, Cody, Windsurf), chacune publiant ses propres journaux de modifications selon son propre rythme.

L'agent LLM intégré à l'un de ces outils a une date de fin de formation fixe. L'écart se creuse chaque jour. Des fonctionnalités sont publiées dont l'agent ignore l'existence. Des bogues sont corrigés, mais l'agent continue de les contourner. Des variables d'environnement et des indicateurs sont ajoutés que l'agent ne suggère jamais. Les flux de travail inter-produits qui combinent plusieurs plateformes restent découverts.

**Ce dépôt comble ce fossé.** La section Synergy en fait un produit plutôt qu'un simple miroir.

---

## Ce qui se trouve ici

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

**Chiffres en direct (version v1.2.1) :** 44 produits / 1 171 fichiers de publication / 6 573 modifications / 1 260 entités / 12 synergies / 519 tests / 13 outils MCP / 17 commandes CLI. (La base de données a été actualisée via `sync_now` le 24 mai 2026.)

---

## Statut — toutes les étapes ont été réalisées

| Étape | Statut | Ce qui s'y trouve |
|------|--------|--------------|
| **1 — corpus Markdown (bootstrap)** | ✅ réalisé | Study-swarm a alimenté 706 fichiers de publication de janvier à mai 2026 ; étendu à 1 186 par l'étape 4. |
| **2a — SQLite + FTS5 + CLI** | ✅ réalisé | CLI `hk` ; 15 sous-commandes ; ingestion inférieure à 300 ms. |
| **2b — sqlite-vec + récupération contextuelle** | ✅ réalisé | Fournisseur adaptable (aucun/structuré/ollama/claude-haiku contexte × ollama/voyage embed × aucun/ollama-judge/voyage/cohere rerank). |
| **3 — synchronisation + serveur MCP** | ✅ réalisé | `hk fetch / sync / seed-markers` ; `claude-synergy-mcp` expose 11 outils via stdio (8 dans la version initiale, 3 ajoutés en v1.1). |
| **4a — extension au-delà d'Anthropic** | ✅ réalisé | +15 SDK MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtré). |
| **4b — récupérateur HTML** | ✅ réalisé | GitHub Copilot + VS Code Chat (Windsurf nécessite Playwright — v0.7). |
| **4c — ingestion HTML→Markdown avec turndown** | ✅ réalisé | Les corps HTML (Copilot/VS Code/Cursor) génèrent désormais des lignes individuelles pour FTS5 + l'extraction d'entités. |
| **4d — Playwright + registre MCP + configuration YAML** | ✅ réalisé | Windsurf via Playwright ; Smithery + registre MCP officiel comme catalogues de l'étape 4 ; les produits sont regroupés dans `products.yaml`. |
| **5 — Navigation avec fenêtrage v1.1 + intégration OpenAI** | ✅ réalisé | `hk diff` / `hk breaking`, limites de date pour toutes les commandes de navigation, 3 nouveaux outils MCP (total de 11), fournisseur d'intégration OpenAI, dimension d'intégration configurable, synchronisation automatique de `claude-code`, analyseur générique `keep-a-changelog`. |
| **6 — v1.2 synchronisation à partir de MCP** | ✅ réalisé | `sync_status` (état de fraîcheur par produit, détection "jamais/obsolète") et `sync_now` (récupération à la demande → ingestion → intégration avec aperçu `dry_run` + verrouillage de concurrence en cours). Comble le fossé où un agent pouvait interroger la base de données, mais pas la mettre à jour. **Corrige également :** un bug de suppression de marqueur où `INSERT OR REPLACE INTO products` déclenchait une suppression sur la clé étrangère `markers`, remettant silencieusement à zéro le curseur `since` de chaque produit à chaque ingestion (régression §8.20). |
| **6.1 — v1.2.1 centralisation des marqueurs de récupération** | ✅ réalisé | La fonction `writeMarker` a été centralisée dans `fetchOne` afin que chaque récupération réussie mette à jour le marqueur. Les stratégies qui renvoyaient 0 éléments datés dans la plage spécifiée (notamment `aider` pour le journal des modifications brut) n'écrivaient pas de marqueur et ré-téléchargeaient `HISTORY.md` à chaque synchronisation. La stratégie `webfetch` non implémentée a été renommée en `manual` pour `claude-api` et `anthropic-apps` ; `sync_status` affiche désormais les produits "manuels" comme "manual" au lieu de "jamais" et les exclut de `stale_only` (régression §8.21). |

Feuille de route pour la version 0.8+ : consultable dans [URGENT_FINDINGS.md](URGENT_FINDINGS.md) et les problèmes.

---

## Sécurité et modèle de données

Cet outil fonctionne localement. **Données concernées :** une base de données SQLite dérivée et des fichiers de publication au format Markdown, tous pouvant être recréés. **Réseau :** uniquement des connexions HTTPS sortantes lorsque vous exécutez `hk fetch`/`hk sync` (API GitHub, flux RSS, pages de modifications, registres MCP) ou `hk embed` avec un fournisseur distant (Voyage, Cohere). **Secrets :** lit les variables d'environnement `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` — jamais enregistrées, jamais stockées sur le disque. **Aucune télémétrie.** Consultez [SECURITY.md](SECURITY.md) pour connaître la politique de signalement.

---

## Installation

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

Pour le développement sans compilation, utilisez `npx tsx src/cli.ts ...` directement. **Particularité de pnpm 10 :** `pnpm dev` ignore les arguments de la CLI après `--` ; utilisez `npx tsx` pour le développement.

---

## Interface CLI — 15 commandes

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

**Nouveautés de la version v1.1 :** `hk diff` et `hk breaking` répondent à la question "qu'est-ce qui a changé récemment ?" sans nécessiter de terme de recherche. Les limites de date sont uniformes : chaque commande de navigation accepte `--since` et `--until` au format `AAAA-MM-JJ` (ou format ISO 8601 complet), ou sous forme relative (`7d`, `2w`, `3m`, `1y`).

---

## Exemples de flux de travail

**Déterminer quand une variable d'environnement Claude Code a été introduite :**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Suivre les modifications incompatibles entre les différentes SDK :**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Planifier une migration de modèle :**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**Recherche sémantique sur l'ensemble du corpus :**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

La requête ne contient jamais "env_scrub" ; le système le détecte par similarité sémantique. La recherche FTS5 classique ne le trouve pas du tout.

**Ce qui a changé dans claude-code cette semaine :**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**Parcourir les modifications importantes dans l'ensemble des données :**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

Pas de terme de recherche nécessaire — `hk breaking` est la réponse à la question "est-ce qu'il y a eu des modifications importantes récemment ?".

---

## Serveur MCP : donnez à vos agents accès à ce corpus

`claude-synergy-mcp` expose 8 outils via le flux standard. Connectez-vous à Claude Code (ou à n'importe quel hôte MCP) via `~/.claude/.mcp.json` ou le fichier `.mcp.json` de votre projet :

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

Pour le fichier `.vscode/mcp.json` de GitHub Copilot, utilisez le wrapper `servers` au lieu de `mcpServers` (voir [synergy 12](synergies/12-mcp-config-format-gotcha.md)).

Outils exposés :

| Outil | Fonctionnalité |
|---|---|
| `search` | FTS5 + vecteur hybride ; réordonnancement optionnel. Mode par défaut pour les requêtes en langage naturel. (+ limite de date supérieure `until`) |
| `lookup_entity` | Historique précis des entités : variables d'environnement, commandes, identifiants de modèles, CVE, etc. |
| `latest_releases` | Nouvelles versions récentes pour les produits (ou un seul). (+ limite de date inférieure `since`) |
| `get_release` | Contenu complet d'une version. |
| `list_products` | Énumération avec nombre d'occurrences + dernière version. |
| `top_entities` | Entités les plus mentionnées par type. |
| `list_synergies` | Flux de travail inter-produits. (+ filtre `product` optionnel) |
| `read_synergy` | Texte intégral d'un fichier de synergie. |
| `get_changes_since` | **Nouveau.** Modifications dans une fenêtre de temps, regroupées par produit + version. Entrées : `since` (obligatoire), `until?`, `product?`, `kind?`, `limit?`. |
| `search_breaking_changes` | **Nouveau.** Liste plate des modifications importantes — aucun terme de recherche n'est nécessaire. Entrées : `product?`, `since?`, `until?`, `limit?`. |
| `compare_versions` | **Nouveau.** Toutes les modifications entre deux versions d'un même produit. Entrées : `product`, `from_version`, `to_version`. |
| `sync_status` | **v1.2.** Fraîcheur de la synchronisation par produit : horodatage de la dernière récupération, heures écoulées depuis la récupération, nombre de publications ingérées. Paramètres : `product?`, `stale_only?`, `stale_hours?`. Utilisez cette fonctionnalité AVANT de faire confiance à `latest_releases` pour savoir si la base de données est obsolète. |
| `sync_now` | **v1.2.** Actualisation à la demande (similaire à `hk sync`). Paramètres : `product?`, `dry_run?`, `include_ingest?`, `include_embed?`, `timeout_ms?`. Renvoie une erreur `InvalidParams` si une autre instance de `sync_now` est déjà en cours. NE COMMET PAS les modifications dans Git. |

Les outils v1.1 sont similaires à `hk diff` / `hk breaking` et au flux de travail de comparaison de versions qui nécessitait auparavant des scripts. Les outils de synchronisation v1.2 comblent le fossé où une session pouvait interroger la base de données, mais pas la mettre à jour : `sync_status` signale l'obsolescence, `sync_now` exécute le pipeline. Consultez [le manuel → serveur MCP](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/) pour les schémas de paramètres complets.

---

## Sources : 5 niveaux, 6 stratégies de récupération

Vue d'ensemble complète dans [SOURCES.md](SOURCES.md).

- **Niveau 1 (Publications GitHub)** — `gh api repos/<owner>/<repo>/releases` pour 23 produits, y compris les SDK Anthropic (7 langages), les SDK Agent (2), l'outil CLI ant, **claude-code** (maintenant synchronisé automatiquement via gh-releases depuis la version v1.1 — auparavant configuré manuellement), claude-code-action, claude-code-security-review, et 15 SDK de l'écosystème MCP.
- **Niveau 2 (Markdown brut)** — `Aider-AI/aider/HISTORY.md`. L'analyseur générique `keep-a-changelog` (v1.1+) est également disponible pour tout produit dont la source est un fichier CHANGELOG.md au format Keep-a-Changelog — à configurer via une entrée dans `products.yaml`.
- **Niveau 3 (HTML / RSS)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtré), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`.
- **Niveau 4 (catalogue)** — `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`.
- **Niveau 5 (conseils)** — Compte X `@ClaudeCodeLog` ; miroir de changelog de marckrenn.

Stratégies de récupération : `gh-releases | rss | raw-changelog | html-scrape | catalog | playwright`. Nouveau produit = une entrée dans `products.yaml`.

---

## Synergies : ce qui est débloqué

12 flux de travail inter-produits sélectionnés. Chacun décrit un modèle de composition, le déclencheur qui le rend pertinent et les preuves de changelog qui le rendent possible. Exemples :

- **08 — Format SKILL.md universel** (Code + Cursor + Codex) : un seul auteur de compétence, trois agents le lisent.
- **09 — MCP sur sept plateformes** (Code + Cursor + Continue + Copilot + Windsurf + Cody + API) : un seul binaire, tous les agents.
- **10 — Anthropic BYOK sur les plateformes** : une seule clé API alimente Claude dans 7 éditeurs avec une facturation unifiée.
- **11 — Claude Code orchestre Aider** : déplace les modifications importantes vers un modèle moins coûteux, tandis que Claude planifie.
- **12 — Piège du format de configuration MCP** : Copilot utilise `servers` ; tout le monde utilise `mcpServers`.

Index complet dans [synergies/INDEX.md](synergies/INDEX.md).

---

## Tests

La suite Vitest couvre les niveaux unitaires, d'intégration, de régression et de test de base. **[test-spec-3.md](test-spec-3.md) est la référence actuelle** à partir de la version v0.7.0 ; [test-spec.md](test-spec.md) (v1) et [test-spec-2.md](test-spec-2.md) (v2) restent dans le dépôt comme enregistrement historique de l'évolution de la conception.

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Structure :

| Dossier | Ce qu'il couvre |
|-----|----------------|
| `test/unit/` | par module — extraction, ingestion, requête (incl. `until` / navigation / depuis / comparaison), base de données (incl. migration de configuration de dimension v3), intégration, hybride, récupération + tous les fournisseurs (Ollama / Voyage / **OpenAI**) + récupération-RSS/changelog (incl. analyseur **keep-a-changelog**) / HTML + récupération-registre-MCP + récupération-playwright + configuration-produits + ingestion/requête de synergies. |
| `test/integration/` | de bout en bout — pipeline, synchronisation, serveur MCP (JSON-RPC via stdin/stdout, 13 outils dont `sync_status` / `sync_now`), CLI (dont `hk diff`, `hk breaking`) |
| `test/regression/` | §8.1–§8.19 — chacun protège contre un bug réel corrigé pendant le développement (§8.19 : la pagination précoce de ghReleases préserve les éléments dans la fenêtre). |
| `test/smoke/` | Test complet sur l'ensemble des fichiers (1 143 fichiers) simulant les produits réels. |
| `test/fixtures/` | 3 produits factices + réponses HTTP simulées (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Registre MCP officiel). |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**Pas de connexion réseau par défaut dans les tests** : le serveur HTTP est simulé via `vi.spyOn(global, 'fetch')`. Utilisation de SQLite réel dans des fichiers temporaires (et non `:memory:`) car les règles de chargement de l'extension `sqlite-vec` varient selon les versions, et le stockage sur disque est la méthode standard. Playwright est chargé via une importation dynamique et simulé via `vi.doMock('playwright', ...)` pour que les tests passent sans installation d'un navigateur réel.

CI : le fichier `.github/workflows/test.yml` exécute `pnpm test:coverage` à chaque commit et à chaque pull request.

---

## Dépannage

**"Base de données verrouillée" ou erreurs WAL**

Un autre processus `hk` (ou un serveur MCP obsolète) maintient la base de données SQLite ouverte. Fermez les autres processus `hk`, puis réessayez. Si le problème persiste, vérifiez la présence de fichiers `-wal` ou `-shm` à côté de `data/claude-synergy.db` : ce sont des fichiers WAL normaux qui seront supprimés lorsque la dernière connexion sera fermée. Ne les supprimez pas tant qu'un autre processus a la base de données ouverte.

**"Extension sqlite-vec introuvable" / échec du chargement de sqlite-vec**

L'extension native `sqlite-vec` n'a pas pu être chargée. Causes courantes :

1. **Version de Node trop ancienne** : `claude-synergy` nécessite Node 22+. Vérifiez avec `node -v`.
2. **Module natif nécessitant une reconstruction** : exécutez `npm rebuild better-sqlite3` (ou `pnpm rebuild better-sqlite3`).
3. **Incompatibilité de la plateforme** : sur Windows/ARM, `better-sqlite3` nécessite un ensemble d'outils de compilation C++. Installez les [windows-build-tools](https://github.com/nicedoc/windows-build-tools) ou les outils de développement Visual Studio avec "Développement Desktop avec C++".

Note : `sqlite-vec` est facultatif. La recherche de mots-clés FTS5 (`hk query`) fonctionne sans lui. Seules les commandes `hk embed` et `hk hybrid` nécessitent l'extension vectorielle.

**"Synchronisation échouée pour le produit X" / erreurs de fetch**

Les commandes `hk fetch` et `hk sync` appellent des API externes. Causes courantes :

- **Limite de débit de GitHub** : la stratégie `gh-releases` utilise `gh api`, qui nécessite votre `GITHUB_TOKEN`. Les requêtes non authentifiées sont limitées à 60 requêtes par heure ; authentifiez-vous avec `gh auth login` ou définissez la variable d'environnement `GITHUB_TOKEN`.
- **Réseau / proxy** : les récupérateurs RSS et HTML utilisent `fetch()`. Vérifiez la connectivité et les éventuels paramètres de proxy d'entreprise (`HTTPS_PROXY`).
- **Produit inconnu** : `hk fetch --product foo` ne fonctionne que pour les produits répertoriés dans `products.yaml`. Exécutez `hk products` pour voir tous les noms disponibles.

La synchronisation est idempotente : il est sûr de la relancer après un échec partiel. Les versions déjà récupérées sont ignorées.

**"Fournisseur d'intégration non réactif"**

La commande `hk embed` appelle un service d'intégration externe :

- **Ollama (par défaut, 768 dimensions)** : assurez-vous qu'Ollama est en cours d'exécution (`ollama serve`) et que le modèle d'intégration est téléchargé (`ollama pull nomic-embed-text`).
- **Voyage (1024 dimensions)** : définissez la variable d'environnement `VOYAGE_API_KEY`. Vérifiez votre clé API sur [dash.voyageai.com](https://dash.voyageai.com).
- **OpenAI (1536 dimensions par défaut, configurable)** : définissez la variable `OPENAI_API_KEY`. Le modèle par défaut est `text-embedding-3-small`; vous pouvez le modifier avec `OPENAI_EMBED_MODEL` (par exemple, `text-embedding-3-large` pour 3072 dimensions). Utilisez-le via `hk hybrid --embed openai` ou `hk embed --embed openai`.

**Incompatibilité de la dimension des vecteurs lors du changement de fournisseur**

Chaque fournisseur produit des vecteurs d'une dimension fixe (Ollama 768, Voyage 1024, OpenAI 1536 par défaut – OpenAI prend en charge une dimension configurable dans les limites de la taille native du modèle). La base de données stocke la dimension active dans `schema_meta.embedding_dim`. Le changement de fournisseur entre des dimensions différentes alors que des fragments existent déclenche une erreur `EMBEDDING_DIM_MISMATCH` (une erreur de l'application) plutôt que de corrompre silencieusement la table des vecteurs. Pour changer de fournisseur :

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --embed openai     # new provider, new dim, fresh chunks_vec
```

Pour la troncature Matryoshka d'OpenAI (dimension inférieure à la dimension native), définissez `OPENAI_EMBED_MODEL` et passez la dimension souhaitée via la construction du fournisseur dans `hk embed` – consultez la [section sur les intégrations du manuel](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) pour plus de détails.

**Incompatibilité de version du schéma / base de données corrompue**

Si la base de données a été créée avec une version de schéma antérieure et que la migration échoue, ou si les données semblent incorrectes après un crash :

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

C'est sans danger : la base de données est un cache dérivé. Toutes les données sources se trouvent dans les fichiers `products/*/releases/*.md`.

---

## Fichiers associés

- [CONTRIBUTING.md](CONTRIBUTING.md) — Comment ajouter des produits, exécuter des tests, soumettre des demandes de modification (pull requests).
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 points d'action (vulnérabilités de sécurité, obsolescence des modèles, modifications majeures, pièges de configuration).
- [SOURCES.md](SOURCES.md) — Paysage des sources en 5 niveaux avec stratégies de récupération.
- [synergies/INDEX.md](synergies/INDEX.md) — 12 flux de travail inter-produits sélectionnés.
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — Schémas SQLite et sqlite-vec.
- [test-spec-3.md](test-spec-3.md) (actuel) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (historique) — Spécifications de la suite de tests.

---

## Licence

MIT. Créé par <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
