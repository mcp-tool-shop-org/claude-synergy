import type { RerankProvider, RerankCandidate, RerankResult } from '../types.js';

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
 * LLM-as-judge reranker via local Ollama. Free; ~3-10s per query depending on model.
 *
 * Single batched call: gives the model the query and ALL candidates, asks for one
 * integer score per candidate. Much faster than per-candidate calls and lets the
 * model see all candidates side-by-side for better calibration.
 *
 * Default model: qwen3:8b (good instruction follower). Override via OLLAMA_RERANK_MODEL.
 */
export class OllamaJudgeRerankProvider implements RerankProvider {
  readonly name = 'ollama-judge';
  private host: string;
  private model: string;

  constructor(opts: { host?: string; model?: string } = {}) {
    const rawHost = opts.host ?? process.env.OLLAMA_HOST ?? 'http://localhost:11434';
    this.host = /^https?:\/\//.test(rawHost) ? rawHost : `http://${rawHost}`;
    // Default to qwen3:8b — newer, better at relevance judgment. Thinking mode is
    // disabled via the `think: false` API param below (the `/no_think` prompt prefix
    // does NOT work — Ollama still routes to thinking and eats num_predict).
    this.model = opts.model ?? process.env.OLLAMA_RERANK_MODEL ?? 'qwen3:8b';
  }

  async rerank(query: string, candidates: RerankCandidate[]): Promise<RerankResult[]> {
    if (candidates.length === 0) return [];

    // Build the batched judgement prompt
    const docs = candidates
      .map((c, i) => `Doc ${i + 1}: ${c.text.slice(0, 400)}`)
      .join('\n\n');

    const prompt = [
      `You are a relevance judge for a Claude changelog search.`,
      `Rate each document 0-10 for how well it answers the user's query.`,
      `Respond with EXACTLY ${candidates.length} integers, one per line, in order. No prose, no explanations, no doc numbers, just one integer per line.`,
      ``,
      `Query: ${query}`,
      ``,
      docs,
      ``,
      `Scores (one integer per line, ${candidates.length} lines total):`,
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
          think: false, // for qwen3/o1-style models; harmless on others
          options: { temperature: 0, num_predict: Math.max(120, candidates.length * 4) },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e: any) {
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
        throw new Error(`Ollama judge rerank timed out after ${timeoutMs}ms — is the Ollama server responsive?`);
      }
      throw e;
    }
    if (!res.ok) throw new Error(`Ollama judge ${res.status}: ${await safeErrorBody(res)}`);
    const json = (await res.json()) as { response: string };

    const scores = parseScores(json.response, candidates.length);
    return candidates.map((c, i) => ({ id: c.id, score: scores[i] ?? 0 }));
  }
}

function parseScores(response: string, n: number): number[] {
  const lines = response.split(/\r?\n/);
  const out: number[] = [];
  for (const line of lines) {
    if (out.length >= n) break;
    const m = line.match(/-?\d+(?:\.\d+)?/);
    if (!m) continue;
    const v = parseFloat(m[0]);
    if (Number.isFinite(v)) out.push(Math.max(0, Math.min(10, v)));
  }
  // Pad with 0 if model returned fewer scores than expected
  while (out.length < n) out.push(0);
  return out;
}
