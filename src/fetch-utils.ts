// Shared HTTP fetch utilities: timeout, retry with exponential backoff, global cancellation.
//
// All HTTP `fetch()` calls across the fetcher layer should use `fetchWithRetry()` instead
// of bare `fetch()`. This provides:
//   - Per-request timeout via AbortSignal.timeout() (default 30s)
//   - Retry on transient errors (429, 500, 502, 503, 504) with exponential backoff + jitter
//   - Respects Retry-After header when present
//   - Propagates an external AbortSignal for global cancellation (e.g., SIGINT or fetchAll timeout)

/** Options for fetchWithRetry */
export interface FetchRetryOptions extends Omit<RequestInit, 'signal'> {
  /** Per-request timeout in ms (default 30_000) */
  timeoutMs?: number;
  /** Maximum retry attempts for transient failures (default 3) */
  maxRetries?: number;
  /** Base delay in ms for exponential backoff (default 1000) */
  baseDelayMs?: number;
  /** External AbortSignal for cancellation (e.g., global timeout or SIGINT) */
  signal?: AbortSignal;
}

/** HTTP status codes eligible for retry */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const GITHUB_TOKEN_HINT =
  'GitHub API rate limit hit. Set GITHUB_TOKEN env var for 5000 req/hr (vs 60 unauthenticated).';

/**
 * Fetch with timeout + retry. Near-drop-in replacement for `fetch(url, init)` with resilience.
 *
 * - Attaches AbortSignal.timeout() to each attempt (default 30s).
 * - Retries on 429/5xx up to `maxRetries` times with exponential backoff + jitter.
 * - Respects the `Retry-After` header (seconds or HTTP-date).
 * - If an external `signal` is provided and aborted, bails immediately (no retry).
 * - Returns the Response for non-retryable statuses (e.g. 404, 301) so callers can
 *   check `.ok` / `.status` as they would with bare fetch().
 *
 * @returns The Response object (may be non-ok for non-retryable statuses like 404).
 * @throws On network errors, timeout exhaustion, abort, or retryable-status exhaustion.
 */
export async function fetchWithRetry(
  url: string | URL,
  opts: FetchRetryOptions = {}
): Promise<Response> {
  const {
    timeoutMs = 30_000,
    maxRetries = 3,
    baseDelayMs = 1_000,
    signal: externalSignal,
    ...fetchInit
  } = opts;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Bail immediately if the external signal is already aborted
    if (externalSignal?.aborted) {
      throw new Error(`fetch aborted: ${(externalSignal.reason as any)?.message ?? 'signal aborted'}`);
    }

    // Combine per-request timeout with external signal
    const timeoutSignal = AbortSignal.timeout(timeoutMs);
    const combinedSignal = externalSignal
      ? AbortSignal.any([timeoutSignal, externalSignal])
      : timeoutSignal;

    try {
      const res = await fetch(url, {
        ...fetchInit,
        signal: combinedSignal,
      });

      // Success — return immediately
      if (res.ok) return res;

      // Non-retryable HTTP status (e.g. 404, 403, 301) — return as-is so caller
      // can inspect .status / .ok. Only 429 + 5xx merit retry.
      // Enrich GitHub API rate-limit errors (403) with GITHUB_TOKEN guidance.
      if (!RETRYABLE_STATUSES.has(res.status)) {
        if (res.status === 403 && isGitHubApiUrl(url)) {
          throw new Error(`HTTP 403 from ${url} — ${GITHUB_TOKEN_HINT}`);
        }
        return res;
      }

      // Retryable error — if we have attempts left, wait and retry
      if (attempt < maxRetries) {
        const delay = computeDelay(res, attempt, baseDelayMs);
        await sleep(delay, externalSignal);
        continue;
      }

      // Exhausted retries on retryable status — throw
      // Enrich GitHub API 429 with GITHUB_TOKEN guidance
      const ghHint = (res.status === 429 && isGitHubApiUrl(url)) ? ` ${GITHUB_TOKEN_HINT}` : '';
      throw new Error(`HTTP ${res.status} from ${url} after ${maxRetries + 1} attempts.${ghHint}`);
    } catch (e: any) {
      // If the external signal caused abort, don't retry
      if (externalSignal?.aborted) {
        throw new Error(`fetch aborted: ${(externalSignal.reason as any)?.message ?? 'signal aborted'}`);
      }

      // Timeout or network error on this attempt
      lastError = e;

      if (attempt < maxRetries) {
        const delay = computeDelay(null, attempt, baseDelayMs);
        try {
          await sleep(delay, externalSignal);
        } catch {
          // Sleep was interrupted by external abort
          throw e;
        }
        continue;
      }

      // Exhausted retries — rethrow the last error
      throw e;
    }
  }

  // Should not reach here, but TypeScript needs it
  throw lastError ?? new Error(`fetchWithRetry: unexpected exhaustion for ${url}`);
}

/**
 * Compute backoff delay, respecting Retry-After header if available.
 * Uses exponential backoff with jitter: base * 2^attempt + random jitter.
 */
function computeDelay(res: Response | null, attempt: number, baseDelayMs: number): number {
  // Check Retry-After header
  if (res) {
    const retryAfter = res.headers.get('retry-after');
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (!Number.isNaN(seconds) && seconds > 0) {
        // Cap at 60s to prevent absurd waits
        return Math.min(seconds * 1000, 60_000);
      }
      // Try HTTP-date format
      const date = new Date(retryAfter);
      if (!Number.isNaN(date.getTime())) {
        const delayMs = date.getTime() - Date.now();
        if (delayMs > 0) return Math.min(delayMs, 60_000);
      }
    }
  }

  // Exponential backoff with jitter
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * baseDelayMs * 0.5;
  return Math.min(exponential + jitter, 30_000); // cap at 30s
}

/**
 * Sleep for a duration, but bail early if signal is aborted.
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) return Promise.reject(new Error('sleep interrupted: signal already aborted'));
  if (!signal) return new Promise<void>((resolve) => setTimeout(resolve, ms));

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const onAbort = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error('sleep interrupted: signal aborted'));
    };
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

// ─── GitHub rate-limit detection ───────────────────────────────────────────

/** Check whether a URL targets the GitHub API (api.github.com or raw.githubusercontent.com). */
function isGitHubApiUrl(url: string | URL): boolean {
  try {
    const hostname = typeof url === 'string' ? new URL(url).hostname : url.hostname;
    return hostname === 'api.github.com' || hostname === 'raw.githubusercontent.com';
  } catch {
    // If URL parsing fails, fall back to string matching
    const s = String(url);
    return s.includes('api.github.com') || s.includes('raw.githubusercontent.com');
  }
}

// ─── Global fetchAll timeout helper ────────────────────────────────────────

/** Default global timeout for the entire fetchAll run: 5 minutes */
export const DEFAULT_FETCH_ALL_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * Create an AbortController for a global fetchAll run.
 * Returns the controller + signal. The caller should pass the signal to each
 * fetchWithRetry call so individual fetches abort if the parent is cancelled.
 */
export function createFetchAllController(timeoutMs: number = DEFAULT_FETCH_ALL_TIMEOUT_MS): {
  controller: AbortController;
  signal: AbortSignal;
} {
  const controller = new AbortController();
  // Abort after the global timeout
  const timer = setTimeout(() => {
    controller.abort(new Error(`fetchAll global timeout exceeded (${timeoutMs}ms)`));
  }, timeoutMs);
  // Ensure the timer doesn't prevent process exit
  if (typeof timer === 'object' && 'unref' in timer) {
    (timer as NodeJS.Timeout).unref();
  }
  return { controller, signal: controller.signal };
}
