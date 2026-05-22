import type { RerankProvider, RerankCandidate, RerankResult } from '../types.js';

/**
 * Pass-through reranker — preserves the input ranking by returning monotonically
 * decreasing scores in input order. Used when `--rerank none` is set (default)
 * to keep the rerank layer pluggable without forcing a real reranker.
 */
export class NoneRerankProvider implements RerankProvider {
  readonly name = 'none';

  async rerank(_query: string, candidates: RerankCandidate[]): Promise<RerankResult[]> {
    return candidates.map((c, i) => ({ id: c.id, score: candidates.length - i }));
  }
}
