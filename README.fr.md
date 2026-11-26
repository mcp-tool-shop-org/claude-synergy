<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#licence"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

Un miroir local et interrogeable de tous les journaux de modifications des outils de développement d’IA d’Anthropic et des outils connexes — ainsi qu’une couche « Synergy » organisée décrivant les flux de travail inter-produits — afin que l’agent LLM intégré à l’ensemble de fonctionnalités sache ce que l’ensemble de fonctionnalités peut faire.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


Une seule requête FTS permet de trouver une correction de sécurité coordonnée entre les différents SDK, correction qui n’a pas été signalée comme une CVE dans les journaux de modifications individuels. C’est la démonstration clé : des tendances se dégagent lorsque tous les journaux de modifications sont présentés côte à côte.

Dépôt : [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## Le problème

Claude Code CLI est mis à jour quotidiennement. L’API Claude est mise à jour presque aussi souvent. Les SDK sont mis à jour à chaque version de la CLI. Claude Design, Cowork, Chat et Mobile sont intégrés au centre d’aide unifié. L’écosystème MCP est mis à jour avec environ 200 à 300 nouveaux serveurs par semaine. De plus, il existe 7 principaux outils de développement d’IA (Cursor, Aider, Continue, Copilot, Cody, Windsurf), chacun publiant ses propres journaux de modifications à ses propres intervalles.

L’agent LLM intégré à l’un de ces outils a une date limite de formation fixe. L’écart s’élargit de jour en jour. Des fonctionnalités sont ajoutées, mais l’agent ne les connaît pas. Des bogues sont corrigés, mais l’agent continue de les contourner. Des variables d’environnement et des indicateurs sont ajoutés, mais l’agent ne les suggère jamais. Les flux de travail inter-produits qui combinent plusieurs outils restent non découverts.

**Ce dépôt comble cet écart.** La section Synergy en fait un produit plutôt qu’un simple miroir.

---

## Ce qui est inclus

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

**Chiffres en direct (au v1.2.1) :** 44 produits / 1 171 fichiers de publication / 6 573 modifications / 1 260 entités / 12 synergies / 519 tests / 13 outils MCP / 17 commandes CLI. (Le corpus est mis à jour via `sync_now` le 24 mai 2026.)

---

## État : toutes les étapes ont été publiées

| Étape | État | Ce qui est inclus |
|------|--------|--------------|
| **1 — bootstrap (corpus markdown)** | ✅ publié | Le « study-swarm » a créé 706 fichiers de publication de janvier à mai 2026 ; le nombre a été étendu à 1 186 à l’étape 4d. |
| **2a — SQLite + FTS5 + CLI** | ✅ publié | CLI `hk` ; 15 sous-commandes ; sub-300ms ingestion |
| **2b — sqlite-vec + récupération contextuelle** | ✅ publié | Fournisseur configurable (aucun / structuré / ollama / contexte claude-haiku × ollama / voyage embed × aucun / ollama-judge / voyage / cohere rerank) |
| **3 — synchronisation + serveur MCP** | ✅ publié | `hk fetch / sync / seed-markers` ; `claude-synergy-mcp` expose 13 outils via stdio (8 à la publication initiale de l’étape 3, 3 ajoutés dans v1.1, 2 ajoutés dans v1.2) |
| **4a — extension au-delà d’Anthropic** | ✅ publié | +15 SDK MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtré) |
| **4b — récupérateur HTML** | ✅ publié | GitHub Copilot + VS Code Chat (Windsurf nécessite Playwright — v0.7) |
| **4c — ingestion de conversion HTML → markdown** | ✅ publié | Les corps HTML (Copilot / VS Code / Cursor) produisent désormais des lignes par point pour FTS5 + extraction d’entités. |
| **4d — Playwright + registre MCP + configuration YAML** | ✅ publié | Windsurf via Playwright ; Smithery + registre MCP officiel en tant que catalogues d’étape 4 ; les produits sont consolidés dans `products.yaml`. |
| **5 — v1.1 navigation fenêtrée + OpenAI intégration** | ✅ publié | `hk diff` / `hk breaking`, limites de date pour toutes les commandes de navigation, 3 nouveaux outils MCP (11 au total), OpenAI fournisseur d’intégration, dimension d’intégration configurable, `claude-code` synchronisation automatique, analyseur générique `keep-a-changelog`. |
| **6 — v1.2 synchronisation à partir de MCP** | ✅ publié | `sync_status` (gestion de la fraîcheur par produit, détection des produits périmés) et `sync_now` (récupération à la demande → intégration → intégration avec `dry_run`, aperçu + verrouillage de concurrence en cours). Résout le problème où un agent appelant pouvait interroger le corpus, mais pas le mettre à jour. **Corrige également :** le bug d’effacement des marqueurs où `INSERT OR REPLACE INTO products` déclenchait une suppression en cascade sur la clé étrangère `markers`, réinitialisant silencieusement le curseur `since` de chaque produit à chaque intégration (régression § 8.20). |
| **6.1 — centralisation du récupérateur-marqueur v1.2.1** | ✅ publié | Centralisation de `writeMarker` dans `fetchOne` afin que chaque récupération réussie mette à jour le marqueur. Avant la correction, les stratégies qui renvoyaient 0 éléments datés dans la fenêtre (en particulier `aider` raw-changelog) n’écrivaient jamais de marqueur et ré-effectuaient une récupération de `HISTORY.md` à chaque synchronisation. La stratégie non implémentée `webfetch` a été renommée `manual` pour `claude-api` + `anthropic-apps` ; `sync_status` affiche désormais les produits manuels comme « manuels » au lieu de « jamais » et les exclut de `stale_only` (régression § 8.21). |
| **7 — v1.3 cs-actions:v1 synthétiseur affiné** | ✅ publié | Premier modèle en aval entraîné sur le corpus. Convertit une entrée de journal de modifications en une action au format JSON strict `{kind, severity, subject, action_text, deadline, tags}`. Qwen2.5-7B + LoRA sur 242 entrées de `dataset/changelog-actions/v1/`, q8_0 GGUF, déployé sur Ollama. Évaluation de la validation de la publication : **88,1 % de type / 79,7 % de gravité / 0,842 macro-F1** par rapport à la vérité terrain sur un ensemble de données de validation stratifié de 59 entrées (+10,1 points de pourcentage / +27,2 points de pourcentage / +0,041 sur qwen3:8b). Étiquette `cs-actions-v1` ; rapport d’évaluation joint à la [publication GitHub](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) en tant que fichier unique. **Limitation documentée v1 :** biais anti-`unknown` (précision 1,000 / rappel 0,286) — le modèle sous-signale les entrées ambiguës. Voir [manuel → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) + [`dataset/README.md`](dataset/README.md) + [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) + [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md). |

Feuille de route au-delà de v1.3 : suivie dans [URGENT_FINDINGS.md](URGENT_FINDINGS.md) et les problèmes.

---

## Sécurité et modèle de données

Cet outil s’exécute localement. **Données traitées :** une base de données SQLite dérivée et des fichiers de publication markdown — tous peuvent être recréés. **Réseau :** HTTPS sortant lorsque vous exécutez `hk fetch`/`hk sync`, lorsqu’un agent appelle l’outil MCP `sync_now`, et à la première utilisation : une commande de requête ou un outil MCP exécuté sur un magasin vide se synchronise de lui-même (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` désactive ce comportement). Les destinations sont l’API GitHub, les flux RSS, les pages de journaux de modifications et les registres MCP, ainsi qu’un fournisseur d’IA distant uniquement si vous en choisissez un : `hk embed` (embeddings Voyage ou OpenAI, Anthropic pour la génération de contexte), ou `hk hybrid -e voyage|openai` / `-r voyage|cohere`. Sinon, la recherche hybride, y compris le mode par défaut de l’outil MCP `search`, appelle un Ollama local sur localhost pour vectoriser la requête. **Secrets :** lit `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` à partir des variables d’environnement — jamais enregistré, jamais stocké sur le disque. **Pas de télémétrie.** Voir [SECURITY.md](SECURITY.md) pour la politique de signalement.

**Texte du fournisseur :** Les notes de version et les entrées de catalogue de tiers sont traitées strictement comme des données citées et ne constituent jamais des instructions permanentes. Le texte de la version est analysé de manière déterministe lors de son intégration (suppression des contrôles Unicode cachés, neutralisation des liens d’images/non sécurisés, masquage des adresses électroniques et des chemins d’accès au répertoire personnel, et marquage des modèles ressemblant à des instructions), puis intégré dans une structure de données fixe par les six outils MCP qui renvoient le texte de la version, avec des marqueurs `[flagged: …]` intégrés, et n’est jamais écrit dans des fichiers d’instructions.

---

## Installation

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

Ou exécution directe après l’installation de `@mcptoolshop/claude-synergy`. Les deux, `hk` et `claude-synergy-mcp`, résolvent le magasin local en utilisant le même ordre de 4 étapes :

1. Variable d’environnement `CLAUDE_SYNERGY_DB`
2. `--db <path>` explicite (CLI) ou chemin d’accès argv positionnel (MCP)
3. `<cwd>/data/claude-synergy.db` **uniquement si ce fichier existe déjà** (préserve l’utilisation du clonage du dépôt)
4. `<home>/.claude-synergy/data/claude-synergy.db` (avec les produits situés sous `<home>/.claude-synergy/products`)

`CLAUDE_SYNERGY_PRODUCTS_ROOT` remplace le répertoire des produits.

**Synchronisation automatique lors de la première utilisation :** Lorsqu’une commande de requête ou un outil MCP est exécuté sur un magasin manquant ou vide, il initialise le schéma et exécute automatiquement `fetch` → `ingest` (sans étape d’intégration, limité par un délai d’attente, en ignorant toute source inaccessible) et ajoute un horodatage `data as of: …` à chaque réponse. Définissez `CLAUDE_SYNERGY_NO_AUTO_SYNC=1` pour désactiver la synchronisation automatique lors de la première utilisation et renvoyer une erreur/un avertissement avec des instructions de corpus vide.

Pour le développement sans compilation, utilisez `npx tsx src/cli.ts ...` directement. **Particularité de pnpm 10 :** `pnpm dev` ignore les indicateurs CLI après `--` ; utilisez `npx tsx` pour le développement.

---

## Interface CLI — 17 commandes

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

**Nouveauté dans v1.1 :** `hk diff` et `hk breaking` répondent à la question « qu’est-ce qui a changé récemment ? » sans avoir besoin d’un terme de recherche. Les limites de date sont uniformes : chaque commande de navigation prend `--since` et `--until` dans `YYYY-MM-DD` (ou ISO 8601 complet), ou une forme relative (`7d`, `2w`, `3m`, `1y`).

---

## Exemples de flux de travail

**Recherchez la date d’introduction d’une variable d’environnement Claude Code :**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Suivez une modification importante entre les SDK :**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Planifiez une migration de modèle :**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**Effectuez une recherche sémantique dans l’ensemble du corpus :**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

La requête n’indique jamais « env_scrub » ; vec l’expose par similarité sémantique. FTS5 pur ne la trouve pas du tout.

**Qu’est-ce qui a changé dans claude-code cette semaine :**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**Parcourez les modifications importantes dans l’ensemble du corpus :**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

Aucun terme de recherche n’est requis ; `hk breaking` est la réponse à la question « une modification importante a-t-elle eu lieu récemment ? »

---

## Serveur MCP — donnez à vos agents accès à ce corpus

`claude-synergy-mcp` expose 13 outils via stdio. Intégrez-le à Claude Code (ou à n’importe quel hôte MCP) via `~/.claude/.mcp.json` ou le `.mcp.json` de votre projet :

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp"
    }
  }
}
```

Définissez `CLAUDE_SYNERGY_DB` dans `env` si vous souhaitez un chemin d’accès au magasin personnalisé ; sinon, il utilise `./data/claude-synergy.db` s’il existe déjà, ou à défaut `~/.claude-synergy/data/claude-synergy.db`, et se synchronise automatiquement lors de la première utilisation de l’outil (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` désactive cette fonction). Chaque réponse d’outil se termine par un horodatage de fraîcheur `data as of:` (préfixé `STALE:` après 7 jours).

Pour le fichier `.vscode/mcp.json` de GitHub Copilot, utilisez l’enveloppe `servers` au lieu de `mcpServers` (voir [synergy 12](synergies/12-mcp-config-format-gotcha.md)).

Outils exposés :

| Outil | Objectif |
|---|---|
| `search` | Hybride FTS5 + vec ; réévaluation facultative. Mode par défaut pour les requêtes en langage naturel. (+ `until` limite de date supérieure) |
| `lookup_entity` | Historique exact des entités : variables d’environnement, commandes en ligne, ID de modèle, CVE, etc. |
| `latest_releases` | Versions récentes dans les produits (ou un seul). (+ `since` limite de date inférieure) |
| `get_release` | Contenu complet d’une version |
| `list_products` | Énumération avec comptages + dernière version |
| `top_entities` | Entités les plus fréquemment mentionnées par type |
| `list_synergies` | Flux de travail inter-produits organisés. (+ filtre `product` facultatif) |
| `read_synergy` | Texte intégral d’un fichier de synergie |
| `get_changes_since` | **Nouveauté.** Modifications dans une fenêtre de temps, regroupées par produit+version. Entrées : `since` (obligatoire), `until?`, `product?`, `kind?`, `limit?`. |
| `search_breaking_changes` | **Nouveauté.** Liste plate des modifications importantes — aucun terme de recherche n’est requis. Entrées : `product?`, `since?`, `until?`, `limit?`. |
| `compare_versions` | **v1.1.** Toutes les modifications entre deux versions d’un produit. Entrées : `product`, `from_version`, `to_version`. |
| `sync_status` | **v1.2.** Fraîcheur de la synchronisation par produit — horodatage de la dernière récupération, nombre d’heures depuis la récupération, nombre de versions intégrées. Entrées : `product?`, `stale_only?`, `stale_hours?`. Utilisez AVANT de faire confiance à `latest_releases` pour savoir si le corpus est obsolète. |
| `sync_now` | **v1.2.** Actualisation à la demande (reproduit `hk sync`). Entrées : `product?`, `dry_run?`, `include_ingest?`, `include_embed?`, `timeout_ms?`. Rejette avec `InvalidParams` si une autre `sync_now` est déjà en cours. N’effectue PAS de validation dans Git. |

Les v1.1 outils reproduisent `hk diff` / `hk breaking` et le flux de travail de comparaison de versions qui nécessitait auparavant un script. Les v1.2 outils de synchronisation comblent la lacune où une session peut interroger le corpus mais ne pas le mettre à jour — `sync_status` signale l’obsolescence, `sync_now` exécute le pipeline. Consultez [manuel → serveur MCP](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/) pour obtenir les schémas d’entrée complets.

---

## Sources — 5 niveaux, 7 stratégies de récupération

Vue d’ensemble dans [SOURCES.md](SOURCES.md).

- **Niveau 1 (GitHub versions)** — `gh api repos/<owner>/<repo>/releases` pour 23 produits, notamment les SDK Anthropic (7 langues), les SDK Agent (2), l’outil en ligne de commande ant, **claude-code** (maintenant synchronisé automatiquement via gh-releases à partir de v1.1 — auparavant initialisé manuellement), claude-code-action, claude-code-security-review et 15 SDK de l’écosystème MCP
- **Niveau 2 (markdown brut)** — `Aider-AI/aider/HISTORY.md`. L’analyseur générique `keep-a-changelog` (v1.1+) est également disponible pour tout produit dont la source est un fichier CHANGELOG.md au format Keep-a-Changelog — configurez-le via une entrée dans `products.yaml`.
- **Niveau 3 (HTML / RSS)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtré), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **Niveau 4 (catalogue)** — `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`
- **Niveau 5 (avis)** — `@ClaudeCodeLog`, compte X ; miroir de changelog de marckrenn

Stratégies de récupération : `gh-releases | rss | raw-changelog | keep-a-changelog | html-scrape | catalog | playwright`. Nouveau produit = une entrée dans `products.yaml`.

---

## Synergies — ce qui est débloqué

12 flux de travail inter-produits organisés. Chacun décrit un modèle de composition, le déclencheur qui en fait la bonne réponse et les preuves de changelog qui le rendent possible. Exemples :

- **08 — Format universel SKILL.md** (Code + Curseur + Codex) : un auteur pour une compétence, trois agents y accèdent.
- **09 — MCP sur sept surfaces** (Code + Curseur + Continue + Copilot + Windsurf + Cody + API) : un seul fichier binaire, accessible à tous les agents.
- **10 — BYOK d’Anthropic sur différentes surfaces** : une seule clé API alimente Claude dans 7 éditeurs avec une facturation unifiée.
- **11 — Claude Code orchestre Aider** : les modifications importantes sont transférées vers un modèle moins coûteux, tandis que Claude planifie.
- **12 — Piège lié au format de configuration MCP** : Copilot utilise `servers` ; tous les autres utilisent `mcpServers`.

Index complet dans [synergies/INDEX.md](synergies/INDEX.md).

---

## Ensembles de données et modèles affinés

Le corpus comporte une couche en aval : des **ensembles de données** organisés dérivés des points clés des modifications, et des **modèles affinés** entraînés sur ces ensembles de données. L’ensemble de données est l’artefact de ce dépôt ; le modèle est en aval.

### `dataset/changelog-actions/v1` — 301 entrées

Chaque entrée associe un point clé de modification du corpus à une tâche à effectuer rédigée à la main : `{kind, severity, subject, action_text, deadline, tags}`. Taxonomie 8-enum `kind` (`breaking | deprecation | security | feature | fix | performance | docs | unknown`), répartition 80/20 pour l’entraînement/la validation, A3c-reviewed par un humain + évaluation croisée entre les familles qwen3:8b (92,4 % d’accord). Voir [`dataset/README.md`](dataset/README.md) pour le tableau de distribution, [`SCHEMA.md`](dataset/changelog-actions/SCHEMA.md) pour le contrat champ par champ, et [`STYLE.md`](dataset/changelog-actions/STYLE.md) pour les règles d’écriture `action_text`.

### `cs-actions:v1` — synthétiseur affiné

Premier modèle entraîné sur l’ensemble de données. Qwen2.5-7B-Instruct + LoRA (rang-256 / entièrement linéaire, 100 étapes QLoRA sur 242 entrées d’entraînement), q8_0 GGUF, déployé via un fichier Ollama Modelfile en deux étapes (`cs-actions-base` + `cs-actions:v1`).

**Évaluation de validation de la publication** (ensemble de validation stratifié de 59 entrées, trois exécutions, toutes réussies, zéro erreur d’analyse) :

| Métrique. | qwen3:8b de base. | cs-actions:v1 | Delta. |
|---|---|---|---|
| Accord sur le type par rapport à la vérité terrain. | 78.0% | **88.1%** | +10,1 points de pourcentage. |
| Accord sur la gravité par rapport à la vérité terrain. | 52.5% | **79.7%** | +27,2 points de pourcentage. |
| Macro-F1 (classes bien représentées). | 0.801 | **0.854** | +0.053 |
| Exécution 3 — ablation de l’indice de type (avec indice / sans). | — | 0.842 / 0.777 | 6,5 points -> zone cible. |

Critère de validation de la publication `qwen3-vs-cs-actions ≥ qwen3-vs-GT` (`0.780 ≥ 0.780`) — RÉUSSI ✓. Verdicts complets pour chaque entrée dans [`eval-report.v1.json`](dataset/changelog-actions/v1/eval-report.v1.json), également joints à la [publication GitHub](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) en tant que fichier unique.

**Limitation documentée v1 — biais anti-`unknown`.** `unknown` est la seule classe où cs-actions:v1 obtient de moins bons résultats que qwen3:8b (F1 0,444 contre 0,545). Précision : 1,000 / rappel : 0,286 — lorsque l’entrée est réellement ambiguë, le modèle s’engage sur un type spécifique plutôt que de s’abstenir. Biais hérité de la famille qwen, pas entièrement annulé par LoRA. Les consommateurs en aval doivent considérer un taux `kind: "unknown"` inférieur à la normale comme un signal pour acheminer les lots vers une révision humaine. Le [plan v2](dataset/README.md) aborde ce problème avec l’augmentation de la classe inconnue et la randomisation des indices.

**Non distribué via ce dépôt** — le q8_0 GGUF est d’environ 5 Go et le point de contrôle fusionné est d’environ 15 Go. L’ensemble de données et le pipeline de construction sont ce qui est publié ; le modèle est reconstruit localement selon [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) (chaîne manuelle en 4 étapes, ~88 min de préchauffage sur RTX 5080 Laptop 16 Go VRAM). Le contrat de validation de la publication en trois exécutions se trouve dans [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md).

Guide d’utilisation complet — y compris l’invocation locale d’Ollama, l’exigence `format: "json"` par requête et le pipeline de reconstruction — est disponible sur la page [manuel -> cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/).

---

## Tests

La suite Vitest couvre les niveaux d’unité / d’intégration / de régression / de test de base. **[test-spec-3.md](test-spec-3.md) est la référence actuelle** à la date du v0.7.0 ; [test-spec.md](test-spec.md) (v1) et [test-spec-2.md](test-spec-2.md) (v2) restent dans le dépôt en tant que registre historique de l’évolution de la conception.

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Disposition :

| Répertoire. | Ce qu’il couvre. |
|-----|----------------|
| `test/unit/` | par module — extraction, ingestion, requête (y compris `until` / navigation / depuis / comparaison), base de données (y compris la migration de la configuration des dimensions v3), intégration, hybride, récupération + chaque fournisseur (Ollama / Voyage / **OpenAI**) + récupération-rss/journal-des-modifications (y compris l’analyseur **keep-a-changelog**) / html + récupération-registre-MCP + récupération-playwright + configuration-produits + ingestion/requête de synergie. |
| `test/integration/` | de bout en bout — pipeline, synchronisation, serveur MCP (stdio JSON-RPC, 13 outils, y compris `sync_status` / `sync_now`), CLI (y compris `hk diff`, `hk breaking`). |
| `test/regression/` | § 8.1 à § 8.19 — chacun protège contre un bug réel corrigé pendant le développement ( § 8.19 : la pagination ghReleases à sortie anticipée préserve les éléments dans la fenêtre). |
| `test/smoke/` | opter pour l’utilisation de l’ensemble complet du corpus par rapport aux données réelles `products/` (1 143 fichiers) |
| `test/fixtures/` | 3 produits factices + réponses HTTP simulées (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Registre MCP officiel). |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**Pas de réseau dans les tests par défaut** — le HTTP du fournisseur est simulé via `vi.spyOn(global, 'fetch')`. Les fichiers réels SQLite sont dans des fichiers temporaires (pas `:memory:`) car la sémantique de chargement de l’extension sqlite-vec diffère selon les versions et le stockage sur disque est le chemin canonique. Playwright est chargé via un import dynamique et simulé via `vi.doMock('playwright', ...)` afin que les tests réussissent sans une installation réelle du navigateur.

CI : `.github/workflows/test.yml` exécute `pnpm test:coverage` lors d’un push et d’une demande d’extraction.

---

## Dépannage

**« Base de données verrouillée » ou erreurs WAL.**

Un autre processus `hk` (ou un serveur MCP obsolète) maintient la base de données SQLite ouverte. Fermez les autres processus `hk`, puis réessayez. Si le problème persiste, vérifiez s’il existe un fichier `-wal` ou `-shm` à côté de `data/claude-synergy.db` ; il s’agit de fichiers WAL normaux qui seront nettoyés lorsque la dernière connexion sera fermée. Ne les supprimez pas pendant qu’un autre processus a la base de données ouverte.

**« Extension sqlite-vec introuvable » / échec du chargement de sqlite-vec.**

L’extension native `sqlite-vec` n’a pas pu être chargée. Les causes courantes sont :

1. **Version de Node trop ancienne** — `claude-synergy` nécessite Node 22.12 ou une version ultérieure sur Windows, macOS ou Linux (glibc ou musl), x64 ou arm64 ; ARM 32 bits n’est pas pris en charge. Vérifiez avec `node -v`.
2. **Le module natif doit être reconstruit** — exécutez `npm rebuild better-sqlite3` (ou `pnpm rebuild better-sqlite3`).
3. **Incompatibilité de la plateforme** — sur Windows/ARM, `better-sqlite3` nécessite une chaîne d’outils de compilation C++. Installez [windows-build-tools](https://github.com/nicedoc/windows-build-tools) ou Visual Studio Build Tools avec « Développement de bureau avec C++ ».

Remarque : `sqlite-vec` est facultatif. La recherche de mots-clés FTS5 (`hk query`) fonctionne sans. Seuls `hk embed` et `hk hybrid` nécessitent l’extension vectorielle.

**« Échec de la synchronisation pour le produit X » / erreurs de récupération.**

`hk fetch` et `hk sync` appellent des API externes. Causes courantes :

- **Limite de débit GitHub** — la stratégie `gh-releases` appelle `gh api`, qui utilise votre `GITHUB_TOKEN`. Les requêtes non authentifiées sont limitées à 60 requêtes/heure ; authentifiez-vous avec `gh auth login` ou définissez `GITHUB_TOKEN` dans votre environnement.
- **Réseau/proxy** — les récupérateurs RSS et HTML utilisent `fetch()`. Vérifiez la connectivité et les paramètres de proxy d’entreprise (`HTTPS_PROXY`).
- **Produit inconnu** — `hk fetch --product foo` ne fonctionne que pour les produits répertoriés dans `products.yaml`. Exécutez `hk products` pour afficher tous les noms disponibles.

La synchronisation est idempotente, ce qui signifie qu’il est sûr de la relancer après un échec partiel. Les versions déjà récupérées sont ignorées.

**« Le fournisseur d’intégration ne répond pas »**

`hk embed` appelle un service d’intégration externe :

- **Ollama (par défaut, 768 dimensions)** — assurez-vous qu’Ollama est en cours d’exécution (`ollama serve`) et que le modèle d’intégration est téléchargé (`ollama pull nomic-embed-text`).
- **Voyage (1024 dimensions)** — définissez `VOYAGE_API_KEY` dans votre environnement. Vérifiez votre clé API à l’adresse [dash.voyageai.com](https://dash.voyageai.com).
- **OpenAI (1536 dimensions par défaut, configurable)** — définissez `OPENAI_API_KEY`. Le modèle par défaut est `text-embedding-3-small` ; remplacez-le par `OPENAI_EMBED_MODEL` (par exemple, `text-embedding-3-large` pour 3072 dimensions). Utilisez-le via `hk hybrid --embed openai` ou `hk embed --embed openai`.

**Incompatibilité des dimensions d’intégration lors du changement de fournisseur**

Chaque fournisseur produit des vecteurs d’une dimension fixe (Ollama 768, Voyage 1024, OpenAI 1536 par défaut — OpenAI prend en charge une dimension configurable dans la taille native du modèle). La base de données stocke la dimension active dans `schema_meta.embedding_dim`. Le changement de fournisseur avec des dimensions différentes alors que des blocs existent entraîne `EMBEDDING_DIM_MISMATCH` (`AppError`) au lieu de corrompre silencieusement la table de vecteurs. Pour changer :

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --embed openai     # new provider, new dim, fresh chunks_vec
```

Pour OpenAI, la troncature Matryoshka (dimension inférieure à la dimension native), définissez `OPENAI_EMBED_MODEL` et transmettez la dimension souhaitée via la construction du fournisseur `hk embed` — consultez la [section sur l’intégration du manuel](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) pour plus de détails.

**Incompatibilité de la version du schéma/base de données corrompue**

Si la base de données a été créée avec une version de schéma plus ancienne et que la migration échoue, ou si les données semblent incorrectes après un plantage :

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --context structured --embedding ollama   # optional, for vector search
```

C’est sûr — la base de données est une cache dérivée. Toutes les données sources se trouvent dans les fichiers `products/*/releases/*.md`.

---

## Fichiers associés

- [CONTRIBUTING.md](CONTRIBUTING.md) — comment ajouter des produits, exécuter des tests, soumettre des demandes de fusion
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 éléments exploitables (CVE de sécurité, suppression de modèles, modifications importantes, pièges de configuration)
- [SOURCES.md](SOURCES.md) — paysage source à 5 niveaux avec des stratégies de récupération
- [synergies/INDEX.md](synergies/INDEX.md) — 12 flux de travail inter-produits organisés
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — schémas SQLite + sqlite-vec
- [test-spec-3.md](test-spec-3.md) (actuel) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (historique) — spécifications de la suite de tests

---

## Licence

MIT. Créé par <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
