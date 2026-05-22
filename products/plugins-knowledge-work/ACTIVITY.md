# knowledge-work-plugins — Activity log (2026-01-01 through 2026-05-21)

**Window commits:** 79 (full repo history within window; repo was created 2026-01-29 so this is all repo activity).
**Source:** `gh api "repos/anthropics/knowledge-work-plugins/commits?since=2026-01-01T00:00:00Z&until=2026-05-21T23:59:59Z"`

## Chronological summary

### January 2026 — Repo bootstrap

- **2026-01-29** `7c35640` — **Initial commit of the knowledge work plugins repo.** Repository created; first set of role plugins land. This is the genesis commit; the repo is brand-new this window.
- **2026-01-30** `ef748ed`, `3c78267` — Small description tweaks (PR #1).
- **2026-01-30** `687be18` — Updating bio-research plugin.

### February 2026 — Foundation: Cowork wiring, bio-research, pdf-research seed

- **2026-02-03 / 2026-02-04** `47877bf`, `904e494` — Update Getting Started section with Cowork and Claude Code instructions (PR #11). This is where the dual-surface story (Cowork + Code) gets baked into the README.
- **2026-02-05** `2592aba` — bio_fix merge (PR #2).
- **2026-02-10 / 2026-02-11** `538fa06`, `e6a84db` — "Sync plugin updates" (#47).
- **2026-02-18** `3449eba` — Improve plugin customizer for scoped and general customization (#54).
- **2026-02-23** `6457be2` — **Add pdf-research plugin with local MCP server** — early seed of what later (March) becomes the renamed pdf-viewer.
- **2026-02-24** `4fa3cb9`, `96b409a` — Big round of pushes (#74).
- **2026-02-24** `808d53d`, `e903376` — Update partner plugin descriptions to align with submitted copy (#76).
- **2026-02-24** `732a355`, `b3b34df`, `477c893` — **Add google-calendar and gmail MCPs to plugins (#77)** + version bump to 1.1.0 for affected plugins. Calendar/email becomes a first-class connector tier across role plugins.

### March 2026 — Commands → Skills migration, plugin batch #117, pdf rescope

- **2026-03-08** `ca018d6` — chore: update plugin-authoring skills to use `skills/` format.
- **2026-03-10** `8542b59`, `1316b65` — **docs: fix version frontmatter placement per spec** (#102). Closes "deprecate commands in favor of skills" prep.
- **2026-03-13** `2d6f7e2`, `05db65c` — **Migrate commands to skills across all plugins** (#115). Load-bearing structural change: the role plugins' explicit commands become auto-firing skills.
- **2026-03-13** `7b2ea8e`, `89f6599` — Bump plugin versions after commands-to-skills migration (#116).
- **2026-03-18** `c43af45` — Update disclaimer with jurisdictional disclaimer (#35).
- **2026-03-18** `e7a5e58` — Add manual plugin validation fallback when CLI validator is unavailable (#63).
- **2026-03-18** `9659c68` — fix: replace 5 bare excepts with except Exception in bio-research scripts (#82).
- **2026-03-18** `a518709` — feat(product-management): **add brainstorming skill and /brainstorm command** (#93).
- **2026-03-18** `307533e` — docs: clarify Cowork vs Claude Code settings file location (#124).
- **2026-03-18** `0835fae` — Add **Supermetrics** as a marketing analytics connector to the marketing plugin (#123).
- **2026-03-18** `57edbc4` — Add **Definite** as a data warehouse connector (#31).
- **2026-03-18** `0a09d9e` — Add **Amplitude EU endpoint** option (#7).
- **2026-03-20** `d2ba7f6` — **Plugin batch: 12 new plugins** (intercom, cockroachdb, prisma, fastly, cloudinary, nimble, brightdata, searchfit-seo, atlan, ai-firstify, product-tracking, postiz) (#117). Single biggest marketplace expansion event in the window.
- **2026-03-24 / 25** `e925679`, `9ba70e2`, `379948a`, `5d244b9` — Rescope `pdf-research` → `pdf` then → `pdf-viewer`; rename skill → view-pdf; refine trigger description; add `-y` flag to `npx` to avoid first-install prompt hanging MCP connection.
- **2026-03-26** `f0c53a1`, `fc8d9b2` — Rescope pdf-research → pdf-viewer: annotation, form-fill, sign commands; merge upstream main and resolve marketplace.json conflict.
- **2026-03-28** `f55b539` — Merge PR #72: add-pdf-research-plugin (lands the renamed pdf-viewer).

### April 2026 — Partner plugin wave, MCP URL hygiene

- **2026-04-03** `976999e` — Restore bio-research to marketplace.json (#165). (bio-research had briefly been dropped from the manifest.)
- **2026-04-09** `3f12086`, `3dc15bd`, `8fd1c52` — Add **Zoom partner plugin** (#174); add then revert external-source variant (#175 → revert #176); land final version (#174 referenced).
- **2026-04-21** `3b505c1` — Rename google-calendar MCP key and clear gmail/gcal URLs (#184). Cleanup of the Feb 24 calendar/email wiring.
- **2026-04-23** `39a57c5`, `86a8570` — fix(mcp): **add Slack OAuth clientId to all role plugins** (#189). Enables one-click Slack auth across the role-plugin set.
- **2026-04-26** `8f9d2d9` — fix(engineering): correct GitHub MCP server URL (#172).
- **2026-04-28** `8f8779a` — Normalize em-dash escapes in marketplace.json (#195).
- **2026-04-28** `d6c8015` — Update LICENSE with syntax-file and code integration (#193).
- **2026-04-28** `902e914` — **Add adobe-for-creativity plugin** (#197).
- **2026-04-28** `16ac27f` — **Add Box plugin to marketplace** (#196).
- **2026-04-29** `bbaf07e` — **Add bigdata-com plugin** (#190).
- **2026-04-29** `0dcd092` — Unpin adobe-for-creativity to track main (#200).
- **2026-04-29** `57f5166` — **Add miro plugin** (#181).
- **2026-04-29** `10b5d42` — **Refresh SHA pins for 14 partner plugins** (#201). First large-scale pin refresh.
- **2026-04-30** `f30aca0` — Update Adobe for creativity description (#203).
- **2026-04-30** `93fefd0` — **Add lseg plugin** (#204).
- **2026-04-30** `9789ea7` — **Add sp-global plugin** (#206).

### May 2026 — Hygiene infrastructure, small-business plugin, vanta, displayNames

- **2026-05-08** `75dde07`, `65f6fdb` — **Add Consensus MCP server to bio-research plugin** (#220).
- **2026-05-12** `7b1d650` — **Add small-business plugin** — new role plugin landed.
- **2026-05-12** `2c70580` — Add `.mcp.json` connector definitions for small-business plugin (QuickBooks, PayPal, HubSpot, Docusign, Gsuite, O365, Canva).
- **2026-05-12** `2e47e5b` — Add remote MCP URLs for QuickBooks, PayPal, Gmail, Google Calendar, and Google Drive.
- **2026-05-13** `c027250`, `a0fda66` — Refine smb-onboard connector tone: lead with capability, not platform (PR #226).
- **2026-05-19** `6445c15` — **Add SHA bump pipeline, policy scan, and MCP URL liveness check** (#236). Big infrastructure landing: this is the automation that keeps the 31 external-source plugins fresh and the bundled-plugin MCP URLs alive.
- **2026-05-19** `58da91d` — Fix dead MCP server URLs in bundled plugins (apollo, outreach, datadog; remove servicenow) (#238). First fruit of the URL liveness check.
- **2026-05-19** `7838f2a` — Bump 13 plugin SHA pins to upstream HEAD; pin figma and adobe-for-creativity (#237).
- **2026-05-19** `9b76143` — Bump zapier plugin SHA + normalize URL (#217).
- **2026-05-19** `2068029` — Bump zoominfo SHA to 14752e45 (v1.0.1) (#234).
- **2026-05-19** `9ef6650` — small-business: repoint paypal MCP URL (/mcp → /sse) (#242).
- **2026-05-19** `938a43d` — bio-research: drop three dead deepsense.ai MCP URLs (#243).
- **2026-05-19** `2ba85d9` — **Add vanta-mcp-plugin to marketplace** (#230).
- **2026-05-19** `09f62fb` — Fix dead MCP server URLs: deepsense rehosted, paypal moved to SSE (#239).
- **2026-05-21** `370deb5` — feat: **add displayName to all marketplace plugin entries** (#247).
- **2026-05-21** `66e9925` — Drop displayName for cockroachdb to clear policy scan.
- **2026-05-21** `3bf5929` — Merge PR #247: add-plugin-display-names. **Closing commit of the window.**

## Significant arcs

1. **Bootstrap → role coverage** (Jan 29 → Feb 24). Repo created; google-calendar + gmail MCPs added across role plugins; partner plugin descriptions aligned with submitted copy. By end of Feb the 11-plugin "primary" set is the core narrative.
2. **Commands → Skills migration** (Mar 8 → Mar 13). Plugin-authoring format updated; all plugins migrated from commands to skills; version bumps. This is the structural change behind the README's "Skills fire when relevant, and slash commands are available" framing — skills became the auto-firing surface.
3. **Partner plugin expansion** (Mar 20 single batch of 12 → Apr 28-30 individual landings of Box / bigdata-com / miro / adobe / lseg / sp-global → May 19 vanta). Marketplace grows from ~16 plugins at end of Feb to 49 by snapshot date.
4. **Infrastructure hygiene** (Apr 29 → May 19). SHA pin refreshes (#201, #237), then full pipeline (#236) with policy scan + MCP URL liveness checks. This is the operational layer that lets the marketplace carry 31 external-source plugins safely. The very last activity in the window (May 21, three commits) is a displayName-everywhere policy enforcement (#247).
5. **small-business plugin** (May 12-13). Late addition specifically scoped to SMB workflows with QuickBooks/PayPal/Docusign/HubSpot/Canva — the only plugin in the marketplace with a money-handling guardrail in its description ("You approve every step that touches money or customers").
