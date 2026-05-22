import type { RerankProvider, RerankCandidate, RerankResult } from '../types.js';

/**
 * Voyage rerank-2 reranker. Anthropic-recommended.
 * Pricing: ~$0.05/M tokens; ~100ms per call for 20 candidates.
 * Requires VOYAGE_API_KEY. Opt-in paid provider.
 */
export class VoyageRerankProvider implements RerankProvider {
  readonly name = 'voyage';
  private apiKey: string;
  private model: string;

  constructor(opts: { apiKey?: string; model?: string } = {}) {
    this.apiKey = opts.apiKey ?? process.env.VOYAGE_API_KEY ?? '';
    this.model = opts.model ?? 'rerank-2';
    if (!this.apiKey) {
      throw new Error('voyage rerank provider requires VOYAGE_API_KEY');
    }
  }

  async rerank(query: string, candidates: RerankCandidate[]): Promise<RerankResult[]> {
    if (candidates.length === 0) return [];
    const res = await fetch('https://api.voyageai.com/v1/rerank', {
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
    });
    if (!res.ok) throw new Error(`Voyage rerank ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { data: Array<{ index: number; relevance_score: number }> };
    return json.data.map((d) => ({
      id: candidates[d.index].id,
      score: d.relevance_score,
    }));
  }
}
