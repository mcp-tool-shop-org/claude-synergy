import type { ContextProvider, ChangeChunk, ReleaseContext } from '../types.js';

export class NoneContextProvider implements ContextProvider {
  readonly name = 'none';

  async contextFor(_chunk: ChangeChunk, _release: ReleaseContext): Promise<string> {
    return '';
  }
}
