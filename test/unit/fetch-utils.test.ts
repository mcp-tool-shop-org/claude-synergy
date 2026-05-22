// Unit tests for src/fetch-utils.ts — HTTP retry logic, backoff, Retry-After
// header parsing, AbortSignal propagation, GitHub rate-limit enrichment.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry, createFetchAllController, DEFAULT_FETCH_ALL_TIMEOUT_MS } from '../../src/fetch-utils.js';

// Suppress console.error from retry logging during tests
beforeEach(() => { vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { vi.restoreAllMocks(); });

// ─── Helpers ──────────────────────────────────────────────────────────────────

function okResponse(body: string = 'ok', init?: ResponseInit): Response {
  return new Response(body, { status: 200, ...init });
}

function errorResponse(status: number, body: string = '', headers?: Record<string, string>): Response {
  return new Response(body, { status, headers: headers ?? {} });
}

// ─── Success paths ────────────────────────────────────────────────────────────

describe('fetchWithRetry — success on first attempt', () => {
  it('returns the response immediately on 200', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(okResponse('hello'));
    const res = await fetchWithRetry('https://example.com', { maxRetries: 3, baseDelayMs: 1 });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('hello');
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

// ─── Retry on 429 ─────────────────────────────────────────────────────────────

describe('fetchWithRetry — 429 retry with Retry-After', () => {
  it('retries on 429 then succeeds', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(errorResponse(429, 'rate limited'))
      .mockResolvedValueOnce(okResponse('recovered'));

    const res = await fetchWithRetry('https://example.com/api', {
      maxRetries: 2,
      baseDelayMs: 1,
    });
    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('respects Retry-After header (seconds format)', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(errorResponse(429, 'rate limited', { 'retry-after': '2' }))
      .mockResolvedValueOnce(okResponse('ok'));

    const t0 = Date.now();
    const res = await fetchWithRetry('https://example.com', {
      maxRetries: 2,
      baseDelayMs: 1,
    });
    const elapsed = Date.now() - t0;
    expect(res.status).toBe(200);
    // Retry-After: 2 means ~2000ms delay. Allow tolerance.
    expect(elapsed).toBeGreaterThanOrEqual(1500);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('respects Retry-After header (HTTP-date format)', async () => {
    // Set Retry-After to ~1 second from now
    const futureDate = new Date(Date.now() + 1000).toUTCString();
    const spy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(errorResponse(429, 'rate limited', { 'retry-after': futureDate }))
      .mockResolvedValueOnce(okResponse('ok'));

    const res = await fetchWithRetry('https://example.com', {
      maxRetries: 2,
      baseDelayMs: 1,
    });
    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

// ─── Retry on 5xx ─────────────────────────────────────────────────────────────

describe('fetchWithRetry — 5xx retries', () => {
  for (const status of [500, 502, 503, 504]) {
    it(`retries on ${status} and succeeds on attempt 2`, async () => {
      const spy = vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(errorResponse(status, 'server error'))
        .mockResolvedValueOnce(okResponse('recovered'));

      const res = await fetchWithRetry('https://example.com', {
        maxRetries: 2,
        baseDelayMs: 1,
      });
      expect(res.status).toBe(200);
      expect(spy).toHaveBeenCalledTimes(2);
    });
  }
});

// ─── Max retries exhausted ────────────────────────────────────────────────────

describe('fetchWithRetry — max retries exhausted', () => {
  it('throws after maxRetries+1 attempts on persistent 500', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValue(errorResponse(500, 'server error'));

    await expect(
      fetchWithRetry('https://example.com/api', { maxRetries: 2, baseDelayMs: 1 })
    ).rejects.toThrow(/HTTP 500.*after 3 attempts/);

    expect(spy).toHaveBeenCalledTimes(3);
  });

  it('throws after maxRetries+1 attempts on persistent network error', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('fetch failed: ECONNRESET'));

    await expect(
      fetchWithRetry('https://example.com', { maxRetries: 1, baseDelayMs: 1 })
    ).rejects.toThrow(/ECONNRESET/);

    expect(spy).toHaveBeenCalledTimes(2);
  });
});

// ─── Non-retryable statuses ───────────────────────────────────────────────────

describe('fetchWithRetry — non-retryable statuses returned as-is', () => {
  for (const status of [301, 400, 401, 404]) {
    it(`returns ${status} response without retry`, async () => {
      const spy = vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(errorResponse(status, `error ${status}`));

      const res = await fetchWithRetry('https://example.com', {
        maxRetries: 3,
        baseDelayMs: 1,
      });
      expect(res.status).toBe(status);
      // Only 1 attempt — no retry
      expect(spy).toHaveBeenCalledTimes(1);
    });
  }
});

// ─── GitHub rate-limit enrichment ─────────────────────────────────────────────

describe('fetchWithRetry — GitHub rate-limit enrichment', () => {
  it('throws enriched error with GITHUB_TOKEN hint on GitHub 403', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(errorResponse(403, 'rate limit exceeded'));

    await expect(
      fetchWithRetry('https://api.github.com/repos/test/releases', {
        maxRetries: 0,
        baseDelayMs: 1,
      })
    ).rejects.toThrow(/GITHUB_TOKEN/);
  });

  it('enriches GitHub 429 after retries exhausted', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValue(errorResponse(429, 'rate limited'));

    await expect(
      fetchWithRetry('https://api.github.com/repos/test/releases', {
        maxRetries: 1,
        baseDelayMs: 1,
      })
    ).rejects.toThrow(/GITHUB_TOKEN/);
  });

  it('returns 403 as-is for non-GitHub URLs', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(errorResponse(403, 'forbidden'));

    const res = await fetchWithRetry('https://example.com/api', {
      maxRetries: 0,
      baseDelayMs: 1,
    });
    // Non-GitHub 403 is returned as response (not thrown)
    expect(res.status).toBe(403);
  });
});

// ─── AbortSignal cancellation ─────────────────────────────────────────────────

describe('fetchWithRetry — AbortSignal cancellation', () => {
  it('throws immediately when signal is already aborted', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(okResponse());

    await expect(
      fetchWithRetry('https://example.com', {
        signal: AbortSignal.abort('pre-aborted'),
        maxRetries: 3,
        baseDelayMs: 1,
      })
    ).rejects.toThrow(/aborted/i);

    // fetch should never be called since we bail before the attempt
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('aborts during retry backoff', async () => {
    const controller = new AbortController();

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(errorResponse(500, 'server error'))
      .mockResolvedValueOnce(okResponse('should not reach'));

    const promise = fetchWithRetry('https://example.com', {
      signal: controller.signal,
      maxRetries: 3,
      baseDelayMs: 5000, // long delay so abort fires during sleep
    });

    // Abort after a short time (before the 5s backoff completes)
    setTimeout(() => controller.abort(new Error('test abort')), 50);

    await expect(promise).rejects.toThrow(/aborted/i);
  });

  it('propagates abort when fetch itself is cancelled by signal', async () => {
    const controller = new AbortController();

    // Simulate fetch throwing AbortError because the signal was aborted
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      controller.abort(new Error('cancelled'));
      throw new DOMException('The operation was aborted', 'AbortError');
    });

    await expect(
      fetchWithRetry('https://example.com', {
        signal: controller.signal,
        maxRetries: 3,
        baseDelayMs: 1,
      })
    ).rejects.toThrow(/aborted/i);
  });
});

// ─── Per-request timeout ──────────────────────────────────────────────────────

describe('fetchWithRetry — per-request timeout', () => {
  it('passes a combined AbortSignal to fetch (with timeout)', async () => {
    let receivedSignal: AbortSignal | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      receivedSignal = init?.signal as AbortSignal | undefined;
      return okResponse();
    });

    await fetchWithRetry('https://example.com', { timeoutMs: 5000 });
    // The signal should exist (either timeout-only or combined)
    expect(receivedSignal).toBeDefined();
    expect(receivedSignal!.aborted).toBe(false);
  });

  it('passes a combined signal when both timeout and external signal provided', async () => {
    const controller = new AbortController();
    let receivedSignal: AbortSignal | undefined;

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, init) => {
      receivedSignal = init?.signal as AbortSignal | undefined;
      return okResponse();
    });

    await fetchWithRetry('https://example.com', {
      timeoutMs: 5000,
      signal: controller.signal,
    });
    expect(receivedSignal).toBeDefined();
    // The combined signal is different from the external signal (it's an AbortSignal.any)
    expect(receivedSignal).not.toBe(controller.signal);
  });
});

// ─── createFetchAllController ─────────────────────────────────────────────────

describe('createFetchAllController', () => {
  it('returns controller + signal with default timeout', () => {
    const { controller, signal } = createFetchAllController();
    expect(controller).toBeInstanceOf(AbortController);
    expect(signal).toBeDefined();
    expect(signal.aborted).toBe(false);
    // Clean up the timer
    controller.abort();
  });

  it('aborts after the specified timeout', async () => {
    const { signal } = createFetchAllController(50);
    expect(signal.aborted).toBe(false);
    // Wait for the timeout to fire
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(signal.aborted).toBe(true);
  });

  it('DEFAULT_FETCH_ALL_TIMEOUT_MS is 5 minutes', () => {
    expect(DEFAULT_FETCH_ALL_TIMEOUT_MS).toBe(5 * 60 * 1000);
  });
});
