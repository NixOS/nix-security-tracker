import { ColorType } from './types.mjs';

declare const parseColor: (value: string) => ColorType;
declare const normalizeColor: (v: string | ColorType) => ColorType;

export { normalizeColor, parseColor };
