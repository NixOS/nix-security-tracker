declare function getScrollSides(node: HTMLElement, dir?: "ltr" | "rtl"): {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
};

export { getScrollSides };
