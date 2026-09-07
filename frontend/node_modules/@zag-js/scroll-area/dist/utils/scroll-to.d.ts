import { ScrollToDetails } from '../scroll-area.types.js';
import '@zag-js/core';
import '@zag-js/types';
import './timeout.js';

declare function scrollTo(node: HTMLElement | null | undefined, options?: ScrollToDetails): void;

export { scrollTo };
