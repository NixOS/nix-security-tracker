type WaitForEventReturn<K extends keyof HTMLElementEventMap> = [Promise<HTMLElementEventMap[K]>, VoidFunction];
export interface WaitForEventOptions<T extends HTMLElement = HTMLElement> extends AddEventListenerOptions {
    predicate?: (element: T) => boolean;
}
export declare function waitForEvent<T extends HTMLElement = HTMLElement, K extends keyof HTMLElementEventMap = keyof HTMLElementEventMap>(target: (() => HTMLElement | null) | undefined, event: K, options?: WaitForEventOptions<T>): WaitForEventReturn<K>;
export {};
