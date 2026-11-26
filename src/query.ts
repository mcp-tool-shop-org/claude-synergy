import type Database from 'better-sqlite3';
import { AppError } from './errors.js';
import {
  SCHEMA_VERSION,
  getSchemaVersion,
  hasChangesFlagsColumn,
  hasReleasesPackageColumn,
} from './db.js';
import {
  UNASSIGNED_PACKAGE,
  UNASSIGNED_PACKAGE_LABEL,
  deriveReleaseIdentity,
  getCanonicalPackages,
  isMultiPackageProduct,
  loadProductsConfig,
  type ProductsConfig,
} from './products-config.js';
import {
  VENDOR_TEXT_FRAME,
  formatFlagMarker,
  frameVendorText,
  parseFlagsJson,
  screenVendorText,
} from './screen.js';

export { VENDOR_TEXT_FRAME, formatFlagMarker, frameVendorText, parseFlagsJson };

/**
 * Resolve text and screening flags for a row fetched from `changes`:
 * uses stored `flags` when the column exists, and falls back to query-time
 * screening when serving an unmigrated read-only pre-v4 DB.
 */
export function resolveRowScreening(
  rawText: string,
  flagsJson: string | null | undefined,
  hasFlagsCol: boolean,
): { text: string; flags: string[] } {
  if (hasFlagsCol) {
    return { text: rawText, flags: parseFlagsJson(flagsJson) };
  }
  return screenVendorText(rawText);
}

// ─── Corpus freshness (Part 1) ────────────────────────────────────────────

/** Threshold (in days) after which the corpus is flagged as STALE. */
export const STALE_AFTER_DAYS = 7;

export interface ProductFreshness {
  product: string;
  synced_at: string | null;
  newest_release: string | null;
  fetch_strategy: string | null;
}

export interface CorpusFreshness {
  synced_at: string | null;
  newest_release: string | null;
  age_days: number | null;
  synced_age_days: number | null;
  stale: boolean;
  stale_after_days: number;
  partial_note?: string;
  schema_note?: string;
  product?: ProductFreshness;
}

export type ClockInput = Date | (() => Date);

/** Metadata key in `schema_meta` storing the last partial sync state (drives stamp only). */
export const LAST_SYNC_PARTIAL_META_KEY = 'last_sync_partial';

/** Legacy metadata key migrated once to `LAST_SYNC_PARTIAL_META_KEY` on read. */
export const LEGACY_FIRST_USE_PARTIAL_META_KEY = 'first_use_partial';

export interface SkippedProductInfo {
  product: string;
  reason: string;
}

export interface PartialSyncState {
  succeeded: number;
  total: number;
  skipped: SkippedProductInfo[];
  recorded_at?: string;
}

/**
 * Format the partial-sync note surfaced in the freshness stamp on every answer
 * while `last_sync_partial` is set in `schema_meta`.
 */
export function formatPartialNote(
  report: Pick<PartialSyncState, 'succeeded' | 'total' | 'skipped'>
): string {
  const skippedNames = report.skipped.map((s) => `${s.product} (${s.reason})`).join(', ');
  return skippedNames
    ? `partial: ${report.succeeded}/${report.total} feeds (skipped: ${skippedNames}) — run hk sync`
    : `partial: ${report.succeeded}/${report.total} feeds — run hk sync`;
}

/** Persist the last partial sync state under `last_sync_partial` in `schema_meta`. */
export function writePartialSyncState(
  db: Database.Database,
  state: PartialSyncState,
  opts: { now?: ClockInput } = {}
): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
  const payload: PartialSyncState = {
    succeeded: state.succeeded,
    total: state.total,
    skipped: state.skipped,
    recorded_at: state.recorded_at ?? resolveNow(opts.now).toISOString(),
  };
  db.prepare(`DELETE FROM schema_meta WHERE key = ?`).run(LEGACY_FIRST_USE_PARTIAL_META_KEY);
  db.prepare(`
    INSERT OR REPLACE INTO schema_meta (key, value) VALUES (?, ?)
  `).run(LAST_SYNC_PARTIAL_META_KEY, JSON.stringify(payload));
}

/** Remove `last_sync_partial` (and any legacy `first_use_partial`) after a clean full sync. */
export function clearPartialSyncState(db: Database.Database | null): void {
  if (!db) return;
  try {
    db.prepare(`DELETE FROM schema_meta WHERE key IN (?, ?)`).run(
      LAST_SYNC_PARTIAL_META_KEY,
      LEGACY_FIRST_USE_PARTIAL_META_KEY
    );
  } catch {
    // schema_meta absent -> nothing to clear
  }
}

/**
 * Read any persisted `last_sync_partial` marker from `schema_meta`, migrating
 * the legacy `first_use_partial` key once if present.
 */
export function readPartialSyncState(db: Database.Database | null): PartialSyncState | null {
  if (!db) return null;
  try {
    const newRow = db
      .prepare(`SELECT value FROM schema_meta WHERE key = ?`)
      .get(LAST_SYNC_PARTIAL_META_KEY) as { value: string } | undefined;
    const legacyRow = db
      .prepare(`SELECT value FROM schema_meta WHERE key = ?`)
      .get(LEGACY_FIRST_USE_PARTIAL_META_KEY) as { value: string } | undefined;

    let rawValue = newRow?.value;
    if (legacyRow?.value) {
      if (!rawValue) {
        rawValue = legacyRow.value;
      }
      try {
        if (!newRow?.value && !db.readonly) {
          db.prepare(`INSERT OR REPLACE INTO schema_meta (key, value) VALUES (?, ?)`).run(
            LAST_SYNC_PARTIAL_META_KEY,
            legacyRow.value
          );
        }
        if (!db.readonly) {
          db.prepare(`DELETE FROM schema_meta WHERE key = ?`).run(LEGACY_FIRST_USE_PARTIAL_META_KEY);
        }
      } catch {
        // Migration write failed (e.g. SQLITE_BUSY or read-only); still return read state.
      }
    }
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<PartialSyncState>;
    if (typeof parsed.succeeded === 'number' && typeof parsed.total === 'number') {
      return {
        succeeded: parsed.succeeded,
        total: parsed.total,
        skipped: Array.isArray(parsed.skipped) ? parsed.skipped : [],
        recorded_at: typeof parsed.recorded_at === 'string' ? parsed.recorded_at : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function resolveNow(now?: ClockInput): Date {
  if (typeof now === 'function') return now();
  if (now instanceof Date) return now;
  const envNow = process.env.CLAUDE_SYNERGY_NOW?.trim();
  if (envNow) {
    const parsed = new Date(envNow);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

/**
 * Compute whole UTC calendar days elapsed from `dateStr` (YYYY-MM-DD or ISO)
 * to `now`. Returns null if `dateStr` is null or unparseable.
 */
export function utcDaysSince(dateStr: string | null | undefined, now: Date): number | null {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  let y: number;
  let m: number;
  let d: number;
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (ymd) {
    y = parseInt(ymd[1], 10);
    m = parseInt(ymd[2], 10) - 1;
    d = parseInt(ymd[3], 10);
  } else {
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return null;
    y = parsed.getUTCFullYear();
    m = parsed.getUTCMonth();
    d = parsed.getUTCDate();
  }
  const thenUtc = Date.UTC(y, m, d);
  const nowUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.floor((nowUtc - thenUtc) / 86_400_000));
}

function datePart(s: string | null | undefined): string | null {
  if (!s) return null;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(s.trim());
  if (m) return m[1];
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toISOString().slice(0, 10);
}

/**
 * Query overall corpus freshness from `markers.updated_at` + `releases.released_at`
 * (and per-product freshness + `fetch_strategy` when `opts.product` is set).
 * Also surfaces any persisted `last_sync_partial` state from `schema_meta`.
 */
export function getCorpusFreshness(
  db: Database.Database | null,
  opts: { product?: string; now?: ClockInput } = {}
): CorpusFreshness {
  const nowDate = resolveNow(opts.now);
  let syncedAt: string | null = null;
  let newestRelease: string | null = null;
  let partialNote: string | undefined;
  let schemaNote: string | undefined;

  if (db) {
    try {
      const hasProducts = db
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='products'`)
        .get();
      if (hasProducts) {
        const schemaVersion = getSchemaVersion(db);
        if (schemaVersion < SCHEMA_VERSION) {
          schemaNote = `old schema (v${schemaVersion} < v${SCHEMA_VERSION}${db.readonly ? ', read-only' : ''})`;
        }
      }
    } catch {
      // Ignore uninitialized DB
    }
    try {
      const markerRow = db
        .prepare(`SELECT MAX(updated_at) AS synced_at FROM markers`)
        .get() as { synced_at: string | null } | undefined;
      syncedAt = markerRow?.synced_at ?? null;
    } catch {
      // Uninitialized DB (no markers table yet) -> leave null so it stamps STALE
    }
    try {
      const relRow = db
        .prepare(`SELECT MAX(released_at) AS newest_release FROM releases`)
        .get() as { newest_release: string | null } | undefined;
      newestRelease = relRow?.newest_release ?? null;
    } catch {
      // Uninitialized DB (no releases table yet) -> leave null so it stamps STALE
    }
    const partialState = readPartialSyncState(db);
    if (partialState) {
      partialNote = formatPartialNote(partialState);
    }
  }

  const ageDays = utcDaysSince(newestRelease, nowDate);
  const syncedAgeDays = utcDaysSince(syncedAt, nowDate);
  const stale = syncedAt === null || (syncedAgeDays !== null && syncedAgeDays > STALE_AFTER_DAYS);

  const result: CorpusFreshness = {
    synced_at: syncedAt,
    newest_release: newestRelease,
    age_days: ageDays,
    synced_age_days: syncedAgeDays,
    stale,
    stale_after_days: STALE_AFTER_DAYS,
    ...(partialNote ? { partial_note: partialNote } : {}),
    ...(schemaNote ? { schema_note: schemaNote } : {}),
  };

  if (opts.product) {
    let prodSynced: string | null = null;
    let prodNewest: string | null = null;
    let fetchStrategy: string | null = null;

    if (db) {
      try {
        const prodMarker = db
          .prepare(`SELECT MAX(updated_at) AS synced_at FROM markers WHERE product = ?`)
          .get(opts.product) as { synced_at: string | null } | undefined;
        prodSynced = prodMarker?.synced_at ?? null;

        const prodRel = db
          .prepare(`SELECT MAX(released_at) AS newest_release FROM releases WHERE product = ?`)
          .get(opts.product) as { newest_release: string | null } | undefined;
        prodNewest = prodRel?.newest_release ?? null;

        const metaRow = db
          .prepare(`SELECT fetch_strategy FROM products WHERE name = ?`)
          .get(opts.product) as { fetch_strategy: string | null } | undefined;
        fetchStrategy = metaRow?.fetch_strategy ?? null;
      } catch {
        // Ignore uninitialized schema
      }
    }

    if (!fetchStrategy) {
      fetchStrategy = loadProductsConfig()?.productMeta[opts.product]?.fetch_strategy ?? null;
    }

    result.product = {
      product: opts.product,
      synced_at: prodSynced,
      newest_release: prodNewest,
      fetch_strategy: fetchStrategy,
    };
  }

  return result;
}

/**
 * Format the single-line "data as of" stamp appended to every CLI text and MCP
 * response. Prefixes `STALE:` and names refresh commands when `stale` is true.
 */
export function formatFreshnessStamp(
  freshness: CorpusFreshness,
  opts: { partialNote?: string } = {}
): string {
  const parts: string[] = [];

  if (freshness.synced_at === null && freshness.newest_release === null) {
    parts.push('data as of: empty corpus (no releases synced)');
  } else {
    const syncStr = datePart(freshness.synced_at) ?? 'never';
    const relDate = datePart(freshness.newest_release);
    const relStr = relDate
      ? `${relDate} (${freshness.age_days ?? 0} day${freshness.age_days === 1 ? '' : 's'} old)`
      : 'none';
    parts.push(`data as of: synced ${syncStr}, newest release ${relStr}`);
  }

  if (freshness.product) {
    const p = freshness.product;
    const pSynced = datePart(p.synced_at) ?? 'never';
    const pNewest = datePart(p.newest_release) ?? 'none';
    const strat = p.fetch_strategy ?? 'unknown';
    const manualTag = p.fetch_strategy === 'manual' ? ', MANUAL FEED — not refreshed by sync' : '';
    parts.push(`${p.product}: synced ${pSynced}, newest release ${pNewest} (${strat}${manualTag})`);
  }

  const partial = opts.partialNote ?? freshness.partial_note;
  if (partial) {
    parts.push(partial);
  }
  if (freshness.schema_note) {
    parts.push(freshness.schema_note);
  }

  const base = parts.join('; ');
  if (freshness.stale) {
    return `STALE: ${base} — refresh with sync_now or hk sync`;
  }
  return base;
}

/**
 * Loud warning banner for any product whose `fetch_strategy` remains `manual`.
 */
export function formatManualFeedWarning(
  product: string,
  newestRelease: string | null,
  now?: ClockInput
): string {
  const nowDate = resolveNow(now);
  const days = utcDaysSince(newestRelease, nowDate);
  const dateStr = datePart(newestRelease) ?? 'never';
  const ageStr = days === null ? 'unknown' : String(days);
  return `MANUAL FEED (${product}): last updated ${dateStr}, ${ageStr} days old, not refreshed by sync`;
}

/** Format display package name (mapping empty unassigned package to `'unassigned'`). */
export function formatPackageName(pkg: string | null | undefined): string {
  return pkg && pkg.length > 0 ? pkg : UNASSIGNED_PACKAGE_LABEL;
}

/**
 * Format `product@version` for single-package products (byte-for-byte legacy shape),
 * or `product (package)@version` for multi-package products.
 */
export function formatReleaseLabel(
  product: string,
  pkg: string | null | undefined,
  version: string,
  config: ProductsConfig | null = loadProductsConfig(),
): string {
  if (!isMultiPackageProduct(config?.productMeta[product])) {
    return `${product}@${version}`;
  }
  return `${product} (${formatPackageName(pkg)})@${version}`;
}

/**
 * Resolve a caller-supplied `package` filter against `products.yaml`.
 * Maps `'unassigned'` / `''` to `UNASSIGNED_PACKAGE`, collapses Go `/v2` aliases
 * to the canonical package name, and throws `UNKNOWN_PACKAGE` when `product`
 * has declared packages and `requestedPackage` is not one of them.
 */
export function resolvePackageFilter(
  product: string | undefined,
  requestedPackage: string,
  config: ProductsConfig | null = loadProductsConfig(),
): string {
  const trimmed = requestedPackage.trim();
  if (trimmed === '' || trimmed.toLowerCase() === UNASSIGNED_PACKAGE_LABEL) {
    return UNASSIGNED_PACKAGE;
  }
  if (product) {
    const meta = config?.productMeta[product];
    const canonical = getCanonicalPackages(meta);
    if (canonical.length > 0) {
      const exact = canonical.find(
        (c) => c.name === trimmed || c.aliases.includes(trimmed),
      );
      if (exact) return exact.name;
      const ci = canonical.find(
        (c) =>
          c.name.toLowerCase() === trimmed.toLowerCase() ||
          c.aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase()),
      );
      if (ci) return ci.name;
      const valid = [...canonical.map((c) => c.name), UNASSIGNED_PACKAGE_LABEL].join(', ');
      throw new AppError({
        code: 'UNKNOWN_PACKAGE',
        message: `unknown package ${JSON.stringify(requestedPackage)} for product ${product}`,
        hint: `Available packages for ${product}: ${valid}`,
      });
    }
    return trimmed;
  }
  if (config) {
    for (const meta of Object.values(config.productMeta)) {
      const canonical = getCanonicalPackages(meta);
      const exact = canonical.find(
        (c) => c.name === trimmed || c.aliases.includes(trimmed),
      );
      if (exact) return exact.name;
    }
  }
  return trimmed;
}

/**
 * List canonical package names present for `product` in `products.yaml` declaration
 * order, appending any extra/unassigned packages present in the DB (unassigned last).
 */
export function listProductPackageOrder(
  db: Database.Database,
  product: string,
  config: ProductsConfig | null = loadProductsConfig(),
): string[] {
  const meta = config?.productMeta[product];
  const declared = getCanonicalPackages(meta).map((c) => c.name);
  const seenInDb = new Set<string>();
  const hasPkgCol = hasReleasesPackageColumn(db);
  if (hasPkgCol) {
    const rows = db
      .prepare(`SELECT DISTINCT package FROM releases WHERE product = ?`)
      .all(product) as Array<{ package: string }>;
    for (const r of rows) seenInDb.add(r.package);
  } else {
    const rows = db
      .prepare(`SELECT version, notes_path FROM releases WHERE product = ?`)
      .all(product) as Array<{ version: string; notes_path: string }>;
    for (const r of rows) {
      seenInDb.add(deriveReleaseIdentity(product, r.version, r.notes_path, config).pkg);
    }
  }

  const out: string[] = [];
  for (const name of declared) {
    if (seenInDb.has(name)) {
      out.push(name);
      seenInDb.delete(name);
    }
  }
  const hasUnassigned = seenInDb.delete(UNASSIGNED_PACKAGE);
  for (const extra of [...seenInDb].sort()) {
    out.push(extra);
  }
  if (hasUnassigned) {
    out.push(UNASSIGNED_PACKAGE);
  }
  return out;
}

/**
 * Require `package` when `product` declares multiple packages in `products.yaml`.
 * Returns the resolved package name (or `undefined` for single-package products).
 */
export function requirePackageIfMultiPackage(
  db: Database.Database,
  product: string,
  requestedPackage: string | undefined,
  config: ProductsConfig | null = loadProductsConfig(),
): string | undefined {
  if (requestedPackage !== undefined) {
    return resolvePackageFilter(product, requestedPackage, config);
  }
  const meta = config?.productMeta[product];
  if (!isMultiPackageProduct(meta)) {
    return undefined;
  }
  const packages = listProductPackageOrder(db, product, config);
  const displayList =
    packages.length > 0
      ? packages.map((p) => formatPackageName(p))
      : getCanonicalPackages(meta).map((c) => c.name);
  throw new AppError({
    code: 'PACKAGE_REQUIRED',
    message: `product "${product}" has multiple packages; specify package (${displayList.join(', ')})`,
    hint: `Pass package as one of: ${displayList.join(', ')}`,
  });
}

function resolveCfg(config?: ProductsConfig | null): ProductsConfig | null {
  return config !== undefined ? config : loadProductsConfig();
}

function attachMultiPackageField<T extends { product: string }>(
  row: T,
  pkg: string,
  config: ProductsConfig | null,
): T & { package?: string } {
  if (!isMultiPackageProduct(config?.productMeta[row.product])) {
    return row;
  }
  return { ...row, package: formatPackageName(pkg) };
}

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
  row: {
    released_at: string | null;
    product: string;
    package?: string;
    version: string;
    kind: string;
    flags?: readonly string[];
  },
  bodyText: string,
  opts: { maxTextLen?: number; productColWidth?: number; productsConfig?: ProductsConfig | null } = {}
): string {
  const date = row.released_at ?? '????-??-??';
  const pv = row.package
    ? `${row.product} (${row.package})@${row.version}`
    : `${row.product}@${row.version}`;
  const padWidth = opts.productColWidth ?? 40;
  const flagMarker = formatFlagMarker(row.flags);
  const flagSuffix = flagMarker ? ` ${flagMarker}` : '';
  const header = `${date}  ${pv.padEnd(padWidth)}  [${row.kind}]${flagSuffix}`;
  const body = `  ${truncate(bodyText, opts.maxTextLen ?? 200)}`;
  return `${header}\n${body}`;
}

/**
 * Compute the ideal product@version column width for a set of rows
 * (max observed length + 2 padding chars).
 */
export function productColWidth(
  rows: Array<{ product: string; package?: string; version: string }>
): number {
  if (rows.length === 0) return 30;
  const maxLen = rows.reduce(
    (mx, r) =>
      Math.max(mx, (r.package ? `${r.product} (${r.package})@${r.version}` : `${r.product}@${r.version}`).length),
    0
  );
  return maxLen + 2;
}

export interface QueryResult {
  product: string;
  package?: string;
  version: string;
  released_at: string | null;
  ordinal: number;
  kind: string;
  text: string;
  snippet: string;
  flags: string[];
}

export interface QueryOptions {
  product?: string;
  package?: string;
  productsConfig?: ProductsConfig | null;
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
  const cfg = resolveCfg(opts.productsConfig);
  const hasPkgCol = hasReleasesPackageColumn(db);
  const resolvedPkg =
    opts.package !== undefined ? resolvePackageFilter(opts.product, opts.package, cfg) : undefined;
  const limit = opts.limit ?? 20;
  const filters: string[] = [];
  const params: Record<string, any> = { query, limit };

  if (opts.product) {
    filters.push('c.product = @product');
    params.product = opts.product;
  }
  if (resolvedPkg !== undefined && hasPkgCol) {
    filters.push('c.package = @package');
    params.package = resolvedPkg;
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
  const hasFlagsCol = hasChangesFlagsColumn(db);
  const flagsExpr = hasFlagsCol ? 'c.flags' : 'NULL';
  const pkgSelect = hasPkgCol ? 'c.package AS pkg, r.notes_path AS notes_path' : `'' AS pkg, r.notes_path AS notes_path`;
  const joinCond = hasPkgCol
    ? 'c.product = r.product AND c.package = r.package AND c.version = r.version'
    : 'c.product = r.product AND c.version = r.version';
  const limitSql = !hasPkgCol && resolvedPkg !== undefined ? '' : 'LIMIT @limit';

  const sql = `
    SELECT c.product, ${pkgSelect}, c.version, r.released_at,
           c.ordinal, c.kind, c.text AS body, ${flagsExpr} AS flags_json,
           snippet(changes_fts, 0, '[[', ']]', '…', 16) AS snippet
    FROM changes_fts
    JOIN changes c ON changes_fts.rowid = c.id
    JOIN releases r ON ${joinCond}
    WHERE changes_fts MATCH @query
      ${where}
    ORDER BY r.released_at DESC, c.ordinal ASC
    ${limitSql}
  `;

  const rows = db.prepare(sql).all(params) as Array<{
    product: string;
    pkg: string;
    notes_path: string;
    version: string;
    released_at: string | null;
    ordinal: number;
    kind: string;
    body: string;
    flags_json?: string | null;
    snippet: string;
  }>;

  const out: QueryResult[] = [];
  for (const r of rows) {
    const derived = hasPkgCol
      ? { pkg: r.pkg, version: r.version }
      : deriveReleaseIdentity(r.product, r.version, r.notes_path, cfg);
    if (resolvedPkg !== undefined && derived.pkg !== resolvedPkg) continue;
    const screened = resolveRowScreening(r.body, r.flags_json, hasFlagsCol);
    const cleanSnippet = hasFlagsCol ? r.snippet : screenVendorText(r.snippet).text;
    out.push(
      attachMultiPackageField(
        {
          product: r.product,
          version: derived.version,
          released_at: r.released_at,
          ordinal: r.ordinal,
          kind: r.kind,
          text: screened.text,
          snippet: cleanSnippet,
          flags: screened.flags,
        },
        derived.pkg,
        cfg,
      ),
    );
    if (out.length >= limit) break;
  }
  return out;
}

export function searchChangesByPackage(
  db: Database.Database,
  query: string,
  opts: QueryOptions & { product: string },
): Array<{ package: string; results: QueryResult[] }> {
  const cfg = resolveCfg(opts.productsConfig);
  const pkgOrder = listProductPackageOrder(db, opts.product, cfg);
  const groups: Array<{ package: string; results: QueryResult[] }> = [];
  for (const pkg of pkgOrder) {
    const results = searchChanges(db, query, {
      ...opts,
      package: formatPackageName(pkg),
      productsConfig: cfg,
    });
    if (results.length > 0) {
      groups.push({ package: formatPackageName(pkg), results });
    }
  }
  return groups;
}

export function lookupEntity(
  db: Database.Database,
  type: string,
  value: string,
  opts: { productsConfig?: ProductsConfig | null } = {},
): QueryResult[] {
  const cfg = resolveCfg(opts.productsConfig);
  const hasFlagsCol = hasChangesFlagsColumn(db);
  const hasPkgCol = hasReleasesPackageColumn(db);
  const flagsExpr = hasFlagsCol ? 'c.flags' : 'NULL';
  const pkgSelect = hasPkgCol ? 'c.package AS pkg, r.notes_path AS notes_path' : `'' AS pkg, r.notes_path AS notes_path`;
  const joinCond = hasPkgCol
    ? 'c.product = r.product AND c.package = r.package AND c.version = r.version'
    : 'c.product = r.product AND c.version = r.version';
  const sql = `
    SELECT c.product, ${pkgSelect}, c.version, r.released_at, c.ordinal, c.kind, c.text,
           ${flagsExpr} AS flags_json, '' AS snippet
    FROM entities e
    JOIN changes c ON e.change_id = c.id
    JOIN releases r ON ${joinCond}
    WHERE e.entity_type = ? AND e.entity_value = ?
    ORDER BY r.released_at ASC, c.product
  `;
  const rows = db.prepare(sql).all(type, value) as Array<{
    product: string;
    pkg: string;
    notes_path: string;
    version: string;
    released_at: string | null;
    ordinal: number;
    kind: string;
    text: string;
    flags_json?: string | null;
    snippet: string;
  }>;
  return rows.map((r) => {
    const derived = hasPkgCol
      ? { pkg: r.pkg, version: r.version }
      : deriveReleaseIdentity(r.product, r.version, r.notes_path, cfg);
    const screened = resolveRowScreening(r.text, r.flags_json, hasFlagsCol);
    return attachMultiPackageField(
      {
        product: r.product,
        version: derived.version,
        released_at: r.released_at,
        ordinal: r.ordinal,
        kind: r.kind,
        text: screened.text,
        snippet: r.snippet,
        flags: screened.flags,
      },
      derived.pkg,
      cfg,
    );
  });
}

export interface RecentReleaseRow {
  product: string;
  package?: string;
  version: string;
  released_at: string;
  change_count: number;
}

export function recentReleases(
  db: Database.Database,
  product?: string,
  limit = 20,
  since?: string,
  pkg?: string,
  productsConfig?: ProductsConfig | null,
): RecentReleaseRow[] {
  const cfg = resolveCfg(productsConfig);
  const hasPkgCol = hasReleasesPackageColumn(db);
  const resolvedPkg =
    pkg !== undefined ? resolvePackageFilter(product, pkg, cfg) : undefined;
  const filters: string[] = [];
  const params: Record<string, any> = { limit };
  if (product) {
    filters.push('r.product = @product');
    params.product = product;
  }
  if (resolvedPkg !== undefined && hasPkgCol) {
    filters.push('r.package = @package');
    params.package = resolvedPkg;
  }
  if (since) {
    filters.push('r.released_at >= @since');
    params.since = since;
  }
  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const pkgSelect = hasPkgCol ? 'r.package AS pkg, r.notes_path AS notes_path' : `'' AS pkg, r.notes_path AS notes_path`;
  const joinCond = hasPkgCol
    ? 'c.product = r.product AND c.package = r.package AND c.version = r.version'
    : 'c.product = r.product AND c.version = r.version';
  const groupBy = hasPkgCol ? 'r.product, r.package, r.version' : 'r.product, r.version';
  const limitSql = !hasPkgCol && resolvedPkg !== undefined ? '' : 'LIMIT @limit';
  const sql = `
    SELECT r.product, ${pkgSelect}, r.version, r.released_at, COUNT(c.id) AS change_count
    FROM releases r
    LEFT JOIN changes c ON ${joinCond}
    ${where}
    GROUP BY ${groupBy}
    ORDER BY r.released_at DESC
    ${limitSql}
  `;
  const rows = db.prepare(sql).all(params) as Array<{
    product: string;
    pkg: string;
    notes_path: string;
    version: string;
    released_at: string;
    change_count: number;
  }>;
  const out: RecentReleaseRow[] = [];
  for (const r of rows) {
    const derived = hasPkgCol
      ? { pkg: r.pkg, version: r.version }
      : deriveReleaseIdentity(r.product, r.version, r.notes_path, cfg);
    if (resolvedPkg !== undefined && derived.pkg !== resolvedPkg) continue;
    out.push(
      attachMultiPackageField(
        {
          product: r.product,
          version: derived.version,
          released_at: r.released_at,
          change_count: r.change_count,
        },
        derived.pkg,
        cfg,
      ),
    );
    if (out.length >= limit) break;
  }
  return out;
}

export function recentReleasesByPackage(
  db: Database.Database,
  product: string,
  limit = 20,
  since?: string,
  productsConfig?: ProductsConfig | null,
): Array<{ package: string; releases: RecentReleaseRow[] }> {
  const cfg = resolveCfg(productsConfig);
  const pkgOrder = listProductPackageOrder(db, product, cfg);
  const groups: Array<{ package: string; releases: RecentReleaseRow[] }> = [];
  for (const pkg of pkgOrder) {
    const releases = recentReleases(db, product, limit, since, formatPackageName(pkg), cfg);
    if (releases.length > 0) {
      groups.push({ package: formatPackageName(pkg), releases });
    }
  }
  return groups;
}

export interface ReleaseDetails {
  product: string;
  package?: string;
  version: string;
  released_at: string | null;
  source_url: string;
  notes_path: string;
  changes: Array<{ ordinal: number; kind: string; text: string; flags: string[] }>;
}

export function getRelease(
  db: Database.Database,
  opts: { product: string; package?: string; version: string; productsConfig?: ProductsConfig | null },
): ReleaseDetails | null {
  const cfg = resolveCfg(opts.productsConfig);
  const resolvedPkg = requirePackageIfMultiPackage(db, opts.product, opts.package, cfg);
  const hasPkgCol = hasReleasesPackageColumn(db);
  const hasFlagsCol = hasChangesFlagsColumn(db);
  const bareVersion = opts.version.replace(/^v(?=\d)/i, '');

  let release:
    | {
        product: string;
        pkg: string;
        version: string;
        dbVersion: string;
        released_at: string | null;
        source_url: string;
        notes_path: string;
      }
    | undefined;

  if (hasPkgCol) {
    const pkgFilter = resolvedPkg !== undefined ? 'AND package = ?' : '';
    const selectStmt = db.prepare(
      `SELECT product, package AS pkg, version, version AS dbVersion, released_at, source_url, notes_path
       FROM releases
       WHERE product = ? AND version = ? ${pkgFilter}`,
    );
    const args = resolvedPkg !== undefined ? [opts.product, opts.version, resolvedPkg] : [opts.product, opts.version];
    release = selectStmt.get(...args) as typeof release;
    if (!release && bareVersion !== opts.version) {
      const bareArgs =
        resolvedPkg !== undefined ? [opts.product, bareVersion, resolvedPkg] : [opts.product, bareVersion];
      release = selectStmt.get(...bareArgs) as typeof release;
    } else if (!release && `v${bareVersion}` !== opts.version) {
      const vVersion = `v${bareVersion}`;
      const vArgs = resolvedPkg !== undefined ? [opts.product, vVersion, resolvedPkg] : [opts.product, vVersion];
      release = selectStmt.get(...vArgs) as typeof release;
    }
  } else {
    const candidates = db
      .prepare(
        `SELECT product, version, released_at, source_url, notes_path
         FROM releases
         WHERE product = ?`,
      )
      .all(opts.product) as Array<{
      product: string;
      version: string;
      released_at: string | null;
      source_url: string;
      notes_path: string;
    }>;
    for (const c of candidates) {
      const derived = deriveReleaseIdentity(c.product, c.version, c.notes_path, cfg);
      if (resolvedPkg !== undefined && derived.pkg !== resolvedPkg) continue;
      if (
        derived.version === opts.version ||
        c.version === opts.version ||
        derived.version === bareVersion
      ) {
        release = {
          product: c.product,
          pkg: derived.pkg,
          version: derived.version,
          dbVersion: c.version,
          released_at: c.released_at,
          source_url: c.source_url,
          notes_path: c.notes_path,
        };
        break;
      }
    }
  }

  if (!release) return null;

  const changeRows = (
    hasPkgCol
      ? db
          .prepare(
            `SELECT ordinal, kind, text, ${hasFlagsCol ? 'flags' : 'NULL AS flags'}
             FROM changes
             WHERE product = ? AND package = ? AND version = ?
             ORDER BY ordinal`,
          )
          .all(release.product, release.pkg, release.dbVersion)
      : db
          .prepare(
            `SELECT ordinal, kind, text, ${hasFlagsCol ? 'flags' : 'NULL AS flags'}
             FROM changes
             WHERE product = ? AND version = ?
             ORDER BY ordinal`,
          )
          .all(release.product, release.dbVersion)
  ) as Array<{ ordinal: number; kind: string; text: string; flags?: string | null }>;

  return attachMultiPackageField(
    {
      product: release.product,
      version: release.version,
      released_at: release.released_at,
      source_url: release.source_url,
      notes_path: release.notes_path,
      changes: changeRows.map((c) => {
        const screened = resolveRowScreening(c.text, c.flags, hasFlagsCol);
        return { ordinal: c.ordinal, kind: c.kind, text: screened.text, flags: screened.flags };
      }),
    },
    release.pkg,
    cfg,
  );
}

export function listProducts(
  db: Database.Database
): Array<{ name: string; display_name: string; release_count: number; latest_version: string | null; latest_date: string | null }> {
  const sql = `
    SELECT p.name, p.display_name,
           COUNT(r.version) AS release_count,
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
           (SELECT COUNT(*)
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
    // Manual-strategy products have no automated fetcher (sync_now can't
    // refresh them), so excluding them from the "what's stale" view keeps
    // the result focused on actionable items.
    return rows.filter(
      (r) =>
        r.fetch_strategy !== 'manual' &&
        (r.hours_since_fetch === null || r.hours_since_fetch > cutoff),
    );
  }
  return rows;
}

export function entityFrequency(
  db: Database.Database,
  type: string,
  limit = 30
): Array<{ value: string; count: number; first_seen: string | null }> {
  const joinCond = hasReleasesPackageColumn(db)
    ? 'c.product = r.product AND c.package = r.package AND c.version = r.version'
    : 'c.product = r.product AND c.version = r.version';
  const sql = `
    SELECT e.entity_value AS value,
           COUNT(*) AS count,
           MIN(r.released_at) AS first_seen
    FROM entities e
    JOIN changes c ON e.change_id = c.id
    JOIN releases r ON ${joinCond}
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
  package?: string;
  productsConfig?: ProductsConfig | null;
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
  const cfg = resolveCfg(opts.productsConfig);
  const hasPkgCol = hasReleasesPackageColumn(db);
  const resolvedPkg =
    opts.package !== undefined ? resolvePackageFilter(opts.product, opts.package, cfg) : undefined;
  const limit = opts.limit ?? 20;
  const filters: string[] = [];
  const params: Record<string, any> = { limit };

  if (opts.product) {
    filters.push('c.product = @product');
    params.product = opts.product;
  }
  if (resolvedPkg !== undefined && hasPkgCol) {
    filters.push('c.package = @package');
    params.package = resolvedPkg;
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
  const hasFlagsCol = hasChangesFlagsColumn(db);
  const flagsExpr = hasFlagsCol ? 'c.flags' : 'NULL';
  const pkgSelect = hasPkgCol ? 'c.package AS pkg, r.notes_path AS notes_path' : `'' AS pkg, r.notes_path AS notes_path`;
  const joinCond = hasPkgCol
    ? 'c.product = r.product AND c.package = r.package AND c.version = r.version'
    : 'c.product = r.product AND c.version = r.version';
  const limitSql = !hasPkgCol && resolvedPkg !== undefined ? '' : 'LIMIT @limit';

  const sql = `
    SELECT c.product, ${pkgSelect}, c.version, r.released_at,
           c.ordinal, c.kind, c.text AS body, ${flagsExpr} AS flags_json,
           '' AS snippet
    FROM changes c
    JOIN releases r ON ${joinCond}
    ${where}
    ORDER BY r.released_at DESC, c.product, c.ordinal ASC
    ${limitSql}
  `;

  const rows = db.prepare(sql).all(params) as Array<{
    product: string;
    pkg: string;
    notes_path: string;
    version: string;
    released_at: string | null;
    ordinal: number;
    kind: string;
    body: string;
    flags_json?: string | null;
    snippet: string;
  }>;
  const out: QueryResult[] = [];
  for (const r of rows) {
    const derived = hasPkgCol
      ? { pkg: r.pkg, version: r.version }
      : deriveReleaseIdentity(r.product, r.version, r.notes_path, cfg);
    if (resolvedPkg !== undefined && derived.pkg !== resolvedPkg) continue;
    const screened = resolveRowScreening(r.body, r.flags_json, hasFlagsCol);
    out.push(
      attachMultiPackageField(
        {
          product: r.product,
          version: derived.version,
          released_at: r.released_at,
          ordinal: r.ordinal,
          kind: r.kind,
          text: screened.text,
          snippet: r.snippet,
          flags: screened.flags,
        },
        derived.pkg,
        cfg,
      ),
    );
    if (out.length >= limit) break;
  }
  return out;
}

export function browseChangesByPackage(
  db: Database.Database,
  opts: BrowseOptions & { product: string },
): Array<{ package: string; results: QueryResult[] }> {
  const cfg = resolveCfg(opts.productsConfig);
  const pkgOrder = listProductPackageOrder(db, opts.product, cfg);
  const groups: Array<{ package: string; results: QueryResult[] }> = [];
  for (const pkg of pkgOrder) {
    const results = browseChanges(db, {
      ...opts,
      package: formatPackageName(pkg),
      productsConfig: cfg,
    });
    if (results.length > 0) {
      groups.push({ package: formatPackageName(pkg), results });
    }
  }
  return groups;
}

export interface ChangesSinceOptions {
  since: string;
  until?: string;
  product?: string;
  package?: string;
  productsConfig?: ProductsConfig | null;
  kind?: string;
  /** Total changes cap. Default 200. */
  limit?: number;
}

export interface ChangesSinceResult {
  product: string;
  package?: string;
  version: string;
  released_at: string;
  changes: Array<{ ordinal: number; kind: string; text: string; flags: string[] }>;
}

/**
 * Return changes within a date window grouped by product+package+release.
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
  const cfg = resolveCfg(opts.productsConfig);
  const hasPkgCol = hasReleasesPackageColumn(db);
  const resolvedPkg =
    opts.package !== undefined ? resolvePackageFilter(opts.product, opts.package, cfg) : undefined;
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
  if (resolvedPkg !== undefined && hasPkgCol) {
    filters.push('c.package = @package');
    params.package = resolvedPkg;
  }
  if (opts.kind) {
    filters.push('c.kind = @kind');
    params.kind = opts.kind;
  }
  const where = `WHERE ${filters.join(' AND ')}`;
  const hasFlagsCol = hasChangesFlagsColumn(db);
  const flagsExpr = hasFlagsCol ? 'c.flags' : 'NULL';
  const pkgSelect = hasPkgCol ? 'c.package AS pkg, r.notes_path AS notes_path' : `'' AS pkg, r.notes_path AS notes_path`;
  const joinCond = hasPkgCol
    ? 'c.product = r.product AND c.package = r.package AND c.version = r.version'
    : 'c.product = r.product AND c.version = r.version';
  const orderBy = hasPkgCol
    ? 'ORDER BY r.released_at DESC, c.product, c.package, c.version, c.ordinal ASC'
    : 'ORDER BY r.released_at DESC, c.product, c.version, c.ordinal ASC';

  // Pull rows; group in JS so we can honor the change-count cap across releases.
  const sql = `
    SELECT c.product, ${pkgSelect}, c.version, r.released_at, c.ordinal, c.kind, c.text, ${flagsExpr} AS flags_json
    FROM changes c
    JOIN releases r ON ${joinCond}
    ${where}
    ${orderBy}
  `;
  const rows = db.prepare(sql).all(params) as Array<{
    product: string;
    pkg: string;
    notes_path: string;
    version: string;
    released_at: string;
    ordinal: number;
    kind: string;
    text: string;
    flags_json?: string | null;
  }>;

  const grouped = new Map<string, ChangesSinceResult>();
  let total = 0;
  for (const r of rows) {
    if (total >= limit) break;
    const derived = hasPkgCol
      ? { pkg: r.pkg, version: r.version }
      : deriveReleaseIdentity(r.product, r.version, r.notes_path, cfg);
    if (resolvedPkg !== undefined && derived.pkg !== resolvedPkg) continue;
    const key = `${r.product}\0${derived.pkg}\0${derived.version}`;
    let bucket = grouped.get(key);
    if (!bucket) {
      bucket = attachMultiPackageField(
        {
          product: r.product,
          version: derived.version,
          released_at: r.released_at,
          changes: [],
        },
        derived.pkg,
        cfg,
      );
      grouped.set(key, bucket);
    }
    const screened = resolveRowScreening(r.text, r.flags_json, hasFlagsCol);
    bucket.changes.push({
      ordinal: r.ordinal,
      kind: r.kind,
      text: screened.text,
      flags: screened.flags,
    });
    total++;
  }

  return Array.from(grouped.values());
}

export function getChangesSinceByPackage(
  db: Database.Database,
  opts: ChangesSinceOptions & { product: string },
): Array<{ package: string; releases: ChangesSinceResult[] }> {
  const cfg = resolveCfg(opts.productsConfig);
  const pkgOrder = listProductPackageOrder(db, opts.product, cfg);
  const groups: Array<{ package: string; releases: ChangesSinceResult[] }> = [];
  for (const pkg of pkgOrder) {
    const releases = getChangesSince(db, {
      ...opts,
      package: formatPackageName(pkg),
      productsConfig: cfg,
    });
    if (releases.length > 0) {
      groups.push({ package: formatPackageName(pkg), releases });
    }
  }
  return groups;
}

export interface CompareVersionsOptions {
  product: string;
  package?: string;
  productsConfig?: ProductsConfig | null;
  /** Exclusive lower bound — changes in this version are NOT included. */
  fromVersion: string;
  /** Inclusive upper bound — changes in this version ARE included. */
  toVersion: string;
}

/**
 * Compare two versions of the same product (and package for multi-package products):
 * return every change in releases strictly after `fromVersion` (by released_at)
 * up to and including `toVersion`.
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

  const cfg = resolveCfg(opts.productsConfig);
  const resolvedPkg = requirePackageIfMultiPackage(db, opts.product, opts.package, cfg);
  const hasPkgCol = hasReleasesPackageColumn(db);
  const hasFlagsCol = hasChangesFlagsColumn(db);
  const flagsExpr = hasFlagsCol ? 'c.flags' : 'NULL';

  if (hasPkgCol) {
    const pkgFilter = resolvedPkg !== undefined ? 'AND package = ?' : '';
    const endpoint = db.prepare(`
      SELECT package, version, released_at FROM releases
      WHERE product = ? AND version = ? ${pkgFilter}
    `);
    const findEndpoint = (v: string) => {
      const exact = (
        resolvedPkg !== undefined
          ? endpoint.get(opts.product, v, resolvedPkg)
          : endpoint.get(opts.product, v)
      ) as { package: string; version: string; released_at: string | null } | undefined;
      if (exact) return exact;
      const bare = v.replace(/^v(?=\d)/i, '');
      if (bare !== v) {
        const bareRow = (
          resolvedPkg !== undefined
            ? endpoint.get(opts.product, bare, resolvedPkg)
            : endpoint.get(opts.product, bare)
        ) as { package: string; version: string; released_at: string | null } | undefined;
        if (bareRow) return bareRow;
      } else {
        const vPrefixed = `v${bare}`;
        return (
          resolvedPkg !== undefined
            ? endpoint.get(opts.product, vPrefixed, resolvedPkg)
            : endpoint.get(opts.product, vPrefixed)
        ) as { package: string; version: string; released_at: string | null } | undefined;
      }
      return undefined;
    };

    const fromRow = findEndpoint(opts.fromVersion);
    const toRow = findEndpoint(opts.toVersion);
    if (!fromRow || !toRow) {
      return [];
    }
    if (!fromRow.released_at || !toRow.released_at) {
      throw new AppError({
        code: 'QUERY_VERSION_NO_DATE',
        message: `cannot compare versions without released_at on both endpoints (${opts.product}@${opts.fromVersion} or ${opts.toVersion} is missing a date)`,
        hint: 're-ingest the affected product so released_at is populated',
      });
    }

    const effectivePkg = resolvedPkg !== undefined ? resolvedPkg : fromRow.package;
    const pkgClause = resolvedPkg !== undefined || effectivePkg === toRow.package ? 'AND c.package = @package' : '';
    const sql = `
      SELECT c.product, c.package AS pkg, c.version, r.released_at, c.ordinal, c.kind, c.text, ${flagsExpr} AS flags_json
      FROM changes c
      JOIN releases r ON c.product = r.product AND c.package = r.package AND c.version = r.version
      WHERE c.product = @product
        ${pkgClause}
        AND r.released_at > @fromDate
        AND r.released_at <= @toDate
      ORDER BY r.released_at DESC, c.version, c.ordinal ASC
    `;
    const rows = db.prepare(sql).all({
      product: opts.product,
      ...(pkgClause ? { package: effectivePkg } : {}),
      fromDate: fromRow.released_at,
      toDate: toRow.released_at,
    }) as Array<{
      product: string;
      pkg: string;
      version: string;
      released_at: string;
      ordinal: number;
      kind: string;
      text: string;
      flags_json?: string | null;
    }>;

    const grouped = new Map<string, ChangesSinceResult>();
    for (const r of rows) {
      const key = `${r.product}\0${r.pkg}\0${r.version}`;
      let bucket = grouped.get(key);
      if (!bucket) {
        bucket = attachMultiPackageField(
          {
            product: r.product,
            version: r.version,
            released_at: r.released_at,
            changes: [],
          },
          r.pkg,
          cfg,
        );
        grouped.set(key, bucket);
      }
      const screened = resolveRowScreening(r.text, r.flags_json, hasFlagsCol);
      bucket.changes.push({
        ordinal: r.ordinal,
        kind: r.kind,
        text: screened.text,
        flags: screened.flags,
      });
    }
    return Array.from(grouped.values());
  }

  // Unmigrated pre-v5 read-only fallback: derive package + normalized version from notes_path
  const allReleases = db
    .prepare(`SELECT version, released_at, notes_path FROM releases WHERE product = ?`)
    .all(opts.product) as Array<{ version: string; released_at: string | null; notes_path: string }>;
  const scoped = allReleases.map((r) => {
    const derived = deriveReleaseIdentity(opts.product, r.version, r.notes_path, cfg);
    return { dbVersion: r.version, pkg: derived.pkg, version: derived.version, released_at: r.released_at };
  });
  const candidates = resolvedPkg !== undefined ? scoped.filter((r) => r.pkg === resolvedPkg) : scoped;
  const matchEndpoint = (v: string) => {
    const bare = v.replace(/^v(?=\d)/i, '');
    return candidates.find((r) => r.version === v || r.dbVersion === v || r.version === bare);
  };
  const fromRow = matchEndpoint(opts.fromVersion);
  const toRow = matchEndpoint(opts.toVersion);
  if (!fromRow || !toRow) return [];
  if (!fromRow.released_at || !toRow.released_at) {
    throw new AppError({
      code: 'QUERY_VERSION_NO_DATE',
      message: `cannot compare versions without released_at on both endpoints (${opts.product}@${opts.fromVersion} or ${opts.toVersion} is missing a date)`,
      hint: 're-ingest the affected product so released_at is populated',
    });
  }
  const effectivePkg = resolvedPkg !== undefined ? resolvedPkg : fromRow.pkg;
  const inRangeDbVersions = new Set(
    candidates
      .filter(
        (r) =>
          (resolvedPkg !== undefined || r.pkg === effectivePkg) &&
          r.released_at !== null &&
          r.released_at > fromRow.released_at! &&
          r.released_at <= toRow.released_at!,
      )
      .map((r) => r.dbVersion),
  );
  if (inRangeDbVersions.size === 0) return [];
  const rows = db
    .prepare(
      `SELECT c.product, c.version, r.released_at, r.notes_path, c.ordinal, c.kind, c.text, ${flagsExpr} AS flags_json
       FROM changes c
       JOIN releases r ON c.product = r.product AND c.version = r.version
       WHERE c.product = ?
         AND r.released_at > ?
         AND r.released_at <= ?
       ORDER BY r.released_at DESC, c.version, c.ordinal ASC`,
    )
    .all(opts.product, fromRow.released_at, toRow.released_at) as Array<{
    product: string;
    version: string;
    released_at: string;
    notes_path: string;
    ordinal: number;
    kind: string;
    text: string;
    flags_json?: string | null;
  }>;

  const grouped = new Map<string, ChangesSinceResult>();
  for (const r of rows) {
    if (!inRangeDbVersions.has(r.version)) continue;
    const derived = deriveReleaseIdentity(r.product, r.version, r.notes_path, cfg);
    const key = `${r.product}\0${derived.pkg}\0${derived.version}`;
    let bucket = grouped.get(key);
    if (!bucket) {
      bucket = attachMultiPackageField(
        {
          product: r.product,
          version: derived.version,
          released_at: r.released_at,
          changes: [],
        },
        derived.pkg,
        cfg,
      );
      grouped.set(key, bucket);
    }
    const screened = resolveRowScreening(r.text, r.flags_json, hasFlagsCol);
    bucket.changes.push({
      ordinal: r.ordinal,
      kind: r.kind,
      text: screened.text,
      flags: screened.flags,
    });
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
