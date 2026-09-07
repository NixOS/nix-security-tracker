import { ScrollToDetails } from '../scroll-area.types.mjs';
import '@zag-js/core';
import '@zag-js/types';
import './timeout.mjs';

declare function scrollTo(node: HTMLElement | null | undefined, options?: ScrollToDetails): void;

export { scrollTo };
