interface InitialFocusOptions {
    root: HTMLElement | null;
    getInitialEl?: (() => HTMLElement | null) | undefined;
    enabled?: boolean | undefined;
    filter?: ((el: HTMLElement) => boolean) | undefined;
}
declare function getInitialFocus(options: InitialFocusOptions): HTMLElement | undefined;
declare function isValidTabEvent(event: Pick<KeyboardEvent, "shiftKey" | "currentTarget">): boolean;

export { type InitialFocusOptions, getInitialFocus, isValidTabEvent };
