import type { RerankProvider, RerankCandidate, RerankResult } from '../types.js';

/**
 * Cohere rerank-3.5 reranker.
 * Pricing: ~$2/1k queries (each query rerasks up to 1000 docs).
 * Requires COHERE_API_KEY. Opt-in paid provider.
 */
export class CohereRerankProvider implements RerankProvider {
  readonly name = 'cohere';
  private apiKey: string;
  private model: string;

  constructor(opts: { apiKey?: string; model?: string } = {}) {
    this.apiKey = opts.apiKey ?? process.env.COHERE_API_KEY ?? '';
    this.model = opts.model ?? 'rerank-v3.5';
    if (!this.apiKey) {
      throw new Error('cohere rerank provider requires COHERE_API_KEY');
    }
  }

  async rerank(query: string, candidates: RerankCandidate[]): Promise<RerankResult[]> {
    if (candidates.length === 0) return [];
    const res = await fetch('https://api.cohere.com/v2/rerank', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        query,
        documents: candidates.map((c) => c.text),
        top_n: candidates.length,
      }),
    });
    if (!res.ok) throw new Error(`Cohere rerank ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { results: Array<{ index: number; relevance_score: number }> };
    return json.results.map((r) => ({
      id: candidates[r.index].id,
      score: r.relevance_score,
    }));
  }
}
