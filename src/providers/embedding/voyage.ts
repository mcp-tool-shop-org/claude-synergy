import type { EmbeddingProvider } from '../types.js';
import { withRetry, providerTimeoutMs, safeErrorBody, type ProviderUsage } from '../retry.js';

/**
 * Voyage 3 embedding provider (Anthropic-recommended per Contextual Retrieval blog).
 *
 * Voyage 3 native dimension is 1024; we use Matryoshka truncation to 768 to match
 * the sqlite-vec table schema. This costs ~1-2% quality vs. native 1024-d but lets
 * users swap between Ollama (free, 768-d native) and Voyage without re-schema.
 *
 * Requires VOYAGE_API_KEY. Opt-in paid provider.
 *
 * Features:
 * - Retry with exponential backoff on 429/5xx (3 attempts by default)
 * - Token usage tracking returned via lastUsage
 */
export class VoyageEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'voyage';
  readonly model: string;
  readonly dimension = 768;
  private apiKey: string;

  /** Accumulated usage across all embed() calls on this instance. */
  private _usage: ProviderUsage = { tokens: 0, requests: 0 };

  constructor(opts: { apiKey?: string; model?: string } = {}) {
    this.apiKey = opts.apiKey ?? process.env.VOYAGE_API_KEY ?? '';
    this.model = opts.model ?? 'voyage-3-large';
    if (!this.apiKey) {
      throw new Error('voyage embedding provider requires VOYAGE_API_KEY');
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
    const timeoutMs = providerTimeoutMs();

    const { data: result } = await withRetry(
      async () => {
        let res: Response;
        try {
          res = await fetch('https://api.voyageai.com/v1/embeddings', {
            method: 'POST',
            headers: {
              'authorization': `Bearer ${this.apiKey}`,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: this.model,
              input: inputs,
              input_type: 'document',
              output_dimension: this.dimension,
            }),
            signal: signal ?? AbortSignal.timeout(timeoutMs),
          });
        } catch (e: any) {
          if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
            throw new Error(`Voyage embed request timed out after ${timeoutMs}ms — is the API responsive?`);
          }
          throw e;
        }
        if (!res.ok) throw new Error(`Voyage ${res.status}: ${await safeErrorBody(res)}`);
        const json = (await res.json()) as {
          data: Array<{ embedding: number[] }>;
          usage?: { total_tokens?: number };
        };
        return json;
      },
      { maxAttempts: 3, signal }
    );

    // Track usage
    this._usage.requests++;
    if (result.usage?.total_tokens) {
      this._usage.tokens += result.usage.total_tokens;
    }

    return result.data.map((d) => Float32Array.from(d.embedding));
  }
}
