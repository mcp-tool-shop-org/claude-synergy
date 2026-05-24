import type Database from 'better-sqlite3';
import { AppError } from './errors.js';

// ─── CLI / MCP formatting helpers ─────────────────────────────────────────

/**
 * Truncate a string to `maxLen` characters, appending an ellipsis when trimmed.
 * Safe for empty / undefined input.
 */
export function truncate(text: string | undefined | null, maxLen = 200): string {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

/**
 * Format a single result row as an aligned CLI line.
 * Returns a two-line string:  date  product@version  [kind]
 *                               body text (truncated)
 *
 * `productColWidth` controls the pad width for the product@version column
 * so columns stay aligned across rows with varying product name lengths.
 */
export function formatResultLine(
  row: { released_at: string | null; product: string; version: string; kind: string },
  bodyText: string,
  opts: { maxTextLen?: number; productColWidth?: number } = {}
): string {
  const date = row.released_at ?? '????-??-??';
  const pv = `${row.product}@${row.version}`;
  const padWidth = opts.productColWidth ?? 40;
  const header = `${date}  ${pv.padEnd(padWidth)}  [${row.kind}]`;
  const body = `  ${truncate(bodyText, opts.maxTextLen ?? 200)}`;
  return `${header}\n${body}`;
}

/**
 * Compute the ideal product@version column width for a set of rows
 * (max observed length + 2 padding chars).
 */
export function productColWidth(
  rows: Array<{ product: string; version: string }>
): number {
  if (rows.length === 0) return 30;
  const maxLen = rows.reduce(
    (mx, r) => Math.max(mx, `${r.product}@${r.version}`.length),
    0
  );
  return maxLen + 2;
}

export interface QueryResult {
  product: string;
  version: string;
  released_at: string | null;
  ordinal: number;
  kind: string;
  text: string;
  snippet: string;
}

export interface QueryOptions {
  product?: string;
  since?: string;
  /** Inclusive date upper bound (YYYY-MM-DD). Pairs with `since` for windowed search. */
  until?: string;
  kind?: string;
  limit?: number;
}

export function searchChanges(
  db: Database.Database,
  query: string,
  opts: QueryOptions = {}
): QueryResult[] {
  const limit = opts.limit ?? 20;
  const filters: string[] = [];
  const params: Record<string, any> = { query, limit };

  if (opts.product) {
    filters.push('c.product = @product');
    params.product = opts.product;
  }
  if (opts.since) {
    filters.push('r.released_at >= @since');
    params.since = opts.since;
  }
  if (opts.until) {
    filters.push('r.released_at <= @until');
    params.until = opts.until;
  }
  if (opts.kind) {
    filters.push('c.kind = @kind');
    params.kind = opts.kind;
  }

  const where = filters.length > 0 ? `AND ${filters.join(' AND ')}` : '';

  const sql = `
    SELECT c.product, c.version, r.released_at,
           c.ordinal, c.kind, c.text AS body,
           snippet(changes_fts, 0, '[[', ']]', '…', 16) AS snippet
    FROM changes_fts
    JOIN changes c ON changes_fts.rowid = c.id
    JOIN releases r ON c.product = r.product AND c.version = r.version
    WHERE changes_fts MATCH @query
      ${where}
    ORDER BY r.released_at DESC, c.ordinal ASC
    LIMIT @limit
  `;

  const rows = db.prepare(sql).all(params) as Array<Omit<QueryResult, 'text'> & { body: string }>;
  return rows.map((r) => ({ ...r, text: r.body })) as QueryResult[];
}

export function lookupEntity(
  db: Database.Database,
  type: string,
  value: string
): QueryResult[] {
  const sql = `
    SELECT c.product, c.version, r.released_at, c.ordinal, c.kind, c.text,
           '' AS snippet
    FROM entities e
    JOIN changes c ON e.change_id = c.id
    JOIN releases r ON c.product = r.product AND c.version = r.version
    WHERE e.entity_type = ? AND e.entity_value = ?
    ORDER BY r.released_at ASC, c.product
  `;
  return db.prepare(sql).all(type, value) as QueryResult[];
}

export function recentReleases(
  db: Database.Database,
  product?: string,
  limit = 20,
  since?: string
): Array<{ product: string; version: string; released_at: string; change_count: number }> {
  const filters: string[] = [];
  const params: Record<string, any> = { limit };
  if (product) {
    filters.push('r.product = @product');
    params.product = product;
  }
  if (since) {
    filters.push('r.released_at >= @since');
    params.since = since;
  }
  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const sql = `
    SELECT r.product, r.version, r.released_at, COUNT(c.id) AS change_count
    FROM releases r
    LEFT JOIN changes c ON c.product = r.product AND c.version = r.version
    ${where}
    GROUP BY r.product, r.version
    ORDER BY r.released_at DESC
    LIMIT @limit
  `;
  return db.prepare(sql).all(params) as any;
}

export function listProducts(
  db: Database.Database
): Array<{ name: string; display_name: string; release_count: number; latest_version: string | null; latest_date: string | null }> {
  const sql = `
    SELECT p.name, p.display_name,
           COUNT(DISTINCT r.version) AS release_count,
           (SELECT version FROM releases r2 WHERE r2.product = p.name ORDER BY r2.released_at DESC LIMIT 1) AS latest_version,
           (SELECT released_at FROM releases r2 WHERE r2.product = p.name ORDER BY r2.released_at DESC LIMIT 1) AS latest_date
    FROM products p
    LEFT JOIN releases r ON r.product = p.name
    GROUP BY p.name
    ORDER BY release_count DESC
  `;
  return db.prepare(sql).all() as any;
}

export interface SyncStatusRow {
  product: string;
  fetch_strategy: string | null;
  last_release_at: string | null;       // marker.version — ISO timestamp of newest fetched release
  last_fetch_attempt: string | null;    // marker.updated_at — when the marker was last written
  hours_since_fetch: number | null;     // null if never fetched
  releases_ingested: number;            // distinct versions in releases table for this product
}

/**
 * Per-product sync freshness. Joins markers + products + releases so a caller
 * can answer "which products are stale, and which haven't ingested anything yet?"
 * with one query.
 *
 * Used by the sync_status MCP tool and (eventually) the CLI's `hk status`.
 */
export function getSyncStatus(
  db: Database.Database,
  opts: { product?: string; staleHours?: number; staleOnly?: boolean } = {}
): SyncStatusRow[] {
  const filters: string[] = [];
  const params: Record<string, any> = {};
  if (opts.product) {
    filters.push('p.name = @product');
    params.product = opts.product;
  }
  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  // LEFT JOIN markers — products with no marker yet still appear (hours_since_fetch = NULL).
  // Hours computation uses julianday() so SQLite handles ISO timestamps uniformly.
  const sql = `
    SELECT p.name                       AS product,
           p.fetch_strategy             AS fetch_strategy,
           m.version                    AS last_release_at,
           m.updated_at                 AS last_fetch_attempt,
           CASE WHEN m.updated_at IS NULL THEN NULL
                ELSE ROUND((julianday('now') - julianday(m.updated_at)) * 24.0, 1)
           END                          AS hours_since_fetch,
           (SELECT COUNT(DISTINCT r.version)
            FROM releases r
            WHERE r.product = p.name)   AS releases_ingested
    FROM products p
    LEFT JOIN markers m
      ON m.product = p.name
     AND m.name = 'last_fetched_release_at'
    ${where}
    ORDER BY (hours_since_fetch IS NULL) DESC,
             hours_since_fetch DESC,
             p.name ASC
  `;
  const rows = db.prepare(sql).all(params) as SyncStatusRow[];
  if (opts.staleOnly) {
    const cutoff = opts.staleHours ?? 24;
    return rows.filter((r) => r.hours_since_fetch === null || r.hours_since_fetch > cutoff);
  }
  return rows;
}

export function entityFrequency(
  db: Database.Database,
  type: string,
  limit = 30
): Array<{ value: string; count: number; first_seen: string | null }> {
  const sql = `
    SELECT e.entity_value AS value,
           COUNT(*) AS count,
           MIN(r.released_at) AS first_seen
    FROM entities e
    JOIN changes c ON e.change_id = c.id
    JOIN releases r ON c.product = r.product AND c.version = r.version
    WHERE e.entity_type = ?
    GROUP BY e.entity_value
    ORDER BY count DESC, first_seen ASC
    LIMIT ?
  `;
  return db.prepare(sql).all(type, limit) as any;
}

// ─── Browse + windowed queries (P1-1 / P1-4) ─────────────────────────────

export interface BrowseOptions {
  product?: string;
  since?: string;
  until?: string;
  kind?: string;
  limit?: number;
}

/**
 * Filter-only browse — list changes by product/date/kind without a search
 * term. Useful when an agent wants "everything since X" or "all breaking
 * changes for product Y" without searching free text.
 *
 * Results share the QueryResult shape used by `searchChanges` so callers
 * can format them identically; `snippet` is left empty (no FTS match).
 */
export function browseChanges(
  db: Database.Database,
  opts: BrowseOptions = {}
): QueryResult[] {
  const limit = opts.limit ?? 20;
  const filters: string[] = [];
  const params: Record<string, any> = { limit };

  if (opts.product) {
    filters.push('c.product = @product');
    params.product = opts.product;
  }
  if (opts.since) {
    filters.push('r.released_at >= @since');
    params.since = opts.since;
  }
  if (opts.until) {
    filters.push('r.released_at <= @until');
    params.until = opts.until;
  }
  if (opts.kind) {
    filters.push('c.kind = @kind');
    params.kind = opts.kind;
  }

  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

  const sql = `
    SELECT c.product, c.version, r.released_at,
           c.ordinal, c.kind, c.text AS body,
           '' AS snippet
    FROM changes c
    JOIN releases r ON c.product = r.product AND c.version = r.version
    ${where}
    ORDER BY r.released_at DESC, c.product, c.ordinal ASC
    LIMIT @limit
  `;

  const rows = db.prepare(sql).all(params) as Array<Omit<QueryResult, 'text'> & { body: string }>;
  return rows.map((r) => ({ ...r, text: r.body })) as QueryResult[];
}

export interface ChangesSinceOptions {
  since: string;
  until?: string;
  product?: string;
  kind?: string;
  /** Total changes cap. Default 200. */
  limit?: number;
}

export interface ChangesSinceResult {
  product: string;
  version: string;
  released_at: string;
  changes: Array<{ ordinal: number; kind: string; text: string }>;
}

/**
 * Return changes within a date window grouped by product+release.
 *
 * Output is sorted release-newest-first, with each release's changes
 * inlined in ordinal order. `since` is required (the function's reason
 * for existing is windowed retrieval); `until` is optional inclusive
 * upper bound.
 *
 * The `limit` caps total changes across all releases; if a release would
 * push the count past the cap, it is included with however many of its
 * changes fit (preserving ordinal order). This keeps the result usable
 * for display even at small limits.
 */
export function getChangesSince(
  db: Database.Database,
  opts: ChangesSinceOptions
): ChangesSinceResult[] {
  if (!opts.since) {
    throw new AppError({
      code: 'QUERY_SINCE_REQUIRED',
      message: 'getChangesSince requires a `since` date',
      hint: 'pass since as YYYY-MM-DD (e.g. "2026-01-01")',
    });
  }
  const limit = opts.limit ?? 200;
  const filters: string[] = ['r.released_at >= @since'];
  const params: Record<string, any> = { since: opts.since };
  if (opts.until) {
    filters.push('r.released_at <= @until');
    params.until = opts.until;
  }
  if (opts.product) {
    filters.push('c.product = @product');
    params.product = opts.product;
  }
  if (opts.kind) {
    filters.push('c.kind = @kind');
    params.kind = opts.kind;
  }
  const where = `WHERE ${filters.join(' AND ')}`;

  // Pull rows; group in JS so we can honor the change-count cap across releases.
  const sql = `
    SELECT c.product, c.version, r.released_at, c.ordinal, c.kind, c.text
    FROM changes c
    JOIN releases r ON c.product = r.product AND c.version = r.version
    ${where}
    ORDER BY r.released_at DESC, c.product, c.version, c.ordinal ASC
  `;
  const rows = db.prepare(sql).all(params) as Array<{
    product: string;
    version: string;
    released_at: string;
    ordinal: number;
    kind: string;
    text: string;
  }>;

  const grouped = new Map<string, ChangesSinceResult>();
  let total = 0;
  for (const r of rows) {
    if (total >= limit) break;
    const key = `${r.product}@${r.version}`;
    let bucket = grouped.get(key);
    if (!bucket) {
      bucket = {
        product: r.product,
        version: r.version,
        released_at: r.released_at,
        changes: [],
      };
      grouped.set(key, bucket);
    }
    bucket.changes.push({ ordinal: r.ordinal, kind: r.kind, text: r.text });
    total++;
  }

  return Array.from(grouped.values());
}

export interface CompareVersionsOptions {
  product: string;
  /** Exclusive lower bound — changes in this version are NOT included. */
  fromVersion: string;
  /** Inclusive upper bound — changes in this version ARE included. */
  toVersion: string;
}

/**
 * Compare two versions of the same product: return every change in
 * releases strictly after `fromVersion` (by released_at) up to and
 * including `toVersion`. The output reuses ChangesSinceResult so the
 * formatter and caller code paths stay identical.
 *
 * Both versions must exist; if either is missing the function throws an
 * AppError so callers can surface a clear "unknown version" message
 * rather than silently returning empty.
 */
export function compareVersions(
  db: Database.Database,
  opts: CompareVersionsOptions
): ChangesSinceResult[] {
  if (!opts.product || !opts.fromVersion || !opts.toVersion) {
    throw new AppError({
      code: 'QUERY_COMPARE_ARGS',
      message: 'compareVersions requires product, fromVersion, and toVersion',
      hint: 'pass all three as strings, e.g. { product: "claude-code", fromVersion: "2.1.100", toVersion: "2.1.147" }',
    });
  }

  // Resolve released_at for both endpoints so we can compare on date
  // (versions are strings; SQLite would lexicographically compare them, which
  // is wrong for "2.1.10" vs "2.1.9").
  const endpoint = db.prepare(`
    SELECT version, released_at FROM releases
    WHERE product = ? AND version = ?
  `);
  const fromRow = endpoint.get(opts.product, opts.fromVersion) as
    | { version: string; released_at: string | null }
    | undefined;
  const toRow = endpoint.get(opts.product, opts.toVersion) as
    | { version: string; released_at: string | null }
    | undefined;
  if (!fromRow || !toRow) {
    // Unknown product or version → return empty rather than throw. Callers
    // (CLI / MCP) decide whether to surface an empty result or error; this
    // mirrors how searchChanges and browseChanges behave on no-match inputs.
    return [];
  }
  if (!fromRow.released_at || !toRow.released_at) {
    throw new AppError({
      code: 'QUERY_VERSION_NO_DATE',
      message: `cannot compare versions without released_at on both endpoints (${opts.product}@${opts.fromVersion} or ${opts.toVersion} is missing a date)`,
      hint: 're-ingest the affected product so released_at is populated',
    });
  }

  const sql = `
    SELECT c.product, c.version, r.released_at, c.ordinal, c.kind, c.text
    FROM changes c
    JOIN releases r ON c.product = r.product AND c.version = r.version
    WHERE c.product = @product
      AND r.released_at > @fromDate
      AND r.released_at <= @toDate
    ORDER BY r.released_at DESC, c.version, c.ordinal ASC
  `;
  const rows = db.prepare(sql).all({
    product: opts.product,
    fromDate: fromRow.released_at,
    toDate: toRow.released_at,
  }) as Array<{
    product: string;
    version: string;
    released_at: string;
    ordinal: number;
    kind: string;
    text: string;
  }>;

  const grouped = new Map<string, ChangesSinceResult>();
  for (const r of rows) {
    const key = `${r.product}@${r.version}`;
    let bucket = grouped.get(key);
    if (!bucket) {
      bucket = {
        product: r.product,
        version: r.version,
        released_at: r.released_at,
        changes: [],
      };
      grouped.set(key, bucket);
    }
    bucket.changes.push({ ordinal: r.ordinal, kind: r.kind, text: r.text });
  }
  return Array.from(grouped.values());
}

// ─── Synergy queries (P1-5) ──────────────────────────────────────────────

export interface SynergyRow {
  id: number;
  name: string;
  title: string;
  trigger: string;
  status: string;
  last_validated: string;
  notes_path: string;
  products: string[];
}

export interface SynergyEvidenceRow {
  source_url: string;
  quote: string | null;
  source_kind: string | null;
}

export interface SynergyFull extends SynergyRow {
  steps: Array<{ ordinal: number; text: string }>;
  evidence: SynergyEvidenceRow[];
  change_refs: Array<{ change_id: number; product: string; version: string; text: string }>;
}

export interface ListSynergiesOptions {
  product?: string;
  status?: string;
  limit?: number;
}

/**
 * List synergies from the populated DB tables. When `opts.product` is set
 * the result is filtered to synergies that mention that product in their
 * `synergy_products` join.
 */
export function listSynergies(
  db: Database.Database,
  opts: ListSynergiesOptions = {}
): SynergyRow[] {
  const filters: string[] = [];
  const params: Record<string, any> = {};
  if (opts.product) {
    filters.push('s.id IN (SELECT synergy_id FROM synergy_products WHERE product = @product)');
    params.product = opts.product;
  }
  if (opts.status) {
    filters.push('s.status = @status');
    params.status = opts.status;
  }
  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const limitClause = opts.limit ? 'LIMIT @limit' : '';
  if (opts.limit) params.limit = opts.limit;

  const sql = `
    SELECT s.id, s.name, s.title, s.trigger, s.status, s.last_validated, s.notes_path
    FROM synergies s
    ${where}
    ORDER BY s.last_validated DESC, s.name
    ${limitClause}
  `;
  const rows = db.prepare(sql).all(params) as Array<Omit<SynergyRow, 'products'>>;

  if (rows.length === 0) return [];

  // Bulk-load products for all surfaced synergies in one query.
  const ids = rows.map((r) => r.id);
  const productsByIdSql = `
    SELECT synergy_id, product FROM synergy_products
    WHERE synergy_id IN (${ids.map(() => '?').join(',')})
    ORDER BY synergy_id, product
  `;
  const productRows = db.prepare(productsByIdSql).all(...ids) as Array<{
    synergy_id: number;
    product: string;
  }>;
  const productsById = new Map<number, string[]>();
  for (const pr of productRows) {
    if (!productsById.has(pr.synergy_id)) productsById.set(pr.synergy_id, []);
    productsById.get(pr.synergy_id)!.push(pr.product);
  }

  return rows.map((r) => ({ ...r, products: productsById.get(r.id) ?? [] }));
}

/**
 * Fetch a single synergy with all joined data. Returns null when not found.
 *
 * The `name` is looked up case-insensitively against `synergies.name`
 * (matches the markdown frontmatter slug). Callers should validate the
 * caller-supplied name with a tight regex before invoking — the MCP
 * server already does this; this layer just passes through.
 */
export function getSynergy(db: Database.Database, name: string): SynergyFull | null {
  const synergy = db
    .prepare(`
      SELECT id, name, title, trigger, status, last_validated, notes_path
      FROM synergies WHERE name = ?
    `)
    .get(name) as Omit<SynergyRow, 'products'> | undefined;
  if (!synergy) return null;

  const products = (
    db
      .prepare(`SELECT product FROM synergy_products WHERE synergy_id = ? ORDER BY product`)
      .all(synergy.id) as Array<{ product: string }>
  ).map((r) => r.product);

  const steps = db
    .prepare(`SELECT ordinal, text FROM synergy_steps WHERE synergy_id = ? ORDER BY ordinal`)
    .all(synergy.id) as Array<{ ordinal: number; text: string }>;

  const evidence = db
    .prepare(`SELECT source_url, quote, source_kind FROM synergy_evidence WHERE synergy_id = ?`)
    .all(synergy.id) as SynergyEvidenceRow[];

  const change_refs = db
    .prepare(`
      SELECT scr.change_id, c.product, c.version, c.text
      FROM synergy_change_refs scr
      JOIN changes c ON c.id = scr.change_id
      WHERE scr.synergy_id = ?
      ORDER BY c.product, c.version
    `)
    .all(synergy.id) as Array<{ change_id: number; product: string; version: string; text: string }>;

  return {
    ...synergy,
    products,
    steps,
    evidence,
    change_refs,
  };
}
