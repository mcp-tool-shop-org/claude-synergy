// Deterministic, read-only workspace relevance evaluation against the local mirror.
// Zero database writes, zero model calls, and version ordering delegated to
// `compareVersions` in src/query.ts.

import type Database from 'better-sqlite3';
import {
  compareVersions,
  formatFlagMarker,
  type ChangesSinceResult,
} from './query.js';
import {
  loadProductsConfig,
  type PackageEcosystem,
  type ProductMeta,
  type ProductsConfig,
} from './products-config.js';
import {
  normalizePackageName,
  type WorkspaceFileRead,
  type WorkspaceFileSkipped,
  type WorkspacePackageEntry,
  type WorkspaceScanResult,
} from './workspace.js';

export type RelevanceStatus = 'action_needed' | 'up_to_date' | 'unknown';

export interface RelevanceChangeItem {
  ordinal: number;
  kind: string;
  text: string;
  flags: string[];
}

export interface RelevanceBreakingChange extends RelevanceChangeItem {
  version: string;
  released_at: string;
}

export interface ProductRelevanceRelease {
  version: string;
  released_at: string;
  kind_counts: Record<string, number>;
  breaking_changes: RelevanceChangeItem[];
  changes: RelevanceChangeItem[];
}

export interface ProductRelevanceResult {
  status: RelevanceStatus;
  product: string;
  display_name: string;
  summary: string;
  installed: {
    ecosystem: PackageEcosystem;
    name: string;
    version: string;
    source_file: WorkspacePackageEntry['source_file'];
    mirror_version: string | null;
  };
  latest_version: string | null;
  latest_released_at: string | null;
  releases_behind: number;
  breaking_changes: RelevanceBreakingChange[];
  releases: ProductRelevanceRelease[];
}

export interface WorkspaceRelevanceReport {
  workspace_path: string;
  action_needed_count: number;
  up_to_date_count: number;
  unknown_count: number;
  not_used_count: number;
  products: ProductRelevanceResult[];
  not_used_products?: string[];
  files_read: WorkspaceFileRead[];
  files_skipped: WorkspaceFileSkipped[];
}

export interface EvaluateRelevanceOptions {
  includeAll?: boolean;
  productsConfig?: ProductsConfig | null;
  yamlPath?: string;
}

function hasTable(db: Database.Database | null, tableName: string): boolean {
  if (!db) return false;
  try {
    return (
      db
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`)
        .get(tableName) !== undefined
    );
  } catch {
    return false;
  }
}

function loadProductCatalog(
  db: Database.Database | null,
  opts: EvaluateRelevanceOptions
): ProductMeta[] {
  const cfg =
    opts.productsConfig !== undefined
      ? opts.productsConfig
      : loadProductsConfig(opts.yamlPath);
  if (cfg) {
    return Object.values(cfg.productMeta);
  }
  if (hasTable(db, 'products')) {
    return db!
      .prepare(
        `SELECT name, display_name, source_tier, source_url, fetch_strategy, notes FROM products ORDER BY name`
      )
      .all() as ProductMeta[];
  }
  return [];
}

function candidateMirrorVersions(pkgName: string, installedVersion: string): string[] {
  const trimmed = installedVersion.trim();
  const bare = trimmed.replace(/^v/, '');
  const shortName = pkgName.includes('/') ? pkgName.split('/').pop()! : pkgName;
  const raw = [
    trimmed,
    bare,
    `v${bare}`,
    `${pkgName}@${bare}`,
    `${pkgName}@v${bare}`,
    `${shortName}-v${bare}`,
    `${shortName}-${bare}`,
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of raw) {
    if (c && !seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

interface MirrorReleaseRow {
  version: string;
  released_at: string | null;
}

function findMirrorRelease(
  db: Database.Database,
  product: string,
  pkgName: string,
  installedVersion: string
): MirrorReleaseRow | null {
  const stmt = db.prepare(
    `SELECT version, released_at FROM releases WHERE product = ? AND version = ?`
  );
  for (const candidate of candidateMirrorVersions(pkgName, installedVersion)) {
    const row = stmt.get(product, candidate) as MirrorReleaseRow | undefined;
    if (row) return row;
  }
  return null;
}

function findNewestMirrorRelease(
  db: Database.Database,
  product: string
): MirrorReleaseRow | null {
  const row = db
    .prepare(
      `SELECT version, released_at FROM releases
       WHERE product = ? AND released_at IS NOT NULL
       ORDER BY released_at DESC, version DESC
       LIMIT 1`
    )
    .get(product) as MirrorReleaseRow | undefined;
  return row ?? null;
}

function mergeEmptyReleases(
  db: Database.Database,
  product: string,
  fromDate: string,
  toDate: string,
  diffWithChanges: ChangesSinceResult[]
): ChangesSinceResult[] {
  const byVersion = new Map<string, ChangesSinceResult>();
  for (const r of diffWithChanges) {
    byVersion.set(r.version, r);
  }
  const allReleases = db
    .prepare(
      `SELECT product, version, released_at
       FROM releases
       WHERE product = ? AND released_at > ? AND released_at <= ?
       ORDER BY released_at DESC, version ASC`
    )
    .all(product, fromDate, toDate) as Array<{
    product: string;
    version: string;
    released_at: string;
  }>;

  if (allReleases.length <= byVersion.size) {
    return diffWithChanges;
  }

  return allReleases.map(
    (rel) =>
      byVersion.get(rel.version) ?? {
        product: rel.product,
        version: rel.version,
        released_at: rel.released_at,
        changes: [],
      }
  );
}

function buildKindCounts(changes: RelevanceChangeItem[]): Record<string, number> {
  const counts = new Map<string, number>();
  for (const c of changes) {
    counts.set(c.kind, (counts.get(c.kind) ?? 0) + 1);
  }
  const out: Record<string, number> = {};
  const breakingCount = counts.get('breaking');
  if (breakingCount !== undefined) {
    out.breaking = breakingCount;
    counts.delete('breaking');
  }
  for (const key of [...counts.keys()].sort()) {
    out[key] = counts.get(key)!;
  }
  return out;
}

function evaluateMatchedEntry(
  db: Database.Database | null,
  hasReleasesTable: boolean,
  meta: ProductMeta,
  entry: WorkspacePackageEntry
): ProductRelevanceResult {
  const baseInstalled = {
    ecosystem: entry.ecosystem,
    name: entry.name,
    version: entry.version,
    source_file: entry.source_file,
    mirror_version: null as string | null,
  };

  if (!db || !hasReleasesTable) {
    return {
      status: 'unknown',
      product: meta.name,
      display_name: meta.display_name,
      summary: `unknown: installed ${entry.version} is not in the mirror`,
      installed: baseInstalled,
      latest_version: null,
      latest_released_at: null,
      releases_behind: 0,
      breaking_changes: [],
      releases: [],
    };
  }

  const matchedRow = findMirrorRelease(db, meta.name, entry.name, entry.version);
  const newestRow = findNewestMirrorRelease(db, meta.name);

  if (
    !matchedRow ||
    !matchedRow.released_at ||
    !newestRow ||
    !newestRow.released_at
  ) {
    return {
      status: 'unknown',
      product: meta.name,
      display_name: meta.display_name,
      summary: `unknown: installed ${entry.version} is not in the mirror`,
      installed: {
        ...baseInstalled,
        mirror_version: matchedRow?.version ?? null,
      },
      latest_version: newestRow?.version ?? null,
      latest_released_at: newestRow?.released_at ?? null,
      releases_behind: 0,
      breaking_changes: [],
      releases: [],
    };
  }

  // Delegate version ordering to `compareVersions` from src/query.ts.
  const diffFromCompare = compareVersions(db, {
    product: meta.name,
    fromVersion: matchedRow.version,
    toVersion: newestRow.version,
  });
  const releasesAfter = mergeEmptyReleases(
    db,
    meta.name,
    matchedRow.released_at,
    newestRow.released_at,
    diffFromCompare
  );

  if (releasesAfter.length === 0) {
    return {
      status: 'up_to_date',
      product: meta.name,
      display_name: meta.display_name,
      summary: 'no action: up to date',
      installed: {
        ...baseInstalled,
        mirror_version: matchedRow.version,
      },
      latest_version: newestRow.version,
      latest_released_at: newestRow.released_at,
      releases_behind: 0,
      breaking_changes: [],
      releases: [],
    };
  }

  const breakingChanges: RelevanceBreakingChange[] = [];
  const releases: ProductRelevanceRelease[] = releasesAfter.map((rel) => {
    const breaking: RelevanceChangeItem[] = [];
    const nonBreaking: RelevanceChangeItem[] = [];
    for (const ch of rel.changes) {
      const item: RelevanceChangeItem = {
        ordinal: ch.ordinal,
        kind: ch.kind,
        text: ch.text,
        flags: ch.flags,
      };
      if (ch.kind === 'breaking') {
        breaking.push(item);
        breakingChanges.push({
          ...item,
          version: rel.version,
          released_at: rel.released_at,
        });
      } else {
        nonBreaking.push(item);
      }
    }
    return {
      version: rel.version,
      released_at: rel.released_at,
      kind_counts: buildKindCounts(rel.changes),
      breaking_changes: breaking,
      changes: [...breaking, ...nonBreaking],
    };
  });

  return {
    status: 'action_needed',
    product: meta.name,
    display_name: meta.display_name,
    summary: `${releases.length} release${releases.length === 1 ? '' : 's'} behind (installed ${entry.version}, newest ${newestRow.version})`,
    installed: {
      ...baseInstalled,
      mirror_version: matchedRow.version,
    },
    latest_version: newestRow.version,
    latest_released_at: newestRow.released_at,
    releases_behind: releases.length,
    breaking_changes: breakingChanges,
    releases,
  };
}

const STATUS_PRIORITY: Record<RelevanceStatus, number> = {
  action_needed: 0,
  unknown: 1,
  up_to_date: 2,
};

function pickPreferredResult(results: ProductRelevanceResult[]): ProductRelevanceResult {
  return [...results].sort((a, b) => {
    const pDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (pDiff !== 0) return pDiff;
    return b.releases_behind - a.releases_behind;
  })[0];
}

/**
 * Evaluate which mirrored products matter to the scanned workspace and what
 * changed since the workspace's installed versions. Read-only and deterministic.
 */
export function evaluateWorkspaceRelevance(
  db: Database.Database | null,
  workspace: WorkspaceScanResult,
  opts: EvaluateRelevanceOptions = {}
): WorkspaceRelevanceReport {
  const catalog = loadProductCatalog(db, opts);
  const hasReleasesTable = hasTable(db, 'releases');

  const entriesByPackageKey = new Map<string, WorkspacePackageEntry[]>();
  for (const entry of workspace.entries) {
    const key = `${entry.ecosystem}:${normalizePackageName(entry.ecosystem, entry.name)}`;
    const list = entriesByPackageKey.get(key) ?? [];
    list.push(entry);
    entriesByPackageKey.set(key, list);
  }

  const matchedProducts: ProductRelevanceResult[] = [];
  const unusedNames: string[] = [];

  for (const meta of catalog) {
    const packages = meta.packages ?? [];
    const matchedEntries: WorkspacePackageEntry[] = [];
    for (const pkg of packages) {
      const key = `${pkg.ecosystem}:${normalizePackageName(pkg.ecosystem, pkg.name)}`;
      const hits = entriesByPackageKey.get(key);
      if (hits) {
        matchedEntries.push(...hits);
      }
    }

    if (matchedEntries.length === 0) {
      unusedNames.push(meta.name);
      continue;
    }

    const candidates = matchedEntries.map((entry) =>
      evaluateMatchedEntry(db, hasReleasesTable, meta, entry)
    );
    matchedProducts.push(pickPreferredResult(candidates));
  }

  matchedProducts.sort((a, b) => {
    const pDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (pDiff !== 0) return pDiff;
    return a.product.localeCompare(b.product);
  });

  const actionNeededCount = matchedProducts.filter((p) => p.status === 'action_needed').length;
  const upToDateCount = matchedProducts.filter((p) => p.status === 'up_to_date').length;
  const unknownCount = matchedProducts.filter((p) => p.status === 'unknown').length;

  return {
    workspace_path: workspace.workspace_path,
    action_needed_count: actionNeededCount,
    up_to_date_count: upToDateCount,
    unknown_count: unknownCount,
    not_used_count: unusedNames.length,
    products: matchedProducts,
    ...(opts.includeAll ? { not_used_products: unusedNames } : {}),
    files_read: workspace.files_read,
    files_skipped: workspace.files_skipped,
  };
}

function formatKindCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts);
  if (entries.length === 0) return '0 changes';
  return entries.map(([k, n]) => `${k}: ${n}`).join(', ');
}

/**
 * Format a WorkspaceRelevanceReport for CLI or MCP text output.
 * Leads with the count of products needing action, lists breaking changes
 * first for outdated products, and reports lockfiles read/skipped.
 */
export function formatRelevanceReport(report: WorkspaceRelevanceReport): string {
  const lines: string[] = [];
  lines.push(
    `${report.action_needed_count} product${report.action_needed_count === 1 ? '' : 's'} needing action`
  );

  for (const p of report.products) {
    if (p.status === 'action_needed') {
      lines.push('');
      lines.push(
        `${p.product} (${p.installed.ecosystem} ${p.installed.name}@${p.installed.version} -> ${p.latest_version}, ${p.releases_behind} release${p.releases_behind === 1 ? '' : 's'} behind):`
      );
      if (p.breaking_changes.length > 0) {
        lines.push(`  breaking (${p.breaking_changes.length}):`);
        for (const bc of p.breaking_changes) {
          const flagMarker = formatFlagMarker(bc.flags);
          const flagSuffix = flagMarker ? ` ${flagMarker}` : '';
          lines.push(
            `    - ${bc.released_at}  ${p.product}@${bc.version}  [breaking]${flagSuffix} ${bc.text}`
          );
        }
      }
      lines.push(`  releases (${p.releases.length}):`);
      for (const rel of p.releases) {
        lines.push(
          `    ${rel.released_at}  ${p.product}@${rel.version}  (${formatKindCounts(rel.kind_counts)})`
        );
      }
    } else if (p.status === 'unknown') {
      lines.push(
        `${p.product} (${p.installed.ecosystem} ${p.installed.name}@${p.installed.version}): ${p.summary}`
      );
    } else {
      lines.push(
        `${p.product} (${p.installed.ecosystem} ${p.installed.name}@${p.installed.version}): ${p.summary}`
      );
    }
  }

  lines.push('');
  lines.push(
    `no action: not used (${report.not_used_count} product${report.not_used_count === 1 ? '' : 's'})`
  );
  if (report.not_used_products && report.not_used_products.length > 0) {
    lines.push(`  not used: ${report.not_used_products.join(', ')}`);
  }

  const readSummary =
    report.files_read.length === 0
      ? 'none'
      : report.files_read
          .map((f) =>
            f.skipped_lines !== undefined
              ? `${f.file} (${f.entries_count} pinned, ${f.skipped_lines} unpinned skipped)`
              : `${f.file} (${f.entries_count})`
          )
          .join(', ');
  lines.push(`files read: ${readSummary}`);

  if (report.files_skipped.length > 0) {
    const skippedSummary = report.files_skipped
      .map((s) => `${s.file} [${s.code}]: ${s.reason}`)
      .join('; ');
    lines.push(`files skipped: ${skippedSummary}`);
  }

  return lines.join('\n');
}
