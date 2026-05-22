---
product: skills
catalog: anthropics-skills-official
skill_name: "webapp-testing"
trigger_summary: "Test local web apps with Playwright — verify functionality, debug UI, screenshot, view browser logs."
github_path: "skills/webapp-testing"
fetched_at: "2026-05-21"
---

# webapp-testing

**Description:** Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.

**Trigger:** "Test my web app", "screenshot this page", "debug this UI", "run Playwright against my local server", "verify the frontend works".

**Surfaces:** Claude Code (primary — runs against local dev servers), Claude API. Manages server lifecycle via `scripts/with_server.py`.

## Original SKILL.md excerpt

> # Web Application Testing
>
> To test local web applications, write native Python Playwright scripts.
>
> **Helper Scripts Available**:
> - `scripts/with_server.py` - Manages server lifecycle (supports multiple servers)
>
> **Always run scripts with `--help` first** to see usage. DO NOT read the source until you try running the script first and find that a customized solution is absolutely necessary. These scripts can be very large and thus pollute your context window. They exist to be called directly as black-box scripts rather than ingested into your context window.
>
> ## Decision Tree: Choosing Your Approach
>
> User task → Is it static HTML?
> - Yes → Read HTML file directly to identify selectors → write Playwright script
> - No (dynamic webapp) → Is the server already running?
>   - No → use `with_server.py` + simplified Playwright script
>   - Yes → reconnaissance-then-action: navigate, wait for networkidle, screenshot/inspect DOM, identify selectors, execute actions
>
> ## Example: Using with_server.py
>
> **Single server:**
> ```bash
> python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
> ```
>
> **Multiple servers (backend + frontend):**
> ```bash
> python scripts/with_server.py \
>   --server "cd backend && python server.py" --port 3000 \
>   --server "cd frontend && npm run dev" --port 5173 \
>   -- python your_automation.py
> ```
>
> Always launch chromium in headless mode. CRITICAL: Wait for `networkidle` for dynamic apps before inspecting DOM.
