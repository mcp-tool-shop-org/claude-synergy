import type { EmbeddingProvider } from '../types.js';

function providerTimeoutMs(): number {
  const raw = process.env.CLAUDE_SYNERGY_PROVIDER_TIMEOUT_MS;
  const n = raw === undefined ? NaN : parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 60_000;
}

async function safeErrorBody(res: Response, max = 200): Promise<string> {
  try {
    const body = await res.text();
    const safe = body
      .split('\n')
      .filter((l) => !/x-api-key|authorization|bearer|api[-_]?key/i.test(l))
      .join('\n');
    return safe.slice(0, max);
  } catch {
    return '<unreadable>';
  }
}

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
    const timeoutMs = providerTimeoutMs();
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
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e: any) {
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
        throw new Error(`Voyage embed request timed out after ${timeoutMs}ms — is the API responsive?`);
      }
      throw e;
    }
    if (!res.ok) throw new Error(`Voyage ${res.status}: ${await safeErrorBody(res)}`);
    const json = (await res.json()) as { data: Array<{ embedding: number[] }> };
    return json.data.map((d) => Float32Array.from(d.embedding));
  }
}
