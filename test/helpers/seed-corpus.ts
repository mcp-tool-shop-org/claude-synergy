import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type Database from 'better-sqlite3';
import { ingestAll } from '../../src/ingest.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Absolute path to test/fixtures/sample-products/ — the canonical fixture root.
 */
export const FIXTURE_PRODUCTS_ROOT = resolve(__dirname, '..', 'fixtures', 'sample-products');

/** Ingest the canonical sample-products fixture tree into the given db. */
export function seedSampleProducts(db: Database.Database) {
  return ingestAll(db, FIXTURE_PRODUCTS_ROOT);
}
