import { Rect, Point } from './types.mjs';

declare function containsPoint(r: Rect, p: Point): boolean;
declare function containsRect(a: Rect, b: Rect): boolean;
declare function contains(r: Rect, v: Rect | Point): boolean;

export { contains, containsPoint, containsRect };
