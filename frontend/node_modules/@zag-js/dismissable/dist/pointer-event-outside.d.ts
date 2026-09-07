declare function assignPointerEventToLayers(): void;
declare function clearPointerEvent(node: HTMLElement): void;
declare function disablePointerEventsOutside(node: HTMLElement, persistentElements?: Array<() => Element | null>): () => void;

export { assignPointerEventToLayers, clearPointerEvent, disablePointerEventsOutside };
