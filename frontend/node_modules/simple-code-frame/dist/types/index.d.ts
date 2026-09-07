export interface Options {
    before?: number;
    after?: number;
    colors?: boolean;
    maxWidth?: number;
    lineMarkerChar?: string;
    seperatorChar?: string;
    columnMarkerChar?: string;
}
/**
 * Generate an excerpt of the location in the source around the
 * specified position.
 */
export declare function createCodeFrame(text: string, lineNum: number, columnNum: number, { before, after, colors, maxWidth, lineMarkerChar, seperatorChar, columnMarkerChar }?: Options): string;
