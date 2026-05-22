import type { EmbeddingProvider } from '../types.js';

/**
 * Voyage 3 embedding provider (Anthropic-recommended per Contextual Retrieval blog).
 *
 * Voyage 3 native dimension is 1024; we use Matryoshka truncation to 768 to match
 * the sqlite-vec table schema. This costs ~1-2% quality vs. native 1024-d but lets
 * users swap between Ollama (free, 768-d native) and Voyage without re-schema.
 *
 * Requires VOYAGE_API_KEY. Opt-in paid provider.
 */
export class VoyageEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'voyage';
  readonly model: string;
  readonly dimension = 768;
  private apiKey: string;

  constructor(opts: { apiKey?: string; model?: string } = {}) {
    this.apiKey = opts.apiKey ?? process.env.VOYAGE_API_KEY ?? '';
    this.model = opts.model ?? 'voyage-3-large';
    if (!this.apiKey) {
      throw new Error('voyage embedding provider requires VOYAGE_API_KEY');
    }
  }

  async embed(inputs: string[]): Promise<Float32Array[]> {
    const res = await fetch('https://api.voyageai.com/v1/embeddings', {
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
    });
    if (!res.ok) throw new Error(`Voyage ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { data: Array<{ embedding: number[] }> };
    return json.data.map((d) => Float32Array.from(d.embedding));
  }
}
