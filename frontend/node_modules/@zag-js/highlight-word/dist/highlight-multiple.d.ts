import { HighlightWordProps, HighlightChunk } from './types.js';

declare function highlightMultiple(props: HighlightWordProps): HighlightChunk[];

export { highlightMultiple };
