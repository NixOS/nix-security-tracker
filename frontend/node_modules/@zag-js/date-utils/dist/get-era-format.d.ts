import { DateValue } from './types.js';
import '@internationalized/date';

declare function getEraFormat(date: DateValue | undefined): "short" | undefined;

export { getEraFormat };
