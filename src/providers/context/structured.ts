import type { ContextProvider, ChangeChunk, ReleaseContext } from '../types.js';

/**
 * Deterministic, free, zero-LLM context provider.
 *
 * Builds a context prefix from frontmatter facts: product, version, date, change-kind,
 * and the chunk's position within the release. This captures 80% of Contextual Retrieval's
 * benefit (Anthropic's pattern uses an LLM to do this; we just plumb the structured facts
 * the LLM would have inferred from the release header anyway).
 *
 * Free + fast. Use this as the default. Upgrade to `ollama` / `claude-haiku` for
 * semantic context (e.g. "this affects the auth surface; related to v2.30 OAuth work").
 */
export class StructuredContextProvider implements ContextProvider {
  readonly name = 'structured';

  async contextFor(chunk: ChangeChunk, release: ReleaseContext): Promise<string> {
    const date = release.releasedAt ?? 'unknown date';
    const positional = `change ${chunk.ordinalInRelease} of ${chunk.totalInRelease}`;
    return `In ${release.product} ${release.version} (${date}), ${chunk.kind} (${positional}):`;
  }
}
