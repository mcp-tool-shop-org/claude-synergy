import type { ContextProvider, ChangeChunk, ReleaseContext } from '../types.js';

/**
 * Local-LLM context provider via Ollama.
 *
 * Per Anthropic's Contextual Retrieval pattern: each chunk gets a 50-100 token
 * context describing what it is and how it relates to the rest of the document.
 * Free (runs locally) but ~1-2s per chunk on a 3B model.
 *
 * For high-volume corpora, prefer `structured` (deterministic) or batch via
 * Claude Haiku with prompt caching.
 */

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

export class OllamaContextProvider implements ContextProvider {
  readonly name = 'ollama';
  private host: string;
  private model: string;

  constructor(opts: { host?: string; model?: string } = {}) {
    const rawHost = opts.host ?? process.env.OLLAMA_HOST ?? 'http://localhost:11434';
    this.host = /^https?:\/\//.test(rawHost) ? rawHost : `http://${rawHost}`;
    this.model = opts.model ?? process.env.OLLAMA_GEN_MODEL ?? 'llama3.2:3b';
  }

  async contextFor(chunk: ChangeChunk, release: ReleaseContext): Promise<string> {
    // Build a short release-context "document" from siblings so the model can situate.
    // Keep it small to fit the 3B model's effective context.
    const releaseSnippet = release.siblings
      .map((s, i) => `${i + 1}. ${s.text}`)
      .slice(0, 30)
      .join('\n');

    const prompt = [
      `<document>`,
      `${release.product} ${release.version} release notes (${release.releasedAt ?? 'unknown date'}):`,
      releaseSnippet,
      `</document>`,
      ``,
      `Here is the chunk we want to situate within the whole document:`,
      `<chunk>`,
      chunk.text,
      `</chunk>`,
      ``,
      `Please give a short succinct context (1 sentence, max 30 words) to situate this chunk within the overall document for improving search retrieval of the chunk. Mention any related product names, env vars, command names, or APIs. Answer only with the succinct context and nothing else.`,
    ].join('\n');

    const timeoutMs = providerTimeoutMs();
    let res: Response;
    try {
      res = await fetch(`${this.host}/api/generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          stream: false,
          options: { temperature: 0, num_predict: 80 },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e: any) {
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
        throw new Error(`Ollama context request timed out after ${timeoutMs}ms — is the Ollama server responsive?`);
      }
      throw e;
    }
    if (!res.ok) throw new Error(`Ollama ${res.status}: ${await safeErrorBody(res)}`);
    const json = (await res.json()) as { response: string };
    return json.response.trim();
  }
}
