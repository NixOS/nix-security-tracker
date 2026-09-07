declare function getWindowFrames(win: Window): {
    each(cb: (win: Window) => void): void;
    addEventListener(event: string, listener: any, options?: any): () => void;
    removeEventListener(event: string, listener: any, options?: any): void;
};
declare function getParentWindow(win: Window): {
    addEventListener: (event: string, listener: any, options?: any) => () => void;
    removeEventListener: (event: string, listener: any, options?: any) => void;
};

export { getParentWindow, getWindowFrames };
