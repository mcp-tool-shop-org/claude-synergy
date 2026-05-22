---
name: anthropic-byok-across-surfaces
title: One ANTHROPIC_API_KEY powers Claude across seven editors
products: [claude-code, cursor, continue-dev, aider, copilot, cody-enterprise, claude-api]
trigger: User on Claude Max or Anthropic API tier wants unified billing across multiple editors
status: confirmed
last_validated: 2026-05-21
---

# One ANTHROPIC_API_KEY powers Claude across seven editors

**Why it works:** BYOK (Bring Your Own Key) support is widespread enough now that one Anthropic API key from `console.anthropic.com` can drive Claude Sonnet/Opus/Haiku across every major IDE assistant.

**Workflow:**

1. Generate or copy your API key from [console.anthropic.com](https://console.anthropic.com/settings/keys).
2. Wire into each surface you use:

| Surface | How to wire BYOK |
|---|---|
| **Claude Code** | Native — uses subscription OR `ANTHROPIC_API_KEY` env. Set `--api-key` or auth via console. |
| **Cursor** | Settings → Models → API Keys → "Anthropic API key" field. Bypasses Cursor's subscription quota. |
| **Continue.dev** | `.continue/config.yaml` with `provider: anthropic`, key reference. First-party provider with prompt caching. |
| **Aider** | `aider --model anthropic/claude-sonnet-4-6-20250929` with `ANTHROPIC_API_KEY` env. Aliases: `sonnet`, `haiku`, `opus`. |
| **GitHub Copilot** | VS Code Chat "Custom Endpoint" provider (Insiders). Config in `chatLanguageModels.json` with `vendor: customendpoint`, `apiType: "messages"`, `url: https://api.anthropic.com/v1/messages`. |
| **Cody Enterprise** | BYO key in admin settings, or route via Cody Gateway / Bedrock / Vertex. (Free/Pro plans don't apply — deprecated 2025-07-23.) |
| **Claude API direct** | Native — same key. |

3. All seven surfaces bill to the same Anthropic account. Prompt caching works wherever the surface supports it (Continue, Code, API direct).

**Evidence:**

- [Anthropic Console](https://console.anthropic.com)
- [Cursor + Claude integration guide](https://www.spacecake.ai/blog/cursor-claude-integration-guide)
- [Continue.dev Anthropic provider](https://docs.continue.dev/customize/model-providers/top-level/anthropic)
- [Aider Anthropic docs](https://aider.chat/docs/llms/anthropic.html)
- [VS Code AI language models / Custom Endpoint](https://code.visualstudio.com/docs/copilot/customization/language-models)
- [Cody supported models](https://sourcegraph.com/docs/cody)

**Caveats:**

- **Windsurf does NOT publicly document BYOK.** Routes through Windsurf's gateway with credit pricing instead. If you need direct-billed BYOK, Windsurf is the gap.
- **Cody Free / Cody Pro retired 2025-07-23.** Only Cody Enterprise ($59/user/mo) supports BYOK now. Indie devs migrated to Cursor / Claude Code / Amp.
- **Prompt caching support varies.** Continue.dev caches system messages + conversation history automatically. Claude Code and direct API support caching with manual breakpoints or auto-caching. Cursor/Aider/Copilot caching support is less documented.
- **Rate limits stack against the key, not the surface.** Heavy usage across 7 surfaces hits the same `requests/min` and `tokens/min` quotas. Plan accordingly.
- **Routing alternatives.** For enterprises that want cloud-provider billing, all major surfaces support Bedrock / Vertex / Foundry / AWS Claude Platform routing — same models, different billing path.
