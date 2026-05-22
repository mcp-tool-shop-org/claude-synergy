---
product: skills
catalog: anthropics-skills-official
skill_name: "slack-gif-creator"
trigger_summary: "Animated GIFs optimized for Slack — emoji (128x128) and message (480x480), PIL-based."
github_path: "skills/slack-gif-creator"
fetched_at: "2026-05-21"
---

# slack-gif-creator

**Description:** Knowledge and utilities for creating animated GIFs optimized for Slack. Provides constraints, validation tools, and animation concepts. Use when users request animated GIFs for Slack like "make me a GIF of X doing Y for Slack."

**Trigger:** "Make a Slack GIF", "create an emoji animation", "animated GIF of X for Slack", "build a custom Slack emoji".

**Surfaces:** Claude.ai, Claude Code, Claude API — outputs `.gif` files via PIL.

## Original SKILL.md excerpt

> # Slack GIF Creator
>
> A toolkit providing utilities and knowledge for creating animated GIFs optimized for Slack.
>
> ## Slack Requirements
>
> **Dimensions:**
> - Emoji GIFs: 128x128 (recommended)
> - Message GIFs: 480x480
>
> **Parameters:**
> - FPS: 10-30 (lower is smaller file size)
> - Colors: 48-128 (fewer = smaller file size)
> - Duration: Keep under 3 seconds for emoji GIFs
>
> ## Core Workflow
>
> ```python
> from core.gif_builder import GIFBuilder
> from PIL import Image, ImageDraw
>
> builder = GIFBuilder(width=128, height=128, fps=10)
>
> for i in range(12):
>     frame = Image.new('RGB', (128, 128), (240, 248, 255))
>     draw = ImageDraw.Draw(frame)
>     # Draw your animation using PIL primitives
>     builder.add_frame(frame)
>
> builder.save('output.gif', num_colors=48, optimize_for_emoji=True)
> ```
>
> ## Drawing Graphics
>
> Working with User-Uploaded Images: consider whether to use directly (e.g., "animate this") or as inspiration. Drawing from scratch: use PIL ImageDraw primitives (ellipse, polygon, line, rectangle).
>
> Bundled `core/gif_builder.py` handles size/palette/optimization. Bundled animation concepts in references include simple loops, bounces, spins, and character-style emojis.
