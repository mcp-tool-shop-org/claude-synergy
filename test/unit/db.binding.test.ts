import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openSqlite } from '../../src/db.js';
import { AppError } from '../../src/errors.js';

/** Run openSqlite with an opener that throws `thrown`, and return what openSqlite threw. */
function caughtFrom(thrown: unknown): unknown {
  try {
    openSqlite('/tmp/x.db', () => {
      throw thrown;
    });
  } catch (e) {
    return e;
  }
  throw new Error('openSqlite did not throw');
}

const withCode = (message: string, code: string) => Object.assign(new Error(message), { code });

describe('openSqlite: driver load failures become SQLITE_BINDING_ERROR', () => {
  // Each case is caught by exactly one mapping branch, so removing any branch fails a test.
  const platformCases: Array<[string, unknown]> = [
    [
      'path branch: no prebuild, build/Release fallback missing (Linux armv7)',
      new Error("Cannot find module '/x/node_modules/better-sqlite3/build/Release/better_sqlite3.node'"),
    ],
    [
      'path branch: Windows prebuild that fails to load',
      new Error(String.raw`C:\x\node_modules\better-sqlite3\prebuilds\win32-x64.node is not a valid Win32 application.`),
    ],
    [
      'path branch: macOS dlopen message',
      new Error(
        "dlopen(/x/node_modules/better-sqlite3/prebuilds/darwin-arm64.node, 0x0001): tried: '/x/node_modules/better-sqlite3/prebuilds/darwin-arm64.node' (mach-o file, but is an incompatible architecture)",
      ),
    ],
    [
      'NODE_MODULE_VERSION branch: built for another Node',
      new Error('The module was compiled against a different Node.js version using NODE_MODULE_VERSION 115.'),
    ],
    ['ERR_DLOPEN_FAILED code branch, whatever the message', withCode('loader failed', 'ERR_DLOPEN_FAILED')],
  ];

  for (const [name, thrown] of platformCases) {
    it(name, () => {
      const err = caughtFrom(thrown);
      expect(err).toBeInstanceOf(AppError);
      const app = err as AppError;
      expect(app.code).toBe('SQLITE_BINDING_ERROR');
      expect(app.hint).toMatch(/Node 22\.12/);
      expect(app.hint).toMatch(/32-bit ARM is not supported/);
      expect(app.cause).toBe((thrown as Error).message);
    });
  }

  it('ERR_DLOPEN_DISABLED code branch gets the addons-disabled hint', () => {
    const err = caughtFrom(
      withCode('Cannot load native addon because loading addons is disabled.', 'ERR_DLOPEN_DISABLED'),
    );
    expect(err).toBeInstanceOf(AppError);
    const app = err as AppError;
    expect(app.code).toBe('SQLITE_BINDING_ERROR');
    expect(app.hint).toMatch(/addons are disabled/);
  });
});

describe('openSqlite: other errors pass through unchanged', () => {
  const passthrough: Array<[string, unknown]> = [
    ['SQLITE_CANTOPEN', withCode('unable to open database file', 'SQLITE_CANTOPEN')],
    [
      'ENOENT on a database path that contains better-sqlite3/build',
      withCode("ENOENT: no such file or directory, open '/tmp/better-sqlite3/build/app.db'", 'ENOENT'),
    ],
    ['a non-Error throw', 'plain string'],
  ];

  for (const [name, thrown] of passthrough) {
    it(name, () => {
      expect(caughtFrom(thrown)).toBe(thrown);
    });
  }

  it('opens a real database with the default driver', () => {
    const dir = mkdtempSync(join(tmpdir(), 'db-binding-'));
    try {
      const db = openSqlite(join(dir, 'ok.db'));
      expect(db.prepare('select 1 as v').get()).toEqual({ v: 1 });
      db.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
