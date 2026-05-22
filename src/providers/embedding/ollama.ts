import type { EmbeddingProvider } from '../types.js';

export class OllamaEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'ollama';
  readonly model: string;
  readonly dimension = 768;
  private host: string;

  constructor(opts: { host?: string; model?: string } = {}) {
    const rawHost = opts.host ?? process.env.OLLAMA_HOST ?? 'http://localhost:11434';
    this.host = /^https?:\/\//.test(rawHost) ? rawHost : `http://${rawHost}`;
    this.model = opts.model ?? process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text';
  }

  async embed(inputs: string[]): Promise<Float32Array[]> {
    if (inputs.length === 0) return [];
    const res = await fetch(`${this.host}/api/embed`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        input: inputs,
      }),
    });
    if (!res.ok) throw new Error(`Ollama embed ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { embeddings: number[][] };
    return json.embeddings.map((e) => {
      if (e.length !== this.dimension) {
        throw new Error(
          `expected dimension ${this.dimension} for ${this.model}, got ${e.length}. Set OLLAMA_EMBED_MODEL or update dimension.`
        );
      }
      return Float32Array.from(e);
    });
  }
}
