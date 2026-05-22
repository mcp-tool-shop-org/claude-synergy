import type Database from 'better-sqlite3';

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
  product: string | undefined,
  limit = 20
): Array<{ product: string; version: string; released_at: string; change_count: number }> {
  if (product) {
    const sql = `
      SELECT r.product, r.version, r.released_at, COUNT(c.id) AS change_count
      FROM releases r
      LEFT JOIN changes c ON c.product = r.product AND c.version = r.version
      WHERE r.product = ?
      GROUP BY r.product, r.version
      ORDER BY r.released_at DESC
      LIMIT ?
    `;
    return db.prepare(sql).all(product, limit) as any;
  }
  const sql = `
    SELECT r.product, r.version, r.released_at, COUNT(c.id) AS change_count
    FROM releases r
    LEFT JOIN changes c ON c.product = r.product AND c.version = r.version
    GROUP BY r.product, r.version
    ORDER BY r.released_at DESC
    LIMIT ?
  `;
  return db.prepare(sql).all(limit) as any;
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
