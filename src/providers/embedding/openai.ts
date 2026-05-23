import type { EmbeddingProvider } from '../types.js';
import { withRetry, providerTimeoutMs, safeErrorBody, type ProviderUsage } from '../retry.js';

/**
 * OpenAI embeddings provider.
 *
 * Defaults to `text-embedding-3-small` (native 1536 dim). Configurable via
 * OPENAI_EMBED_MODEL — `text-embedding-3-large` (3072 dim) is the other
 * common choice.
 *
 * Both `text-embedding-3-*` models support the `dimensions` parameter
 * for Matryoshka-style truncation to any target dim <= native; we use this
 * when `opts.dim` (or the negotiated DB dim) differs from native.
 *
 * Requires OPENAI_API_KEY. Opt-in paid provider.
 *
 * Features:
 * - Retry with exponential backoff on 429/5xx (3 attempts by default)
 * - Token usage tracking via lastUsage
 */
const NATIVE_DIMS: Record<string, number> = {
  'text-embedding-3-small': 1536,
  'text-embedding-3-large': 3072,
  'text-embedding-ada-002': 1536,
};

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai';
  readonly model: string;
  readonly dimension: number;
  private apiKey: string;
  private baseUrl: string;
  /** Whether the requested dimension matches native (skip sending `dimensions` param). */
  private useNativeDim: boolean;

  private _usage: ProviderUsage = { tokens: 0, requests: 0 };

  constructor(opts: { apiKey?: string; model?: string; dim?: number; baseUrl?: string } = {}) {
    this.apiKey = opts.apiKey ?? process.env.OPENAI_API_KEY ?? '';
    this.model = opts.model ?? process.env.OPENAI_EMBED_MODEL ?? 'text-embedding-3-small';
    this.baseUrl = opts.baseUrl ?? process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1';
    const native = NATIVE_DIMS[this.model];
    if (opts.dim !== undefined) {
      if (native !== undefined && opts.dim > native) {
        throw new Error(
          `OpenAI model ${this.model} has native dim ${native}; requested ${opts.dim} exceeds native and cannot be expanded.`
        );
      }
      this.dimension = opts.dim;
      this.useNativeDim = native !== undefined && opts.dim === native;
    } else {
      this.dimension = native ?? 1536;
      this.useNativeDim = true;
    }
    if (!this.apiKey) {
      throw new Error('openai embedding provider requires OPENAI_API_KEY');
    }
  }

  /** Get accumulated usage stats. */
  get usage(): ProviderUsage {
    return { ...this._usage };
  }

  /** Reset accumulated usage counters. */
  resetUsage(): void {
    this._usage = { tokens: 0, requests: 0 };
  }

  async embed(inputs: string[], signal?: AbortSignal): Promise<Float32Array[]> {
    if (inputs.length === 0) return [];
    const timeoutMs = providerTimeoutMs();

    const body: Record<string, unknown> = {
      model: this.model,
      input: inputs,
    };
    // Only send `dimensions` when truncating from native — sending it with
    // the native value is harmless but breaks against models that don't
    // accept the param (e.g. ada-002, third-party gateways).
    if (!this.useNativeDim) {
      body.dimensions = this.dimension;
    }

    const { data: result } = await withRetry(
      async () => {
        let res: Response;
        try {
          res = await fetch(`${this.baseUrl}/embeddings`, {
            method: 'POST',
            headers: {
              'authorization': `Bearer ${this.apiKey}`,
              'content-type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: signal ?? AbortSignal.timeout(timeoutMs),
          });
        } catch (e: any) {
          if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
            throw new Error(`OpenAI embed request timed out after ${timeoutMs}ms — is the API responsive?`);
          }
          throw e;
        }
        if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await safeErrorBody(res)}`);
        const json = (await res.json()) as {
          data: Array<{ embedding: number[]; index: number }>;
          usage?: { total_tokens?: number; prompt_tokens?: number };
        };
        return json;
      },
      { maxAttempts: 3, signal }
    );

    // Track usage
    this._usage.requests++;
    const totalTokens = result.usage?.total_tokens ?? result.usage?.prompt_tokens;
    if (typeof totalTokens === 'number') {
      this._usage.tokens += totalTokens;
    }

    // OpenAI returns results in order but with explicit `index` — sort defensively
    // to keep alignment with the input array.
    const sorted = [...result.data].sort((a, b) => a.index - b.index);
    return sorted.map((d) => {
      if (d.embedding.length !== this.dimension) {
        throw new Error(
          `OpenAI returned ${d.embedding.length}-d embedding for ${this.model}; expected ${this.dimension}. Check OPENAI_EMBED_MODEL or re-init the DB.`
        );
      }
      return Float32Array.from(d.embedding);
    });
  }
}
