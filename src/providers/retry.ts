/**
 * Shared retry utility for paid HTTP providers (Voyage, Cohere).
 *
 * Exponential backoff with jitter on retryable HTTP status codes (429, 502, 503, 504).
 * Non-retryable errors (4xx other than 429) propagate immediately.
 */

/** HTTP status codes that indicate a transient failure worth retrying. */
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

export interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3. */
  maxAttempts?: number;
  /** Base delay in ms before exponential growth. Default: 1000. */
  baseDelayMs?: number;
  /** Maximum delay cap in ms. Default: 30000. */
  maxDelayMs?: number;
  /** AbortSignal for cancellation. */
  signal?: AbortSignal;
}

export interface RetryResult<T> {
  data: T;
  attempts: number;
}

/**
 * Execute an async function with retry on retryable failures.
 *
 * The `fn` receives the attempt number (1-based). If the function throws
 * an error whose `message` matches a retryable HTTP status pattern, the
 * utility will retry with exponential backoff + jitter.
 *
 * The function should throw an Error with the HTTP status code in the message
 * (e.g., "Voyage 429: rate limited") for status-based retry detection.
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  opts: RetryOptions = {}
): Promise<RetryResult<T>> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const baseDelayMs = opts.baseDelayMs ?? 1000;
  const maxDelayMs = opts.maxDelayMs ?? 30_000;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (opts.signal?.aborted) {
      throw new Error('Operation cancelled via AbortSignal');
    }

    try {
      const data = await fn(attempt);
      return { data, attempts: attempt };
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Don't retry if we've exhausted attempts
      if (attempt >= maxAttempts) break;

      // Only retry on retryable errors
      if (!isRetryable(lastError)) break;

      // Exponential backoff with full jitter
      const expDelay = baseDelayMs * Math.pow(2, attempt - 1);
      const cappedDelay = Math.min(expDelay, maxDelayMs);
      const jitteredDelay = Math.random() * cappedDelay;

      await sleep(jitteredDelay, opts.signal);
    }
  }

  throw lastError!;
}

/**
 * Determine if an error is retryable based on its message.
 * Matches patterns like "Voyage 429:", "Cohere rerank 503:", timeout errors.
 */
function isRetryable(err: Error): boolean {
  const msg = err.message;

  // Check for retryable HTTP status codes in error message
  for (const status of RETRYABLE_STATUSES) {
    if (msg.includes(String(status))) return true;
  }

  // Timeout/network errors are retryable
  if (err.name === 'TimeoutError' || err.name === 'AbortError') return true;
  if (msg.includes('timed out')) return true;
  if (msg.includes('ECONNRESET') || msg.includes('ECONNREFUSED')) return true;
  if (msg.includes('fetch failed') || msg.includes('network')) return true;

  return false;
}

/** Sleep with AbortSignal support. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Operation cancelled via AbortSignal'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Operation cancelled via AbortSignal'));
    }, { once: true });
  });
}

/**
 * Helper to extract token counts from provider response bodies.
 * Providers return usage in different shapes; this normalizes them.
 */
export interface ProviderUsage {
  tokens: number;
  requests: number;
}

/**
 * Common helper functions previously duplicated across provider files.
 */
export function providerTimeoutMs(): number {
  const raw = process.env.CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS;
  const n = raw === undefined ? NaN : parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 60_000;
}

export async function safeErrorBody(res: Response, max = 200): Promise<string> {
  try {
    const body = await res.text();
    const safe = body
      .split('\n')
      .filter((l) => !/x-api-key|authorization|bearer|api[-_]?key/i.test(l))
      .join('\n');
    return safe.slice(0, max);
  } catch {
    return '<unreadable>';
  }
}
