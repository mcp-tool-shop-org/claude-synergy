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

  it('never claims up to date and never drops same-day sibling releases', () => {
    const root = makeDir('cs-rel-sameday-');
    const productsRoot = join(root, 'products');
    const yamlPath = buildTestProductsYaml(root);

    // Case A: newest date has two releases (1.9.0 & 1.9.1 on 2026-05-19), like anthropic-cli
    writeRelease(productsRoot, 'tool-go', '1.8.0', '1.8.0', '2026-05-13', ['- Prior release']);
    writeRelease(productsRoot, 'tool-go', '1.9.0', '1.9.0', '2026-05-19', ['- First same-day release']);
    writeRelease(productsRoot, 'tool-go', '1.9.1', '1.9.1', '2026-05-19', [
      '- Breaking change: tightened same-day CLI validation',
      '- Second same-day release',
    ]);

    // Case B: two releases on installed date (0.97.0 & 0.97.1 on 2026-05-19) plus a newer release (0.98.0)
    writeRelease(productsRoot, 'sdk-npm', 'sdk-npm-0.97.0', '0.97.0', '2026-05-19', ['- Added 0.97.0']);
    writeRelease(productsRoot, 'sdk-npm', 'sdk-npm-0.97.1', '0.97.1', '2026-05-19', ['- Fixed 0.97.1']);
    writeRelease(productsRoot, 'sdk-npm', 'sdk-npm-0.98.0', '0.98.0', '2026-05-21', ['- Added 0.98.0']);
    ingestAll(tempDb.db, productsRoot);

    const cfg = loadProductsConfig(yamlPath)!;
    const wsA = makeDir('cs-ws-sameday-newest-');
    writeFileSync(
      join(wsA, 'go.mod'),
      `module example.invalid/app
go 1.25
require (
	example.invalid/tool-go v1.9.0
)
`,
      'utf-8'
    );
    const reportA = evaluateWorkspaceRelevance(tempDb.db, readWorkspace(wsA), { productsConfig: cfg });
    expect(reportA.up_to_date_count).toBe(0);
    expect(reportA.unknown_count).toBe(1);
    const cliRes = reportA.products[0];
    expect(cliRes.status).toBe('unknown');
    expect(cliRes.summary).toContain('unknown: releases on the same day, order not known');
    expect(cliRes.same_day_versions).toEqual(['1.9.0', '1.9.1']);
    expect(cliRes.releases.map((r) => r.version)).toEqual(['1.9.0', '1.9.1']);
    expect(cliRes.breaking_changes).toHaveLength(1);
    const formattedA = formatRelevanceReport(reportA);
    expect(formattedA).not.toContain('up to date');
    expect(formattedA).toContain('unknown: releases on the same day, order not known');
    expect(formattedA).toContain('tool-go@1.9.0');
    expect(formattedA).toContain('tool-go@1.9.1');
    expect(formattedA).toContain('breaking (1):');

    // Installed at the second same-day release is also unknown (order not known)
    const wsA2 = makeDir('cs-ws-sameday-newest2-');
    writeFileSync(
      join(wsA2, 'go.mod'),
      `module example.invalid/app
go 1.25
require example.invalid/tool-go v1.9.1
`,
      'utf-8'
    );
    const reportA2 = evaluateWorkspaceRelevance(tempDb.db, readWorkspace(wsA2), { productsConfig: cfg });
    expect(reportA2.products[0].status).toBe('unknown');
    expect(reportA2.products[0].same_day_versions).toEqual(['1.9.0', '1.9.1']);

    // Case B: installed at 0.97.0 lists 0.98.0 AND preserves same-day sibling 0.97.1
    const wsB = makeDir('cs-ws-sameday-behind-');
    writeFileSync(
      join(wsB, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: { 'node_modules/@scope/sdk-npm': { version: '0.97.0' } },
      }),
      'utf-8'
    );
    const reportB = evaluateWorkspaceRelevance(tempDb.db, readWorkspace(wsB), { productsConfig: cfg });
    expect(reportB.action_needed_count).toBe(1);
    expect(reportB.products[0].status).toBe('action_needed');
    expect(reportB.products[0].releases_behind).toBe(1);
    expect(reportB.products[0].same_day_versions).toEqual(['0.97.0', '0.97.1']);
    expect(reportB.products[0].releases.map((r) => r.version)).toEqual(['0.98.0', '0.97.1']);
    const formattedB = formatRelevanceReport(reportB);
    expect(formattedB).toContain('same-day: unknown: releases on the same day, order not known (0.97.0, 0.97.1)');
    expect(formattedB).toContain('sdk-npm@0.98.0');
    expect(formattedB).toContain('sdk-npm@0.97.1');
  });

  it('scopes mixed-package products strictly to unprefixed or matching notes_path files', () => {
    const root = makeDir('cs-rel-mixed-');
    const productsRoot = join(root, 'products');
    const yamlPath = join(root, 'products.yaml');
    writeFileSync(
      yamlPath,
      `products:
  - name: anthropic-sdk-typescript
    display_name: Anthropic SDK (TypeScript)
    tier: 1
    source_url: https://example.invalid/anthropic-sdk-typescript
    fetch_strategy: gh-releases
    packages:
      - ecosystem: npm
        name: "@anthropic-ai/sdk"
  - name: mcp-typescript-sdk
    display_name: MCP TypeScript SDK
    tier: 1
    source_url: https://example.invalid/mcp-typescript-sdk
    fetch_strategy: gh-releases
    packages:
      - ecosystem: npm
        name: "@modelcontextprotocol/sdk"
`,
      'utf-8'
    );

    // Mixed anthropic-sdk-typescript files: sdk-* + bedrock-sdk-* + vertex-sdk-*
    writeRelease(productsRoot, 'anthropic-sdk-typescript', 'vertex-sdk-0.16.1', '0.16.1', '2026-05-19', [
      '- Vertex adapter update',
    ]);
    writeRelease(productsRoot, 'anthropic-sdk-typescript', 'bedrock-sdk-0.29.2', '0.29.2', '2026-05-19', [
      '- Bedrock adapter update',
    ]);
    writeRelease(productsRoot, 'anthropic-sdk-typescript', 'sdk-0.97.0', '0.97.0', '2026-05-19', [
      '- Core SDK 0.97.0',
    ]);
    writeRelease(productsRoot, 'anthropic-sdk-typescript', 'sdk-0.98.0', '0.98.0', '2026-05-21', [
      '- Core SDK 0.98.0',
    ]);

    // Mixed mcp-typescript-sdk files: bare 1.29.0 alongside newer prefixed server v2 alphas
    writeRelease(productsRoot, 'mcp-typescript-sdk', '1.29.0', '1.29.0', '2026-03-30', [
      '- MCP TypeScript SDK 1.29.0',
    ]);
    writeRelease(
      productsRoot,
      'mcp-typescript-sdk',
      'modelcontextprotocol-server-2.0.0-alpha.2',
      '@modelcontextprotocol/server@2.0.0-alpha.2',
      '2026-04-01',
      ['- Server v2 alpha']
    );
    ingestAll(tempDb.db, productsRoot);

    const cfg = loadProductsConfig(yamlPath)!;

    // 1. Sub-packages are unmapped (bedrock-sdk is not matched); @anthropic-ai/sdk@0.16.1 does not match vertex-sdk-0.16.1
    const wsFalseVertex = makeDir('cs-ws-mixed-1-');
    writeFileSync(
      join(wsFalseVertex, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: {
          'node_modules/@anthropic-ai/bedrock-sdk': { version: '0.29.2' },
          'node_modules/@anthropic-ai/sdk': { version: '0.16.1' },
          'node_modules/@modelcontextprotocol/sdk': { version: '1.29.0' },
        },
      }),
      'utf-8'
    );
    const report1 = evaluateWorkspaceRelevance(tempDb.db, readWorkspace(wsFalseVertex), {
      productsConfig: cfg,
    });
    expect(report1.action_needed_count).toBe(0);
    const sdkRes1 = report1.products.find((p) => p.product === 'anthropic-sdk-typescript')!;
    expect(sdkRes1.status).toBe('unknown');
    expect(sdkRes1.summary).toBe('unknown: installed 0.16.1 is not in the mirror');

    const mcpRes1 = report1.products.find((p) => p.product === 'mcp-typescript-sdk')!;
    expect(mcpRes1.status).toBe('up_to_date');
    expect(mcpRes1.latest_version).toBe('1.29.0');

    // 2. Installed @anthropic-ai/sdk@0.97.0 compares strictly against sdk-* rows (ignores bedrock-sdk/vertex-sdk)
    const wsSdk97 = makeDir('cs-ws-mixed-2-');
    writeFileSync(
      join(wsSdk97, 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: { 'node_modules/@anthropic-ai/sdk': { version: '0.97.0' } },
      }),
      'utf-8'
    );
    const report2 = evaluateWorkspaceRelevance(tempDb.db, readWorkspace(wsSdk97), {
      productsConfig: cfg,
    });
    expect(report2.action_needed_count).toBe(1);
    expect(report2.products[0].releases.map((r) => r.version)).toEqual(['0.98.0']);
    expect(report2.products[0].releases.some((r) => r.version === '0.29.2' || r.version === '0.16.1')).toBe(
      false
    );
  });

  it('formats go.mod replace-skipped summary in files read', () => {
    const { yamlPath } = seedRelevanceCorpus();
    const cfg = loadProductsConfig(yamlPath)!;
    const wsDir = makeDir('cs-ws-go-replace-');
    writeFileSync(
      join(wsDir, 'go.mod'),
      `module example.invalid/app
go 1.25
require (
	example.invalid/tool-go v2.0.0
	example.invalid/sdk-go v1.0.0
)
replace example.invalid/sdk-go => ../local-sdk
`,
      'utf-8'
    );
    const report = evaluateWorkspaceRelevance(tempDb.db, readWorkspace(wsDir), { productsConfig: cfg });
    const text = formatRelevanceReport(report);
    expect(text).toContain('files read: go.mod (1 read, 1 skipped: targeted by replace directive)');
  });
});
