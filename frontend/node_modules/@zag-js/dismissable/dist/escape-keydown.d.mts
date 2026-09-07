declare function trackEscapeKeydown(node: HTMLElement, fn?: (event: KeyboardEvent) => void): () => void;

export { trackEscapeKeydown };
