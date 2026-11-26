import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  PRODUCTS_PACKAGES_CONFIG_ERROR,
  UNASSIGNED_PACKAGE,
  UNASSIGNED_PACKAGE_LABEL,
  deriveReleaseIdentity,
  extractVersionFromNotesPath,
  getCanonicalPackages,
  isMultiPackageProduct,
  loadProductsConfig,
  resetWarnedFlag,
  resolveCanonicalPackageName,
  resolveReleasePackage,
} from '../../src/products-config.js';
import {
  validProductsYaml,
  invalidProductsYamlNoRoot,
  malformedProductsYaml,
  missingNameProductsYaml,
  ghReleasesMissingRepoYaml,
  rssMissingUrlYaml,
  rssBadRegexYaml,
  rawChangelogMissingParserYaml,
  htmlScrapeMissingParserYaml,
  catalogMissingTypeYaml,
  unknownFetchTypeYaml,
  bomPrefixedYaml,
  forwardCompatYaml,
} from '../helpers/yaml-fixtures.js';

let dir: string;
function writeYaml(contents: string): string {
  const p = join(dir, 'products.yaml');
  writeFileSync(p, contents, 'utf-8');
  return p;
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'pcfg-'));
  resetWarnedFlag();
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('loadProductsConfig — happy path', () => {
  it('returns ProductsConfig with productMeta + fetchTargets', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()));
    expect(cfg).not.toBeNull();
    expect(Object.keys(cfg!.productMeta).length).toBe(10);
    // catalog-only entry has no fetch block → 9 fetch targets
    expect(cfg!.fetchTargets.length).toBe(9);
  });

  it('populates ProductMeta fields from frontmatter', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()))!;
    const py = cfg.productMeta['claude-agent-sdk-python'];
    expect(py.name).toBe('claude-agent-sdk-python');
    expect(py.display_name).toBe('Claude Agent SDK (Python)');
    expect(py.source_tier).toBe(1);
    expect(py.fetch_strategy).toBe('gh-releases');
    expect(py.source_url).toMatch(/github\.com/);
  });

  it('catalog-only entries appear in productMeta but NOT in fetchTargets', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()))!;
    expect(cfg.productMeta['catalog-only-no-fetch']).toBeDefined();
    const targets = cfg.fetchTargets.find((t) => t.product === 'catalog-only-no-fetch');
    expect(targets).toBeUndefined();
  });

  it('emits fetchTargets in the same order as the YAML document', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()))!;
    const firstFew = cfg.fetchTargets.slice(0, 3).map((t) => t.product);
    expect(firstFew).toEqual([
      'claude-agent-sdk-python',
      'anthropic-sdk-typescript',
      'cursor',
    ]);
  });
});

describe('loadProductsConfig — strategy mapping', () => {
  it('gh-releases preserves repo + multi_package', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()))!;
    const ts = cfg.fetchTargets.find((t) => t.product === 'anthropic-sdk-typescript')!;
    expect(ts.strategy).toBe('gh-releases');
    expect(ts.repo).toBe('anthropics/anthropic-sdk-typescript');
    expect(ts.multiPackage).toBe(true);
  });

  it('rss compiles title_filter into RegExp (case-insensitive)', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()))!;
    const cody = cfg.fetchTargets.find((t) => t.product === 'cody-enterprise')!;
    expect(cody.strategy).toBe('rss');
    expect(cody.rssUrl).toContain('sourcegraph.com');
    expect(cody.rssTitleFilter).toBeInstanceOf(RegExp);
    expect(cody.rssTitleFilter!.flags).toContain('i');
    expect(cody.rssTitleFilter!.test('Cody update'), 'title filter should match "Cody update"').toBe(true);
    expect(cody.rssTitleFilter!.test('unrelated'), 'title filter should not match "unrelated"').toBe(false);
  });

  it('raw-changelog carries url + parser', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()))!;
    const aider = cfg.fetchTargets.find((t) => t.product === 'aider')!;
    expect(aider.strategy).toBe('raw-changelog');
    expect(aider.rawChangelogUrl).toContain('HISTORY.md');
    expect(aider.rawChangelogParser).toBe('aider-history');
  });

  it('html-scrape carries parser', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()))!;
    const cop = cfg.fetchTargets.find((t) => t.product === 'github-copilot')!;
    expect(cop.strategy).toBe('html-scrape');
    expect(cop.htmlParser).toBe('github-copilot-blog');
  });

  it('catalog carries catalog_type + max_entries (attached as untyped extras)', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()))!;
    const off = cfg.fetchTargets.find((t) => t.product === 'mcp-registry-official')!;
    expect(off.strategy).toBe('catalog');
    expect((off as any).catalogType).toBe('official-mcp-registry');
    expect((off as any).catalogMaxEntries).toBe(500);
  });

  it('playwright strategy needs no extra config (Windsurf-hardcoded for now)', () => {
    const cfg = loadProductsConfig(writeYaml(validProductsYaml()))!;
    const win = cfg.fetchTargets.find((t) => t.product === 'windsurf')!;
    expect(win.strategy).toBe('playwright');
  });
});

describe('loadProductsConfig — validation + error paths', () => {
  it('returns null and warns once when products.yaml is missing', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const missing = join(dir, 'nope.yaml');
    expect(loadProductsConfig(missing)).toBeNull();
    expect(loadProductsConfig(missing)).toBeNull();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatch(/products\.yaml not found/);
  });

  it('throws on malformed YAML with a helpful prefix', () => {
    expect(() => loadProductsConfig(writeYaml(malformedProductsYaml()))).toThrow(
      /products\.yaml parse error/
    );
  });

  it('throws when the top-level products array is missing', () => {
    expect(() => loadProductsConfig(writeYaml(invalidProductsYamlNoRoot()))).toThrow(
      /missing required 'products' array/
    );
  });

  it('throws when an entry is missing name/display_name', () => {
    expect(() => loadProductsConfig(writeYaml(missingNameProductsYaml()))).toThrow(
      /missing name\/display_name/
    );
  });

  it('throws when gh-releases is missing repo', () => {
    expect(() => loadProductsConfig(writeYaml(ghReleasesMissingRepoYaml()))).toThrow(
      /gh-releases requires 'repo'/
    );
  });

  it('throws when rss is missing url', () => {
    expect(() => loadProductsConfig(writeYaml(rssMissingUrlYaml()))).toThrow(/rss requires 'url'/);
  });

  it('throws when rss title_filter is an invalid regex', () => {
    expect(() => loadProductsConfig(writeYaml(rssBadRegexYaml()))).toThrow(
      /invalid rss title_filter regex/
    );
  });

  it('throws when raw-changelog is missing parser', () => {
    expect(() => loadProductsConfig(writeYaml(rawChangelogMissingParserYaml()))).toThrow(
      /raw-changelog requires 'parser'/
    );
  });

  it('throws when html-scrape is missing parser', () => {
    expect(() => loadProductsConfig(writeYaml(htmlScrapeMissingParserYaml()))).toThrow(
      /html-scrape requires 'parser'/
    );
  });

  it('throws when html-scrape uses an unsupported parser', () => {
    const badHtmlParserYaml = `products:
  - name: foo
    display_name: foo
    tier: 3
    source_url: https://example.test
    fetch_strategy: html-scrape
    fetch:
      type: html-scrape
      parser: unknown-html-parser
`;
    expect(() => loadProductsConfig(writeYaml(badHtmlParserYaml))).toThrow(
      /html-scrape 'parser' must be one of/
    );
  });

  it('throws when catalog is missing catalog_type', () => {
    expect(() => loadProductsConfig(writeYaml(catalogMissingTypeYaml()))).toThrow(
      /catalog requires 'catalog_type'/
    );
  });

  it('throws on unknown fetch type', () => {
    expect(() => loadProductsConfig(writeYaml(unknownFetchTypeYaml()))).toThrow(
      /unknown fetch type/
    );
  });
});

describe('loadProductsConfig — forward-compat + BOM', () => {
  it('strips a UTF-8 BOM from the start of the file', () => {
    const cfg = loadProductsConfig(writeYaml(bomPrefixedYaml()));
    expect(cfg).not.toBeNull();
    expect(cfg!.productMeta['claude-agent-sdk-python']).toBeDefined();
  });

  it('unknown top-level keys are tolerated (forward-compat)', () => {
    const cfg = loadProductsConfig(writeYaml(forwardCompatYaml()));
    expect(cfg).not.toBeNull();
    expect(cfg!.fetchTargets.length).toBe(1);
    expect(cfg!.fetchTargets[0].product).toBe('foo');
  });
});

describe('loadProductsConfig — packages identity validation', () => {
  it('parses valid packages across npm, pypi, crates, and go', () => {
    const yaml = `products:
  - name: mapped-prod
    display_name: Mapped Product
    tier: 1
    source_url: https://example.invalid/mapped
    fetch_strategy: gh-releases
    packages:
      - ecosystem: npm
        name: "@scope/pkg"
        release_prefix: "sdk-"
      - ecosystem: pypi
        name: some-py-pkg
        release_prefix: "py-"
      - ecosystem: crates
        name: some-crate
        release_prefix: "rmcp-v"
      - ecosystem: go
        name: example.invalid/mod
        release_prefix: ""
  - name: unmapped-prod
    display_name: Unmapped Product
    tier: 1
    source_url: https://example.invalid/unmapped
    fetch_strategy: gh-releases
`;
    const cfg = loadProductsConfig(writeYaml(yaml))!;
    expect(cfg.productMeta['mapped-prod'].packages).toEqual([
      { ecosystem: 'npm', name: '@scope/pkg', release_prefix: 'sdk-' },
      { ecosystem: 'pypi', name: 'some-py-pkg', release_prefix: 'py-' },
      { ecosystem: 'crates', name: 'some-crate', release_prefix: 'rmcp-v' },
      { ecosystem: 'go', name: 'example.invalid/mod', release_prefix: '' },
    ]);
    expect(cfg.productMeta['unmapped-prod'].packages).toBeUndefined();
  });

  it('throws PRODUCTS_PACKAGES_CONFIG_ERROR for unknown ecosystem, empty name, or bad release_prefix', () => {
    const cases = [
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages: "not-an-array"\n`,
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages:\n      - "just-a-string"\n`,
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages:\n      - ecosystem: maven\n        name: com.example:pkg\n        release_prefix: ""\n`,
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages:\n      - ecosystem: npm\n        name: "   "\n        release_prefix: ""\n`,
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages:\n      - ecosystem: npm\n        name: "has space"\n        release_prefix: ""\n`,
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages:\n      - ecosystem: npm\n        name: "@scope/pkg"\n`,
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages:\n      - ecosystem: npm\n        name: "@scope/pkg"\n        release_prefix: 123\n`,
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages:\n      - ecosystem: npm\n        name: "@scope/pkg"\n        release_prefix: "sub/pkg-"\n`,
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages:\n      - ecosystem: npm\n        name: "@scope/pkg"\n        release_prefix: "v1.0-"\n`,
      `products:\n  - name: bad\n    display_name: Bad\n    tier: 1\n    source_url: https://example.invalid\n    fetch_strategy: gh-releases\n    packages:\n      - ecosystem: npm\n        name: "@scope/pkg"\n        release_prefix: "has space-"\n`,
    ];

    for (const c of cases) {
      let caught: any;
      try {
        loadProductsConfig(writeYaml(c));
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeDefined();
      expect(caught.code).toBe(PRODUCTS_PACKAGES_CONFIG_ERROR);
    }
  });
});

describe('loadProductsConfig — repo products.yaml', () => {
  it('the real repo-root products.yaml loads without error and includes mapped SDK/CLI packages', () => {
    const cfg = loadProductsConfig();
    // The hardcoded fallback returns null when products.yaml is missing; the
    // repo ships a real one, so this should be non-null.
    expect(cfg).not.toBeNull();
    expect(Object.keys(cfg!.productMeta).length).toBeGreaterThan(20);
    expect(cfg!.fetchTargets.length).toBeGreaterThan(15);
    expect(cfg!.productMeta['claude-code'].packages).toEqual([
      { ecosystem: 'npm', name: '@anthropic-ai/claude-code', release_prefix: '' },
    ]);
    expect(cfg!.productMeta['claude-agent-sdk-python'].packages).toEqual([
      { ecosystem: 'pypi', name: 'claude-agent-sdk', release_prefix: '' },
    ]);
    expect(cfg!.productMeta['mcp-rust-sdk'].packages).toEqual([
      { ecosystem: 'crates', name: 'rmcp', release_prefix: 'rmcp-v' },
      { ecosystem: 'crates', name: 'rmcp-macros', release_prefix: 'rmcp-macros-v' },
    ]);
    expect(cfg!.productMeta['anthropic-sdk-typescript'].packages).toEqual([
      { ecosystem: 'npm', name: '@anthropic-ai/sdk', release_prefix: 'sdk-' },
      { ecosystem: 'npm', name: '@anthropic-ai/bedrock-sdk', release_prefix: 'bedrock-sdk-' },
      { ecosystem: 'npm', name: '@anthropic-ai/vertex-sdk', release_prefix: 'vertex-sdk-' },
      { ecosystem: 'npm', name: '@anthropic-ai/aws-sdk', release_prefix: 'aws-sdk-' },
      { ecosystem: 'npm', name: '@anthropic-ai/foundry-sdk', release_prefix: 'foundry-sdk-' },
      { ecosystem: 'npm', name: '@anthropic-ai/google-cloud-sdk', release_prefix: 'google-cloud-sdk-' },
    ]);
    expect(cfg!.productMeta['mcp-typescript-sdk'].packages?.length).toBe(10);
    expect(cfg!.productMeta['anthropic-sdk-csharp'].packages?.map((p) => [p.ecosystem, p.name, p.release_prefix])).toEqual([
      ['nuget', 'Anthropic', 'Anthropic-'],
      ['nuget', 'Anthropic.Bedrock', 'Bedrock-'],
      ['nuget', 'Anthropic.Vertex', 'Vertex-'],
      ['nuget', 'Anthropic.Foundry', 'Foundry-'],
      ['nuget', 'Anthropic.Aws', 'Aws-'],
      ['nuget', 'Anthropic.GoogleCloud', 'GoogleCloud-'],
    ]);
    expect(cfg!.productMeta['anthropic-cli'].packages?.map((p) => p.release_prefix)).toEqual(['', '', 'sandboxes-v']);
    expect(cfg!.productMeta['continue-dev'].packages?.length).toBe(7);
    expect(cfg!.productMeta['cursor'].packages).toEqual([
      { name: 'cursor', release_prefix: '' },
      { name: 'composer', release_prefix: 'composer-' },
    ]);
    expect(isMultiPackageProduct(cfg!.productMeta['anthropic-sdk-go'])).toBe(false);
    expect(isMultiPackageProduct(cfg!.productMeta['anthropic-cli'])).toBe(true);
    expect(isMultiPackageProduct(cfg!.productMeta['anthropic-sdk-typescript'])).toBe(true);
    expect(isMultiPackageProduct(cfg!.productMeta['cursor'])).toBe(true);
  });

  it('supports nuget, optional ecosystem, Go /v2 alias deduping, and rejects duplicate non-Go prefixes', () => {
    const goAndNuget = `products:
  - name: nuget-and-go
    display_name: Test
    tier: 1
    source_url: https://example.invalid
    fetch_strategy: gh-releases
    packages:
      - ecosystem: go
        name: example.invalid/mod
        release_prefix: ""
      - ecosystem: go
        name: example.invalid/mod/v2
        release_prefix: ""
      - ecosystem: nuget
        name: Example.Pkg
        release_prefix: "Example-"
      - name: logical-only
        release_prefix: "logical-"
`;
    const cfg = loadProductsConfig(writeYaml(goAndNuget))!;
    const meta = cfg.productMeta['nuget-and-go'];
    expect(meta.packages).toHaveLength(4);
    expect(getCanonicalPackages(meta)).toEqual([
      { name: 'example.invalid/mod', ecosystems: ['go'], aliases: ['example.invalid/mod', 'example.invalid/mod/v2'], release_prefix: '' },
      { name: 'Example.Pkg', ecosystems: ['nuget'], aliases: ['Example.Pkg'], release_prefix: 'Example-' },
      { name: 'logical-only', ecosystems: [], aliases: ['logical-only'], release_prefix: 'logical-' },
    ]);
    expect(resolveCanonicalPackageName(meta, { name: 'example.invalid/mod/v2', release_prefix: '' })).toBe('example.invalid/mod');

    const dupPrefix = `products:
  - name: dup
    display_name: Dup
    tier: 1
    source_url: https://example.invalid
    fetch_strategy: gh-releases
    packages:
      - ecosystem: npm
        name: "@scope/a"
        release_prefix: "a-"
      - ecosystem: npm
        name: "@scope/b"
        release_prefix: "a-"
`;
    expect(() => loadProductsConfig(writeYaml(dupPrefix))).toThrow(/duplicate release_prefix/i);
  });

  it('derives package and normalized version solely from declared release_prefix rules', () => {
    const cfg = loadProductsConfig()!;
    expect(deriveReleaseIdentity('anthropic-sdk-typescript', 'aws-sdk-v0.3.0', 'anthropic-sdk-typescript/releases/aws-sdk-0.3.0.md', cfg)).toEqual({
      pkg: '@anthropic-ai/aws-sdk',
      version: '0.3.0',
    });
    expect(deriveReleaseIdentity('anthropic-sdk-typescript', 'sdk-0.98.0', 'anthropic-sdk-typescript/releases/sdk-0.98.0.md', cfg)).toEqual({
      pkg: '@anthropic-ai/sdk',
      version: '0.98.0',
    });
    // Unknown stem on multi-package product is unassigned (never falls back to sdk or empty)
    expect(deriveReleaseIdentity('anthropic-sdk-typescript', 'ertex-sdk-0.17.0', 'anthropic-sdk-typescript/releases/ertex-sdk-0.17.0.md', cfg)).toEqual({
      pkg: UNASSIGNED_PACKAGE,
      version: 'ertex-sdk-0.17.0',
    });
    // Suffix-tagged continue-dev release has no prefix match -> unassigned
    expect(deriveReleaseIdentity('continue-dev', '1.5.20-vscode', 'continue-dev/releases/v1.5.20-vscode.md', cfg)).toEqual({
      pkg: UNASSIGNED_PACKAGE,
      version: '1.5.20-vscode',
    });
    // Prefix-tagged continue-dev release matches its declared package
    expect(deriveReleaseIdentity('continue-dev', 'continuedev-config-yaml-1.42.0', 'continue-dev/releases/continuedev-config-yaml-1.42.0.md', cfg)).toEqual({
      pkg: '@continuedev/config-yaml',
      version: '1.42.0',
    });
    // Bare vscode-suffixed / v-prefixed continue-dev filenames are unassigned
    expect(deriveReleaseIdentity('continue-dev', '1.2.23-vscode', 'continue-dev/releases/1.2.23-vscode.md', cfg)).toEqual({
      pkg: UNASSIGNED_PACKAGE,
      version: '1.2.23-vscode',
    });
    // Cursor feature slug without composer- or numeric start -> unassigned
    expect(deriveReleaseIdentity('cursor', 'cli-jan-08-2026', 'cursor/releases/cli-jan-08-2026.md', cfg)).toEqual({
      pkg: UNASSIGNED_PACKAGE,
      version: 'cli-jan-08-2026',
    });
    expect(deriveReleaseIdentity('cursor', 'composer-1.5', 'cursor/releases/composer-1.5.md', cfg)).toEqual({
      pkg: 'composer',
      version: '1.5',
    });
    // Longest prefix wins for rmcp-macros-v vs rmcp-v
    expect(deriveReleaseIdentity('mcp-rust-sdk', 'rmcp-macros-v0.16.0', 'mcp-rust-sdk/releases/rmcp-macros-v0.16.0.md', cfg)).toEqual({
      pkg: 'rmcp-macros',
      version: '0.16.0',
    });
    // Single-package Go module merges v2 under canonical package
    expect(deriveReleaseIdentity('anthropic-sdk-go', 'v2.1.0', 'anthropic-sdk-go/releases/2.1.0.md', cfg)).toEqual({
      pkg: 'github.com/anthropics/anthropic-sdk-go',
      version: 'v2.1.0',
    });
    expect(resolveReleasePackage('anthropic-cli/releases/sandboxes-v0.1.0.md', cfg.productMeta['anthropic-cli']).pkg).toBe(
      'github.com/anthropics/anthropic-cli/sandboxes'
    );
    expect(extractVersionFromNotesPath('mcp-rust-sdk/releases/rmcp-macros-0.16.0.md', 'rmcp-macros-v')).toBeNull();
    expect(UNASSIGNED_PACKAGE_LABEL).toBe('unassigned');
  });
});
