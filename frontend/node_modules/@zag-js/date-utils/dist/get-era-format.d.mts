import { DateValue } from './types.mjs';
import '@internationalized/date';

declare function getEraFormat(date: DateValue | undefined): "short" | undefined;

export { getEraFormat };
