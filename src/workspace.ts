// Top-level lockfile scanner for workspace relevance matching.
// Reads only exact, known lockfile names at the top level of a caller-named
// directory: no recursion, no globbing, no execution, and no subprocesses.

import { lstatSync, readFileSync, statSync, type Stats } from 'node:fs';
import { join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { AppError } from './errors.js';
import type { PackageEcosystem } from './products-config.js';

export const WORKSPACE_INVALID_DIR = 'WORKSPACE_INVALID_DIR';
export const MAX_LOCKFILE_BYTES = 20 * 1024 * 1024;

export type KnownLockfileName =
  | 'package-lock.json'
  | 'pnpm-lock.yaml'
  | 'uv.lock'
  | 'poetry.lock'
  | 'requirements.txt'
  | 'Cargo.lock'
  | 'go.mod';

export type LockfileWarningCode =
  | 'LOCKFILE_SYMLINK'
  | 'LOCKFILE_OVERSIZED'
  | 'LOCKFILE_MALFORMED'
  | 'LOCKFILE_NOT_REGULAR_FILE'
  | 'LOCKFILE_READ_ERROR';

export interface WorkspacePackageEntry {
  ecosystem: PackageEcosystem;
  name: string;
  version: string;
  source_file: KnownLockfileName;
}

export interface WorkspaceFileRead {
  file: KnownLockfileName;
  ecosystem: PackageEcosystem;
  entries_count: number;
  skipped_lines?: number;
}

export interface WorkspaceFileSkipped {
  file: KnownLockfileName;
  code: LockfileWarningCode;
  reason: string;
}

export interface WorkspaceScanResult {
  workspace_path: string;
  entries: WorkspacePackageEntry[];
  files_read: WorkspaceFileRead[];
  files_skipped: WorkspaceFileSkipped[];
}

export interface WorkspaceFs {
  statSync: (path: string) => Stats;
  lstatSync: (path: string) => Stats;
  readFileSync: (path: string, encoding: BufferEncoding) => string;
}

export interface ReadWorkspaceOptions {
  fs?: WorkspaceFs;
  maxLockfileBytes?: number;
}

interface LockfileSpec {
  file: KnownLockfileName;
  ecosystem: PackageEcosystem;
  parse: (raw: string) => { entries: Array<{ name: string; version: string }>; skippedLines?: number };
}

const DEFAULT_FS: WorkspaceFs = {
  statSync: (p) => statSync(p),
  lstatSync: (p) => lstatSync(p),
  readFileSync: (p, enc) => readFileSync(p, enc),
};

const KNOWN_LOCKFILES: readonly LockfileSpec[] = [
  { file: 'package-lock.json', ecosystem: 'npm', parse: (raw) => ({ entries: parsePackageLock(raw) }) },
  { file: 'pnpm-lock.yaml', ecosystem: 'npm', parse: (raw) => ({ entries: parsePnpmLock(raw) }) },
  { file: 'uv.lock', ecosystem: 'pypi', parse: (raw) => ({ entries: parseTomlLock(raw, 'uv') }) },
  { file: 'poetry.lock', ecosystem: 'pypi', parse: (raw) => ({ entries: parseTomlLock(raw, 'poetry') }) },
  { file: 'requirements.txt', ecosystem: 'pypi', parse: parseRequirementsTxt },
  { file: 'Cargo.lock', ecosystem: 'crates', parse: (raw) => ({ entries: parseTomlLock(raw, 'crates') }) },
  { file: 'go.mod', ecosystem: 'go', parse: (raw) => ({ entries: parseGoMod(raw) }) },
];

/**
 * Normalize a package name according to its ecosystem's canonical rules.
 * PyPI follows PEP 503 (lowercase; runs of `-`, `_`, `.` collapsed to `-`).
 */
export function normalizePackageName(ecosystem: PackageEcosystem, name: string): string {
  const trimmed = name.trim();
  switch (ecosystem) {
    case 'pypi':
      return trimmed.toLowerCase().replace(/[-_.]+/g, '-');
    case 'npm':
    case 'crates':
      return trimmed.toLowerCase();
    case 'go':
      return trimmed;
  }
}

function isPlainObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

/**
 * Read all supported top-level lockfiles in `dir` without recursing, globbing,
 * or executing any external tools. Missing lockfiles are ignored; symlinked,
 * oversized (>20 MB), non-regular, or malformed lockfiles are skipped with a
 * named warning while remaining lockfiles continue to be read.
 */
export function readWorkspace(dir: string, opts: ReadWorkspaceOptions = {}): WorkspaceScanResult {
  if (typeof dir !== 'string' || dir.trim().length === 0 || dir.includes('\0')) {
    throw new AppError({
      code: WORKSPACE_INVALID_DIR,
      message: 'workspace path must be a non-empty directory path',
      hint: 'Pass the path to a directory containing lockfiles (e.g. ".").',
    });
  }

  const fsImpl = opts.fs ?? DEFAULT_FS;
  const maxBytes = opts.maxLockfileBytes ?? MAX_LOCKFILE_BYTES;
  const resolvedDir = resolve(dir);

  let dirStat: Stats;
  try {
    dirStat = fsImpl.statSync(resolvedDir);
  } catch (e: any) {
    throw new AppError({
      code: WORKSPACE_INVALID_DIR,
      message: `workspace directory not found or unreadable: ${dir}`,
      hint: 'Verify the workspace directory exists and is readable.',
      cause: e?.message ?? String(e),
    });
  }

  if (!dirStat.isDirectory()) {
    throw new AppError({
      code: WORKSPACE_INVALID_DIR,
      message: `workspace path is not a directory: ${dir}`,
      hint: 'Pass a directory path rather than a file path.',
    });
  }

  const entries: WorkspacePackageEntry[] = [];
  const files_read: WorkspaceFileRead[] = [];
  const files_skipped: WorkspaceFileSkipped[] = [];

  for (const spec of KNOWN_LOCKFILES) {
    const filePath = join(resolvedDir, spec.file);
    let st: Stats;
    try {
      st = fsImpl.lstatSync(filePath);
    } catch (e: any) {
      if (e?.code === 'ENOENT') continue;
      files_skipped.push({
        file: spec.file,
        code: 'LOCKFILE_READ_ERROR',
        reason: e?.message ?? String(e),
      });
      continue;
    }

    if (st.isSymbolicLink()) {
      files_skipped.push({
        file: spec.file,
        code: 'LOCKFILE_SYMLINK',
        reason: 'symlinked lockfile refused',
      });
      continue;
    }

    if (!st.isFile()) {
      files_skipped.push({
        file: spec.file,
        code: 'LOCKFILE_NOT_REGULAR_FILE',
        reason: 'not a regular file',
      });
      continue;
    }

    if (st.size > maxBytes) {
      files_skipped.push({
        file: spec.file,
        code: 'LOCKFILE_OVERSIZED',
        reason: `lockfile size (${st.size} bytes) exceeds ${maxBytes} byte limit`,
      });
      continue;
    }

    let raw: string;
    try {
      raw = fsImpl.readFileSync(filePath, 'utf-8');
    } catch (e: any) {
      files_skipped.push({
        file: spec.file,
        code: 'LOCKFILE_READ_ERROR',
        reason: e?.message ?? String(e),
      });
      continue;
    }

    if (raw.charCodeAt(0) === 0xfeff) {
      raw = raw.slice(1);
    }
    if (raw.includes('\0')) {
      files_skipped.push({
        file: spec.file,
        code: 'LOCKFILE_MALFORMED',
        reason: 'unexpected NUL byte in lockfile',
      });
      continue;
    }

    try {
      const parsed = spec.parse(raw);
      for (const item of parsed.entries) {
        entries.push({
          ecosystem: spec.ecosystem,
          name: item.name,
          version: item.version,
          source_file: spec.file,
        });
      }
      files_read.push({
        file: spec.file,
        ecosystem: spec.ecosystem,
        entries_count: parsed.entries.length,
        ...(parsed.skippedLines !== undefined ? { skipped_lines: parsed.skippedLines } : {}),
      });
    } catch (e: any) {
      files_skipped.push({
        file: spec.file,
        code: 'LOCKFILE_MALFORMED',
        reason: e?.message ?? String(e),
      });
    }
  }

  return {
    workspace_path: resolvedDir,
    entries,
    files_read,
    files_skipped,
  };
}

// ── package-lock.json (v2/v3 packages map) ───────────────────────────────────

const ROOT_NODE_MODULE_RE = /^node_modules\/(@[^/]+\/[^/]+|[^@/][^/]*)$/;

function parsePackageLock(raw: string): Array<{ name: string; version: string }> {
  let doc: unknown;
  try {
    doc = JSON.parse(raw);
  } catch (e: any) {
    throw new Error(`invalid JSON: ${e?.message ?? String(e)}`);
  }

  if (!isPlainObject(doc) || !isPlainObject(doc.packages)) {
    throw new Error('package-lock.json missing v2/v3 "packages" object');
  }

  const out: Array<{ name: string; version: string }> = [];
  const seen = new Set<string>();

  for (const [pkgPath, meta] of Object.entries(doc.packages)) {
    const m = ROOT_NODE_MODULE_RE.exec(pkgPath);
    if (!m) continue;
    if (!isPlainObject(meta)) {
      throw new Error(`invalid package entry for "${pkgPath}"`);
    }
    if (meta.link === true && typeof meta.version !== 'string') {
      continue;
    }
    if (typeof meta.version !== 'string' || meta.version.trim().length === 0) {
      continue;
    }
    const rawName = typeof meta.name === 'string' && meta.name.trim().length > 0 ? meta.name : m[1];
    const name = normalizePackageName('npm', rawName);
    const version = meta.version.trim();
    const key = `${name}@${version}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ name, version });
    }
  }

  return out;
}

// ── pnpm-lock.yaml (importers['.'] dependencies + devDependencies) ───────────

function cleanPnpmVersion(rawVer: string): string {
  return rawVer.trim().replace(/\([^)]*\).*$/, '').replace(/_.*$/, '').trim();
}

function extractPnpmPkgAndVersion(depKey: string, rawSpec: string): { name: string; version: string } | null {
  const trimmed = rawSpec.trim();
  if (!trimmed) return null;
  if (/^(?:link|file|workspace|portal):/i.test(trimmed)) return null;

  // Strip peer-dependency suffixes before parsing alias/v5 "@scope/pkg@1.2.3" specs,
  // because peer qualifiers themselves contain '@' (e.g. "(debug@4.0.0)").
  const strippedLeadingSlash = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  const cleaned = cleanPnpmVersion(strippedLeadingSlash);
  if (!cleaned) return null;

  const atIdx = cleaned.lastIndexOf('@');
  if (atIdx > 0) {
    const aliasName = cleaned.slice(0, atIdx);
    const ver = cleaned.slice(atIdx + 1).trim();
    if (!ver) return null;
    return { name: normalizePackageName('npm', aliasName), version: ver };
  }

  return { name: normalizePackageName('npm', depKey), version: cleaned };
}

function parsePnpmLock(raw: string): Array<{ name: string; version: string }> {
  let doc: unknown;
  try {
    doc = parseYaml(raw);
  } catch (e: any) {
    throw new Error(`invalid YAML: ${e?.message ?? String(e)}`);
  }

  if (!isPlainObject(doc) || !isPlainObject(doc.importers)) {
    throw new Error('pnpm-lock.yaml missing "importers" object');
  }
  const rootImporter = doc.importers['.'];
  if (!isPlainObject(rootImporter)) {
    throw new Error('pnpm-lock.yaml missing importers["."] object');
  }

  const out: Array<{ name: string; version: string }> = [];
  const seen = new Set<string>();

  for (const sectionName of ['dependencies', 'devDependencies'] as const) {
    const section = rootImporter[sectionName];
    if (section === undefined) continue;
    if (!isPlainObject(section)) {
      throw new Error(`pnpm-lock.yaml importers["."].${sectionName} must be an object`);
    }
    for (const [depKey, rawVal] of Object.entries(section)) {
      let rawSpec: string | null = null;
      if (typeof rawVal === 'string') {
        rawSpec = rawVal;
      } else if (isPlainObject(rawVal) && (typeof rawVal.version === 'string' || typeof rawVal.version === 'number')) {
        rawSpec = String(rawVal.version);
      } else {
        throw new Error(`pnpm-lock.yaml invalid dependency entry for "${depKey}"`);
      }

      const resolved = extractPnpmPkgAndVersion(depKey, rawSpec);
      if (!resolved) continue;
      const key = `${resolved.name}@${resolved.version}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(resolved);
      }
    }
  }

  return out;
}

// ── Strict lockfile TOML parser for uv.lock, poetry.lock, Cargo.lock ─────────

interface TomlPackageRecord {
  name?: unknown;
  version?: unknown;
  source?: unknown;
}

class TomlScanner {
  private pos = 0;

  constructor(private readonly src: string) {}

  parsePackages(): TomlPackageRecord[] {
    const packages: TomlPackageRecord[] = [];
    let currentPkg: TomlPackageRecord | null = null;

    while (true) {
      this.skipWsNewlinesAndComments();
      if (this.eof()) break;

      if (this.peek() === '[') {
        const isArrayTable = this.src.startsWith('[[', this.pos);
        const header = this.parseTableHeader(isArrayTable);
        this.expectLineEnd();
        if (isArrayTable && header.length === 1 && header[0] === 'package') {
          currentPkg = {};
          packages.push(currentPkg);
        } else {
          currentPkg = null;
        }
        continue;
      }

      const keyPath = this.parseDottedKey();
      this.skipHorizontalWs();
      if (this.peek() !== '=') {
        throw new Error(`expected "=" after TOML key at offset ${this.pos}`);
      }
      this.pos++;
      this.skipHorizontalWs();
      const val = this.parseValue();
      this.expectLineEnd();

      if (currentPkg && keyPath.length === 1) {
        const key = keyPath[0];
        if (key === 'name' || key === 'version' || key === 'source') {
          currentPkg[key] = val;
        }
      }
    }

    return packages;
  }

  private eof(): boolean {
    return this.pos >= this.src.length;
  }

  private peek(offset = 0): string {
    return this.src[this.pos + offset] ?? '';
  }

  private skipHorizontalWs(): void {
    while (!this.eof()) {
      const ch = this.src[this.pos];
      if (ch === ' ' || ch === '\t') {
        this.pos++;
      } else {
        break;
      }
    }
  }

  private skipComment(): void {
    if (this.peek() === '#') {
      while (!this.eof() && this.peek() !== '\n' && this.peek() !== '\r') {
        this.pos++;
      }
    }
  }

  private skipWsNewlinesAndComments(): void {
    while (!this.eof()) {
      const ch = this.src[this.pos];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        this.pos++;
      } else if (ch === '#') {
        this.skipComment();
      } else {
        break;
      }
    }
  }

  private expectLineEnd(): void {
    this.skipHorizontalWs();
    this.skipComment();
    if (this.eof()) return;
    const ch = this.peek();
    if (ch === '\r') {
      this.pos++;
      if (this.peek() === '\n') this.pos++;
      return;
    }
    if (ch === '\n') {
      this.pos++;
      return;
    }
    throw new Error(`unexpected trailing token ${JSON.stringify(ch)} at offset ${this.pos}`);
  }

  private parseTableHeader(isArrayTable: boolean): string[] {
    this.pos += isArrayTable ? 2 : 1;
    this.skipHorizontalWs();
    const parts = this.parseDottedKey();
    this.skipHorizontalWs();
    if (isArrayTable) {
      if (!this.src.startsWith(']]', this.pos)) {
        throw new Error(`unclosed [[table]] header at offset ${this.pos}`);
      }
      this.pos += 2;
    } else {
      if (this.peek() !== ']') {
        throw new Error(`unclosed [table] header at offset ${this.pos}`);
      }
      this.pos++;
    }
    return parts;
  }

  private parseDottedKey(): string[] {
    const parts: string[] = [this.parseKeySegment()];
    while (true) {
      this.skipHorizontalWs();
      if (this.peek() !== '.') break;
      this.pos++;
      this.skipHorizontalWs();
      parts.push(this.parseKeySegment());
    }
    return parts;
  }

  private parseKeySegment(): string {
    const ch = this.peek();
    if (ch === '"') return this.parseBasicString();
    if (ch === "'") return this.parseLiteralString();
    const start = this.pos;
    while (!this.eof() && /[A-Za-z0-9_-]/.test(this.peek())) {
      this.pos++;
    }
    if (this.pos === start) {
      throw new Error(`expected TOML key at offset ${this.pos}`);
    }
    return this.src.slice(start, this.pos);
  }

  private parseValue(): unknown {
    if (this.eof()) {
      throw new Error(`missing TOML value at offset ${this.pos}`);
    }
    if (this.src.startsWith('"""', this.pos)) return this.parseMultilineBasicString();
    if (this.src.startsWith("'''", this.pos)) return this.parseMultilineLiteralString();
    const ch = this.peek();
    if (ch === '"') return this.parseBasicString();
    if (ch === "'") return this.parseLiteralString();
    if (ch === '[') return this.parseArray();
    if (ch === '{') return this.parseInlineTable();

    const start = this.pos;
    while (!this.eof()) {
      const c = this.peek();
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n' || c === '#' || c === ',' || c === ']' || c === '}') {
        break;
      }
      this.pos++;
    }
    const token = this.src.slice(start, this.pos);
    if (!token) {
      throw new Error(`missing TOML value at offset ${start}`);
    }
    if (token === 'true') return true;
    if (token === 'false') return false;
    if (/^[+-]?(?:0x[0-9a-fA-F_]+|0o[0-7_]+|0b[01_]+|[0-9][0-9_T:Z.+\-eE]*|inf|nan)$/i.test(token)) {
      return token;
    }
    throw new Error(`invalid TOML value "${token}" at offset ${start}`);
  }

  private parseBasicString(): string {
    this.pos++;
    let out = '';
    while (!this.eof()) {
      const ch = this.src[this.pos++];
      if (ch === '"') return out;
      if (ch === '\n' || ch === '\r') {
        throw new Error(`unterminated TOML string at offset ${this.pos}`);
      }
      if (ch === '\\') {
        if (this.eof()) throw new Error(`unterminated escape at offset ${this.pos}`);
        const esc = this.src[this.pos++];
        switch (esc) {
          case 'n': out += '\n'; break;
          case 't': out += '\t'; break;
          case 'r': out += '\r'; break;
          case '"': out += '"'; break;
          case '\\': out += '\\'; break;
          default: out += esc; break;
        }
      } else {
        out += ch;
      }
    }
    throw new Error(`unterminated TOML string at offset ${this.pos}`);
  }

  private parseLiteralString(): string {
    this.pos++;
    const start = this.pos;
    while (!this.eof()) {
      const ch = this.src[this.pos++];
      if (ch === "'") return this.src.slice(start, this.pos - 1);
      if (ch === '\n' || ch === '\r') {
        throw new Error(`unterminated TOML literal string at offset ${this.pos}`);
      }
    }
    throw new Error(`unterminated TOML literal string at offset ${this.pos}`);
  }

  private parseMultilineBasicString(): string {
    this.pos += 3;
    if (this.peek() === '\r') this.pos++;
    if (this.peek() === '\n') this.pos++;
    let out = '';
    while (!this.eof()) {
      if (this.src.startsWith('"""', this.pos)) {
        this.pos += 3;
        return out;
      }
      const ch = this.src[this.pos++];
      if (ch === '\\' && !this.eof()) {
        out += this.src[this.pos++];
      } else {
        out += ch;
      }
    }
    throw new Error(`unterminated TOML multiline string at offset ${this.pos}`);
  }

  private parseMultilineLiteralString(): string {
    this.pos += 3;
    if (this.peek() === '\r') this.pos++;
    if (this.peek() === '\n') this.pos++;
    const start = this.pos;
    while (!this.eof()) {
      if (this.src.startsWith("'''", this.pos)) {
        const val = this.src.slice(start, this.pos);
        this.pos += 3;
        return val;
      }
      this.pos++;
    }
    throw new Error(`unterminated TOML multiline literal string at offset ${this.pos}`);
  }

  private parseArray(): unknown[] {
    this.pos++;
    const items: unknown[] = [];
    while (true) {
      this.skipWsNewlinesAndComments();
      if (this.eof()) throw new Error(`unclosed TOML array at offset ${this.pos}`);
      if (this.peek() === ']') {
        this.pos++;
        return items;
      }
      items.push(this.parseValue());
      this.skipWsNewlinesAndComments();
      if (this.peek() === ',') {
        this.pos++;
        continue;
      }
      if (this.peek() === ']') {
        this.pos++;
        return items;
      }
      throw new Error(`expected "," or "]" in TOML array at offset ${this.pos}`);
    }
  }

  private parseInlineTable(): Record<string, unknown> {
    this.pos++;
    const obj: Record<string, unknown> = {};
    this.skipHorizontalWs();
    if (this.peek() === '}') {
      this.pos++;
      return obj;
    }
    while (true) {
      this.skipHorizontalWs();
      const key = this.parseDottedKey().join('.');
      this.skipHorizontalWs();
      if (this.peek() !== '=') {
        throw new Error(`expected "=" in TOML inline table at offset ${this.pos}`);
      }
      this.pos++;
      this.skipHorizontalWs();
      obj[key] = this.parseValue();
      this.skipHorizontalWs();
      if (this.peek() === ',') {
        this.pos++;
        this.skipHorizontalWs();
        if (this.peek() === '}') {
          this.pos++;
          return obj;
        }
        continue;
      }
      if (this.peek() === '}') {
        this.pos++;
        return obj;
      }
      throw new Error(`expected "," or "}" in TOML inline table at offset ${this.pos}`);
    }
  }
}

function parseTomlLock(raw: string, mode: 'uv' | 'poetry' | 'crates'): Array<{ name: string; version: string }> {
  const records = new TomlScanner(raw).parsePackages();
  const eco: PackageEcosystem = mode === 'crates' ? 'crates' : 'pypi';
  const out: Array<{ name: string; version: string }> = [];
  const seen = new Set<string>();

  for (const pkg of records) {
    if (typeof pkg.name !== 'string' || pkg.name.trim().length === 0) {
      throw new Error('TOML [[package]] entry missing string "name"');
    }
    if (mode === 'uv' && isPlainObject(pkg.source) && ('virtual' in pkg.source || 'editable' in pkg.source)) {
      continue;
    }
    if (typeof pkg.version !== 'string' || pkg.version.trim().length === 0) {
      throw new Error(`TOML [[package]] "${pkg.name}" missing string "version"`);
    }
    const name = normalizePackageName(eco, pkg.name);
    const version = pkg.version.trim();
    const key = `${name}@${version}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ name, version });
    }
  }

  return out;
}

// ── requirements.txt (exact name==version pins only) ─────────────────────────

const REQ_EXACT_PIN_RE =
  /^([A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)(?:\[[A-Za-z0-9._,\s-]+\])?==([A-Za-z0-9][A-Za-z0-9._+!-]*)$/;

function parseRequirementsTxt(raw: string): { entries: Array<{ name: string; version: string }>; skippedLines: number } {
  const entries: Array<{ name: string; version: string }> = [];
  const seen = new Set<string>();
  let skippedLines = 0;

  for (const rawLine of raw.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Strip inline comment preceded by whitespace.
    const noComment = trimmed.replace(/\s+#.*$/, '').trim();
    const match = REQ_EXACT_PIN_RE.exec(noComment);
    if (!match) {
      skippedLines++;
      continue;
    }

    const name = normalizePackageName('pypi', match[1]);
    const version = match[2];
    const key = `${name}@${version}`;
    if (!seen.has(key)) {
      seen.add(key);
      entries.push({ name, version });
    }
  }

  return { entries, skippedLines };
}

// ── go.mod (require directives) ──────────────────────────────────────────────

const VALID_GOMOD_DIRECTIVES = new Set([
  'module',
  'go',
  'toolchain',
  'require',
  'replace',
  'exclude',
  'retract',
  'tool',
  'godebug',
]);

function stripGoComment(line: string): string {
  const idx = line.indexOf('//');
  return (idx >= 0 ? line.slice(0, idx) : line).trim();
}

function unquoteGoToken(token: string): string {
  if (token.length >= 2 && ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith('`') && token.endsWith('`')))) {
    return token.slice(1, -1);
  }
  return token;
}

function normalizeGoVersion(rawVer: string): string {
  if (!/^v\d+\.\d+\.\d+/.test(rawVer)) {
    throw new Error(`invalid go.mod require version "${rawVer}"`);
  }
  return rawVer.replace(/^v/, '').replace(/\+incompatible$/, '');
}

function parseGoMod(raw: string): Array<{ name: string; version: string }> {
  const out: Array<{ name: string; version: string }> = [];
  const seen = new Set<string>();
  let inBlock: string | null = null;

  for (const rawLine of raw.split(/\r?\n/)) {
    const line = stripGoComment(rawLine);
    if (!line) continue;

    if (inBlock !== null) {
      if (line === ')') {
        inBlock = null;
        continue;
      }
      if (inBlock === 'require') {
        const parts = line.split(/\s+/);
        if (parts.length < 2) {
          throw new Error(`malformed go.mod require line: "${line}"`);
        }
        const mod = normalizePackageName('go', unquoteGoToken(parts[0]));
        const ver = normalizeGoVersion(parts[1]);
        const key = `${mod}@${ver}`;
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ name: mod, version: ver });
        }
      }
      continue;
    }

    if (line === ')') {
      throw new Error('unexpected ")" outside block in go.mod');
    }

    const tokens = line.split(/\s+/);
    const directive = tokens[0];
    if (!VALID_GOMOD_DIRECTIVES.has(directive)) {
      throw new Error(`unknown go.mod directive "${directive}"`);
    }

    if (tokens.length === 2 && tokens[1] === '(') {
      inBlock = directive;
      continue;
    }

    if (directive === 'require') {
      if (tokens.length < 3) {
        throw new Error(`malformed go.mod require directive: "${line}"`);
      }
      const mod = normalizePackageName('go', unquoteGoToken(tokens[1]));
      const ver = normalizeGoVersion(tokens[2]);
      const key = `${mod}@${ver}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ name: mod, version: ver });
      }
    }
  }

  if (inBlock !== null) {
    throw new Error(`unclosed ${inBlock} (...) block in go.mod`);
  }

  return out;
}
