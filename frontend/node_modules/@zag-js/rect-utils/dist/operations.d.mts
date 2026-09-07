import { Rect, SymmetricRectInset, RectInset, Point } from './types.mjs';

declare const isSymmetric: (v: any) => v is SymmetricRectInset;
declare function inset(r: Rect, i: RectInset | SymmetricRectInset): Rect;
declare function expand(r: Rect, v: number | SymmetricRectInset): Rect;
declare function shrink(r: Rect, v: number | SymmetricRectInset): Rect;
declare function shift(r: Rect, o: Partial<Point>): Rect;

export { expand, inset, isSymmetric, shift, shrink };
