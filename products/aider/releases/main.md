---
product: aider
version: "main"
released_at: null
source_url: "https://raw.githubusercontent.com/Aider-AI/aider/main/HISTORY.md"
fetched_at: "2026-05-22"
---

# aider vmain

- Added support for Claude 4.5/4.6 models and updated model aliases (sonnet/haiku/opus).
- Expanded Gemini model support with 2.5 Flash and Flash‑Lite, added Gemini 3 preview models, and updated the flash alias to gemini/gemini-flash-latest.
- Added DeepSeek Reasoner model and updated DeepSeek model metadata with costs and prompt caching.
- Added BadGatewayError and ImageFetchError to handled exceptions.
- Fixed exception mapping to only include real exception classes, avoiding runtime errors, by Claudia Pellegrino.
- Repo map now tags Fortran, Haskell, Julia, and Zig and is compatible with newer tree-sitter Python APIs, by Varchas Gopalaswamy, Tim Put, and Mubashir Osmani.
- Removed deprecated google-generativeai dependency to eliminate import warnings, by Mark McDonald.
- Added settings for new OpenAI GPT‑5.1/5.2 and GPT‑5‑pro models across OpenAI, Azure, and OpenRouter, including chat and codex variants.
- Changed the gemini alias to point to gemini/gemini-3-pro-preview.
- Added support for OpenAI o1-pro model.
- Added support for GPT‑5.3/5.4 model variants across OpenAI, Azure, and OpenRouter, plus GPT‑4.1‑nano.
- Added `/ok` as a shortcut for asking aider to go ahead with the proposed changes, with optional extra instructions.
- When auto-commits are disabled, aider can add files outside the git repo and promote read-only files to editable, by Chris McCormick.
- Fixed crashes caused by circular symlink loops when resolving paths, by coder_3.
- Aider wrote 62% of the code in this release.
