// Pure staleness check + CLI helper for the rolling daily sync PR.
// Called by .github/workflows/sync.yml before refreshing an open sync/daily PR.

import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const STALE_SYNC_COMMENT_MARKER = '<!-- claude-synergy:sync-stale -->';

const MS_PER_DAY = 86_400_000;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseUtcDateMs(raw, label) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error(`${label} must be a non-empty YYYY-MM-DD or ISO-8601 date string`);
  }
  const date = raw.trim().slice(0, 10);
  if (!ISO_DATE_RE.test(date)) {
    throw new Error(`${label} must start with YYYY-MM-DD (got ${JSON.stringify(raw)})`);
  }
  const [y, m, d] = date.split('-').map(Number);
  const utcMs = Date.UTC(y, m - 1, d);
  const check = new Date(utcMs);
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== m - 1 ||
    check.getUTCDate() !== d
  ) {
    throw new Error(`${label} is not a valid calendar date (${date})`);
  }
  return { date, utcMs };
}

/**
 * Determine whether an open rolling sync PR is stale.
 * A PR is stale strictly when `ageDays > maxDays` (more than `STALE_SYNC_PR_DAYS` days old).
 *
 * @param {{ createdAt: string, today: string, maxDays?: number }} input
 */
export function evaluateSyncPrStaleness(input) {
  const maxDays = input.maxDays ?? 3;
  if (!Number.isInteger(maxDays) || maxDays < 0) {
    throw new Error(`maxDays must be a non-negative integer (got ${String(maxDays)})`);
  }
  const created = parseUtcDateMs(input.createdAt, 'createdAt');
  const today = parseUtcDateMs(input.today, 'today');
  const ageDays = Math.floor((today.utcMs - created.utcMs) / MS_PER_DAY);
  const stale = ageDays > maxDays;
  const title = stale
    ? `Daily sync (open since ${created.date}, refreshed ${today.date})`
    : `Daily sync ${today.date}`;

  return {
    stale,
    ageDays,
    maxDays,
    createdDate: created.date,
    todayDate: today.date,
    title,
  };
}

function parseCliArgs(argv) {
  let createdAt = '';
  let today = new Date().toISOString().slice(0, 10);
  let maxDaysRaw = process.env.STALE_SYNC_PR_DAYS ?? '3';

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--created-at' && i + 1 < argv.length) {
      createdAt = argv[++i];
    } else if (arg === '--today' && i + 1 < argv.length) {
      today = argv[++i];
    } else if (arg === '--max-days' && i + 1 < argv.length) {
      maxDaysRaw = argv[++i];
    } else {
      throw new Error(`unknown or incomplete argument: ${arg}`);
    }
  }

  const maxDays = Number(maxDaysRaw);
  return { createdAt, today, maxDays };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const args = parseCliArgs(process.argv.slice(2));
    const result = evaluateSyncPrStaleness(args);
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`check-stale-sync-pr error: ${message}\n`);
    process.exitCode = 2;
  }
}
