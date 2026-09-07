import { Direction } from '@zag-js/types';
import { ScrollToEdge } from '../scroll-area.types.js';
import '@zag-js/core';
import './timeout.js';

declare function scrollToEdge(node: HTMLElement | null | undefined, edge: ScrollToEdge, dir?: Direction, behavior?: ScrollBehavior, easing?: (t: number) => number, duration?: number): void;

export { scrollToEdge };
