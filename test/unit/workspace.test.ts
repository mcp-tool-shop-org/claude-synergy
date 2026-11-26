import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
  type Stats,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AppError } from '../../src/errors.js';
import {
  MAX_LOCKFILE_BYTES,
  WORKSPACE_INVALID_DIR,
  normalizePackageName,
  readWorkspace,
  type WorkspaceFs,
} from '../../src/workspace.js';

let tempDirs: string[] = [];

function makeTempDir(prefix = 'cs-ws-'): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

beforeEach(() => {
  tempDirs = [];
});

afterEach(() => {
  while (tempDirs.length > 0) {
    rmSync(tempDirs.pop()!, { recursive: true, force: true });
  }
  vi.restoreAllMocks();
});

describe('normalizePackageName', () => {
  it('applies PEP 503 normalization for PyPI packages', () => {
    expect(normalizePackageName('pypi', 'Claude_Agent.SDK')).toBe('claude-agent-sdk');
    expect(normalizePackageName('pypi', 'foo..__--bar')).toBe('foo-bar');
    expect(normalizePackageName('pypi', '  MCP  ')).toBe('mcp');
  });

  it('lowercases npm and crates names and preserves case for Go module paths', () => {
    expect(normalizePackageName('npm', '@Anthropic-AI/Claude-Code')).toBe('@anthropic-ai/claude-code');
    expect(normalizePackageName('crates', 'RMCP_Macros')).toBe('rmcp_macros');
    expect(normalizePackageName('go', 'github.com/Anthropic/SDK-Go/v2')).toBe(
      'github.com/Anthropic/SDK-Go/v2'
    );
  });
});

describe('readWorkspace — lockfile parsers', () => {
  it('reads package-lock.json v2/v3 root node_modules entries and skips nested node_modules', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'package-lock.json'),
      JSON.stringify({
        name: 'demo-app',
        lockfileVersion: 3,
        packages: {
          '': { name: 'demo-app', version: '1.0.0' },
          'node_modules/@anthropic-ai/sdk': { version: '1.10.0' },
          'node_modules/@anthropic-ai/sdk/node_modules/nested-dep': { version: '0.1.0' },
          'node_modules/local-link': { link: true, resolved: '../local' },
          'node_modules/alias-pkg': { name: '@modelcontextprotocol/sdk', version: '1.27.0' },
          'node_modules/no-ver': {},
        },
      }),
      'utf-8'
    );

    const res = readWorkspace(dir);
    expect(res.files_skipped).toEqual([]);
    expect(res.files_read).toEqual([
      { file: 'package-lock.json', ecosystem: 'npm', entries_count: 2 },
    ]);
    expect(res.entries).toEqual([
      {
        ecosystem: 'npm',
        name: '@anthropic-ai/sdk',
        version: '1.10.0',
        source_file: 'package-lock.json',
      },
      {
        ecosystem: 'npm',
        name: '@modelcontextprotocol/sdk',
        version: '1.27.0',
        source_file: 'package-lock.json',
      },
    ]);
  });

  it('reads pnpm-lock.yaml importers["."] dependencies and devDependencies', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'pnpm-lock.yaml'),
      `lockfileVersion: '9.0'
importers:
  .:
    dependencies:
      '@modelcontextprotocol/sdk':
        specifier: ^1.0.4
        version: 1.30.0(zod@4.6.7)
      'local-pkg':
        specifier: workspace:*
        version: link:../local-pkg
    devDependencies:
      '@anthropic-ai/claude-code':
        specifier: ^2.1.0
        version: 2.1.96
      'aliased-sdk':
        specifier: npm:@anthropic-ai/sdk@^1.12.0
        version: /@anthropic-ai/sdk@1.12.0(debug@4.0.0)
`,
      'utf-8'
    );

    const res = readWorkspace(dir);
    expect(res.files_skipped).toEqual([]);
    expect(res.files_read).toEqual([
      { file: 'pnpm-lock.yaml', ecosystem: 'npm', entries_count: 3 },
    ]);
    expect(res.entries).toEqual([
      {
        ecosystem: 'npm',
        name: '@modelcontextprotocol/sdk',
        version: '1.30.0',
        source_file: 'pnpm-lock.yaml',
      },
      {
        ecosystem: 'npm',
        name: '@anthropic-ai/claude-code',
        version: '2.1.96',
        source_file: 'pnpm-lock.yaml',
      },
      {
        ecosystem: 'npm',
        name: '@anthropic-ai/sdk',
        version: '1.12.0',
        source_file: 'pnpm-lock.yaml',
      },
    ]);
  });

  it('reads uv.lock, skips virtual/editable workspace root, and normalizes PyPI names', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'uv.lock'),
      `version = 1
requires-python = ">=3.11"

[[package]]
name = "my-workspace"
version = "0.1.0"
source = { virtual = "." }

[[package]]
name = "Claude_Agent.SDK"
version = "0.2.95"
source = { registry = "https://pypi.org/simple" }
dependencies = [
  { name = "mcp" },
]

[package.metadata]
requires-dist = [{ name = "mcp", specifier = ">=1.23.0" }]

[[package]]
name = "anthropic"
version = "2.10.0"
source = { registry = "https://pypi.org/simple" }
`,
      'utf-8'
    );

    const res = readWorkspace(dir);
    expect(res.files_skipped).toEqual([]);
    expect(res.files_read).toEqual([{ file: 'uv.lock', ecosystem: 'pypi', entries_count: 2 }]);
    expect(res.entries).toEqual([
      { ecosystem: 'pypi', name: 'claude-agent-sdk', version: '0.2.95', source_file: 'uv.lock' },
      { ecosystem: 'pypi', name: 'anthropic', version: '2.10.0', source_file: 'uv.lock' },
    ]);
  });

  it('reads poetry.lock and ignores sub-table keys', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'poetry.lock'),
      `# This file is automatically @generated by Poetry.
[[package]]
name = "mcp"
version = '2.1.0'
description = """
Multi-line description
for MCP
"""
optional = false

[package.dependencies]
anyio = ">=4.5"

[package.extras]
cli = ["typer>=0.16.0"]

[metadata]
lock-version = "2.1"
`,
      'utf-8'
    );

    const res = readWorkspace(dir);
    expect(res.files_skipped).toEqual([]);
    expect(res.files_read).toEqual([{ file: 'poetry.lock', ecosystem: 'pypi', entries_count: 1 }]);
    expect(res.entries).toEqual([
      { ecosystem: 'pypi', name: 'mcp', version: '2.1.0', source_file: 'poetry.lock' },
    ]);
  });

  it('reads requirements.txt exact == pins, normalizes PEP 503, and counts unpinned lines', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'requirements.txt'),
      `# comment line

Anthropic[bedrock]==2.14.0  # inline comment
Claude_Agent.SDK==0.2.98
mcp>=2.0.0
httpx~=0.28
unpinned-pkg
-r base.txt
-e ./local
git+https://example.invalid/repo.git@main
`,
      'utf-8'
    );

    const res = readWorkspace(dir);
    expect(res.files_skipped).toEqual([]);
    expect(res.files_read).toEqual([
      { file: 'requirements.txt', ecosystem: 'pypi', entries_count: 2, skipped_lines: 6 },
    ]);
    expect(res.entries).toEqual([
      { ecosystem: 'pypi', name: 'anthropic', version: '2.14.0', source_file: 'requirements.txt' },
      {
        ecosystem: 'pypi',
        name: 'claude-agent-sdk',
        version: '0.2.98',
        source_file: 'requirements.txt',
      },
    ]);
  });

  it('reads Cargo.lock package versions', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'Cargo.lock'),
      `version = 4

[[package]]
name = "rmcp"
version = "3.4.0"
source = "registry+https://github.com/rust-lang/crates.io-index"
dependencies = [
  "rmcp-macros",
]

[[package]]
name = "rmcp-macros"
version = "3.4.0"
`,
      'utf-8'
    );

    const res = readWorkspace(dir);
    expect(res.files_skipped).toEqual([]);
    expect(res.files_read).toEqual([{ file: 'Cargo.lock', ecosystem: 'crates', entries_count: 2 }]);
    expect(res.entries).toEqual([
      { ecosystem: 'crates', name: 'rmcp', version: '3.4.0', source_file: 'Cargo.lock' },
      { ecosystem: 'crates', name: 'rmcp-macros', version: '3.4.0', source_file: 'Cargo.lock' },
    ]);
  });

  it('reads go.mod single-line and block require directives', () => {
    const dir = makeTempDir();
    writeFileSync(
      join(dir, 'go.mod'),
      `module example.invalid/demo

go 1.25

require github.com/anthropics/anthropic-sdk-go/v2 v2.14.0

require (
	github.com/modelcontextprotocol/go-sdk v1.7.0 // indirect
	"github.com/legacy/pkg" v2.0.0+incompatible
)
`,
      'utf-8'
    );

    const res = readWorkspace(dir);
    expect(res.files_skipped).toEqual([]);
    expect(res.files_read).toEqual([{ file: 'go.mod', ecosystem: 'go', entries_count: 3 }]);
    expect(res.entries).toEqual([
      {
        ecosystem: 'go',
        name: 'github.com/anthropics/anthropic-sdk-go/v2',
        version: '2.14.0',
        source_file: 'go.mod',
      },
      {
        ecosystem: 'go',
        name: 'github.com/modelcontextprotocol/go-sdk',
        version: '1.7.0',
        source_file: 'go.mod',
      },
      {
        ecosystem: 'go',
        name: 'github.com/legacy/pkg',
        version: '2.0.0',
        source_file: 'go.mod',
      },
    ]);
  });
});

describe('readWorkspace — refusals, warnings, and non-recursion', () => {
  it('throws WORKSPACE_INVALID_DIR for empty, missing, or non-directory paths', () => {
    expect(() => readWorkspace('')).toThrowError(AppError);
    try {
      readWorkspace('');
    } catch (e: any) {
      expect(e.code).toBe(WORKSPACE_INVALID_DIR);
    }

    const dir = makeTempDir();
    const missing = join(dir, 'does-not-exist');
    expect(() => readWorkspace(missing)).toThrowError(AppError);
    try {
      readWorkspace(missing);
    } catch (e: any) {
      expect(e.code).toBe(WORKSPACE_INVALID_DIR);
    }

    const regularFile = join(dir, 'not-a-dir.txt');
    writeFileSync(regularFile, 'hello', 'utf-8');
    try {
      readWorkspace(regularFile);
      expect.unreachable('expected WORKSPACE_INVALID_DIR');
    } catch (e: any) {
      expect(e).toBeInstanceOf(AppError);
      expect(e.code).toBe(WORKSPACE_INVALID_DIR);
    }
  });

  it('skips symlinked lockfiles without reading them and continues reading valid lockfiles', () => {
    const dir = makeTempDir();
    const goModPath = join(dir, 'go.mod');
    writeFileSync(goModPath, 'module example.invalid/ok\ngo 1.25\nrequire github.com/modelcontextprotocol/go-sdk v1.8.0\n', 'utf-8');

    const pkgLockPath = join(dir, 'package-lock.json');
    writeFileSync(pkgLockPath, '{"lockfileVersion":3,"packages":{}}', 'utf-8');

    const readSpy = vi.fn((p: string, enc: BufferEncoding) => readFileSync(p, enc));
    const spyFs: WorkspaceFs = {
      statSync: (p) => statSync(p),
      lstatSync: (p) => {
        const real = lstatSync(p);
        if (p === pkgLockPath) {
          return {
            ...real,
            isSymbolicLink: () => true,
            isFile: () => false,
          } as unknown as Stats;
        }
        return real;
      },
      readFileSync: readSpy,
    };

    const res = readWorkspace(dir, { fs: spyFs });
    expect(res.files_skipped).toEqual([
      {
        file: 'package-lock.json',
        code: 'LOCKFILE_SYMLINK',
        reason: 'symlinked lockfile refused',
      },
    ]);
    expect(res.files_read).toEqual([{ file: 'go.mod', ecosystem: 'go', entries_count: 1 }]);
    expect(readSpy).toHaveBeenCalledTimes(1);
    expect(readSpy.mock.calls[0][0]).toBe(goModPath);
  });

  it('skips a real OS symlink when symlink creation is permitted', () => {
    const dir = makeTempDir();
    const target = join(dir, 'real-target.json');
    writeFileSync(target, '{"lockfileVersion":3,"packages":{}}', 'utf-8');
    let symlinkCreated = false;
    try {
      symlinkSync(target, join(dir, 'package-lock.json'));
      symlinkCreated = true;
    } catch {
      // Unprivileged Windows environments without Developer Mode cannot create file symlinks.
    }
    if (!symlinkCreated) return;

    const res = readWorkspace(dir);
    expect(res.files_skipped).toEqual([
      {
        file: 'package-lock.json',
        code: 'LOCKFILE_SYMLINK',
        reason: 'symlinked lockfile refused',
      },
    ]);
  });

  it('skips lockfiles exceeding 20 MB via size check without writing 20 MB to disk', () => {
    const dir = makeTempDir();
    const bigLockPath = join(dir, 'Cargo.lock');
    writeFileSync(bigLockPath, 'version = 4\n', 'utf-8');
    const reqPath = join(dir, 'requirements.txt');
    writeFileSync(reqPath, 'mcp==2.1.0\n', 'utf-8');

    const readSpy = vi.fn((p: string, enc: BufferEncoding) => readFileSync(p, enc));
    const spyFs: WorkspaceFs = {
      statSync: (p) => statSync(p),
      lstatSync: (p) => {
        const real = lstatSync(p);
        if (p === bigLockPath) {
          return {
            isSymbolicLink: () => false,
            isFile: () => true,
            size: MAX_LOCKFILE_BYTES + 1,
          } as unknown as Stats;
        }
        return real;
      },
      readFileSync: readSpy,
    };

    const res = readWorkspace(dir, { fs: spyFs });
    expect(res.files_skipped).toHaveLength(1);
    expect(res.files_skipped[0].file).toBe('Cargo.lock');
    expect(res.files_skipped[0].code).toBe('LOCKFILE_OVERSIZED');
    expect(res.files_skipped[0].reason).toContain(String(MAX_LOCKFILE_BYTES));
    expect(res.files_read).toEqual([
      { file: 'requirements.txt', ecosystem: 'pypi', entries_count: 1, skipped_lines: 0 },
    ]);
    expect(readSpy).toHaveBeenCalledTimes(1);
    expect(readSpy.mock.calls[0][0]).toBe(reqPath);
  });

  it('skips non-regular lockfile directory entries and read errors gracefully', () => {
    const dir = makeTempDir();
    mkdirSync(join(dir, 'package-lock.json'));
    writeFileSync(join(dir, 'requirements.txt'), 'mcp==2.1.0\n', 'utf-8');

    const res = readWorkspace(dir);
    expect(res.files_skipped).toEqual([
      {
        file: 'package-lock.json',
        code: 'LOCKFILE_NOT_REGULAR_FILE',
        reason: 'not a regular file',
      },
    ]);
    expect(res.files_read).toHaveLength(1);
  });

  it('skips malformed JSON, YAML, TOML, and go.mod lockfiles while still reading valid siblings', () => {
    const dir = makeTempDir();
    writeFileSync(join(dir, 'package-lock.json'), '{not-valid-json', 'utf-8');
    writeFileSync(join(dir, 'pnpm-lock.yaml'), 'importers:\n  .: invalid\n', 'utf-8');
    writeFileSync(join(dir, 'uv.lock'), '[[package]\nname = "unclosed\n', 'utf-8');
    writeFileSync(join(dir, 'poetry.lock'), '[[package]]\nname = "mcp"\nversion = \n', 'utf-8');
    writeFileSync(join(dir, 'Cargo.lock'), '[[package]]\nversion = "1.0.0"\n', 'utf-8');
    writeFileSync(join(dir, 'go.mod'), 'not_a_directive foo\n', 'utf-8');
    writeFileSync(join(dir, 'requirements.txt'), '\uFEFFanthropic==2.14.0\n', 'utf-8');

    const res = readWorkspace(dir);
    expect(res.files_read).toEqual([
      { file: 'requirements.txt', ecosystem: 'pypi', entries_count: 1, skipped_lines: 0 },
    ]);
    expect(res.files_skipped.map((s) => ({ file: s.file, code: s.code }))).toEqual([
      { file: 'package-lock.json', code: 'LOCKFILE_MALFORMED' },
      { file: 'pnpm-lock.yaml', code: 'LOCKFILE_MALFORMED' },
      { file: 'uv.lock', code: 'LOCKFILE_MALFORMED' },
      { file: 'poetry.lock', code: 'LOCKFILE_MALFORMED' },
      { file: 'Cargo.lock', code: 'LOCKFILE_MALFORMED' },
      { file: 'go.mod', code: 'LOCKFILE_MALFORMED' },
    ]);
    expect(res.entries).toEqual([
      { ecosystem: 'pypi', name: 'anthropic', version: '2.14.0', source_file: 'requirements.txt' },
    ]);
  });

  it('handles NUL bytes, read errors, TOML multiline/inline forms, and go.mod block errors', () => {
    // 1. NUL byte + readFileSync error
    const dirErr = makeTempDir();
    const reqPath = join(dirErr, 'requirements.txt');
    const goPath = join(dirErr, 'go.mod');
    writeFileSync(reqPath, 'mcp==2.1.0\0', 'utf-8');
    writeFileSync(goPath, 'module example.invalid/x\n', 'utf-8');
    const spyFs: WorkspaceFs = {
      statSync: (p) => statSync(p),
      lstatSync: (p) => lstatSync(p),
      readFileSync: (p, enc) => {
        if (p === goPath) throw new Error('EACCES mock');
        return readFileSync(p, enc);
      },
    };
    const errRes = readWorkspace(dirErr, { fs: spyFs });
    expect(errRes.files_skipped.map((s) => [s.file, s.code])).toEqual([
      ['requirements.txt', 'LOCKFILE_MALFORMED'],
      ['go.mod', 'LOCKFILE_READ_ERROR'],
    ]);

    // 2. Additional malformed TOML and go.mod shapes
    const malformedCases: Array<[string, string]> = [
      ['package-lock.json', JSON.stringify({ lockfileVersion: 3, packages: { 'node_modules/a': 'bad' } })],
      ['pnpm-lock.yaml', 'importers:\n  .:\n    dependencies: 123\n'],
      ['pnpm-lock.yaml', 'importers:\n  .:\n    dependencies:\n      a: 123\n'],
      ['uv.lock', '[[package]]\nname = "a"\nversion = "1.0.0"\ndeps = [\n'],
      ['uv.lock', '[[package]]\nname = "a"\nversion = "1.0.0"\nsource = { a = \n'],
      ['uv.lock', '[[package]]\nname = "a"\nversion = \'unterminated\n'],
      ['uv.lock', '[[package]]\nname = "a"\nversion = """unterminated\n'],
      ['uv.lock', '[[package]]\nname = "a"\nversion = \'\'\'unterminated\n'],
      ['uv.lock', '[[package]]\nname = "a"\nversion = @bad\n'],
      ['uv.lock', '[unclosed\n'],
      ['uv.lock', '[[package]] trailing\n'],
      ['go.mod', 'module x\nrequire (\n\texample.invalid/a v1.0.0\n'],
      ['go.mod', 'module x\nrequire example.invalid/a\n'],
      ['go.mod', 'module x\n)\n'],
      ['go.mod', 'module x\nrequire example.invalid/a badver\n'],
      ['go.mod', 'module x\nrequire (\n\tbadline\n)\n'],
    ];
    for (const [fname, content] of malformedCases) {
      const d = makeTempDir();
      writeFileSync(join(d, fname), content, 'utf-8');
      const r = readWorkspace(d);
      expect(r.files_skipped[0]?.code, `expected LOCKFILE_MALFORMED for ${fname}: ${content}`).toBe(
        'LOCKFILE_MALFORMED'
      );
    }

    // 3. Valid multiline literal strings, escapes, booleans, inline tables in TOML
    const dToml = makeTempDir();
    writeFileSync(
      join(dToml, 'poetry.lock'),
      `[[package]]
"name" = "my\\npkg\\t\\"x\\"\\\\"
'version' = '1.2.3'
notes = '''
raw literal
'''
flags = [true, false, 42]
meta = { k = "v", }
`,
      'utf-8'
    );
    const tomlOk = readWorkspace(dToml);
    expect(tomlOk.files_skipped).toEqual([]);
    expect(tomlOk.entries[0]?.version).toBe('1.2.3');
  });

  it('does not recurse into subdirectories (spies on lstatSync and readFileSync)', () => {
    const dir = makeTempDir();
    mkdirSync(join(dir, 'nested', 'deep'), { recursive: true });
    writeFileSync(
      join(dir, 'nested', 'package-lock.json'),
      JSON.stringify({
        lockfileVersion: 3,
        packages: { 'node_modules/@anthropic-ai/sdk': { version: '1.0.0' } },
      }),
      'utf-8'
    );
    writeFileSync(
      join(dir, 'nested', 'deep', 'Cargo.lock'),
      '[[package]]\nname = "rmcp"\nversion = "3.0.0"\n',
      'utf-8'
    );
    writeFileSync(join(dir, 'requirements.txt'), 'mcp==2.1.0\n', 'utf-8');

    const lstatSpy = vi.fn((p: string) => lstatSync(p));
    const readSpy = vi.fn((p: string, enc: BufferEncoding) => readFileSync(p, enc));
    const spyFs: WorkspaceFs = {
      statSync: (p) => statSync(p),
      lstatSync: lstatSpy,
      readFileSync: readSpy,
    };

    const res = readWorkspace(dir, { fs: spyFs });
    expect(res.entries).toHaveLength(1);
    expect(res.entries[0].source_file).toBe('requirements.txt');
    for (const [calledPath] of lstatSpy.mock.calls) {
      expect(calledPath).not.toContain('nested');
      expect(calledPath).not.toContain('deep');
    }
    for (const [calledPath] of readSpy.mock.calls) {
      expect(calledPath).not.toContain('nested');
      expect(calledPath).not.toContain('deep');
    }
  });
});
