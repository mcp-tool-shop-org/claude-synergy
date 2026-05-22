# knowledge-work-plugins — Cowork-targeted plugin marketplace (snapshot 2026-05-21)

**Repository:** [anthropics/knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)
**Initial commit:** 2026-01-29 ("Initial commit of the knowledge work plugins repo")
**Total plugins (marketplace.json):** 49
**Target surface:** Claude Cowork (primarily) + Claude Code

> "Plugins that turn Claude into a specialist for your role, team, and company. Built for Claude Cowork, also compatible with Claude Code." — README.md

The marketplace ships 49 plugins. README highlights "11 plugins built and inspired by our own work" (the in-repo Anthropic-authored role plugins); the remaining 38 are partner-built or external-source plugins listed in `.claude-plugin/marketplace.json`. Plugin structure is uniform: `.claude-plugin/plugin.json` (manifest), `.mcp.json` (tool connectors), `skills/` (auto-firing domain knowledge), and `commands/` (explicit slash commands). All file-based — markdown + JSON, no code or build steps.

## Breakdown

| Authoring | Count | Sourcing |
|-----------|-------|----------|
| Anthropic in-repo (role plugins) | 13 | `source: "./<name>"` |
| Partner in-repo (partner-built/) | 5 | `source: "./partner-built/<name>"` + `author` field |
| External git-subdir | 6 | `source.source: "git-subdir"` + `path` + `sha` pin |
| External url (full-repo) | 25 | `source.source: "url"` + `sha` pin |

External plugins (31 of 49) are thin marketplace pointers — the repo only stores a `sha` pin and `homepage` link. The 18 in-repo plugins (Anthropic + partner-built/) ship the actual `.mcp.json`, `skills/`, and (where present) `commands/` directly.

**Plugin substance** — every plugin in this marketplace is a substantive workflow plugin, not a thin MCP wrapper. Even single-vendor partner plugins (Sanity, Intercom, Cloudinary, Box, Zoom) ship "MCP server + agent skills + slash commands" per their descriptions. The closest things to "MCP-only" wrappers are the database plugins (PlanetScale, CockroachDB, Prisma) and the Vanta security plugin, which are still skill-bearing per their stated scope.

## Catalog

| Plugin | Description | Author | Source |
|--------|-------------|--------|--------|
| productivity | Manage tasks, plan your day, and build up memory of important context about your work. Syncs with your calendar, email, and chat to keep everything organized and on track. | Anthropic | ./productivity |
| enterprise-search | Search across all of your company's tools in one place. Find anything across email, chat, documents, and wikis without switching between apps. | Anthropic | ./enterprise-search |
| cowork-plugin-management | Create, customize, and manage plugins tailored to your organization's tools and workflows. Configure MCP servers, adjust plugin behavior, and adapt templates to match how your team works. | Anthropic | ./cowork-plugin-management |
| sales | Prospect, craft outreach, and build deal strategy faster. Prep for calls, manage your pipeline, and write personalized messaging that moves deals forward. | Anthropic | ./sales |
| finance | Streamline finance and accounting workflows, from journal entries and reconciliation to financial statements and variance analysis. Speed up audit prep, month-end close, and keeping your books clean. | Anthropic | ./finance |
| data | Write SQL, explore datasets, and generate insights faster. Build visualizations and dashboards, and turn raw data into clear stories for stakeholders. | Anthropic | ./data |
| legal | Speed up contract review, NDA triage, and compliance workflows for in-house legal teams. Draft legal briefs, organize precedent research, and manage institutional knowledge. | Anthropic | ./legal |
| marketing | Create content, plan campaigns, and analyze performance across marketing channels. Maintain brand voice consistency, track competitors, and report on what's working. | Anthropic | ./marketing |
| customer-support | Triage tickets, draft responses, escalate issues, and build your knowledge base. Research customer context and turn resolved issues into self-service content. | Anthropic | ./customer-support |
| product-management | Write feature specs, plan roadmaps, and synthesize user research faster. Keep stakeholders updated and stay ahead of the competitive landscape. | Anthropic | ./product-management |
| bio-research | Connect to preclinical research tools and databases (literature search, genomics analysis, target prioritization) to accelerate early-stage life sciences R&D | Anthropic | ./bio-research |
| engineering | Streamline engineering workflows — standups, code review, architecture decisions, incident response, and technical documentation. Works with your existing tools or standalone. | Anthropic | ./engineering |
| human-resources | Streamline people operations — recruiting, onboarding, performance reviews, compensation analysis, and policy guidance. Maintain compliance and keep your team running smoothly. | Anthropic | ./human-resources |
| design | Accelerate design workflows — critique, design system management, UX writing, accessibility audits, research synthesis, and dev handoff. From exploration to pixel-perfect specs. | Anthropic | ./design |
| operations | Optimize business operations — vendor management, process documentation, change management, capacity planning, and compliance tracking. Keep your organization running efficiently. | Anthropic | ./operations |
| small-business | Pre-built small business workflows (including payroll planning, month-end close, weekly briefs, and growth campaigns) using your QuickBooks, PayPal, HubSpot, Docusign, Gsuite, O365, Canva, and other connected tools. You approve every step that touches money or customers. | Anthropic | ./small-business |
| pdf-viewer | View, annotate, and sign PDFs in a live interactive viewer. Mark up contracts, fill forms with visual feedback, stamp approvals, and place signatures — then download the annotated copy. | Anthropic | ./pdf-viewer |
| slack-by-salesforce | Slack integration for searching messages, sending communications, managing canvases, and more | Salesforce | ./partner-built/slack |
| apollo | Prospect, enrich leads, and load outreach sequences with Apollo.io — one-click MCP server integration for Claude Code and Cowork. | Apollo.io | ./partner-built/apollo |
| common-room | Turn Common Room into your GTM copilot. Research accounts and contacts, prep for calls with attendee profiles and talking points, and draft personalized outreach across email, LinkedIn, and phone. | Common Room | ./partner-built/common-room |
| brand-voice | Discover your brand voice from existing documents and conversations, generate enforceable guidelines, and validate AI-generated content against your established tone and positioning. | Tribe AI | ./partner-built/brand-voice |
| zoom-plugin | Plan, build, and debug Zoom integrations across REST APIs, Meeting SDK, Video SDK, webhooks, bots, and MCP workflows. Search meetings, retrieve recordings, access transcripts, and design AI-powered Zoom experiences. | Zoom | ./partner-built/zoom-plugin |
| vanta-mcp-plugin | The Vanta plugin connects Claude to Vanta's security and compliance platform through the Vanta MCP server. List failing compliance tests, get test-specific remediation context, and fix failing tests with code changes — directly from your Claude session. | VantaInc | url: VantaInc/vanta-mcp-plugin |
| bigdata-com | Official Bigdata.com plugin providing financial research, analytics, and intelligence tools powered by Bigdata MCP. | RavenPack | git-subdir: Bigdata-com/bigdata-plugins-marketplace |
| miro | Secure access to Miro boards. Enables AI to read board context, create diagrams, and generate code with enterprise-grade security. | Miro | git-subdir: miroapp/miro-ai |
| planetscale | An authenticated hosted MCP server that accesses your PlanetScale organizations, databases, branches, schema, and Insights data. Query against your data, surface slow queries, and get organizational and account information. | PlanetScale | url: planetscale/claude-plugin |
| adspirer-ads-agent | Cross-platform ad management for Google Ads, Meta Ads, TikTok Ads, and LinkedIn Ads. 91 tools for keyword research, campaign creation, performance analysis, and budget optimization. | Adspirer | url: amekala/adspirer-mcp-plugin |
| sanity-plugin | Sanity content platform integration with MCP server, agent skills, and slash commands. Query and author content, build and optimize GROQ queries, design schemas, and set up Visual Editing. | Sanity | url: sanity-io/agent-toolkit |
| zoominfo | Search companies and contacts, enrich leads, find lookalikes, and get AI-ranked contact recommendations. Pre-built skills chain multiple ZoomInfo tools into complete B2B sales workflows. | ZoomInfo | url: Zoominfo/zoominfo-mcp-plugin |
| mintlify | Build beautiful documentation sites with Mintlify. Convert non-markdown files into properly formatted MDX pages, add and modify content with correct component use, and automate documentation updates. | Mintlify | url: mintlify/mintlify-claude-plugin |
| daloopa | Financial analysis skills powered by Daloopa's institutional-grade data | Daloopa | url: daloopa/plugin |
| zapier | Connect 8,000+ apps to your AI workflow. Discover, enable, and execute Zapier actions directly from your client. | Zapier | git-subdir: zapier/zapier-mcp |
| intercom | Intercom integration for Claude Code. Search conversations, analyze customer support patterns, look up contacts and companies, and install the Intercom Messenger. Connect your Intercom workspace to get real-time insights from customer data. | Intercom | url: intercom/claude-plugin-external |
| cockroachdb | CockroachDB plugin for Claude Code — explore schemas, write optimized SQL, debug queries, and manage distributed database clusters directly from your AI coding agent. | CockroachDB | url: cockroachdb/claude-plugin |
| prisma | Prisma MCP integration for Postgres database management, schema migrations, SQL queries, and connection string management. Provision Prisma Postgres databases, run migrations, and interact with your data directly. | Prisma | url: prisma/claude-plugin |
| fastly-agent-toolkit | Fastly development tools and platform skills | Fastly | url: fastly/fastly-agent-toolkit |
| cloudinary | Use Cloudinary directly in Claude. Manage assets, apply transformations, optimize media, and more through natural conversation. | Cloudinary | url: cloudinary-devs/cloudinary-plugin |
| nimble | Nimble web data toolkit — search, extract, map, crawl the web and work with structured data agents | Nimble | url: Nimbleway/agent-skills |
| brightdata-plugin | Web scraping, Google search, structured data extraction, and MCP server integration powered by Bright Data. Includes 7 skills: scrape any webpage as markdown (with bot detection/CAPTCHA bypass), search Google with structured JSON results, extract data from 40+ websites (Amazon, LinkedIn, Instagram, TikTok, YouTube, and more), orchestrate Bright Data's 60+ MCP tools, built-in best practices for Web Unlocker, SERP API, Web Scraper API, and Browser API, Python SDK best practices for the brightda... | Bright Data | url: brightdata/skills |
| searchfit-seo | Free AI-powered SEO toolkit — audit websites, plan content strategy, optimize pages, generate schema markup, cluster keywords, and track AI visibility. Works with any website or codebase. | SearchFit | url: searchfit/searchfit-seo |
| atlan | Atlan data catalog plugin for Claude Code. Search, explore, govern, and manage your data assets through natural language. Powered by the Atlan MCP server with semantic search, lineage traversal, glossary management, data quality rules, and more. | Atlan | url: atlanhq/agent-toolkit |
| ai-firstify | AI-first project auditor and re-engineer based on the 9 design principles and 7 design patterns from the TechWolf AI-First Bootcamp | TechWolf | git-subdir: techwolf-ai/ai-first-toolkit |
| product-tracking-skills | AI agent skills that make SaaS products data-ready for product analytics — from codebase scan to tracking plan to working instrumentation code. | Accoil | url: Accoil/product-tracking-skills |
| postiz | Social media automation CLI for scheduling posts, managing integrations, uploading media, and tracking analytics across 28+ platforms including X, LinkedIn, Reddit, YouTube, TikTok, Instagram, and more | Postiz | url: gitroomhq/postiz-agent |
| figma | Figma design platform integration. Access design files, extract component information, read design tokens, and translate designs into code. Bridge the gap between design and development workflows. | Figma | url: figma/mcp-server-guide |
| adobe-for-creativity | Brings together Adobe Creative Cloud tools for images, vectors, design, and video. Edit multiple assets at once, adapt for different platforms, and complete multi-step creative workflows for polished results. | Adobe | git-subdir: adobe/skills |
| box | Work with your Box content directly from Claude Code — search files, organize folders, collaborate with your team, and use Box AI to answer questions, summarize documents, and extract data without leaving your workflow. | Box | url: box/box-for-ai |
| lseg | Price bonds, analyze yield curves, evaluate FX carry trades, value options, and build macro dashboards using LSEG financial data and analytics. | LSEG | url: LSEG-API-Samples/lseg-claude-plugin |
| sp-global | S&P Global - Financial data and analytics skills including company tearsheets, earnings previews, and transaction summaries | Kensho (S&P) | git-subdir: kensho-technologies/spglobal-agent-skills |

## By category

The marketplace.json `category` field is set on only 13 plugins; the rest are implicitly categorized by their description and the README's role-plugin grouping. Categories synthesized from both:

**Role / job-function plugins (Anthropic in-repo, 16):** productivity, sales, finance, data, legal, marketing, customer-support, product-management, bio-research, engineering, human-resources, design, operations, small-business, enterprise-search, cowork-plugin-management

**Knowledge management / search (4):** enterprise-search, box, atlan, mintlify

**Communication / collaboration (4):** slack-by-salesforce, zoom-plugin, intercom, miro

**Sales / GTM / prospecting (4):** sales, apollo, common-room, zoominfo

**Finance / financial data (5):** finance, lseg, sp-global, daloopa, bigdata-com

**Design / creative (3):** design, figma, adobe-for-creativity

**Database / data infrastructure (5):** data, planetscale, cockroachdb, prisma, atlan

**Marketing / content / brand (5):** marketing, brand-voice, postiz, adspirer-ads-agent, searchfit-seo

**Developer / dev-platform (4):** sanity-plugin, fastly-agent-toolkit, cloudinary, ai-firstify

**Web data / scraping / SEO (3):** nimble, brightdata-plugin, searchfit-seo

**Security / compliance (1):** vanta-mcp-plugin

**Automation / connector hub (1):** zapier (8,000+ apps via universal connector)

**Specialty / vertical (3):** bio-research, pdf-viewer, small-business

**Product analytics (1):** product-tracking-skills

(Plugins appear in multiple buckets where they straddle categories.)

## Connector footprint

Per README, the Anthropic in-repo role plugins reach into a broad SaaS stack. Sample from `productivity/.mcp.json`: Slack, Notion, Asana, Linear, Atlassian (Jira), Microsoft 365, Monday, ClickUp, Google Calendar, Gmail. Other role plugins layer in domain-specific connectors:

- **sales** — HubSpot, Close, Clay, ZoomInfo, Fireflies
- **product-management** — Figma, Amplitude, Pendo
- **marketing** — Canva, Ahrefs, SimilarWeb, Klaviyo, Supermetrics (added #123)
- **legal** — Box, Egnyte
- **finance / data** — Snowflake, Databricks, BigQuery, Definite (added #31), Hex
- **bio-research** — PubMed, BioRender, bioRxiv, ClinicalTrials.gov, ChEMBL, Synapse, Wiley, Owkin, Open Targets, Benchling, Consensus (added 2026-05-08)
- **small-business** — QuickBooks, PayPal, HubSpot, Docusign, Gsuite, O365, Canva

MCP connectors are HTTP / hosted URLs (e.g. `https://mcp.slack.com/mcp`, `https://mcp.notion.com/mcp`); a few use `npx` stdio servers with `-y` to avoid first-install prompts hanging (#5d244b9, 2026-03-25).

## Notable structural facts

- **Marketplace manifest** lives at `.claude-plugin/marketplace.json` and is the source of truth; the README table is curated to a 11-plugin subset for narrative emphasis but the manifest carries the full 49.
- **External plugin pins** every external plugin (`source.source: "url"` or `"git-subdir"`) carries a `sha` pin. A "SHA bump pipeline, policy scan, and MCP URL liveness check" was added 2026-05-19 (#236) to keep pins fresh.
- **Skills-first migration** completed 2026-03-13 (#115, #116) — commands across plugins were migrated to skills, with version bumps. The `skills/` directory is the auto-firing surface; `commands/` is the explicit slash-command surface.
- **Multi-surface** every plugin works in both Cowork and Claude Code per README "Getting Started" (`claude plugin marketplace add anthropics/knowledge-work-plugins` for Code; install from `claude.com/plugins` for Cowork). A few descriptions explicitly mention "Claude Code" (intercom, cockroachdb) or "Cowork" but the marketplace is unified.
