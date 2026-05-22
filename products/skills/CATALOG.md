# anthropics/skills — official Agent Skills catalog (snapshot 2026-05-21)

Repo: <https://github.com/anthropics/skills>
Description: "Public repository for Agent Skills." Contains 17 skills under `skills/`, plus the Agent Skills `spec/` and a `template/`. Document skills (docx, pdf, pptx, xlsx) are source-available (proprietary license) — the same code that powers Claude.ai's document capabilities. All other example skills are Apache-2.0.

Distribution:
- **Claude Code**: install as plugin via `/plugin marketplace add anthropics/skills`, then `document-skills@anthropic-agent-skills` or `example-skills@anthropic-agent-skills`.
- **Claude.ai**: pre-installed for paid plans (Pro / Max / Team / Enterprise).
- **Claude API**: usable via the Skills API; custom skills can be uploaded.

## Skills

| Skill | Trigger | Surfaces | Entry |
|-------|---------|----------|-------|
| algorithmic-art | Generative / algorithmic art via p5.js with seeded randomness | Claude.ai artifacts, Code, API | [entry](entries/algorithmic-art.md) |
| brand-guidelines | Apply Anthropic's official brand colors + typography to any artifact | Claude.ai, Code, API | [entry](entries/brand-guidelines.md) |
| canvas-design | Create static visual art (.png/.pdf) — posters, design pieces, art objects | Claude.ai, Code, API | [entry](entries/canvas-design.md) |
| claude-api | Build / debug / optimize Claude API + Anthropic SDK apps across Python / TS / Java / Go / Ruby / PHP / C# / cURL; mandate prompt caching; handle model migrations | Claude Code (primary), API, Cowork | [entry](entries/claude-api.md) |
| doc-coauthoring | Structured 3-stage workflow for co-authoring substantial docs (PRD, spec, design doc, RFC, proposal) | Claude.ai, Code, Cowork | [entry](entries/doc-coauthoring.md) |
| docx | .docx (Word) — create, read, edit, manipulate. Includes tracked changes, comments, TOC, page numbers, letterheads | Claude.ai (production), Code, API | [entry](entries/docx.md) |
| frontend-design | Distinctive production-grade web UI — avoid generic AI aesthetics; commit to a bold aesthetic direction | Claude.ai artifacts, Code, API | [entry](entries/frontend-design.md) |
| internal-comms | Internal company communications — 3P updates, newsletters, FAQs, status / leadership / project updates, incident reports | Claude.ai, Code, Cowork | [entry](entries/internal-comms.md) |
| mcp-builder | Build high-quality MCP (Model Context Protocol) servers — TypeScript SDK or Python FastMCP | Claude Code (primary), API, Claude.ai | [entry](entries/mcp-builder.md) |
| pdf | .pdf — read, extract text/tables, merge/split, rotate, watermark, fill forms, encrypt/decrypt, OCR | Claude.ai (production), Code, API | [entry](entries/pdf.md) |
| pptx | .pptx (PowerPoint) — create, read, edit, manipulate any presentation file | Claude.ai (production), Code, API | [entry](entries/pptx.md) |
| skill-creator | Create new skills, improve existing ones, run evals + benchmarks, optimize triggering description | Claude Code (primary), API, Claude.ai | [entry](entries/skill-creator.md) |
| slack-gif-creator | Animated GIFs optimized for Slack — emoji (128x128) and message (480x480), PIL-based | Claude.ai, Code, API | [entry](entries/slack-gif-creator.md) |
| theme-factory | Apply curated colour + font themes to artifacts (slides / docs / HTML); 10 preset themes + on-the-fly custom theme generation | Claude.ai, Code, API | [entry](entries/theme-factory.md) |
| web-artifacts-builder | Elaborate multi-component claude.ai HTML artifacts via React + TS + Vite + Tailwind + shadcn/ui, bundled into one HTML | Claude.ai artifacts, Code, API | [entry](entries/web-artifacts-builder.md) |
| webapp-testing | Test local web apps with Playwright — verify functionality, debug UI, screenshot, view browser logs | Claude Code (primary), API | [entry](entries/webapp-testing.md) |
| xlsx | .xlsx / .xlsm / .csv / .tsv — create, read, edit, restructure spreadsheets. Financial-model-grade color/formula conventions enforced | Claude.ai (production), Code, API | [entry](entries/xlsx.md) |

## Categorization (per README)

- **Creative & Design**: algorithmic-art, canvas-design, frontend-design, web-artifacts-builder, slack-gif-creator, theme-factory, brand-guidelines
- **Development & Technical**: claude-api, mcp-builder, webapp-testing, skill-creator
- **Enterprise & Communication**: doc-coauthoring, internal-comms
- **Document Skills (source-available)**: docx, pdf, pptx, xlsx

## Notes on the snapshot

- Most skills were moved into `skills/` from the repo root on 2025-12-01 (commit `ef74077`), predating this window. The window's activity is dominated by the `claude-api` skill (added 2026-03-04, then iterated heavily).
- Two new skills were added inside the 2026-01-01 → 2026-05-21 window: **claude-api** (2026-03-04) and the **CMA Managed Agents** material that ships inside claude-api (memory stores, multiagent + webhooks + outcomes, self-hosted sandboxes).
- The four document skills (docx, pdf, pptx, xlsx) carry a Proprietary license (`license: Proprietary. LICENSE.txt has complete terms`); everything else is Apache 2.0 or has the standard "Complete terms in LICENSE.txt" Anthropic Labs Source-Available marker.
- Each skill folder also contains bundled scripts, references, and templates that this snapshot does NOT capture — see the repo for those. Where load-bearing for trigger decisions, the bundled-resources list is included at the bottom of each entry.
- See [ACTIVITY.md](ACTIVITY.md) for the chronological commit log in the window.
