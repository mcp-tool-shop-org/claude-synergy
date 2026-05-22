// Provider interfaces for Tier 2b — Contextual Retrieval pluggability.

export interface ChangeChunk {
  changeId: number;
  product: string;
  releaseVersion: string;
  releasedAt: string | null;
  kind: string;
  text: string;
  ordinalInRelease: number;
  totalInRelease: number;
}

export interface ReleaseContext {
  product: string;
  version: string;
  releasedAt: string | null;
  /** All chunks in the same release, in order. The context provider may reference these to situate the focus chunk. */
  siblings: ChangeChunk[];
}

export interface ContextProvider {
  readonly name: string;
  /**
   * Generate a 50-100 token context prefix to prepend to the chunk for embedding.
   * Returns the prefix only (not the full contextualized text — the caller assembles).
   */
  contextFor(chunk: ChangeChunk, release: ReleaseContext): Promise<string>;
}

export interface EmbeddingProvider {
  readonly name: string;
  readonly model: string;
  readonly dimension: number;
  /**
   * Embed one or more inputs. Returns a vector per input (length = dimension).
   */
  embed(inputs: string[]): Promise<Float32Array[]>;
}

export interface RerankCandidate {
  /** External identifier carried through so the caller can join results back. */
  id: number;
  /** Text shown to the reranker. Should be the full contextualized chunk. */
  text: string;
}

export interface RerankResult {
  id: number;
  score: number;
}

export interface RerankProvider {
  readonly name: string;
  /**
   * Re-rank candidates against the query. Higher score = more relevant.
   * Implementations may bound the response length; callers should pass top-K filtering separately.
   */
  rerank(query: string, candidates: RerankCandidate[]): Promise<RerankResult[]>;
}
