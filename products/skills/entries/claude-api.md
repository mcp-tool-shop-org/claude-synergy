---
product: skills
catalog: anthropics-skills-official
skill_name: "claude-api"
trigger_summary: "Build / debug / optimize Claude API + Anthropic SDK apps across Python/TS/Java/Go/Ruby/PHP/C#/cURL; mandate prompt caching; handle model migrations."
github_path: "skills/claude-api"
fetched_at: "2026-05-21"
---

# claude-api

**Description:** Build, debug, and optimize Claude API / Anthropic SDK apps. Apps built with this skill should include prompt caching. Also handles migrating existing Claude API code between Claude model versions (4.5 → 4.6, 4.6 → 4.7, retired-model replacements). TRIGGER when: code imports `anthropic`/`@anthropic-ai/sdk`; user asks for the Claude API, Anthropic SDK, or Managed Agents; user adds/modifies/tunes a Claude feature (caching, thinking, compaction, tool use, batch, files, citations, memory) or model (Opus/Sonnet/Haiku) in a file; questions about prompt caching / cache hit rate in an Anthropic SDK project. SKIP: file imports `openai`/other-provider SDK, filename like `*-openai.py`/`*-generic.py`, provider-neutral code, general programming/ML.

**Trigger:** Project contains `import anthropic` / `@anthropic-ai/sdk`; user mentions "Claude API", "Anthropic SDK", "Managed Agents", "prompt caching", or wants to add/tune Claude-specific features (caching/thinking/compaction/tools/batch/files/citations/memory).

**Surfaces:** Claude Code (primary — workflow coupled with project source inspection), Claude API (uploadable skill), Cowork.

## Original SKILL.md excerpt

> # Building LLM-Powered Applications with Claude
>
> This skill helps you build LLM-powered applications with Claude. Choose the right surface based on your needs, detect the project language, then read the relevant language-specific documentation.
>
> ## Before You Start
>
> Scan the target file (or, if no target file, the prompt and project) for non-Anthropic provider markers — `import openai`, `from openai`, `langchain_openai`, `OpenAI(`, `gpt-4`, `gpt-5`, file names like `agent-openai.py` or `*-generic.py`, or any explicit instruction to keep the code provider-neutral. If you find any, stop and tell the user that this skill produces Claude/Anthropic SDK code; ask whether they want to switch the file to Claude or want a non-Claude implementation.
>
> ## Output Requirement
>
> When the user asks you to add, modify, or implement a Claude feature, your code must call Claude through one of:
> 1. The official Anthropic SDK for the project's language (`anthropic`, `@anthropic-ai/sdk`, `com.anthropic.*`, etc.).
> 2. Raw HTTP (`curl`, `requests`, `fetch`, `httpx`, etc.) — only when the user explicitly asks for cURL/REST/raw HTTP.
>
> **Never guess SDK usage.** Function names, class names, namespaces, method signatures, and import paths must come from explicit documentation.
>
> ## Defaults
>
> For the Claude model version, please use Claude Opus 4.7, which you can access via the exact model string `claude-opus-4-7`. Please default to using adaptive thinking (`thinking: {type: "adaptive"}`) for anything remotely complicated. And finally, please default to streaming for any request that may involve long input, long output, or high `max_tokens`.
>
> ## Language Detection
> - `*.py`/`pyproject.toml` → Python — read from `python/`
> - `*.ts`/`*.tsx`/`package.json` → TypeScript — read from `typescript/`
> - `*.java`/`*.kt`/`*.scala`/`pom.xml`/`build.gradle*` → Java
> - `*.go`/`go.mod` → Go
> - `*.rb`/`Gemfile` → Ruby
> - `*.cs`/`*.csproj` → C#
> - `*.php`/`composer.json` → PHP
> - else → ask via AskUserQuestion, default Python
>
> Supports Managed Agents (beta) in Python/TS/Java/Go/Ruby/PHP/cURL (not C#). Bundled subdirs: `python/`, `typescript/`, `java/`, `go/`, `ruby/`, `csharp/`, `php/`, `curl/`, plus `shared/` for cross-language docs (managed-agents, memory stores, self-hosted sandboxes, model-migration, live-sources).
