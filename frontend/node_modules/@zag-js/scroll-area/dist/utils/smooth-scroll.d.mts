import { ScrollbarEasing } from '../scroll-area.types.mjs';
import '@zag-js/core';
import '@zag-js/types';
import './timeout.mjs';

interface SmoothScrollOptions extends ScrollbarEasing {
    top?: number | undefined;
    left?: number | undefined;
    onComplete?: (() => void) | undefined;
}
declare function smoothScroll(node: HTMLElement | null | undefined, options?: SmoothScrollOptions): (() => void) | undefined;

export { type SmoothScrollOptions, smoothScroll };
