import { Point, RectInit, Size } from './types.js';

declare const isSizeEqual: (a: Size, b: Size | undefined) => boolean;
declare const isPointEqual: (a: Point, b: Point | undefined) => boolean;
declare const isRectEqual: (a: RectInit, b: RectInit | undefined) => boolean;

export { isPointEqual, isRectEqual, isSizeEqual };
