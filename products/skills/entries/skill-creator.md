---
product: skills
catalog: anthropics-skills-official
skill_name: "skill-creator"
trigger_summary: "Create new skills, improve existing ones, run evals + benchmarks, optimize triggering description."
github_path: "skills/skill-creator"
fetched_at: "2026-05-21"
---

# skill-creator

**Description:** Create new skills, modify and improve existing skills, and measure skill performance. Use when users want to create a skill from scratch, edit, or optimize an existing skill, run evals to test a skill, benchmark skill performance with variance analysis, or optimize a skill's description for better triggering accuracy.

**Trigger:** "Create a skill", "make this into a skill", "evaluate my skill", "optimize the skill description", "benchmark this skill", "improve skill triggering".

**Surfaces:** Claude Code (primary — eval scripts + scaffolding), Claude API, Claude.ai (uploadable skill). Uses `claude -p` subprocess (not SDK) so no separate ANTHROPIC_API_KEY needed.

## Original SKILL.md excerpt

> # Skill Creator
>
> A skill for creating new skills and iteratively improving them.
>
> At a high level, the process of creating a skill goes like this:
>
> - Decide what you want the skill to do and roughly how it should do it
> - Write a draft of the skill
> - Create a few test prompts and run claude-with-access-to-the-skill on them
> - Help the user evaluate the results both qualitatively and quantitatively
> - Rewrite the skill based on feedback from the user's evaluation of the results
> - Repeat until you're satisfied
> - Expand the test set and try again at larger scale
>
> ## Creating a skill
>
> ### Capture Intent
>
> 1. What should this skill enable Claude to do?
> 2. When should this skill trigger? (what user phrases/contexts)
> 3. What's the expected output format?
> 4. Should we set up test cases to verify the skill works?
>
> ### Write the SKILL.md
>
> - **name**: Skill identifier
> - **description**: When to trigger, what it does. This is the primary triggering mechanism — include both what the skill does AND specific contexts for when to use it. All "when to use" info goes here, not in the body. Note: currently Claude has a tendency to "undertrigger" skills — to not use them when they'd be useful. To combat this, please make the skill descriptions a little bit "pushy".
> - **compatibility**: Required tools, dependencies (optional, rarely needed)
>
> ### Anatomy of a Skill
> ```
> skill-name/
> ├── SKILL.md (required)
> │   ├── YAML frontmatter (name, description required)
> │   └── Markdown instructions
> └── Bundled Resources (optional)
> ```
>
> Bundled scripts: `init_skill.py` (scaffold), `quick_validate.py` (validate frontmatter; max name length 64, kebab-case), `run_eval.py` (triggering eval), `improve_description.py` (description optimizer via `claude -p`), `aggregate_benchmark.py`, `package_skill.py`. Sub-agents in `agents/`: analyzer, comparator, grader.
