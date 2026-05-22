import { vi } from 'vitest';

export interface MockRoute {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  urlPattern: string | RegExp;
  response: (req: { url: string; method: string; body: any; headers: Record<string, string> }) => Promise<Response> | Response;
}

export interface MockCall {
  url: string;
  method: string;
  body: any;
  headers: Record<string, string>;
}

export interface FetchMockHandle {
  restore: () => void;
  calls: MockCall[];
  /** Number of recorded calls. */
  callCount: () => number;
  /** Most recent call. */
  lastCall: () => MockCall | undefined;
}

/**
 * Mock global.fetch with a route table.
 *
 * Each call is matched against routes in order. The first matching route handles it.
 * If no route matches, an Error is thrown so tests fail loud instead of silently
 * hitting the real network.
 *
 * Returns a handle exposing the captured request log and a restore() to undo.
 */
export function mockFetch(routes: MockRoute[]): FetchMockHandle {
  const calls: MockCall[] = [];

  const spy = vi.spyOn(global, 'fetch').mockImplementation(async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = (init?.method ?? 'GET').toUpperCase();
    const rawBody = init?.body;
    let body: any = rawBody;
    if (typeof rawBody === 'string') {
      try {
        body = JSON.parse(rawBody);
      } catch {
        body = rawBody;
      }
    }
    const headers: Record<string, string> = {};
    if (init?.headers) {
      if (init.headers instanceof Headers) {
        init.headers.forEach((v: string, k: string) => {
          headers[k.toLowerCase()] = v;
        });
      } else if (Array.isArray(init.headers)) {
        for (const [k, v] of init.headers) headers[String(k).toLowerCase()] = String(v);
      } else {
        for (const [k, v] of Object.entries(init.headers as Record<string, string>)) {
          headers[k.toLowerCase()] = v as string;
        }
      }
    }
    const call: MockCall = { url, method, body, headers };
    calls.push(call);

    for (const route of routes) {
      const methodOk = !route.method || route.method === method;
      if (!methodOk) continue;
      const urlMatch =
        route.urlPattern instanceof RegExp
          ? route.urlPattern.test(url)
          : url.includes(route.urlPattern);
      if (urlMatch) {
        return Promise.resolve(route.response(call));
      }
    }
    throw new Error(`fetch-mock: no route matched ${method} ${url}`);
  });

  return {
    restore: () => spy.mockRestore(),
    calls,
    callCount: () => calls.length,
    lastCall: () => calls[calls.length - 1],
  };
}

/** Helper: build a JSON Response with status 200 and the given object as body. */
export function jsonResponse(body: any, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

/** Helper: build an error Response with status + text body. */
export function errorResponse(status: number, text: string): Response {
  return new Response(text, { status, headers: { 'content-type': 'text/plain' } });
}
