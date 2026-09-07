type IncludeContainerType = boolean | "if-empty";
type GetShadowRootOption = boolean | ((node: HTMLElement) => ShadowRoot | boolean | undefined) | undefined;
interface TabbableOptions {
    includeContainer?: IncludeContainerType;
    getShadowRoot?: GetShadowRootOption;
}
interface NextTabbableOptions {
    current?: HTMLElement | undefined | null;
    getShadowRoot?: GetShadowRootOption;
}
declare const getFocusables: (container: Pick<HTMLElement, "querySelectorAll"> | null, options?: TabbableOptions) => HTMLElement[];
declare function isFocusable(element: HTMLElement | EventTarget | null): element is HTMLElement;
declare function getFirstFocusable(container: HTMLElement | null, options?: TabbableOptions): HTMLElement | null;
declare function getTabbables(container: HTMLElement | null, options?: TabbableOptions): HTMLElement[];
declare function isTabbable(el: HTMLElement | EventTarget | null): el is HTMLElement;
declare function getFirstTabbable(container: HTMLElement | null, options?: TabbableOptions): HTMLElement | null;
declare function getLastTabbable(container: HTMLElement | null, options?: TabbableOptions): HTMLElement | null;
declare function getTabbableEdges(container: HTMLElement | null, options?: TabbableOptions): [HTMLElement, HTMLElement] | [null, null];
declare function getNextTabbable(container: HTMLElement | null, options?: NextTabbableOptions): HTMLElement | null;
declare function getTabIndex(node: HTMLElement | SVGElement): number;

export { type GetShadowRootOption, type NextTabbableOptions, type TabbableOptions, getFirstFocusable, getFirstTabbable, getFocusables, getLastTabbable, getNextTabbable, getTabIndex, getTabbableEdges, getTabbables, isFocusable, isTabbable };
