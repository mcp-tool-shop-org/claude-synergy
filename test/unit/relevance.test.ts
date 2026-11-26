import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createTempDb, type TempDb } from '../helpers/temp-db.js';
import { ingestAll } from '../../src/ingest.js';
import { loadProductsConfig } from '../../src/products-config.js';
import { readWorkspace, type KnownLockfileName } from '../../src/workspace.js';
import {
  evaluateWorkspaceRelevance,
  formatRelevanceReport,
} from '../../src/relevance.js';

let tempDb: TempDb;
let tempDirs: string[] = [];

function makeDir(prefix = 'cs-rel-'): string {
  const d = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(d);
  return d;
}

function writeRelease(
  productsRoot: string,
  product: string,
  filename: string,
  version: string,
  releasedAt: string,
  bullets: string[]
): void {
  const relDir = join(productsRoot, product, 'releases');
  mkdirSync(relDir, { recursive: true });
  writeFileSync(
    join(relDir, `${filename}.md`),
    [
      '---',
      `product: ${product}`,
      `version: "${version}"`,
      `released_at: "${releasedAt}"`,
      `source_url: "https://example.invalid/${product}/${version}"`,
      `fetched_at: "2026-11-25"`,
      '---',
      '',
      `# ${product} ${version}`,
      '',
      ...bullets,
      '',
    ].join('\n'),
    'utf-8'
  );
}

function buildTestProductsYaml(dir: string): string {
  const yamlPath = join(dir, 'products.yaml');
  writeFileSync(
    yamlPath,
    `products:
  - name: sdk-npm
    display_name: Test NPM SDK
    tier: 1
    source_url: https://example.invalid/sdk-npm
    fetch_strategy: gh-releases
    packages:
      - ecosystem: npm
        name: "@scope/sdk-npm"
  - name: tool-npm
    display_name: Test NPM Tool
    tier: 1
    source_url: https://example.invalid/tool-npm
    fetch_strategy: gh-releases
    packages:
      - ecosystem: npm
        name: "@scope/tool-npm"
  - name: sdk-pypi
    display_name: Test PyPI SDK
    tier: 1
    source_url: https://example.invalid/sdk-pypi
    fetch_strategy: gh-releases
    packages:
      - ecosystem: pypi
        name: test-pypi-sdk
  - name: tool-pypi
    display_name: Test PyPI Tool
    tier: 1
    source_url: https://example.invalid/tool-pypi
    fetch_strategy: gh-releases
    packages:
      - ecosystem: pypi
        name: test-pypi-tool
  - name: sdk-rust
    display_name: Test Rust SDK
    tier: 1
    source_url: https://example.invalid/sdk-rust
    fetch_strategy: gh-releases
    packages:
      - ecosystem: crates
        name: test-rust-sdk
  - name: tool-rust
    display_name: Test Rust Tool
    tier: 1
    source_url: https://example.invalid/tool-rust
    fetch_strategy: gh-releases
    packages:
      - ecosystem: crates
        name: test-rust-tool
  - name: sdk-go
    display_name: Test Go SDK
    tier: 1
    source_url: https://example.invalid/sdk-go
    fetch_strategy: gh-releases
    packages:
      - ecosystem: go
        name: example.invalid/sdk-go
      - ecosystem: go
        name: example.invalid/sdk-go/v2
  - name: tool-go
    display_name: Test Go Tool
    tier: 1
    source_url: https://example.invalid/tool-go
    fetch_strategy: gh-releases
    packages:
      - ecosystem: go
        name: example.invalid/tool-go
  - name: unused-product
    display_name: Unused Product
    tier: 1
    source_url: https://example.invalid/unused
    fetch_strategy: gh-releases
    packages:
      - ecosystem: npm
        name: "@scope/never-used"
`,
    'utf-8'
  );
  return yamlPath;
}

function seedRelevanceCorpus(): { yamlPath: string } {
  const root = makeDir('cs-rel-corpus-');
  const productsRoot = join(root, 'products');
  const yamlPath = buildTestProductsYaml(root);

  // Older -> intermediate -> newest with breaking change
  const multiEcoProducts = [
    { name: 'sdk-npm', v1: '1.0.0', v2: '1.1.0', v3: '2.0.0', prefix: '' },
    { name: 'tool-npm', v1: '1.0.0', v2: '1.1.0', v3: '2.0.0', prefix: '' },
    { name: 'sdk-pypi', v1: '1.0.0', v2: '1.1.0', v3: '2.0.0', prefix: '' },
    { name: 'tool-pypi', v1: '1.0.0', v2: '1.1.0', v3: '2.0.0', prefix: '' },
    { name: 'sdk-rust', v1: 'test-rust-sdk-v1.0.0', v2: 'test-rust-sdk-v1.1.0', v3: 'test-rust-sdk-v2.0.0', prefix: '' },
    { name: 'tool-rust', v1: '1.0.0', v2: '1.1.0', v3: '2.0.0', prefix: '' },
    { name: 'sdk-go', v1: '1.0.0', v2: '1.1.0', v3: '2.0.0', prefix: '' },
    { name: 'tool-go', v1: '1.0.0', v2: '1.1.0', v3: '2.0.0', prefix: '' },
  ];

  for (const p of multiEcoProducts) {
    writeRelease(productsRoot, p.name, p.v1, p.v1, '2026-09-01', ['- Added initial release']);
    writeRelease(productsRoot, p.name, p.v2, p.v2, '2026-10-01', [
      '- Added helper method',
      '- Fixed retry timeout',
    ]);
    writeRelease(productsRoot, p.name, p.v3, p.v3, '2026-11-01', [
      '- Added streaming support',
      '- Breaking change: removed legacy client constructor',
    ]);
  }
  writeRelease(productsRoot, 'unused-product', '1.0.0', '1.0.0', '2026-11-01', [
    '- Added unused feature',
  ]);

  ingestAll(tempDb.db, productsRoot);
  return { yamlPath };
}

beforeEach(() => {
  tempDb = createTempDb({ loadVec: false });
  tempDirs = [];
});

afterEach(() => {
  tempDb.cleanup();
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
});

interface FormatFixture {
  file: KnownLockfileName;
  outdatedProduct: string;
  upToDateProduct: string;
  unknownProduct: string;
  content: string;
}

const FORMAT_FIXTURES: FormatFixture[] = [
  {
    file: 'package-lock.json',
    outdatedProduct: 'sdk-npm',
    upToDateProduct: 'tool-npm',
    unknownProduct: 'sdk-npm',
    content: JSON.stringify({
      lockfileVersion: 3,
      packages: {
        'node_modules/@scope/sdk-npm': { version: '1.0.0' },
        'node_modules/@scope/tool-npm': { version: '2.0.0' },
      },
    }),
  },
  {
    file: 'pnpm-lock.yaml',
    outdatedProduct: 'sdk-npm',
    upToDateProduct: 'tool-npm',
    unknownProduct: 'sdk-npm',
    content: `lockfileVersion: '9.0'
importers:
  .:
    dependencies:
      '@scope/sdk-npm':
        specifier: ^1.0.0
        version: 1.0.0
    devDependencies:
      '@scope/tool-npm':
        specifier: ^2.0.0
        version: 2.0.0
`,
  },
  {
    file: 'uv.lock',
    outdatedProduct: 'sdk-pypi',
    upToDateProduct: 'tool-pypi',
    unknownProduct: 'sdk-pypi',
    content: `version = 1

[[package]]
name = "Test_PyPI.SDK"
version = "1.0.0"

[[package]]
name = "test-pypi-tool"
version = "2.0.0"
`,
  },
  {
    file: 'poetry.lock',
    outdatedProduct: 'sdk-pypi',
    upToDateProduct: 'tool-pypi',
    unknownProduct: 'sdk-pypi',
    content: `[[package]]
name = "test-pypi-sdk"
version = "1.0.0"

[[package]]
name = "test-pypi-tool"
version = "2.0.0"
`,
  },
  {
    file: 'requirements.txt',
    outdatedProduct: 'sdk-pypi',
    upToDateProduct: 'tool-pypi',
    unknownProduct: 'sdk-pypi',
    content: `test-pypi-sdk==1.0.0
test-pypi-tool==2.0.0
`,
  },
  {
    file: 'Cargo.lock',
    outdatedProduct: 'sdk-rust',
    upToDateProduct: 'tool-rust',
    unknownProduct: 'sdk-rust',
    content: `version = 4

[[package]]
name = "test-rust-sdk"
version = "1.0.0"

[[package]]
name = "test-rust-tool"
version = "2.0.0"
`,
  },
  {
    file: 'go.mod',
    outdatedProduct: 'sdk-go',
    upToDateProduct: 'tool-go',
    unknownProduct: 'sdk-go',
    content: `module example.invalid/app

go 1.25

require (
	example.invalid/sdk-go v1.0.0
	example.invalid/tool-go v2.0.0
)
`,
  },
];

describe('evaluateWorkspaceRelevance — all 7 lockfile formats', () => {
  it.each(FORMAT_FIXTURES)(
    'evaluates older, newest, and unused products for $file',
    (fixture) => {
      const { yamlPath } = seedRelevanceCorpus();
      const cfg = loadProductsConfig(yamlPath)!;
      const wsDir = makeDir(`cs-ws-${fixture.file}-`);
      writeFileSync(join(wsDir, fixture.file), fixture.content, 'utf-8');

      const scan = readWorkspace(wsDir);
      const report = evaluateWorkspaceRelevance(tempDb.db, scan, { productsConfig: cfg });

      expect(report.action_needed_count).toBe(1);
      expect(report.up_to_date_count).toBe(1);
      expect(report.unknown_count).toBe(0);
      expect(report.not_used_count).toBe(7);
      expect(report.not_used_products).toBeUndefined();

      const outdated = report.products[0];
      expect(outdated.status).toBe('action_needed');
      expect(outdated.product).toBe(fixture.outdatedProduct);
      expect(outdated.releases_behind).toBe(2);
      // Newest first
      expect(outdated.releases.map((r) => r.released_at)).toEqual(['2026-11-01', '2026-10-01']);
      expect(outdated.releases[0].kind_counts).toEqual({ breaking: 1, added: 1 });
      expect(outdated.releases[1].kind_counts).toEqual({ added: 1, fixed: 1 });
      // Breaking changes lead the list
      expect(outdated.breaking_changes).toHaveLength(1);
      expect(outdated.breaking_changes[0].text).toContain('removed legacy client constructor');
      expect(outdated.releases[0].changes[0].kind).toBe('breaking');

      const upToDate = report.products[1];
      expect(upToDate.status).toBe('up_to_date');
      expect(upToDate.product).toBe(fixture.upToDateProduct);
      expect(upToDate.summary).toBe('no action: up to date');

      const withAll = evaluateWorkspaceRelevance(tempDb.db, scan, {
        productsConfig: cfg,
        includeAll: true,
      });
      expect(withAll.not_used_products).toContain('unused-product');
    }
  );

  it('reports unknown when installed version is absent from the mirror', () => {
    const { yamlPath } = seedRelevanceCorpus();
    const cfg = loadProductsConfig(yamlPath)!;
    const wsDir = makeDir('cs-ws-unknown-');
    writeFileSync(
      join(wsDir, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: {
          'node_modules/@scope/sdk-npm': { version: '9.9.9' },
        },
      }),
      'utf-8'
    );

    const report = evaluateWorkspaceRelevance(tempDb.db, readWorkspace(wsDir), {
      productsConfig: cfg,
    });
    expect(report.action_needed_count).toBe(0);
    expect(report.unknown_count).toBe(1);
    expect(report.products[0].status).toBe('unknown');
    expect(report.products[0].summary).toBe('unknown: installed 9.9.9 is not in the mirror');

    const text = formatRelevanceReport(report);
    expect(text.split('\n')[0]).toBe('0 products needing action');
    expect(text).toContain('unknown: installed 9.9.9 is not in the mirror');
    expect(text).toContain('no action: not used (8 products)');
  });

  it('includes zero-bullet newer releases and handles null/uninitialized DB safely', () => {
    const root = makeDir('cs-rel-empty-rel-');
    const productsRoot = join(root, 'products');
    const yamlPath = buildTestProductsYaml(root);
    writeRelease(productsRoot, 'sdk-npm', '1.0.0', '1.0.0', '2026-10-01', ['- Initial']);
    writeRelease(productsRoot, 'sdk-npm', '1.1.0', '1.1.0', '2026-11-01', []);
    ingestAll(tempDb.db, productsRoot);

    const cfg = loadProductsConfig(yamlPath)!;
    const wsDir = makeDir('cs-ws-empty-rel-');
    writeFileSync(
      join(wsDir, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: { 'node_modules/@scope/sdk-npm': { version: '1.0.0' } },
      }),
      'utf-8'
    );

    const scan = readWorkspace(wsDir);
    const report = evaluateWorkspaceRelevance(tempDb.db, scan, { productsConfig: cfg });
    expect(report.action_needed_count).toBe(1);
    expect(report.products[0].releases_behind).toBe(1);
    expect(report.products[0].releases[0].kind_counts).toEqual({});
    expect(formatRelevanceReport(report)).toContain('(0 changes)');

    // Null DB degrades cleanly to unknown without writing anything
    const nullReport = evaluateWorkspaceRelevance(null, scan, { productsConfig: cfg });
    expect(nullReport.unknown_count).toBe(1);
    expect(nullReport.products[0].summary).toBe('unknown: installed 1.0.0 is not in the mirror');
  });

  it('formats breaking changes first, skipped files, and --all unused list', () => {
    const { yamlPath } = seedRelevanceCorpus();
    const cfg = loadProductsConfig(yamlPath)!;
    const wsDir = makeDir('cs-ws-fmt-');
    writeFileSync(join(wsDir, 'requirements.txt'), 'test-pypi-sdk==1.0.0\nmcp>=1.0\n', 'utf-8');
    writeFileSync(join(wsDir, 'Cargo.lock'), 'broken = \n', 'utf-8');

    const report = evaluateWorkspaceRelevance(tempDb.db, readWorkspace(wsDir), {
      productsConfig: cfg,
      includeAll: true,
    });
    const text = formatRelevanceReport(report);
    const lines = text.split('\n');
    expect(lines[0]).toBe('1 product needing action');
    const breakingIdx = text.indexOf('breaking (1):');
    const releasesIdx = text.indexOf('releases (2):');
    expect(breakingIdx).toBeGreaterThan(0);
    expect(releasesIdx).toBeGreaterThan(breakingIdx);
    expect(text).toContain('not used: sdk-npm, tool-npm');
    expect(text).toContain('files read: requirements.txt (1 pinned, 1 unpinned skipped)');
    expect(text).toContain('files skipped: Cargo.lock [LOCKFILE_MALFORMED]:');

    // Empty workspace directory reports files read: none and up-to-date format branch
    const emptyWs = makeDir('cs-ws-empty-');
    const emptyReport = evaluateWorkspaceRelevance(tempDb.db, readWorkspace(emptyWs), {
      productsConfig: cfg,
    });
    expect(formatRelevanceReport(emptyReport)).toContain('files read: none');

    const upToDateWs = makeDir('cs-ws-uptodate-');
    writeFileSync(
      join(upToDateWs, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: { 'node_modules/@scope/tool-npm': { version: '2.0.0' } },
      }),
      'utf-8'
    );
    const upToDateText = formatRelevanceReport(
      evaluateWorkspaceRelevance(tempDb.db, readWorkspace(upToDateWs), { productsConfig: cfg })
    );
    expect(upToDateText).toContain('tool-npm (npm @scope/tool-npm@2.0.0): no action: up to date');
  });
});
