import { Rect } from './types.mjs';

type WindowRectOptions = {
    /**
     * Whether to exclude the element's scrollbar size from the calculation.
     */
    excludeScrollbar?: boolean | undefined;
};
/**
 * Creates a rectangle from window object
 */
declare function getWindowRect(win: Window, opts?: WindowRectOptions): Rect;
/**
 * Get the rect of the window with the option to exclude the scrollbar
 */
declare function getViewportRect(win: Window, opts: WindowRectOptions): {
    x: number;
    y: number;
    width: number;
    height: number;
};

export { type WindowRectOptions, getViewportRect, getWindowRect };
