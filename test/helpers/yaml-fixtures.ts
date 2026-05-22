// Reusable YAML config fixtures for products-config tests.
//
// `validProductsYaml()` covers every strategy in a single document so a single
// `loadProductsConfig` call exercises the full parser.
//
// Other helpers produce intentionally broken YAML to drive the error paths.

export function validProductsYaml(): string {
  return `products:

  - name: claude-agent-sdk-python
    display_name: Claude Agent SDK (Python)
    tier: 1
    source_url: https://github.com/anthropics/claude-agent-sdk-python
    fetch_strategy: gh-releases
    fetch:
      type: gh-releases
      repo: anthropics/claude-agent-sdk-python

  - name: anthropic-sdk-typescript
    display_name: Anthropic SDK (TypeScript)
    tier: 1
    source_url: https://github.com/anthropics/anthropic-sdk-typescript
    fetch_strategy: gh-releases
    fetch:
      type: gh-releases
      repo: anthropics/anthropic-sdk-typescript
      multi_package: true

  - name: cursor
    display_name: Cursor
    tier: 3
    source_url: https://cursor.com/changelog
    fetch_strategy: rss
    fetch:
      type: rss
      url: https://cursor.com/changelog/rss.xml

  - name: cody-enterprise
    display_name: Sourcegraph Cody Enterprise
    tier: 3
    source_url: https://sourcegraph.com/changelog
    fetch_strategy: rss
    fetch:
      type: rss
      url: https://sourcegraph.com/changelog/featured.rss
      title_filter: cody|sourcegraph

  - name: aider
    display_name: Aider
    tier: 2
    source_url: https://github.com/Aider-AI/aider
    fetch_strategy: raw-changelog
    fetch:
      type: raw-changelog
      url: https://raw.githubusercontent.com/Aider-AI/aider/main/HISTORY.md
      parser: aider-history

  - name: github-copilot
    display_name: GitHub Copilot
    tier: 3
    source_url: https://github.blog/changelog/label/copilot/
    fetch_strategy: html-scrape
    fetch:
      type: html-scrape
      parser: github-copilot-blog

  - name: mcp-registry-official
    display_name: Official MCP Registry
    tier: 4
    source_url: https://registry.modelcontextprotocol.io
    fetch_strategy: catalog
    notes: Official Anthropic-recognised MCP registry
    fetch:
      type: catalog
      catalog_type: official-mcp-registry
      max_entries: 500

  - name: mcp-registry-smithery
    display_name: Smithery MCP Registry
    tier: 4
    source_url: https://registry.smithery.ai
    fetch_strategy: catalog
    fetch:
      type: catalog
      catalog_type: smithery
      max_entries: 200

  - name: windsurf
    display_name: Windsurf
    tier: 3
    source_url: https://windsurf.com/changelog
    fetch_strategy: playwright
    fetch:
      type: playwright

  - name: catalog-only-no-fetch
    display_name: Catalog-only test entry
    tier: 4
    source_url: https://example.test/no-fetch
    fetch_strategy: webfetch
    # No fetch: block — entry registered in productMeta but absent from fetchTargets
`;
}

/** YAML missing the required `products:` key at the top. */
export function invalidProductsYamlNoRoot(): string {
  return `# not a products config\nsomething_else:\n  - a\n  - b\n`;
}

/** YAML with a syntactically-broken token (real YAML parse error — bad indentation + flow-seq mismatch). */
export function malformedProductsYaml(): string {
  return `products: [unclosed-flow-seq\n  bad: indent\n    deeper: [also-bad\n`;
}

/** YAML with an entry missing required `name`. */
export function missingNameProductsYaml(): string {
  return `products:\n  - display_name: oops\n    tier: 1\n`;
}

/** gh-releases without `repo`. */
export function ghReleasesMissingRepoYaml(): string {
  return `products:\n  - name: foo\n    display_name: foo\n    tier: 1\n    source_url: u\n    fetch_strategy: gh-releases\n    fetch:\n      type: gh-releases\n`;
}

/** rss without `url`. */
export function rssMissingUrlYaml(): string {
  return `products:\n  - name: foo\n    display_name: foo\n    tier: 3\n    source_url: u\n    fetch_strategy: rss\n    fetch:\n      type: rss\n`;
}

/** rss with an invalid title_filter regex (unclosed group). */
export function rssBadRegexYaml(): string {
  return `products:\n  - name: foo\n    display_name: foo\n    tier: 3\n    source_url: u\n    fetch_strategy: rss\n    fetch:\n      type: rss\n      url: https://example.test/rss\n      title_filter: "(unclosed"\n`;
}

/** raw-changelog without `parser`. */
export function rawChangelogMissingParserYaml(): string {
  return `products:\n  - name: foo\n    display_name: foo\n    tier: 2\n    source_url: u\n    fetch_strategy: raw-changelog\n    fetch:\n      type: raw-changelog\n      url: https://example.test/history.md\n`;
}

/** html-scrape without `parser`. */
export function htmlScrapeMissingParserYaml(): string {
  return `products:\n  - name: foo\n    display_name: foo\n    tier: 3\n    source_url: u\n    fetch_strategy: html-scrape\n    fetch:\n      type: html-scrape\n`;
}

/** catalog without `catalog_type`. */
export function catalogMissingTypeYaml(): string {
  return `products:\n  - name: foo\n    display_name: foo\n    tier: 4\n    source_url: u\n    fetch_strategy: catalog\n    fetch:\n      type: catalog\n`;
}

/** Unknown fetch type. */
export function unknownFetchTypeYaml(): string {
  return `products:\n  - name: foo\n    display_name: foo\n    tier: 1\n    source_url: u\n    fetch_strategy: gh-releases\n    fetch:\n      type: not-a-real-strategy\n`;
}

/** YAML with a UTF-8 BOM prefix. */
export function bomPrefixedYaml(): string {
  return '﻿' + validProductsYaml();
}

/** YAML with forward-compat unknown top-level field — should NOT error. */
export function forwardCompatYaml(): string {
  return `products:\n  - name: foo\n    display_name: Foo\n    tier: 1\n    source_url: u\n    fetch_strategy: gh-releases\n    fetch:\n      type: gh-releases\n      repo: anthropics/foo\nfuture_extension:\n  enabled: true\n`;
}
