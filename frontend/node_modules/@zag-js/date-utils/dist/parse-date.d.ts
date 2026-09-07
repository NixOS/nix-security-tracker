import { DateValue } from './types.js';
import '@internationalized/date';

declare function parseDateString(date: string, locale: string, timeZone: string): DateValue | undefined;

export { parseDateString };
