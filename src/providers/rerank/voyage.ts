import type { RerankProvider, RerankCandidate, RerankResult } from '../types.js';
import { withRetry, providerTimeoutMs, safeErrorBody, type ProviderUsage } from '../retry.js';

/**
 * Voyage rerank-2 reranker. Anthropic-recommended.
 * Pricing: ~$0.05/M tokens; ~100ms per call for 20 candidates.
 * Requires VOYAGE_API_KEY. Opt-in paid provider.
 *
 * Features:
 * - Retry with exponential backoff on 429/5xx (3 attempts by default)
 * - Token usage tracking via lastUsage
 */
export class VoyageRerankProvider implements RerankProvider {
  readonly name = 'voyage';
  private apiKey: string;
  private model: string;

  /** Accumulated usage across all rerank() calls on this instance. */
  private _usage: ProviderUsage = { tokens: 0, requests: 0 };

  constructor(opts: { apiKey?: string; model?: string } = {}) {
    this.apiKey = opts.apiKey ?? process.env.VOYAGE_API_KEY ?? '';
    this.model = opts.model ?? 'rerank-2';
    if (!this.apiKey) {
      throw new Error('voyage rerank provider requires VOYAGE_API_KEY');
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

  async rerank(query: string, candidates: RerankCandidate[], signal?: AbortSignal): Promise<RerankResult[]> {
    if (candidates.length === 0) return [];
    const timeoutMs = providerTimeoutMs();

    const { data: result } = await withRetry(
      async () => {
        let res: Response;
        try {
          res = await fetch('https://api.voyageai.com/v1/rerank', {
            method: 'POST',
            headers: {
              'authorization': `Bearer ${this.apiKey}`,
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: this.model,
              query,
              documents: candidates.map((c) => c.text),
              top_k: candidates.length,
            }),
            signal: signal ?? AbortSignal.timeout(timeoutMs),
          });
        } catch (e: any) {
          if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
            throw new Error(`Voyage rerank request timed out after ${timeoutMs}ms — is the API responsive?`);
          }
          throw e;
        }
        if (!res.ok) throw new Error(`Voyage rerank ${res.status}: ${await safeErrorBody(res)}`);
        const json = (await res.json()) as {
          data: Array<{ index: number; relevance_score: number }>;
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

    return result.data.map((d) => ({
      id: candidates[d.index].id,
      score: d.relevance_score,
    }));
  }
}
