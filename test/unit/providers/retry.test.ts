// Unit tests for the shared retry utility used by paid providers.

import { describe, it, expect, afterEach, vi } from 'vitest';
import { withRetry } from '../../../src/providers/retry.js';

describe('withRetry — success paths', () => {
  it('returns on first attempt when no error', async () => {
    const { data, attempts } = await withRetry(async () => 'ok');
    expect(data).toBe('ok');
    expect(attempts).toBe(1);
  });

  it('retries on retryable error (429) and succeeds on next attempt', async () => {
    let calls = 0;
    const { data, attempts } = await withRetry(
      async () => {
        calls++;
        if (calls === 1) throw new Error('Voyage 429: rate limited');
        return 'recovered';
      },
      { baseDelayMs: 1 }
    );
    expect(data).toBe('recovered');
    expect(attempts).toBe(2);
  });

  it('retries on 503 error', async () => {
    let calls = 0;
    const { data, attempts } = await withRetry(
      async () => {
        calls++;
        if (calls < 3) throw new Error(`Voyage ${calls === 1 ? 503 : 502}: server error`);
        return 'ok';
      },
      { maxAttempts: 3, baseDelayMs: 1 }
    );
    expect(data).toBe('ok');
    expect(attempts).toBe(3);
  });
});

describe('withRetry — failure paths', () => {
  it('throws after maxAttempts exhausted on retryable error', async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new Error('Voyage 429: rate limit');
        },
        { maxAttempts: 2, baseDelayMs: 1 }
      )
    ).rejects.toThrow(/429/);
    expect(calls).toBe(2);
  });

  it('does not retry on non-retryable error (400)', async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new Error('Voyage 400: bad request');
        },
        { maxAttempts: 3, baseDelayMs: 1 }
      )
    ).rejects.toThrow(/400/);
    expect(calls).toBe(1);
  });

  it('does not retry on non-retryable error (401)', async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new Error('Voyage 401: unauthorized');
        },
        { maxAttempts: 3, baseDelayMs: 1 }
      )
    ).rejects.toThrow(/401/);
    expect(calls).toBe(1);
  });
});

describe('withRetry — cancellation via AbortSignal', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('throws immediately when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      withRetry(async () => 'ok', { signal: controller.signal })
    ).rejects.toThrow(/cancelled/i);
  });

  it('throws when signal aborts during retry delay', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const controller = new AbortController();
    let calls = 0;
    const promise = withRetry(
      async () => {
        calls++;
        throw new Error('Voyage 429: rate limited');
      },
      { maxAttempts: 5, baseDelayMs: 500, signal: controller.signal }
    );
    const rejected = expect(promise).rejects.toThrow(/cancelled/i);

    // Let the first attempt fail and enter the 250 ms jittered retry delay
    await vi.advanceTimersByTimeAsync(0);
    expect(calls).toBe(1);

    // Advance 100 ms (still inside the 250 ms delay), abort, and verify cancellation
    await vi.advanceTimersByTimeAsync(100);
    controller.abort();
    await rejected;
    expect(calls).toBe(1);

    // Advance past 500 ms and confirm no attempt ran after the abort
    await vi.advanceTimersByTimeAsync(600);
    expect(calls).toBe(1);
  });
});

describe('withRetry — timeout errors are retryable', () => {
  it('retries on timed out error message', async () => {
    let calls = 0;
    const { data } = await withRetry(
      async () => {
        calls++;
        if (calls === 1) throw new Error('Voyage embed request timed out after 60000ms');
        return 'ok';
      },
      { maxAttempts: 2, baseDelayMs: 1 }
    );
    expect(data).toBe('ok');
    expect(calls).toBe(2);
  });

  it('retries on network errors (ECONNRESET)', async () => {
    let calls = 0;
    const { data } = await withRetry(
      async () => {
        calls++;
        if (calls === 1) throw new Error('fetch failed: ECONNRESET');
        return 'ok';
      },
      { maxAttempts: 2, baseDelayMs: 1 }
    );
    expect(data).toBe('ok');
    expect(calls).toBe(2);
  });
});
