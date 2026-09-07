import { Time } from './timer.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare function parse(date: string | Partial<Time>): number;

export { parse };
