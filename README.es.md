<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center"><img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/claude-synergy/readme.png" alt="Claude Synergy" width="400"></p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml"><img src="https://github.com/mcp-tool-shop-org/claude-synergy/actions/workflows/test.yml/badge.svg" alt="tests"></a>
  <a href="https://www.npmjs.com/package/@mcptoolshop/claude-synergy"><img src="https://img.shields.io/npm/v/@mcptoolshop/claude-synergy" alt="npm"></a>
  <a href="#license"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license"></a>
  <a href="https://mcp-tool-shop-org.github.io/claude-synergy/"><img src="https://img.shields.io/badge/landing%20page-live-brightgreen" alt="landing page"></a>
</p>

Un espejo local y consultable de todos los registros de cambios de Anthropic y de las herramientas de desarrollo de IA relacionadas, además de una capa de **"Synergy"** (sinergia) que describe los flujos de trabajo entre productos, para que el agente LLM dentro del sistema sepa lo que el sistema puede hacer.

```bash
$ hk query redact
2026-05-11  anthropic-cli@1.7.1            [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-java@2.31.0      [changed]  redact api-key headers in debug logs
2026-05-11  anthropic-sdk-go@1.42.0        [changed]  redact api-key headers in debug logs
2026-05-07  anthropic-sdk-typescript@0.95.1 [changed] redact api-key headers in debug logs

4 results
```


**Una única consulta FTS (búsqueda de texto completo) revela una corrección de seguridad coordinada entre diferentes SDKs que ningún registro de cambios individual identificó como una vulnerabilidad (CVE).** Esa es la demostración clave: los patrones emergen cuando todos los registros de cambios están uno al lado del otro.

Repositorio: [github.com/mcp-tool-shop-org/claude-synergy](https://github.com/mcp-tool-shop-org/claude-synergy)

---

## El problema

Claude Code CLI se actualiza casi a diario. La API de Claude se actualiza con la misma frecuencia. Los SDKs se actualizan con cada nueva versión de la CLI. Claude Design, Cowork, Chat y Mobile se integran a través del Centro de Ayuda unificado. El ecosistema MCP implementa aproximadamente 200-300 nuevos servidores por semana. Además, existen 7 plataformas principales de herramientas de desarrollo de IA (Cursor, Aider, Continue, Copilot, Cody, Windsurf), cada una con sus propios registros de cambios y sus propios ciclos de lanzamiento.

El agente LLM dentro de cualquiera de estos sistemas tiene un punto de corte de entrenamiento fijo. La brecha se amplía cada día. Aparecen funciones de las que el agente no es consciente. Se corrigen errores que el agente aún intenta solucionar. Se agregan variables de entorno y banderas que el agente nunca sugiere. Los flujos de trabajo entre productos que combinan múltiples plataformas permanecen sin descubrir.

**Este repositorio cierra esa brecha.** La sección de "Synergy" lo convierte en un producto en lugar de un simple espejo.

---

## ¿Qué hay aquí?

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

**Estadísticas actualizadas (versión 1.0.0):** 44 productos / 1.186 archivos de lanzamiento / 6.042 cambios / 1.225 entidades / 12 sinergias / 382 pruebas.

---

## Estado: todas las etapas implementadas

| Etapa | Estado | ¿Qué hay? |
|------|--------|--------------|
| **1 — corpus de Markdown (inicialización)** | ✅ implementado | Study-swarm recopiló 706 archivos de lanzamiento de enero a mayo de 2026; se ampliaron a 1186 en la etapa 4. |
| **2a — SQLite + FTS5 + CLI** | ✅ implementado | CLI `hk`; 15 subcomandos; ingestión en menos de 300 ms. |
| **2b — sqlite-vec + Recuperación contextual** | ✅ implementado | Proveedor adaptable (ninguno/estructurado/ollama/contexto de Claude-haiku × incrustaciones de ollama/viaje × ninguno/ollama-judge/viaje/cohere para reordenar). |
| **3 — sincronización + servidor MCP** | ✅ implementado | `hk fetch / sync / seed-markers`; `claude-synergy-mcp` expone 8 herramientas a través de stdio. |
| **4a — extender más allá de Anthropic** | ✅ implementado | +15 SDKs de MCP, Cursor (RSS), Aider (HISTORY.md), Continue.dev, Cody Enterprise (RSS filtrado). |
| **4b — rastreador de HTML** | ✅ implementado | GitHub Copilot + VS Code Chat (Windsurf necesita Playwright — v0.7). |
| **4c — ingestión de HTML a Markdown con turndown** | ✅ implementado | Los cuerpos de HTML (Copilot/VS Code/Cursor) ahora generan filas individuales para FTS5 + extracción de entidades. |
| **4d — Playwright + registro de MCP + configuración YAML** | ✅ implementado | Windsurf a través de Playwright; Smithery + registro oficial de MCP como catálogos de la etapa 4; productos consolidados en `products.yaml`. |

Hoja de ruta para la versión 0.8+: se encuentra en [URGENT_FINDINGS.md](URGENT_FINDINGS.md) y en los problemas.

---

## Seguridad y modelo de datos

Esta herramienta se ejecuta localmente. **Datos utilizados:** una base de datos SQLite derivada y archivos de lanzamiento en formato Markdown, todos recreables. **Red:** solo conexiones HTTPS salientes cuando se ejecuta `hk fetch`/`hk sync` (API de GitHub, fuentes RSS, páginas de registro de cambios, registros de MCP) o `hk embed` con un proveedor remoto (Voyage, Cohere). **Credenciales:** lee las variables de entorno `GITHUB_TOKEN`, `VOYAGE_API_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY`; nunca se registran ni se almacenan en el disco. **No se recopilan datos de telemetría.** Consulte [SECURITY.md](SECURITY.md) para obtener información sobre la política de informes.

---

## Instalación

```bash
git clone https://github.com/mcp-tool-shop-org/claude-synergy
cd claude-synergy
pnpm install
pnpm build       # produces dist/cli.js + dist/mcp-server.js
npm link         # makes `hk` and `claude-synergy-mcp` available globally
```

Para desarrollo sin compilación, use `npx tsx src/cli.ts ...` directamente. **Una peculiaridad de pnpm 10:** `pnpm dev` ignora las banderas de la CLI después de `--`; use `npx tsx` para el desarrollo.

---

## Interfaz de la CLI: 15 comandos

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

## Ejemplos de flujos de trabajo

**Encontrar cuándo se introdujo una variable de entorno de Claude Code:**
```
$ hk env-var CLAUDE_CODE_WORKFLOWS
env var CLAUDE_CODE_WORKFLOWS — 1 mention:

2026-05-21  claude-code@2.1.147  [added]
  Added the `Workflow` tool for deterministic multi-agent orchestration.
  It is off by default — set `CLAUDE_CODE_WORKFLOWS=1` to enable
```

**Rastrear cambios importantes entre diferentes SDK:**
```
$ hk query TodoWrite --limit 5
2026-05-15  claude-agent-sdk-python@0.2.82       [breaking]   Headless and SDK sessions now use Task tools...
2026-05-14  claude-agent-sdk-typescript@0.3.142  [breaking]   Headless and SDK sessions now use Task tools...
2026-05-08  claude-agent-sdk-typescript@0.2.136  [deprecated] Deprecated TodoWrite tool...
```

**Planificar una migración de modelo:**
```
$ hk model claude-opus-4-20250514
model id claude-opus-4-20250514 — 2 mentions:

2026-04-14  anthropic-sdk-python@0.94.0  [deprecated]
  Deprecation of the Claude Sonnet 4 model and the Claude Opus 4 model,
  with retirement on the Claude API scheduled for June 15, 2026...
```

**Búsqueda semántica en todo el corpus:**
```
$ hk hybrid "credential exfiltration" --limit 3
2026-03-25  claude-code@2.1.83  [added]          vec#5 rrf=0.0154
  Added `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` to strip Anthropic and
  cloud provider credentials from subprocess environments...
```

La consulta nunca dice "env_scrub"; el sistema lo muestra por similitud semántica. FTS5 puro no lo encuentra en absoluto.

---

## Servidor MCP: proporcione a sus agentes acceso a este corpus

`claude-synergy-mcp` expone 8 herramientas a través de stdio. Conéctese a Claude Code (o cualquier host MCP) a través de `~/.claude/.mcp.json` o el archivo `.mcp.json` de su proyecto:

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

Para el archivo `.vscode/mcp.json` de GitHub Copilot, utilice el envoltorio `servers` en lugar de `mcpServers` (consulte [synergy 12](synergies/12-mcp-config-format-gotcha.md)).

Herramientas disponibles:

| Herramienta | Propósito |
|---|---|
| `search` | FTS5 + vec híbrido; reordenamiento opcional. Modo predeterminado para consultas en lenguaje natural. |
| `lookup_entity` | Historial exacto de entidades: variables de entorno, comandos, ID de modelos, CVE, etc. |
| `latest_releases` | Lanzamientos recientes en todos los productos (o en uno). |
| `get_release` | Contenido completo de un lanzamiento. |
| `list_products` | Enumeración con conteos + última versión. |
| `top_entities` | Entidades más mencionadas por tipo. |
| `list_synergies` | Flujos de trabajo entre productos, seleccionados. |
| `read_synergy` | Texto completo de un archivo de sinergia. |

---

## Fuentes: 5 niveles, 6 estrategias de recuperación

Panorama general en [SOURCES.md](SOURCES.md).

- **Nivel 1 (Lanzamientos de GitHub)** — `gh api repos/<owner>/<repo>/releases` para 22 productos, incluidos los SDK de Anthropic (7 idiomas), los SDK de Agentes (2), la CLI de ant, claude-code-action, claude-code-security-review y 15 SDK del ecosistema MCP.
- **Nivel 2 (Markdown sin formato)** — `anthropics/claude-code/CHANGELOG.md` + `Aider-AI/aider/HISTORY.md`
- **Nivel 3 (HTML / RSS)** — `platform.claude.com/docs/release-notes`, `support.claude.com/articles/12138966`, `cursor.com/changelog/rss.xml`, `sourcegraph.com/changelog/featured.rss` (filtrado), `github.blog/changelog/label/copilot/`, `code.visualstudio.com/updates/v1_NNN`
- **Nivel 4 (Catálogo)** — `anthropics/skills`, `claude-plugins-{official,community}`, `knowledge-work-plugins`
- **Nivel 5 (Asesoramiento)** — Cuenta de X `@ClaudeCodeLog`; espejo de changelog de marckrenn.

Estrategias de recuperación: `gh-releases | rss | raw-changelog | html-scrape | catalog | playwright`. Nuevo producto = una entrada en `products.yaml`.

---

## Sinergias: lo que se desbloquea

12 flujos de trabajo entre productos, seleccionados. Cada uno describe un patrón de composición, el desencadenante que lo convierte en la respuesta correcta y la evidencia del changelog que lo habilita. Ejemplos:

- **08 — Universal SKILL.md format** (Code + Cursor + Codex): un autor de habilidad, tres agentes lo leen.
- **09 — MCP across seven surfaces** (Code + Cursor + Continue + Copilot + Windsurf + Cody + API): un binario, todos los agentes.
- **10 — Anthropic BYOK across surfaces**: una clave de API habilita a Claude en 7 editores con facturación unificada.
- **11 — Claude Code orchestrates Aider**: traslada las ediciones pesadas a un modelo económico mientras Claude planifica.
- **12 — MCP config format gotcha**: Copilot usa `servers`; todos los demás usan `mcpServers`.

Índice completo en [synergies/INDEX.md](synergies/INDEX.md).

---

## Pruebas

El conjunto de pruebas Vitest cubre los niveles de unidad / integración / regresión / pruebas básicas. **[test-spec-3.md](test-spec-3.md) es la autoridad actual** a partir de la versión v0.7.0; [test-spec.md](test-spec.md) (v1) y [test-spec-2.md](test-spec-2.md) (v2) permanecen en el repositorio como registro histórico de la línea de diseño.

```bash
pnpm test               # unit + integration + regression (~16s, 382 tests)
pnpm test:watch         # interactive
pnpm test:coverage      # generate coverage/index.html (thresholds: 78/75/85/78)
pnpm test:smoke         # opt-in full-corpus smoke (RUN_SMOKE=1)
```

Estructura:

| Directorio | Lo que cubre |
|-----|----------------|
| `test/unit/` | por módulo: extracción, ingestión, consulta, base de datos, incrustación, híbrido, recuperación + cada proveedor + recuperación de RSS/changelog/HTML + recuperación del registro MCP + recuperación de Playwright + configuración de productos. |
| `test/integration/` | de extremo a extremo: canalización, sincronización, servidor MCP (JSON-RPC de stdio), CLI. |
| `test/regression/` | §8.1–§8.18: Cada uno protege contra un error real corregido durante el desarrollo. |
| `test/smoke/` | Prueba completa con todo el corpus contra productos reales (1143 archivos). |
| `test/fixtures/` | 3 productos falsos + respuestas HTTP simuladas (RSS / GH / Voyage / Cohere / Ollama / Anthropic / Smithery / Registro oficial de MCP). |
| `test/helpers/` | `temp-db.ts`, `fetch-mock.ts`, `mcp-client.ts`, `seed-corpus.ts`, `golden-vectors.ts`, `playwright-mock.ts`, `yaml-fixtures.ts` |

**Por defecto, no hay conexión de red** — el proveedor HTTP se simula mediante `vi.spyOn(global, 'fetch')`. Se utiliza SQLite real en archivos temporales (no `:memory:`) porque la semántica de carga de la extensión `sqlite-vec` varía según la versión, y el almacenamiento en disco es la ruta canónica. Playwright se carga mediante importación dinámica y se simula mediante `vi.doMock('playwright', ...)` para que las pruebas se ejecuten sin instalar un navegador real.

CI: `.github/workflows/test.yml` ejecuta `pnpm test:coverage` al realizar un push o una solicitud de extracción.

---

## Solución de problemas

**"Base de datos bloqueada" o errores de WAL**

Otro proceso de `hk` (o un servidor MCP obsoleto) mantiene la base de datos SQLite abierta. Cierre otros procesos de `hk` y luego intente de nuevo. Si el problema persiste, verifique si hay archivos `-wal` o `-shm` junto a `data/claude-synergy.db`: estos son archivos normales en modo WAL y se eliminarán cuando se cierre la última conexión. No los elimine mientras otro proceso tenga la base de datos abierta.

**"No se encontró la extensión sqlite-vec" / falló la carga de sqlite-vec"**

La extensión nativa `sqlite-vec` no se pudo cargar. Causas comunes:

1. **Versión de Node demasiado antigua** — `claude-synergy` requiere Node 22+. Verifique con `node -v`.
2. **Módulo nativo que necesita ser reconstruido** — ejecute `npm rebuild better-sqlite3` (o `pnpm rebuild better-sqlite3`).
3. **Incompatibilidad de plataforma** — en Windows/ARM, `better-sqlite3` necesita un conjunto de herramientas de compilación de C++. Instale [windows-build-tools](https://github.com/nicedoc/windows-build-tools) o Visual Studio Build Tools con "Desarrollo de escritorio con C++".

Nota: `sqlite-vec` es opcional. La búsqueda de palabras clave FTS5 (`hk query`) funciona sin ella. Solo `hk embed` y `hk hybrid` requieren la extensión vectorial.

**"Error de sincronización para el producto X" / errores de fetch"**

`hk fetch` y `hk sync` llaman a API externas. Causas comunes:

- **Límite de velocidad de GitHub** — la estrategia `gh-releases` llama a `gh api`, que utiliza su `GITHUB_TOKEN`. Las solicitudes no autenticadas tienen un límite de 60 solicitudes/hora; autentíquese con `gh auth login` o configure `GITHUB_TOKEN` en su entorno.
- **Red / proxy** — los extractores de RSS y HTML utilizan `fetch()`. Verifique la conectividad y cualquier configuración de proxy corporativa (`HTTPS_PROXY`).
- **Producto desconocido** — `hk fetch --product foo` solo funciona para los productos que se enumeran en `products.yaml`. Ejecute `hk products` para ver todos los nombres disponibles.

La sincronización es idempotente: es seguro volver a ejecutarla después de un fallo parcial. Las versiones ya descargadas se omiten.

**"El proveedor de incrustación no responde"**

`hk embed` llama a un servicio de incrustación externo:

- **Ollama (predeterminado)** — asegúrese de que Ollama se está ejecutando (`ollama serve`) y que el modelo de incrustación se ha descargado (`ollama pull nomic-embed-text`).
- **Voyage** — configure `VOYAGE_API_KEY` en su entorno. Verifique su clave de API en [dash.voyageai.com](https://dash.voyageai.com).

**Incompatibilidad de versión de esquema / base de datos corrupta**

Si la base de datos se creó con una versión de esquema anterior y la migración falla, o si los datos parecen incorrectos después de un fallo:

```bash
rm data/claude-synergy.db data/claude-synergy.db-wal data/claude-synergy.db-shm
hk init
hk ingest
hk embed --context structured --embedding ollama   # optional, for vector search
```

Esto es seguro: la base de datos es una caché derivada. Todos los datos de origen se encuentran en los archivos `products/*/releases/*.md`.

---

## Archivos relacionados

- [CONTRIBUTING.md](CONTRIBUTING.md) — Cómo agregar productos, ejecutar pruebas y enviar solicitudes de extracción (PR).
- [URGENT_FINDINGS.md](URGENT_FINDINGS.md) — 23 elementos que requieren atención inmediata (vulnerabilidades de seguridad, obsolescencia de modelos, cambios importantes, problemas de configuración).
- [SOURCES.md](SOURCES.md) — Panorama de fuentes de 5 niveles con estrategias de obtención.
- [synergies/INDEX.md](synergies/INDEX.md) — 12 flujos de trabajo seleccionados que involucran varios productos.
- [schema.sql](schema.sql) + [schema-vec.sql](schema-vec.sql) — Esquemas de SQLite y sqlite-vec.
- [test-spec-3.md](test-spec-3.md) (actual) + [test-spec-2.md](test-spec-2.md), [test-spec.md](test-spec.md) (histórico) — Especificaciones del conjunto de pruebas.

---

## Licencia

MIT. Creado por <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a>.
