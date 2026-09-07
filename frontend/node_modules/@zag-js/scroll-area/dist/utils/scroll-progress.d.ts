declare function getScrollProgress(element: HTMLElement | null, scrollThreshold: number): {
    x: number;
    y: number;
};

export { getScrollProgress };
