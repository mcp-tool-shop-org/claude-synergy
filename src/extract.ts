// Entity extraction from change bullet text.
// Regex-based; runs at ingest time. No LLM in the loop.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { AppError } from './errors.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FAMILY_NAME_RE = /^[A-Za-z0-9._+-]+$/;

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function resolveModelFamiliesPath(explicitPath?: string): string {
  if (explicitPath) return explicitPath;
  const envPath = process.env.CLAUDE_SYNERGY_MODEL_FAMILIES?.trim();
  if (envPath) return envPath;
  return join(__dirname, '..', 'model-families.yaml');
}

/**
 * Load and validate the model family list from `model-families.yaml` (or an
 * explicit path). Throws a named AppError (`MODEL_FAMILIES_CONFIG_ERROR`) on
 * missing, unreadable, malformed, or empty configs rather than silently
 * producing an empty pattern.
 */
export function loadModelFamilies(yamlPath?: string): string[] {
  const resolved = resolveModelFamiliesPath(yamlPath);
  let raw: string;
  try {
    raw = readFileSync(resolved, 'utf-8');
  } catch (e: any) {
    throw new AppError({
      code: 'MODEL_FAMILIES_CONFIG_ERROR',
      message: `could not read model families file at ${resolved}`,
      hint: 'Ensure model-families.yaml exists alongside the package or set CLAUDE_SYNERGY_MODEL_FAMILIES.',
      cause: e?.message ?? String(e),
    });
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (e: any) {
    throw new AppError({
      code: 'MODEL_FAMILIES_CONFIG_ERROR',
      message: `malformed YAML in model families file ${resolved}`,
      hint: 'Fix YAML syntax; expected `families: [opus, sonnet, haiku, ...]`.',
      cause: e?.message ?? String(e),
    });
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed) ||
    !Array.isArray((parsed as { families?: unknown }).families)
  ) {
    throw new AppError({
      code: 'MODEL_FAMILIES_CONFIG_ERROR',
      message: `model families file ${resolved} must define a top-level \`families\` array`,
      hint: 'Expected YAML mapping with a non-empty `families:` list of strings.',
    });
  }

  const rawFamilies = (parsed as { families: unknown[] }).families;
  const families: string[] = [];
  const seen = new Set<string>();

  for (const item of rawFamilies) {
    if (typeof item !== 'string') {
      throw new AppError({
        code: 'MODEL_FAMILIES_CONFIG_ERROR',
        message: `invalid family entry in ${resolved}: expected string, got ${typeof item}`,
        hint: 'Every entry under `families:` must be a non-empty model family name.',
      });
    }
    const trimmed = item.trim();
    if (!trimmed || !FAMILY_NAME_RE.test(trimmed)) {
      throw new AppError({
        code: 'MODEL_FAMILIES_CONFIG_ERROR',
        message: `invalid model family name ${JSON.stringify(item)} in ${resolved}`,
        hint: 'Family names must be non-empty tokens matching /^[A-Za-z0-9._+-]+$/.',
      });
    }
    if (!seen.has(trimmed)) {
      seen.add(trimmed);
      families.push(trimmed);
    }
  }

  if (families.length === 0) {
    throw new AppError({
      code: 'MODEL_FAMILIES_CONFIG_ERROR',
      message: `model families list in ${resolved} is empty`,
      hint: 'Add at least one model family name under `families:`.',
    });
  }

  return families;
}

/**
 * Build the `model_id` extraction regex from `model-families.yaml` (or a
 * custom YAML file), escaping each family name.
 */
export function buildModelIdPattern(yamlPath?: string): RegExp {
  const families = loadModelFamilies(yamlPath);
  const alternation = families.map(escapeRegExp).join('|');
  return new RegExp(
    `\\b(claude-(?:${alternation})-\\d+(?:-\\d+)?(?:-\\d{8})?)(?![-A-Za-z0-9]|\\.\\d)\\b`,
    'g'
  );
}

function buildPatterns(modelIdPattern: RegExp): Array<{ type: string; pattern: RegExp }> {
  return [
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
    // Model IDs — claude-<family>-N(-N)?(-YYYYMMDD)? loaded from model-families.yaml
    {
      type: 'model_id',
      pattern: modelIdPattern,
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
}

const DEFAULT_MODEL_ID_PATTERN = buildModelIdPattern();
const DEFAULT_PATTERNS = buildPatterns(DEFAULT_MODEL_ID_PATTERN);

export interface ExtractOptions {
  modelFamiliesPath?: string;
}

export function extractEntities(text: string, opts?: ExtractOptions): Array<[string, string]> {
  const patterns = opts?.modelFamiliesPath
    ? buildPatterns(buildModelIdPattern(opts.modelFamiliesPath))
    : DEFAULT_PATTERNS;
  const found: Array<[string, string]> = [];
  const seen = new Set<string>();
  for (const { type, pattern } of patterns) {
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
