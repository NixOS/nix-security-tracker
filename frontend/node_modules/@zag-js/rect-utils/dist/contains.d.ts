import { Rect, Point } from './types.js';

declare function containsPoint(r: Rect, p: Point): boolean;
declare function containsRect(a: Rect, b: Rect): boolean;
declare function contains(r: Rect, v: Rect | Point): boolean;

export { contains, containsPoint, containsRect };
