import type { ContextProvider, ChangeChunk, ReleaseContext } from '../types.js';

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
 * Claude Haiku 4.5 context provider with prompt caching (Anthropic's recommended pattern).
 *
 * For each product, the release document is cached. Each chunk-specific call pays only
 * the small delta (chunk text + response). Result: ~$1-2 for the full corpus.
 *
 * Requires ANTHROPIC_API_KEY. NOT installed by default — Tier 2b ships with `none`,
 * `structured`, `ollama` ready out of the box. Users opt in to this paid provider.
 *
 * SKELETON: API call shape is correct but not yet wired with the @anthropic-ai/sdk
 * dependency. Implement when paid path is needed.
 */
export class ClaudeHaikuContextProvider implements ContextProvider {
  readonly name = 'claude-haiku';
  private apiKey: string;
  private model: string;
  private cachedDocByRelease = new Map<string, string>();

  constructor(opts: { apiKey?: string; model?: string } = {}) {
    this.apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY ?? '';
    this.model = opts.model ?? 'claude-haiku-4-5-20251001';
    if (!this.apiKey) {
      throw new Error('claude-haiku context provider requires ANTHROPIC_API_KEY');
    }
  }

  async contextFor(chunk: ChangeChunk, release: ReleaseContext): Promise<string> {
    const releaseKey = `${release.product}@${release.version}`;
    let doc = this.cachedDocByRelease.get(releaseKey);
    if (!doc) {
      doc = release.siblings.map((s, i) => `${i + 1}. ${s.text}`).join('\n');
      this.cachedDocByRelease.set(releaseKey, doc);
    }

    const userPrompt = [
      `Chunk: ${chunk.text}`,
      ``,
      `Give a 1-sentence context (max 30 words) situating this chunk in the release. Mention related products, env vars, commands. Output ONLY the context.`,
    ].join('\n');

    const timeoutMs = providerTimeoutMs();
    let res: Response;
    try {
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 80,
          system: [
            {
              type: 'text',
              text: `${release.product} ${release.version} (${release.releasedAt}) release notes:\n${doc}`,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userPrompt }],
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (e: any) {
      if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
        throw new Error(`Anthropic API request timed out after ${timeoutMs}ms — is the API responsive?`);
      }
      throw e;
    }
    if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await safeErrorBody(res)}`);
    const json = (await res.json()) as { content: Array<{ type: string; text?: string }> };
    return (json.content.find((c) => c.type === 'text')?.text ?? '').trim();
  }
}
