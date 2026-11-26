<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#licencia"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

Un espejo local y consultable de cada registro de cambios de las herramientas de desarrollo de IA de Anthropic y de productos relacionados, además de una capa **Synergy** seleccionada que describe los flujos de trabajo entre productos, para que el agente LLM dentro del sistema sepa qué puede hacer el sistema.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


**Una única consulta FTS revela una solución de seguridad coordinada entre varios SDK que ningún registro de cambios individual identificó como una CVE.** Esa es la demostración clave: los patrones emergen cuando todos los registros de cambios se muestran uno al lado del otro.

Repositorio: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## El problema

Claude Code CLI se lanza aproximadamente a diario. Claude API se lanza casi con la misma frecuencia. Los SDK se lanzan con cada versión de CLI. Claude Design, Cowork, Chat y Mobile se integran a través del Centro de ayuda unificado. El ecosistema MCP lanza aproximadamente entre 200 y 300 nuevos servidores por semana. Además, existen 7 herramientas de desarrollo de IA principales (Cursor, Aider, Continue, Copilot, Cody, Windsurf), todas las cuales lanzan sus propios registros de cambios a sus propios ritmos.

El agente LLM dentro de cualquiera de estas herramientas tiene un punto de corte de entrenamiento fijo. La brecha se amplía cada día. Se lanzan funciones que el agente desconoce. Se corrigen errores para los que el agente aún tiene que encontrar soluciones alternativas. Se añaden variables de entorno y opciones que el agente nunca sugiere. Los flujos de trabajo entre productos que combinan varias herramientas permanecen sin descubrir.

**Este repositorio cierra la brecha.** La sección Synergy lo convierte en un producto en lugar de en un espejo.

---

## Qué hay aquí

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

**Datos actualizados (a fecha de v1.2.1):** 44 productos / 1.171 archivos de lanzamiento / 6.573 cambios / 1.260 entidades / 12 sinergias / 519 pruebas / 13 herramientas MCP / 17 comandos CLI. (El corpus se actualiza a través de `sync_now` el 24 de mayo de 2026).

---

## Estado: todas las capas se han lanzado

| Capa | Estado | Qué hay |
|------|--------|--------------|
| **1: arranque (corpus en formato markdown)** | ✅ Lanzado | El estudio-enjambre recopiló 706 archivos de lanzamiento de enero a mayo de 2026; se amplió a 1.186 en la capa 4d |
| **2a: SQLite + FTS5 + CLI** | ✅ Lanzado | CLI `hk`; 15 subcomandos; sub-300ms ingestión |
| **2b: sqlite-vec + Recuperación contextual** | ✅ Lanzado | Proveedor configurable (ninguno/estructurado/ollama/contexto de claude-haiku × incrustación de ollama/voyage × ninguno/ollama-judge/voyage/cohere reordenación) |
| **3: sincronización + servidor MCP** | ✅ Lanzado | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` expone 13 herramientas a través de stdio (8 en el lanzamiento original de la capa 3, 3 añadidas en v1.1, 2 añadidas en v1.2) |
| **4a: ampliación más allá de Anthropic** | ✅ Lanzado | +15 SDK de MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtrado) |
| **4b: extractor de HTML** | ✅ Lanzado | GitHub Copilot + VS Code Chat (Windsurf necesita Playwright — v0.7) |
| **4c: ingestión de HTML a markdown** | ✅ Lanzado | Los cuerpos HTML (Copilot/VS Code/Cursor) ahora producen filas por viñeta para FTS5 + extracción de entidades |
| **4d: Playwright + registro MCP + configuración YAML** | ✅ Lanzado | Windsurf a través de Playwright; Smithery + registro oficial de MCP como catálogos de la capa 4; los productos se consolidan en `products.yaml` |
| **5: v1.1 navegación con ventana + OpenAI incrustación** | ✅ Lanzado | `hk diff` / `hk breaking`, límites de fecha en todos los comandos de navegación, 3 nuevas herramientas MCP (11 en total), OpenAI proveedor de incrustación, dimensión de incrustación configurable, `claude-code` sincronización automática, analizador genérico `keep-a-changelog` |
| **6: v1.2 sincronización desde MCP** | ✅ Lanzado | `sync_status` (control de la frescura por producto, detección de productos obsoletos) y `sync_now` (obtención bajo demanda → ingestión → incrustación con `dry_run` vista previa + bloqueo de concurrencia en proceso). Cierra la brecha por la que un agente externo podría consultar el corpus, pero no actualizarlo. **También corrige:** el error de borrado de marcadores, en el que `INSERT OR REPLACE INTO products` desencadenaba un borrado en cascada en la clave externa `markers`, restableciendo silenciosamente el `since` cursor de cada producto en cada ingestión (regresión §8.20). |
| **6.1: centralización del extractor-marcador v1.2.1** | ✅ Lanzado | Centralización de `writeMarker` en `fetchOne` para que cada obtención correcta actualice el marcador. Antes de la corrección, las estrategias que devolvían 0 elementos con fecha dentro del período (especialmente `aider` raw-changelog) nunca escribían un marcador y volvían a obtener `HISTORY.md` en cada sincronización. Se renombró la estrategia no implementada `webfetch` a `manual` para `claude-api` + `anthropic-apps`; `sync_status` ahora representa los productos manuales como "manuales" en lugar de "nunca" y los excluye de `stale_only` (regresión §8.21). |
| **7: v1.3 cs-actions:v1 sintetizador afinado** | ✅ Lanzado | Primer modelo descendente entrenado en el corpus. Convierte una entrada de registro de cambios en un elemento de acción estricto en formato JSON `{kind, severity, subject, action_text, deadline, tags}`. Qwen2.5-7B + LoRA en 242 entradas de `dataset/changelog-actions/v1/`, q8_0 GGUF, implementado en Ollama. Evaluación de la puerta de lanzamiento: **88,1% de tipo / 79,7% de gravedad / 0,842 macro-F1** frente a la verdad fundamental en 59 entradas de un conjunto de pruebas estratificado (+10,1 puntos porcentuales / +27,2 puntos porcentuales / +0,041 sobre qwen3:8b base). Etiquetado `cs-actions-v1`; informe de evaluación adjunto al [lanzamiento GitHub](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) como una descarga de un solo archivo. **Limitación documentada v1:** sesgo anti-`unknown` (precisión 1,000 / recuperación 0,286): el modelo subestima las entradas ambiguas. Consulte [manual → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/) + [`dataset/README.md`](dataset/README.md) + [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) + [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md). |

Hoja de ruta más allá de v1.3: rastreada en [URGENT_FINDINGS.md](URGENT_FINDINGS.md) y en los problemas.

---

## Seguridad y modelo de datos

Esta herramienta se ejecuta localmente. **Datos afectados:** una base de datos derivada SQLite y archivos de lanzamiento en formato markdown, todos ellos recreables. **Red:** HTTPS saliente cuando ejecuta `hk fetch`/`hk sync`, cuando un agente llama a la herramienta MCP `sync_now` y en el primer uso: un comando de consulta o una herramienta MCP ejecutados contra un almacén vacío se sincronizan por sí solos (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` lo desactiva). Los destinos son la API de GitHub, los feeds RSS, las páginas de registro de cambios y los registros de MCP, además de un proveedor de IA remoto solo cuando usted lo elige: `hk embed` (embeddings de Voyage, Anthropic para generar contexto) o `hk hybrid -e voyage` / `-r voyage|cohere`. En otro caso, la búsqueda híbrida, incluido el modo predeterminado de la herramienta MCP `search`, llama a un Ollama local en localhost para incrustar la consulta. **Secretos:** lee `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` de las variables de entorno: nunca se registran, nunca se almacenan en el disco. **Sin telemetría.** Consulte [SECURITY.md](SECURITY.md) para conocer la política de informes.

**Texto del proveedor:** Las notas de la versión y las entradas del catálogo de terceros se tratan estrictamente como datos citados, y nunca como instrucciones permanentes. El texto de la versión se analiza de forma determinista al ingerirse (eliminando los controles Unicode ocultos, neutralizando los enlaces de imagen/inseguros, eliminando las direcciones de correo electrónico y las rutas de inicio, y marcando los patrones similares a instrucciones), se incluye en un marco de datos fijo por las seis herramientas MCP que devuelven el texto de la versión, con marcadores `[flagged: …]` en línea, y nunca se escribe en archivos de instrucciones.

---

## Instalar

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

O ejecutar directamente después de instalar `@mcptoolshop/claude-synergy`. Tanto `hk` como `claude-synergy-mcp` resuelven el almacén local utilizando el mismo orden de 4 pasos:

1. Variable de entorno `CLAUDE_SYNERGY_DB`
2. `--db <path>` explícito (CLI) o ruta argv posicional (MCP)
3. `<cwd>/data/claude-synergy.db` **solo si ese archivo ya existe** (conserva el uso de la clonación del repositorio)
4. `<home>/.claude-synergy/data/claude-synergy.db` (con productos bajo `<home>/.claude-synergy/products`)

`CLAUDE_SYNERGY_PRODUCTS_ROOT` anula el directorio de productos.

**Sincronización automática en el primer uso:** Cuando se ejecuta un comando de consulta o una herramienta MCP contra un almacén que falta o está vacío, inicializa el esquema y ejecuta automáticamente `fetch` → `ingest` (sin paso de incrustación, limitado por un tiempo de espera, omitiendo cualquier fuente inalcanzable) y marca cada respuesta con `data as of: …`. Establezca `CLAUDE_SYNERGY_NO_AUTO_SYNC=1` para deshabilitar la sincronización automática en el primer uso y, en su lugar, mostrar un error/advertencia con instrucciones de corpus vacío.

Para el desarrollo sin compilación, utilice `npx tsx src/cli.ts ...` directamente. **Particularidad de pnpm 10:** `pnpm dev` ignora las opciones de la CLI después de `--`; utilice `npx tsx` para el desarrollo.

---

## Interfaz de línea de comandos: 17 comandos

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

**Novedad en v1.1:** `hk diff` y `hk breaking` responden a la pregunta "¿qué ha cambiado recientemente?" sin necesidad de un término de búsqueda. Los límites de fecha son uniformes: cada comando de búsqueda toma `--since` y `--until` en `YYYY-MM-DD` (o ISO 8601 completo), o una forma relativa (`7d`, `2w`, `3m`, `1y`).

---

## Ejemplos de flujos de trabajo

**Encuentre cuándo se introdujo una variable de entorno de Claude Code:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Realice un seguimiento de un cambio importante entre SDK:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Planifique una migración de modelo:**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**Realice una búsqueda semántica en todo el corpus:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

La consulta nunca dice "env_scrub"; vec lo presenta por similitud semántica. FTS5 puro lo omite por completo.

**¿Qué ha cambiado en claude-code esta semana:**
```
$ hk diff claude-code --since 7d
claude-code@2.1.147  2026-05-21  (3 changes)
  [added]     Added the `Workflow` tool for deterministic multi-agent orchestration.
  [changed]   Slash commands now lazy-load until first invocation.
  [fixed]     Race condition in MCP server discovery on Windows.

claude-code@2.1.146  2026-05-19  (1 change)
  [fixed]     Restored `--debug` flag accidentally removed in 2.1.144.
```

**Explore los cambios importantes en todo el corpus:**
```
$ hk breaking --since 30d --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       Headless and SDK sessions now use Task tools by default.
2026-05-14  claude-agent-sdk-typescript@0.3.142  Headless and SDK sessions now use Task tools by default.
2026-05-08  anthropic-sdk-go@1.42.0              Removed deprecated `client.Beta()` namespace.
2026-04-29  cursor@0.49.0                        MCP server config moved from `cursor.json` to `.cursor/mcp.json`.
2026-04-22  windsurf@1.10.0                      Removed `cascade.run` JSON-RPC method.
```

No se necesita ningún término de búsqueda; `hk breaking` es la respuesta a "¿ha cambiado algo importante recientemente?".

---

## Servidor MCP: dé a sus agentes acceso a este corpus

`claude-synergy-mcp` expone 13 herramientas a través de stdio. Conéctelo a Claude Code (o cualquier host MCP) a través de `~/.claude/.mcp.json` o el `.mcp.json` de su proyecto:

```json
{
  "mcpServers": {
    "claude-synergy": {
      "command": "claude-synergy-mcp"
    }
  }
}
```

Establezca `CLAUDE_SYNERGY_DB` en `env` si desea una ruta de almacén personalizada; de lo contrario, utiliza `./data/claude-synergy.db` si ese archivo ya existe, o si no `~/.claude-synergy/data/claude-synergy.db`, y se sincroniza automáticamente en el primer uso de la herramienta (`CLAUDE_SYNERGY_NO_AUTO_SYNC=1` deshabilita esto). Cada respuesta de la herramienta termina con una marca de tiempo de actualización `data as of:` (con el prefijo `STALE:` después de 7 días).

Para GitHub Copilot's `.vscode/mcp.json`, utilice el envoltorio `servers` en lugar de `mcpServers` (consulte [sinergia 12](synergies/12-mcp-config-format-gotcha.md)).

Herramientas expuestas:

| Herramienta | Propósito |
|---|---|
| `search` | Híbrido FTS5 + vec; reordenamiento opcional. Modo predeterminado para consultas en lenguaje natural. (+ límite superior de fecha `until`) |
| `lookup_entity` | Historial exacto de entidades: variables de entorno, comandos de barra, ID de modelo, CVE, etc. |
| `latest_releases` | Lanzamientos recientes en todos los productos (o uno). (+ límite inferior de fecha `since`) |
| `get_release` | Contenido completo de un lanzamiento |
| `list_products` | Enumeración con recuentos + última versión |
| `top_entities` | Entidades más mencionadas por tipo |
| `list_synergies` | Flujos de trabajo seleccionados entre productos. (+ filtro opcional `product`) |
| `read_synergy` | Texto completo de un archivo de sinergia |
| `get_changes_since` | **Novedad.** Cambios en una ventana de tiempo, agrupados por producto+versión. Entradas: `since` (obligatorio), `until?`, `product?`, `kind?`, `limit?`. |
| `search_breaking_changes` | **Novedad.** Lista plana de cambios importantes; no se necesita ningún término de búsqueda. Entradas: `product?`, `since?`, `until?`, `limit?`. |
| `compare_versions` | **v1.1.** Todos los cambios entre dos versiones de un producto. Entradas: `product`, `from_version`, `to_version`. |
| `sync_status` | **v1.2.** Actualización de sincronización por producto: marca de tiempo de la última recuperación, horas desde la recuperación, recuento de lanzamientos ingeridos. Entradas: `product?`, `stale_only?`, `stale_hours?`. Utilice ANTES de confiar en `latest_releases` para saber si el corpus está desactualizado. |
| `sync_now` | **v1.2.** Actualización a petición (refleja `hk sync`). Entradas: `product?`, `dry_run?`, `include_ingest?`, `include_embed?`, `timeout_ms?`. Rechaza con `InvalidParams` si ya hay otra `sync_now` en curso. NO se confirma en git. |

Las v1.1 herramientas reflejan `hk diff` / `hk breaking` y el flujo de trabajo de comparación de versiones que antes requería scripts. Las herramientas de sincronización v1.2 cierran la brecha donde una sesión podría consultar el corpus pero no actualizarlo; `sync_status` informa sobre la desactualización, `sync_now` ejecuta la canalización. Consulte [manual → servidor MCP](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/mcp-server/) para obtener los esquemas de entrada completos.

---

## Fuentes: 5 niveles, 7 estrategias de recuperación

Panorama completo en [SOURCES.md](SOURCES.md).

- **Nivel 1 (GitHub Lanzamientos)**: `gh api repos/<owner>/<repo>/releases` para 23 productos, incluidos los SDK de Anthropic (7 idiomas), los SDK de agentes (2), la CLI ant, **claude-code** (ahora sincronizado automáticamente a través de gh-releases a partir de v1.1; antes se introducía manualmente), claude-code-action, claude-code-security-review y 15 SDK del ecosistema MCP
- **Nivel 2 (markdown sin procesar)**: `Aider-AI/aider/HISTORY.md`. El analizador genérico `keep-a-changelog` (v1.1+) también está disponible para cualquier producto cuya fuente sea un archivo CHANGELOG.md en formato Keep-a-Changelog; configúrelo mediante una entrada en `products.yaml`.
- **Nivel 3 (HTML / RSS)**: `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtrado), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **Nivel 4 (catálogo)**: `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`
- **Nivel 5 (asesoramiento)**: `@ClaudeCodeLog` cuenta de X; espejo del registro de cambios de marckrenn

Estrategias de recuperación: `gh-releases | rss | raw-changelog | keep-a-changelog | html-scrape | catalog | playwright`. Nuevo producto = una entrada en `products.yaml`.

---

## Sinergias: lo que se desbloquea

12 flujos de trabajo seleccionados entre productos. Cada uno describe un patrón de composición, el desencadenante que lo convierte en la respuesta correcta y la evidencia del registro de cambios que lo permite. Ejemplos:

- **08 — Formato universal SKILL.md** (Código + Cursor + Codex): un autor de la habilidad, tres agentes la leen.
- **09 — MCP en siete superficies** (Código + Cursor + Continuar + Copilot + Windsurf + Cody + API): un binario, cada agente.
- **10 — BYOK de Anthropic en diferentes superficies**: una clave de API potencia a Claude en 7 editores con facturación unificada.
- **11 — Claude Code orquesta Aider**: traslada las ediciones más complejas a un modelo económico mientras Claude planifica.
- **12 — Particularidad del formato de configuración de MCP**: Copilot usa `servers`; todos los demás usan `mcpServers`.

Índice completo en [synergies/INDEX.md](synergies/INDEX.md).

---

## Conjuntos de datos y modelos ajustados

El corpus tiene una capa descendente: **conjuntos de datos** seleccionados derivados de los puntos clave de los cambios y **modelos ajustados** entrenados en esos conjuntos de datos. El conjunto de datos es el artefacto en este repositorio; el modelo es la capa descendente.

### `dataset/changelog-actions/v1` — 301 entradas

Cada entrada relaciona un elemento de la lista de cambios del corpus con una tarea a realizar, escrita a mano: `{kind, severity, subject, action_text, deadline, tags}`. Taxonomía 8-enum `kind` (`breaking | deprecation | security | feature | fix | performance | docs | unknown`), división estratificada 80/20 para entrenamiento/validación, A3c-reviewed realizada por un evaluador humano + evaluación cruzada entre familias qwen3:8b (92,4 % de acuerdo). Consulte [`dataset/README.md`](dataset/README.md) para ver la tabla de distribución, [`SCHEMA.md`](dataset/changelog-actions/SCHEMA.md) para ver el contrato detallado por campo y [`STYLE.md`](dataset/changelog-actions/STYLE.md) para ver las `action_text` reglas de redacción.

### `cs-actions:v1` — sintetizador ajustado

Primer modelo entrenado en el conjunto de datos. Qwen2.5-7B-Instruct + LoRA (rango 256 / totalmente lineal, 100 pasos QLoRA en 242 entradas de entrenamiento), q8_0 GGUF, implementado a través de un archivo Modelfile de Ollama de dos etapas (`cs-actions-base` + `cs-actions:v1`).

**Evaluación de la puerta de lanzamiento** (prueba estratificada de 59 entradas, tres ejecuciones, todas superadas, cero errores de análisis):

| Métrica | qwen3:8b base | cs-actions:v1 | Delta |
|---|---|---|---|
| Acuerdo de tipo frente a la verdad fundamental | 78.0% | **88.1%** | +10,1 puntos porcentuales |
| Acuerdo de gravedad frente a la verdad fundamental | 52.5% | **79.7%** | +27,2 puntos porcentuales |
| Macro-F1 (clases bien pobladas) | 0.801 | **0.854** | +0.053 |
| Ejecución 3: ablación de sugerencia de tipo (con sugerencia / sin sugerencia) | — | 0.842 / 0.777 | 6,5 puntos → zona objetivo |

Criterio de aprobación de la versión `qwen3-vs-cs-actions ≥ qwen3-vs-GT` (`0.780 ≥ 0.780`) — APROBADO ✓. Resultados detallados por entrada en [`eval-report.v1.json`](dataset/changelog-actions/v1/eval-report.v1.json), también adjuntos a la [GitHub Versión](https://github.com/mcp-tool-shop-org/claude-synergy/releases/tag/cs-actions-v1) como una descarga de un solo archivo.

**Limitación documentada v1: sesgo anti-`unknown`.** `unknown` es la única clase en la que cs-actions:v1 tiene un rendimiento inferior a qwen3:8b (F1 0,444 frente a 0,545). Precisión 1,000 / exhaustividad 0,286: cuando la entrada es genuinamente ambigua, el modelo se compromete con un tipo específico en lugar de abstenerse. Prioridad heredada de la familia qwen, no completamente anulada por la LoRA. Los consumidores posteriores deben tratar una tasa `kind: "unknown"` inferior a la esperada como una señal para dirigir los lotes a la revisión humana. El [plan v2](dataset/README.md) aborda esto con la ampliación de la clase desconocida más la aleatorización de la sugerencia.

**No se distribuye a través de este repositorio**: el q8_0 GGUF tiene aproximadamente 5 GB y el punto de control combinado tiene aproximadamente 15 GB. El conjunto de datos y la canalización de compilación son lo que se publica; el modelo se vuelve a compilar localmente según [`TRAINING.md`](dataset/changelog-actions/v1/TRAINING.md) (cadena manual de 4 etapas, ~88 minutos de calentamiento en RTX 5080 Laptop 16 GB VRAM). El contrato de la puerta de lanzamiento de tres ejecuciones se encuentra en [`EVAL.md`](dataset/changelog-actions/v1/EVAL.md).

Guía completa de uso, que incluye la invocación local de Ollama, el requisito de llamada `format: "json"` por solicitud y la canalización de recompilación, en la página [manual → cs-actions:v1](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cs-actions-v1/).

---

## Pruebas

La suite Vitest cubre las capas de unidad / integración / regresión / pruebas básicas. **[test-spec-3.md](test-spec-3.md) es la autoridad actual** a partir de v0.7.0; [test-spec.md](test-spec.md) (v1) y [test-spec-2.md](test-spec-2.md) (v2) permanecen en el repositorio como registro histórico de la línea de diseño.

```bash
pnpm test               # unit + integration + regression (~36s, 519 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Diseño:

| Dir | Qué cubre |
|-----|----------------|
| `test/unit/` | por módulo: extraer, ingerir, consultar (incl. `until` / buscar / desde / comparar), base de datos (incl. migración de configuración de dimensiones v3), incrustar, híbrido, obtener + cada proveedor (Ollama / Voyage / **OpenAI**) + obtener-rss/changelog (incl. analizador **keep-a-changelog**) / html + obtener-registro-mcp + obtener-playwright + configuración de productos + ingestión/consulta de sinergias |
| `test/integration/` | de extremo a extremo: canalización, sincronización, servidor MCP (stdio JSON-RPC, 13 herramientas incl. `sync_status` / `sync_now`), CLI (incl. `hk diff`, `hk breaking`) |
| `test/regression/` | §8.1–§8.19: cada uno protege contra un error real corregido durante el desarrollo (§8.19: la paginación de salida temprana ghReleases conserva los elementos dentro de la ventana) |
| `test/smoke/` | opcional, corpus completo frente a `products/` real (1143 archivos) |
| `test/fixtures/` | 3 productos simulados + respuestas HTTP simuladas (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Registro oficial de MCP) |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**Sin red en las pruebas por defecto**: el HTTP del proveedor se simula mediante `vi.spyOn(global, 'fetch')`. SQLite real en archivos temporales (no `:memory:`) porque la semántica de carga de la extensión sqlite-vec difiere entre las versiones y el disco es la ruta canónica. Playwright se carga mediante importación dinámica y se simula mediante `vi.doMock('playwright', ...)` para que las pruebas se superen sin una instalación real del navegador.

CI: `.github/workflows/test.yml` ejecuta `pnpm test:coverage` al hacer push y en las solicitudes de extracción.

---

## Solución de problemas

**"Base de datos bloqueada" o errores de WAL**

Otro proceso `hk` (o un servidor MCP obsoleto) mantiene la SQLite base de datos abierta. Cierre los demás procesos `hk` y vuelva a intentarlo. Si el problema persiste, compruebe si hay un archivo `-wal` o `-shm` junto a `data/claude-synergy.db`: estos son archivos normales del modo WAL y se limpiarán cuando se cierre la última conexión. No los elimine mientras otro proceso tenga la base de datos abierta.

**"No se encontró la extensión sqlite-vec" / error al cargar sqlite-vec**

La extensión nativa `sqlite-vec` no se pudo cargar. Las causas comunes son:

1. **Versión de Node demasiado antigua**: `claude-synergy` requiere Node 22.12 o posterior en Windows, macOS o Linux (glibc o musl), x64 o arm64; no se admite ARM de 32 bits. Compruebe con `node -v`.
2. **El módulo nativo necesita ser recompilado**: ejecute `npm rebuild better-sqlite3` (o `pnpm rebuild better-sqlite3`).
3. **Incompatibilidad de plataforma**: en Windows/ARM, `better-sqlite3` necesita una cadena de herramientas de compilación de C++. Instale las [herramientas de compilación de Windows](https://github.com/nicedoc/windows-build-tools) o Visual Studio Build Tools con "Desarrollo de escritorio con C++".

Nota: `sqlite-vec` es opcional. La búsqueda de palabras clave FTS5 (`hk query`) funciona sin ella. Solo `hk embed` y `hk hybrid` requieren la extensión vectorial.

**"Error de sincronización para el producto X" / errores de obtención**

`hk fetch` y `hk sync` llaman a API externas. Causas comunes:

- **Límite de velocidad de GitHub** — la estrategia `gh-releases` utiliza `gh api`, que usa su `GITHUB_TOKEN`. Las solicitudes no autenticadas alcanzan los 60 req/hora; autentíquese con `gh auth login` o establezca `GITHUB_TOKEN` en su entorno.
- **Red/proxy** — los extractores de RSS y HTML utilizan `fetch()`. Verifique la conectividad y cualquier configuración de proxy corporativo (`HTTPS_PROXY`).
- **Producto desconocido** — `hk fetch --product foo` solo funciona para los productos que figuran en `products.yaml`. Ejecute `hk products` para ver todos los nombres disponibles.

La sincronización es idempotente: es seguro volver a ejecutarla después de un fallo parcial. Las versiones ya extraídas se omiten.

**"El proveedor de incrustaciones no responde"**

`hk embed` llama a un servicio de incrustación externo:

- **Ollama (predeterminado, 768-dim)** — asegúrese de que Ollama se esté ejecutando (`ollama serve`) y de que se haya descargado el modelo de incrustación (`ollama pull nomic-embed-text`).
- **Voyage (1024-dim)** — establezca `VOYAGE_API_KEY` en su entorno. Verifique su clave de API en [dash.voyageai.com](https://dash.voyageai.com).
- **OpenAI (1536-dim predeterminado, configurable)** — establezca `OPENAI_API_KEY`. El modelo predeterminado es `text-embedding-3-small`; anule con `OPENAI_EMBED_MODEL` (por ejemplo, `text-embedding-3-large` para 3072-dim). Utilice a través de `hk hybrid --embed openai` o `hk embed --embed openai`.

**Incompatibilidad de la dimensión de incrustación al cambiar de proveedor**

Cada proveedor produce vectores de una dimensión fija (Ollama 768, Voyage 1024, OpenAI 1536 por defecto; OpenAI admite dimensiones configurables dentro del tamaño nativo del modelo). La base de datos almacena la dimensión activa en `schema_meta.embedding_dim`. Cambiar de proveedor utilizando diferentes dimensiones mientras existen fragmentos genera `EMBEDDING_DIM_MISMATCH` (`AppError`) en lugar de corromper silenciosamente la tabla de vectores. Para cambiar:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --embed openai     # new provider, new dim, fresh chunks_vec
```

Para OpenAI, la truncación de Matryoshka (dimensión menor que la nativa), establezca `OPENAI_EMBED_MODEL` y pase la dimensión deseada a través de la construcción del proveedor de `hk embed`; consulte la [sección de incrustaciones del manual](https://mcp-tool-shop-org.github.io/claude-synergy/handbook/cli-reference/#embedding-providers-and-dimensions) para obtener más detalles.

**Incompatibilidad de la versión del esquema / base de datos corrupta**

Si la base de datos se creó con una versión de esquema anterior y la migración falla, o si los datos parecen incorrectos después de un fallo:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init --db data/claude-synergy.db
hk ingest --db data/claude-synergy.db
hk embed --db data/claude-synergy.db --context structured --embedding ollama   # optional, for vector search
```

Esto es seguro: la base de datos es una caché derivada. Todos los datos de origen se encuentran en los archivos `products/*/releases/*.md`.

---

## Archivos relacionados

- [CONTRIBUTING.md](CONTRIBUTING.md) — cómo agregar productos, ejecutar pruebas, enviar solicitudes de incorporación de cambios
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 elementos de acción (CVE de seguridad, eliminación de modelos, cambios importantes, problemas de configuración)
- [SOURCES.md](SOURCES.md) — panorama de fuentes de 5 niveles con estrategias de extracción
- [synergies/INDEX.md](synergies/INDEX.md) — 12 flujos de trabajo interproductos seleccionados
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — esquemas SQLite + sqlite-vec
- [test-spec-3.md](test-spec-3.md) (actual) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (histórico) — especificaciones del conjunto de pruebas

---

## Licencia

MIT. Creado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
