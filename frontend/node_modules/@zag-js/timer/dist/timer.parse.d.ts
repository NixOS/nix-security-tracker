import { Time } from './timer.types.js';
import '@zag-js/core';
import '@zag-js/types';

declare function parse(date: string | Partial<Time>): number;

export { parse };
