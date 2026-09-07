type Subscriber<T> = (entry: T) => void;
interface SharedResizeObserver {
    observe: (element: Element, listener: Subscriber<ResizeObserverEntry>) => () => void;
    unobserve: (element: Element) => void;
}
declare const resizeObserverContentBox: SharedResizeObserver;
declare const resizeObserverBorderBox: SharedResizeObserver;
declare const resizeObserverDevicePixelContentBox: SharedResizeObserver;

export { resizeObserverBorderBox, resizeObserverContentBox, resizeObserverDevicePixelContentBox };
