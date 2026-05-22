---
product: skills
catalog: anthropics-skills-official
skill_name: "doc-coauthoring"
trigger_summary: "Structured 3-stage workflow for co-authoring substantial docs (PRD, spec, design doc, RFC, proposal)."
github_path: "skills/doc-coauthoring"
fetched_at: "2026-05-21"
---

# doc-coauthoring

**Description:** Guide users through a structured workflow for co-authoring documentation. Use when user wants to write documentation, proposals, technical specs, decision docs, or similar structured content. This workflow helps users efficiently transfer context, refine content through iteration, and verify the doc works for readers. Trigger when user mentions writing docs, creating proposals, drafting specs, or similar documentation tasks.

**Trigger:** "Write a doc / draft a proposal / create a spec / write up", or specific doc types ("PRD", "design doc", "decision doc", "RFC").

**Surfaces:** Claude.ai (with integrations to Slack/Teams/Google Drive/SharePoint for context-pulling), Claude Code, Cowork.

## Original SKILL.md excerpt

> # Doc Co-Authoring Workflow
>
> This skill provides a structured workflow for guiding users through collaborative document creation. Act as an active guide, walking users through three stages: Context Gathering, Refinement & Structure, and Reader Testing.
>
> ## When to Offer This Workflow
>
> Trigger conditions:
> - User mentions writing documentation: "write a doc", "draft a proposal", "create a spec", "write up"
> - User mentions specific doc types: "PRD", "design doc", "decision doc", "RFC"
> - User seems to be starting a substantial writing task
>
> Initial offer: Offer the user a structured workflow for co-authoring the document. Explain the three stages:
>
> 1. **Context Gathering**: User provides all relevant context while Claude asks clarifying questions
> 2. **Refinement & Structure**: Iteratively build each section through brainstorming and editing
> 3. **Reader Testing**: Test the doc with a fresh Claude (no context) to catch blind spots before others read it
>
> ## Stage 1: Context Gathering
>
> **Goal:** Close the gap between what the user knows and what Claude knows, enabling smart guidance later.
>
> Start by asking the user for meta-context about the document:
> 1. What type of document is this?
> 2. Who's the primary audience?
> 3. What's the desired impact when someone reads this?
> 4. Is there a template or specific format to follow?
> 5. Any other constraints or context to know?
>
> Once initial questions are answered, encourage the user to dump all the context they have. Offer multiple ways to provide context (info dump, link to team channels, link to shared docs). If integrations are available (Slack/Teams/Drive/SharePoint), mention these can pull context directly.
>
> **Asking clarifying questions:** Generate 5-10 numbered questions based on gaps in the context. Inform them they can use shorthand to answer.
>
> **Exit condition:** Sufficient context has been gathered when questions show understanding — when edge cases and trade-offs can be asked about without needing basics explained.
