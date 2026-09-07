interface HighlightRegexOptions {
    /**
     * Whether to ignore case while matching
     */
    ignoreCase?: boolean | undefined;
    /**
     * Whether to match multiple instances of the query
     */
    matchAll?: boolean | undefined;
    /**
     * Whether to match whole words only
     */
    exactMatch?: boolean | undefined;
}
interface HighlightWordProps extends HighlightRegexOptions {
    /**
     * The text to highlight
     */
    text: string;
    /**
     * The query to highlight in the text
     */
    query: string | string[];
}
interface HighlightChunk {
    /**
     * The text to highlight
     */
    text: string;
    /**
     * Whether the text is a match
     */
    match: boolean;
}
interface HighlightSpan {
    /**
     * The start index of the span
     */
    start: number;
    /**
     * The end index of the span
     */
    end: number;
    /**
     * Whether the span is a match
     */
    match?: boolean | undefined;
}

export type { HighlightChunk, HighlightRegexOptions, HighlightSpan, HighlightWordProps };
