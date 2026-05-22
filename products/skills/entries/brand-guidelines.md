---
product: skills
catalog: anthropics-skills-official
skill_name: "brand-guidelines"
trigger_summary: "Apply Anthropic's official brand colors + typography to any artifact."
github_path: "skills/brand-guidelines"
fetched_at: "2026-05-21"
---

# brand-guidelines

**Description:** Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.

**Trigger:** Mentions of branding, corporate identity, visual identity, post-processing, styling, brand colors, typography, Anthropic brand, visual formatting, visual design.

**Surfaces:** Claude.ai, Claude Code, Claude API — applied as a styling layer over docx/pptx/HTML outputs (uses RGBColor in python-pptx-style flows).

## Original SKILL.md excerpt

> # Anthropic Brand Styling
>
> ## Overview
> To access Anthropic's official brand identity and style resources, use this skill.
>
> **Keywords**: branding, corporate identity, visual identity, post-processing, styling, brand colors, typography, Anthropic brand, visual formatting, visual design
>
> ## Brand Guidelines
>
> ### Colors
>
> **Main Colors:**
> - Dark: `#141413` - Primary text and dark backgrounds
> - Light: `#faf9f5` - Light backgrounds and text on dark
> - Mid Gray: `#b0aea5` - Secondary elements
> - Light Gray: `#e8e6dc` - Subtle backgrounds
>
> **Accent Colors:**
> - Orange: `#d97757` - Primary accent
> - Blue: `#6a9bcc` - Secondary accent
> - Green: `#788c5d` - Tertiary accent
>
> ### Typography
> - **Headings**: Poppins (with Arial fallback)
> - **Body Text**: Lora (with Georgia fallback)
>
> ### Smart Font Application
> - Applies Poppins font to headings (24pt and larger)
> - Applies Lora font to body text
> - Automatically falls back to Arial/Georgia if custom fonts unavailable
>
> ### Shape and Accent Colors
> - Non-text shapes use accent colors
> - Cycles through orange, blue, and green accents
> - Maintains visual interest while staying on-brand
