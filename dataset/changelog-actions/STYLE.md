# `action_text` style spec

Locked by the Phase A1 study swarm. Apply mechanically to every entry. **This spec is load-bearing — inconsistency in the dataset propagates to the fine-tune** (per [Li et al. SCAR 2024, arXiv:2406.10882](https://arxiv.org/abs/2406.10882): style consistency dominates dataset size; selecting 0.7–25% of style-consistent examples matches or beats the full dataset).

## Hard rules

| Dimension | Rule |
|---|---|
| **Length** | 1–3 sentences. 30–80 words target. 150–400 chars target. **Hard cap: 500 chars.** |
| **Voice** | Imperative + present tense. Verb-first opener. |
| **Banned openers** | "If you...", "You should...", "We recommend...", "You might want to...", "This change...", "Users who..." — anything that puts a conditional or preamble before the verb. |
| **Allowed openers** | "Replace `X` with `Y`.", "Audit `X` for...", "Upgrade to N+ if...", "Update `X` to use...", "Remove `X` from...", "Pass `--flag` when...", "Spread `process.env` before...", "Migrate `X` to `Y`." |
| **Surface naming** | The affected surface (env var, API method, CLI flag, slash command, config key, file path) MUST appear in backticks in the first sentence. Non-negotiable. |
| **Code blocks** | Include code (fenced or inline) ONLY when the source `change_text` already contains code. Never invent code. Code is the demonstration of the fix, not an addition. |
| **Consequence clause** | Optional second sentence may name the failure mode the action prevents. Keep concrete: "Subprocess will lose inherited env (PATH, ANTHROPIC_API_KEY) if you don't." NOT abstract: "This could cause issues." |
| **Hedging** | Banned. "might", "could potentially", "may want to", "should probably" — all out. State the action; if you're not sure, downgrade `kind` to `unknown` and lower `severity`, but don't hedge the prose. |
| **Future tense** | Banned. "Will be removed" is fine when stating an upstream-named fact; "you will need to" is hedged future — use "update X" present-imperative instead. |

## Audience model

The reader is in **skim mode**, glancing at a digest queue of 20+ action items. **The first 8 words must convey the action.** If they can't tell from the first 8 words what to do, the entry fails. No preamble. No throat-clearing. No "This change means that..."

## Examples

### Good (verb-first, surface-named, concrete)

> Replace `/simplify` with `/code-review`. The new command also accepts an effort suffix (`/code-review high`); the default matches the old `/simplify`.

> Audit every call site passing `options.env` to `query()`. Spread `process.env` first: `env: { ...process.env, MY_VAR: 'x' }`. Subprocess will lose inherited env (PATH, ANTHROPIC_API_KEY) if you don't.

> Upgrade to 0.16.0+ to pass `output_schema` to `define_tool`. Pre-fix callers passing the argument had no error but also no effect.

### Bad (conditional opener, hedged, surface buried)

> ❌ "If you have hooks, scripts, or muscle memory invoking `/simplify`, you should consider replacing them with `/code-review`."
> — conditional opener, "should consider" is hedged future, takes 14 words before the surface name.

> ❌ "This change means that the `options.env` parameter will now replace `process.env` instead of overlaying it, so you might want to audit your code."
> — "This change" preamble, future tense, "might want to" hedged.

> ❌ "Stability and reliability have been improved in this release."
> — passive voice, no surface named, no action. (If the source change_text is this vague, `kind: unknown` and action_text says so explicitly: "Upgrade if you've been hitting stability issues; upstream notes don't specify which.")

## When to break the rules

Almost never. Two cases:

1. **`kind: unknown`** entries genuinely have no actionable advice; the action_text should say so plainly: "Upgrade if affected; upstream notes don't specify the scope." This IS the action.
2. **Multi-surface entries** (one change affects three env vars) may need a third sentence to enumerate. Stay under 500 chars.

If you're tempted to break the rules for prose quality, **don't** — the fine-tune learns the rule, not the exception. Consistency dominates polish.

## Why this spec is load-bearing

The fine-tune model will mimic the dataset's voice exactly. Three converging lines of evidence:

- **[Li et al. SCAR 2024 (arXiv:2406.10882)](https://arxiv.org/abs/2406.10882)** — Style consistency beats dataset size, even at 0.7% of data. Inconsistency in the dataset transfers directly to inconsistency in the fine-tune.
- **[Liang et al. 2024 (arXiv:2307.15504)](https://arxiv.org/abs/2307.15504)** — Format inconsistency across instruction-tuning datasets measurably degrades generalization on unseen instructions.
- **[Zhao et al. 2024 "Long Is More for Alignment" (arXiv:2402.04833)](https://arxiv.org/abs/2402.04833)** — Length signals "more learnable information"; too-short outputs train sycophantic, content-thin models. The 30-80 word target is calibrated above the "too-short" floor.

A dataset that mixes 1-sentence terse entries with 5-sentence chatty ones produces a fine-tune that does both at random. The spec exists to make every entry consistent enough that the fine-tune learns one register, not several.
