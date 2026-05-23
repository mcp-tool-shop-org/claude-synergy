import type { SiteConfig } from '@mcptoolshop/site-theme';

export const config: SiteConfig = {
  title: 'Claude Synergy',
  description: 'Local mirror of Anthropic product changelogs with hybrid FTS5 + sqlite-vec retrieval and curated cross-product synergy intelligence.',
  logoBadge: 'CS',
  brandName: 'claude-synergy',
  repoUrl: 'https://github.com/mcp-tool-shop-org/claude-synergy',
  npmUrl: 'https://www.npmjs.com/package/@mcptoolshop/claude-synergy',
  footerText: 'MIT Licensed — built by <a href="https://mcp-tool-shop.github.io/" style="color:var(--color-muted);text-decoration:underline">MCP Tool Shop</a>',

  hero: {
    badge: 'v1.1 — 44 products',
    headline: 'Claude Synergy',
    headlineAccent: 'knows what the harness can do.',
    description: 'A local, queryable mirror of every Anthropic + adjacent AI dev tool changelog — plus a curated Synergy layer describing cross-product workflows.',
    primaryCta: { href: '#usage', label: 'Get started' },
    secondaryCta: { href: 'handbook/', label: 'Read the Handbook' },
    previews: [
      { label: 'Install', code: 'npm i -g @mcptoolshop/claude-synergy' },
      { label: 'Sync', code: 'hk sync' },
      { label: 'Search', code: 'hk query "managed agents"' },
    ],
  },

  sections: [
    {
      kind: 'features',
      id: 'features',
      title: 'Features',
      subtitle: 'Why Claude Synergy exists.',
      features: [
        {
          title: 'Hybrid search',
          desc: 'FTS5 full-text + sqlite-vec semantic search fused via Reciprocal Rank Fusion. Optional reranking via Voyage or Cohere.',
        },
        {
          title: '44 products tracked',
          desc: 'Anthropic SDKs (7 languages), Agent SDKs, MCP ecosystem, Cursor, Aider, Continue.dev, Cody, Windsurf, and more.',
        },
        {
          title: 'MCP server',
          desc: '11-tool MCP server over stdio. Wire it into Claude Code, Cline, or any MCP-compatible harness for live changelog queries.',
        },
        {
          title: '12 synergies',
          desc: 'Curated cross-product workflows — skill portability, MCP server portability, design-to-code bundles, and more.',
        },
        {
          title: 'Zero telemetry',
          desc: 'Runs locally. No analytics, no crash reporting, no network calls unless you explicitly invoke fetch/sync/embed.',
        },
        {
          title: '508 tests',
          desc: 'Comprehensive test suite covering fetchers, ingest, query, embed, security validators, and CLI integration.',
        },
      ],
    },
    {
      kind: 'code-cards',
      id: 'usage',
      title: 'Usage',
      cards: [
        {
          title: 'Install & sync',
          code: 'npm i -g @mcptoolshop/claude-synergy\nhk init && hk sync',
        },
        {
          title: 'Full-text search',
          code: 'hk query "redact api-key"\nhk query --product anthropic-sdk-typescript --since 2026-01-01 "streaming"',
        },
        {
          title: 'Hybrid semantic search',
          code: 'hk embed --embed ollama\nhk hybrid "how do I use tool use with streaming?"',
        },
        {
          title: 'MCP server',
          code: '# In claude_desktop_config.json:\n{\n  "mcpServers": {\n    "claude-synergy": {\n      "command": "claude-synergy-mcp"\n    }\n  }\n}',
        },
      ],
    },
  ],
};
