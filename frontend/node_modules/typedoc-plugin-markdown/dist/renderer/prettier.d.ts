import { Renderer } from 'typedoc';
/**
 * Prettier helpers.
 */
export declare function formatWithPrettierIfAvailable(renderer: Renderer, contents: string, fileName: string): Promise<string>;
