---
product: skills
catalog: anthropics-skills-official
skill_name: "pptx"
trigger_summary: ".pptx (PowerPoint) — create, read, edit, manipulate any presentation file."
github_path: "skills/pptx"
fetched_at: "2026-05-21"
---

# pptx

**Description:** Use this skill any time a .pptx file is involved in any way — as input, output, or both. This includes: creating slide decks, pitch decks, or presentations; reading, parsing, or extracting text from any .pptx file (even if the extracted content will be used elsewhere, like in an email or summary); editing, modifying, or updating existing presentations; combining or splitting slide files; working with templates, layouts, speaker notes, or comments. Trigger whenever the user mentions "deck," "slides," "presentation," or references a .pptx filename, regardless of what they plan to do with the content afterward. If a .pptx file needs to be opened, created, or touched, use this skill.

**Trigger:** Any mention of `.pptx`, "deck", "slides", "presentation", "pitch deck"; or any extraction/edit task on a presentation file.

**Surfaces:** Claude.ai document capabilities (production), Claude Code, Claude API. License: Proprietary (source-available).

## Original SKILL.md excerpt

> # PPTX Skill
>
> ## Quick Reference
>
> | Task | Guide |
> |------|-------|
> | Read/analyze content | `python -m markitdown presentation.pptx` |
> | Edit or create from template | Read [editing.md](editing.md) |
> | Create from scratch | Read [pptxgenjs.md](pptxgenjs.md) |
>
> ## Reading Content
> ```bash
> python -m markitdown presentation.pptx          # text extraction
> python scripts/thumbnail.py presentation.pptx    # visual overview
> python scripts/office/unpack.py presentation.pptx unpacked/   # raw XML
> ```
>
> ## Editing Workflow
> Analyze template with `thumbnail.py` → unpack → manipulate slides → edit content → clean → pack
>
> ## Creating from Scratch
> Use when no template or reference presentation is available — see `pptxgenjs.md`.
>
> ## Design Ideas
>
> **Don't create boring slides.** Plain bullets on a white background won't impress anyone.
>
> ### Before Starting
> - **Pick a bold, content-informed color palette**
> - **Dominance over equality**: One color should dominate (60-70% visual weight), with 1-2 supporting tones and one sharp accent.
> - **Dark/light contrast**: Dark backgrounds for title + conclusion slides, light for content ("sandwich" structure).
> - **Commit to a visual motif**: Pick ONE distinctive element and repeat it — rounded image frames, icons in colored circles, thick single-side borders.
>
> Bundled color palettes include Midnight Executive, Forest & Moss, Coral Energy, Warm Terracotta, Ocean Gradient, Charcoal Minimal, Teal Trust, Berry & Cream, Sage Calm, Cherry Bold. Tools: pptxgenjs (creation), markitdown, python-pptx, scripts/thumbnail.py, scripts/office/{unpack,pack}.py.
