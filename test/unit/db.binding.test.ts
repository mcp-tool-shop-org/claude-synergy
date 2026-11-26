import { describe, it, expect } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openSqlite } from '../../src/db.js';
import { AppError } from '../../src/errors.js';

const fail = (message: string) => () => {
  throw new Error(message);
};

describe('openSqlite: missing or mismatched native driver', () => {
  const bindingFailures = [
    "Cannot find module '/x/node_modules/better-sqlite3/build/Release/better_sqlite3.node'",
    String.raw`C:\x\node_modules\better-sqlite3\prebuilds\win32-x64.node is not a valid Win32 application.`,
    '/x/node_modules/better-sqlite3/prebuilds/linuxmusl-x64.node: Error loading shared library',
    'The module was compiled against a different Node.js version using NODE_MODULE_VERSION 115.',
  ];

  for (const msg of bindingFailures) {
    it(`names the error for: ${msg.slice(0, 40)}`, () => {
      let caught: unknown;
      try {
        openSqlite('/tmp/x.db', fail(msg));
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(AppError);
      const err = caught as AppError;
      expect(err.code).toBe('SQLITE_BINDING_ERROR');
      expect(err.hint).toMatch(/Node 22\.12/);
      expect(err.hint).toMatch(/32-bit ARM is not supported/);
      expect(err.cause).toBe(msg);
    });
  }

  it('names a dlopen failure by its error code', () => {
    const err = Object.assign(new Error('some loader message'), { code: 'ERR_DLOPEN_FAILED' });
    let caught: unknown;
    try {
      openSqlite('/tmp/x.db', () => {
        throw err;
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(AppError);
    expect((caught as AppError).code).toBe('SQLITE_BINDING_ERROR');
  });

  it('passes other errors through unchanged', () => {
    const original = new Error('SQLITE_CANTOPEN: unable to open database file');
    let caught: unknown;
    try {
      openSqlite('/tmp/x.db', () => {
        throw original;
      });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBe(original);
  });

  it('passes a non-Error throw through unchanged', () => {
    expect(() =>
      openSqlite('/tmp/x.db', () => {
        throw 'plain string';
      }),
    ).toThrow('plain string');
  });

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
