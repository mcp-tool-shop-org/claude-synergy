// Entity extraction from change bullet text.
// Regex-based; runs at ingest time. No LLM in the loop.

const PATTERNS: Array<{ type: string; pattern: RegExp }> = [
  // env vars — uppercase with underscores, prefixed by known prefixes
  {
    type: 'env_var',
    pattern: /\b((?:CLAUDE_CODE|ANTHROPIC|MCP|GH|GITHUB|AWS|GOOGLE|VOYAGE|OLLAMA|NPM|NODE)_[A-Z][A-Z0-9_]+)\b/g,
  },
  // slash commands — lowercase with hyphens, must start with /
  {
    type: 'slash_command',
    pattern: /(?<![A-Za-z0-9_/])(\/[a-z][a-z0-9-]+)(?![A-Za-z0-9-])/g,
  },
  // CLI options — --long-form or -s shorthand
  {
    type: 'cli_option',
    pattern: /(?<![A-Za-z0-9])(--[a-z][a-z0-9-]+)(?![A-Za-z0-9-])/g,
  },
  // Beta headers — kebab-case with date suffix YYYY-MM-DD
  {
    type: 'beta_header',
    pattern: /\b([a-z][a-z0-9-]*-20\d{2}-\d{2}-\d{2})\b/g,
  },
  // Model IDs — claude-{opus,sonnet,haiku}-N(-N)?(-YYYYMMDD)?
  {
    type: 'model_id',
    pattern: /\b(claude-(?:opus|sonnet|haiku)-\d+(?:-\d+)?(?:-\d{8})?)\b/g,
  },
  // Hook event names — defined set
  {
    type: 'hook_event',
    pattern: /\b(PreToolUse|PostToolUse|SessionStart|SessionEnd|SubagentStart|SubagentStop|Stop|UserPromptSubmit|Setup|Notification|PreCompact|ConfigChange|WorktreeCreate)\b/g,
  },
  // Setting keys — camelCase under settings.json (heuristic)
  {
    type: 'setting_key',
    pattern: /\b((?:permissions|hooks|worktree|mcpServers|spinnerVerbs|allowed_non_write_users)\.[a-zA-Z]+)\b/g,
  },
  // CVE identifiers
  {
    type: 'cve',
    pattern: /\b(CVE-20\d{2}-\d{4,7})\b/g,
  },
  // GHSA identifiers
  {
    type: 'ghsa',
    pattern: /\b(GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})\b/g,
  },
];

export function extractEntities(text: string): Array<[string, string]> {
  const found: Array<[string, string]> = [];
  const seen = new Set<string>();
  for (const { type, pattern } of PATTERNS) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      const value = match[1];
      const key = `${type}:${value}`;
      if (!seen.has(key)) {
        seen.add(key);
        found.push([type, value]);
      }
    }
  }
  return found;
}
