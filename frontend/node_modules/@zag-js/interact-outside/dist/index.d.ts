interface InteractOutsideHandlers {
    /**
     * Function called when the pointer is pressed down outside the component
     */
    onPointerDownOutside?: ((event: PointerDownOutsideEvent) => void) | undefined;
    /**
     * Function called when the focus is moved outside the component
     */
    onFocusOutside?: ((event: FocusOutsideEvent) => void) | undefined;
    /**
     * Function called when an interaction happens outside the component
     */
    onInteractOutside?: ((event: InteractOutsideEvent) => void) | undefined;
}
interface InteractOutsideOptions extends InteractOutsideHandlers {
    exclude?: ((target: HTMLElement) => boolean) | undefined;
    defer?: boolean | undefined;
    /**
     * Default: `true`. If `true`, the interact outside detection will recursively include elements
     * that are controlled by elements within the trap via `aria-controls`. Only elements
     * with `aria-expanded="true"` and interactive container roles (menu, listbox, dialog, etc.)
     * will be included. This allows nested menus, select dropdowns, and other portalled
     * content to remain within the interaction boundary.
     */
    followControlledElements?: boolean | undefined;
}
interface EventDetails<T> {
    originalEvent: T;
    contextmenu: boolean;
    focusable: boolean;
    target: EventTarget;
}
type PointerDownOutsideEvent = CustomEvent<EventDetails<PointerEvent>>;
type FocusOutsideEvent = CustomEvent<EventDetails<FocusEvent>>;
type InteractOutsideEvent = PointerDownOutsideEvent | FocusOutsideEvent;
type MaybeElement = HTMLElement | null | undefined;
type NodeOrFn = MaybeElement | (() => MaybeElement);
declare function trackInteractOutside(nodeOrFn: NodeOrFn, options: InteractOutsideOptions): () => void;

export { type EventDetails, type FocusOutsideEvent, type InteractOutsideEvent, type InteractOutsideHandlers, type InteractOutsideOptions, type MaybeElement, type NodeOrFn, type PointerDownOutsideEvent, trackInteractOutside };
