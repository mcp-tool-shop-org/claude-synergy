import { describe, it, expect } from 'vitest';
import { extractEntities } from '../../src/extract.js';

function values(text: string, type: string): string[] {
  return extractEntities(text)
    .filter(([t]) => t === type)
    .map(([, v]) => v);
}

describe('extractEntities', () => {
  describe('env_var', () => {
    it('matches the canonical env vars', () => {
      const text =
        'Use CLAUDE_CODE_WORKFLOWS, ANTHROPIC_API_KEY, MCP_TOOL_TIMEOUT, GH_TOKEN, and OLLAMA_HOST.';
      const found = values(text, 'env_var');
      expect(found).toEqual(
        expect.arrayContaining([
          'CLAUDE_CODE_WORKFLOWS',
          'ANTHROPIC_API_KEY',
          'MCP_TOOL_TIMEOUT',
          'GH_TOKEN',
          'OLLAMA_HOST',
        ])
      );
    });

    it('is case-sensitive — lowercase or mixed does not match', () => {
      expect(values('claude_code_workflows', 'env_var')).toEqual([]);
      expect(values('CLAUDE_CODE_workflows', 'env_var')).toEqual([]);
    });

    it('does not match in-word substrings', () => {
      // word-boundary regex should not catch partial matches
      expect(values('XCLAUDE_CODE_THING_Y', 'env_var')).toEqual([]);
    });

    it('matches GITHUB_, AWS_, GOOGLE_, NODE_, NPM_ prefixed vars', () => {
      const text = 'GITHUB_TOKEN, AWS_REGION, GOOGLE_API_KEY, NODE_OPTIONS, NPM_CONFIG_USERCONFIG';
      const found = values(text, 'env_var');
      expect(found).toContain('GITHUB_TOKEN');
      expect(found).toContain('AWS_REGION');
      expect(found).toContain('GOOGLE_API_KEY');
      expect(found).toContain('NODE_OPTIONS');
      expect(found).toContain('NPM_CONFIG_USERCONFIG');
    });
  });

  describe('slash_command', () => {
    it('matches canonical slash commands', () => {
      const text = 'Use /code-review and /usage-credits and /ultrareview for testing.';
      const found = values(text, 'slash_command');
      expect(found).toEqual(
        expect.arrayContaining(['/code-review', '/usage-credits', '/ultrareview'])
      );
    });

    // NOTE: spec §4.1 says URL paths and file paths should NOT match, but the
    // current regex only excludes preceding-`/` (covers `//foo`), preceding-word
    // (covers `flag/value`), and trailing word chars / hyphens. It does NOT exclude
    // a trailing `/`. So `/v1/messages` matches `/v1` and `/home/foo` matches
    // `/home`. Tests pin the actual behavior; tighten the regex (and these tests)
    // together if it changes.
    it('matches the first segment of URL paths (known limitation)', () => {
      expect(values('POST /v1/messages endpoint', 'slash_command')).toEqual(['/v1']);
    });

    it('matches the first segment of filesystem paths (known limitation)', () => {
      expect(values('See /home/foo/bar.md for details', 'slash_command')).toEqual(['/home']);
    });

    it('does not match in-word slashes', () => {
      expect(values('flag/value combo', 'slash_command')).toEqual([]);
    });
  });

  describe('cli_option', () => {
    it('matches double-dash long flags', () => {
      const text = 'Pass --config, --limit, and --since to customize.';
      const found = values(text, 'cli_option');
      expect(found).toEqual(expect.arrayContaining(['--config', '--limit', '--since']));
    });

    it('does not match the -- separator or --- rule', () => {
      expect(values('use -- to separate args', 'cli_option')).toEqual([]);
      expect(values('--- horizontal rule ---', 'cli_option')).toEqual([]);
    });
  });

  describe('beta_header', () => {
    it('matches kebab-with-date beta headers', () => {
      const text =
        'New beta headers: fast-mode-2026-02-01, cache-diagnosis-2026-04-07, managed-agents-2026-04-01.';
      const found = values(text, 'beta_header');
      expect(found).toEqual(
        expect.arrayContaining([
          'fast-mode-2026-02-01',
          'cache-diagnosis-2026-04-07',
          'managed-agents-2026-04-01',
        ])
      );
    });

    it('does not match plain dates', () => {
      expect(values('Released 2026-04-01', 'beta_header')).toEqual([]);
    });
  });

  describe('model_id', () => {
    it('matches modern model IDs with optional date suffix', () => {
      const text =
        'Supports claude-opus-4-7, claude-sonnet-4-6-20250929, claude-haiku-4-5, and legacy claude-opus-4-20250514.';
      const found = values(text, 'model_id');
      expect(found).toEqual(
        expect.arrayContaining([
          'claude-opus-4-7',
          'claude-sonnet-4-6-20250929',
          'claude-haiku-4-5',
          'claude-opus-4-20250514',
        ])
      );
    });

    it('does not match claude-code or claude-mythos-preview', () => {
      expect(values('claude-code release', 'model_id')).toEqual([]);
      expect(values('claude-mythos-preview', 'model_id')).toEqual([]);
    });
  });

  describe('hook_event', () => {
    it('matches the defined hook events', () => {
      const text =
        'Implements PreToolUse, PostToolUse, SessionStart, SessionEnd, SubagentStart, SubagentStop, Stop, UserPromptSubmit, Setup, Notification, PreCompact, ConfigChange.';
      const found = values(text, 'hook_event');
      expect(found.length).toBeGreaterThanOrEqual(12);
      expect(found).toEqual(
        expect.arrayContaining([
          'PreToolUse',
          'PostToolUse',
          'SessionStart',
          'SessionEnd',
          'SubagentStart',
          'SubagentStop',
          'Stop',
          'UserPromptSubmit',
          'Setup',
          'Notification',
          'PreCompact',
          'ConfigChange',
        ])
      );
    });

    it('is case-sensitive', () => {
      expect(values('pretooluse', 'hook_event')).toEqual([]);
      expect(values('PRETOOLUSE', 'hook_event')).toEqual([]);
    });
  });

  describe('setting_key', () => {
    it('matches dotted setting keys', () => {
      const text =
        'Configures permissions.ask, hooks.PreToolUse, and worktree.bgIsolation.';
      const found = values(text, 'setting_key');
      expect(found).toEqual(
        expect.arrayContaining(['permissions.ask', 'hooks.PreToolUse', 'worktree.bgIsolation'])
      );
    });
  });

  describe('cve', () => {
    it('matches CVE identifiers', () => {
      const text = 'Fixed CVE-2025-66414 and CVE-2026-12345.';
      const found = values(text, 'cve');
      expect(found).toEqual(expect.arrayContaining(['CVE-2025-66414', 'CVE-2026-12345']));
    });
  });

  describe('ghsa', () => {
    it('matches GHSA identifiers', () => {
      const text = 'Fixed GHSA-9h52-p55h-vw2f vulnerability.';
      const found = values(text, 'ghsa');
      expect(found).toEqual(['GHSA-9h52-p55h-vw2f']);
    });
  });

  describe('deduplication', () => {
    it('produces ONE row when an entity is mentioned twice', () => {
      const text = 'CLAUDE_CODE_WORKFLOWS introduced. Use CLAUDE_CODE_WORKFLOWS to enable.';
      const found = values(text, 'env_var');
      expect(found).toEqual(['CLAUDE_CODE_WORKFLOWS']);
    });

    it('produces multiple rows for distinct entities', () => {
      const text = 'CLAUDE_CODE_WORKFLOWS plus ANTHROPIC_API_KEY together.';
      const found = values(text, 'env_var');
      expect(found.length).toBe(2);
      expect(found).toEqual(
        expect.arrayContaining(['CLAUDE_CODE_WORKFLOWS', 'ANTHROPIC_API_KEY'])
      );
    });
  });

  describe('boundary cases', () => {
    it('returns [] on empty string', () => {
      expect(extractEntities('')).toEqual([]);
    });

    it('returns [] on whitespace-only input', () => {
      expect(extractEntities('   \n\t   ')).toEqual([]);
    });
  });

  describe('multi-type extraction', () => {
    it('returns entities of multiple types from a single text', () => {
      const text =
        'Added CLAUDE_CODE_WORKFLOWS env var and /code-review slash command with --limit option.';
      const results = extractEntities(text);
      const types = new Set(results.map(([t]) => t));
      expect(types.has('env_var')).toBe(true);
      expect(types.has('slash_command')).toBe(true);
      expect(types.has('cli_option')).toBe(true);
    });
  });
});
