import { Rect } from './types.js';

declare function getElementRect(el: HTMLElement, opts?: ElementRectOptions): Rect;
type ElementRectOptions = {
    /**
     * Whether to exclude the element's scrollbar size from the calculation.
     */
    excludeScrollbar?: boolean | undefined;
    /**
     * Whether to exclude the element's borders from the calculation.
     */
    excludeBorders?: boolean | undefined;
};

export { type ElementRectOptions, getElementRect };
