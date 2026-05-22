import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadProductsConfig, resetWarnedFlag } from '../../src/products-config.js';
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
    expect(cody.rssTitleFilter!.test('Cody update')).toBe(true);
    expect(cody.rssTitleFilter!.test('unrelated')).toBe(false);
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

describe('loadProductsConfig — repo products.yaml', () => {
  it('the real repo-root products.yaml loads without error', () => {
    const cfg = loadProductsConfig();
    // The hardcoded fallback returns null when products.yaml is missing; the
    // repo ships a real one, so this should be non-null.
    expect(cfg).not.toBeNull();
    expect(Object.keys(cfg!.productMeta).length).toBeGreaterThan(20);
    expect(cfg!.fetchTargets.length).toBeGreaterThan(15);
  });
});
