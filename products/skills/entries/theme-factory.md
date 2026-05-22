---
product: skills
catalog: anthropics-skills-official
skill_name: "theme-factory"
trigger_summary: "Apply curated colour + font themes to artifacts (slides/docs/HTML); 10 preset themes + on-the-fly custom theme generation."
github_path: "skills/theme-factory"
fetched_at: "2026-05-21"
---

# theme-factory

**Description:** Toolkit for styling artifacts with a theme. These artifacts can be slides, docs, reportings, HTML landing pages, etc. There are 10 pre-set themes with colors/fonts that you can apply to any artifact that has been creating, or can generate a new theme on-the-fly.

**Trigger:** "Apply a theme to this deck", "style my landing page", "give this a professional look", or selecting one of the 10 preset themes by name.

**Surfaces:** Claude.ai, Claude Code, Claude API — applied as a styling layer over pptx/docx/HTML outputs.

## Original SKILL.md excerpt

> # Theme Factory Skill
>
> This skill provides a curated collection of professional font and color themes themes, each with carefully selected color palettes and font pairings. Once a theme is chosen, it can be applied to any artifact.
>
> ## Usage Instructions
>
> 1. **Show the theme showcase**: Display the `theme-showcase.pdf` file to allow users to see all available themes visually.
> 2. **Ask for their choice**: Ask which theme to apply to the deck
> 3. **Wait for selection**: Get explicit confirmation about the chosen theme
> 4. **Apply the theme**: Once a theme has been chosen, apply the selected theme's colors and fonts to the deck/artifact
>
> ## Themes Available
>
> The following 10 themes are available, each showcased in `theme-showcase.pdf`:
>
> 1. **Ocean Depths** - Professional and calming maritime theme
> 2. **Sunset Boulevard** - Warm and vibrant sunset colors
> 3. **Forest Canopy** - Natural and grounded earth tones
> 4. **Modern Minimalist** - Clean and contemporary grayscale
> 5. **Golden Hour** - Rich and warm autumnal palette
> 6. **Arctic Frost** - Cool and crisp winter-inspired theme
> 7. **Desert Rose** - Soft and sophisticated dusty tones
> 8. **Tech Innovation** - Bold and modern tech aesthetic
> 9. **Botanical Garden** - Fresh and organic garden colors
> 10. **Midnight Galaxy** - Dramatic and cosmic deep tones
>
> ## Create your Own Theme
> To handle cases where none of the existing themes work for an artifact, create a custom theme. Based on provided inputs, generate a new theme similar to the ones above.
>
> Bundled: `theme-showcase.pdf`, `themes/` directory with full per-theme specifications.
