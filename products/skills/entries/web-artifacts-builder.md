---
product: skills
catalog: anthropics-skills-official
skill_name: "web-artifacts-builder"
trigger_summary: "Elaborate multi-component claude.ai HTML artifacts via React + TS + Vite + Tailwind + shadcn/ui, bundled into one HTML."
github_path: "skills/web-artifacts-builder"
fetched_at: "2026-05-21"
---

# web-artifacts-builder

**Description:** Suite of tools for creating elaborate, multi-component claude.ai HTML artifacts using modern frontend web technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components - not for simple single-file HTML/JSX artifacts.

**Trigger:** "Build a complex artifact with state/routing", "use shadcn/ui", "multi-component React app as an artifact". NOT for simple single-file artifacts.

**Surfaces:** Claude.ai (artifacts — the bundled output is a single self-contained HTML file shareable in conversation), Claude Code, Claude API.

## Original SKILL.md excerpt

> # Web Artifacts Builder
>
> To build powerful frontend claude.ai artifacts, follow these steps:
> 1. Initialize the frontend repo using `scripts/init-artifact.sh`
> 2. Develop your artifact by editing the generated code
> 3. Bundle all code into a single HTML file using `scripts/bundle-artifact.sh`
> 4. Display artifact to user
> 5. (Optional) Test the artifact
>
> **Stack**: React 18 + TypeScript + Vite + Parcel (bundling) + Tailwind CSS + shadcn/ui
>
> ## Design & Style Guidelines
>
> VERY IMPORTANT: To avoid what is often referred to as "AI slop", avoid using excessive centered layouts, purple gradients, uniform rounded corners, and Inter font.
>
> ## Quick Start
>
> ### Step 1: Initialize Project
> ```bash
> bash scripts/init-artifact.sh <project-name>
> cd <project-name>
> ```
>
> This creates a fully configured project with React + TypeScript (via Vite), Tailwind CSS 3.4.1 with shadcn/ui theming, path aliases (`@/`), 40+ shadcn/ui components pre-installed, all Radix UI dependencies, Parcel configured for bundling, Node 18+ compatibility.
>
> ### Step 3: Bundle to Single HTML File
> ```bash
> bash scripts/bundle-artifact.sh
> ```
>
> Creates `bundle.html` — a self-contained artifact with all JavaScript, CSS, and dependencies inlined.
>
> Bundled scripts: `init-artifact.sh`, `bundle-artifact.sh`. Reference: https://ui.shadcn.com/docs/components
