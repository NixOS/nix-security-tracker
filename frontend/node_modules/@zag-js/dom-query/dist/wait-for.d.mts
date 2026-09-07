interface WaitForOptions {
    timeout: number;
    rootNode?: Document | ShadowRoot | undefined;
}
type WaitForPromiseReturn<T> = [Promise<T>, () => void];
declare function waitForPromise<T>(promise: Promise<T>, controller: AbortController, timeout: number): WaitForPromiseReturn<T>;
declare function waitForElement(target: () => HTMLElement | null, options: WaitForOptions): WaitForPromiseReturn<HTMLElement>;
type WaitForEventReturn<K extends keyof HTMLElementEventMap> = [Promise<HTMLElementEventMap[K]>, VoidFunction];
interface WaitForEventOptions<T extends HTMLElement = HTMLElement> extends AddEventListenerOptions {
    predicate?: (element: T) => boolean;
}
declare function waitForEvent<T extends HTMLElement = HTMLElement, K extends keyof HTMLElementEventMap = keyof HTMLElementEventMap>(target: (() => HTMLElement | null) | undefined, event: K, options?: WaitForEventOptions<T>): WaitForEventReturn<K>;

export { type WaitForEventOptions, type WaitForOptions, type WaitForPromiseReturn, waitForElement, waitForEvent, waitForPromise };
