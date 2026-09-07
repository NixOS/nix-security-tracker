interface DisableTextSelectionOptions<T = MaybeElement> {
    target?: T | undefined;
    doc?: Document | undefined;
    defer?: boolean | undefined;
}
declare function restoreTextSelection(options?: DisableTextSelectionOptions): void;
type MaybeElement = HTMLElement | null | undefined;
type NodeOrFn = MaybeElement | (() => MaybeElement);
declare function disableTextSelection(options?: DisableTextSelectionOptions<NodeOrFn>): () => void;

export { type DisableTextSelectionOptions, disableTextSelection, restoreTextSelection };
