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
    const timeoutMs = providerTimeoutMs();
    let res: Response;
    try {
      res = await fetch(`${this.host}/api/embed`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          input: inputs,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e: any) {
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
        throw new Error(`Ollama embed request timed out after ${timeoutMs}ms — is the Ollama server responsive?`);
      }
      throw e;
    }
    if (!res.ok) throw new Error(`Ollama embed ${res.status}: ${await safeErrorBody(res)}`);
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
