import { HighlightWordProps, HighlightChunk } from './types.mjs';

declare function highlightMultiple(props: HighlightWordProps): HighlightChunk[];

export { highlightMultiple };
