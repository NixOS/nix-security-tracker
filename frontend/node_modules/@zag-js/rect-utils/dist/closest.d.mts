import { Point, Rect, RectSide } from './types.mjs';

declare function closest(...pts: Point[]): (a: Point) => Point;
declare function closestSideToRect(ref: Rect, r: Rect): RectSide;
declare function closestSideToPoint(ref: Rect, p: Point): RectSide;

export { closest, closestSideToPoint, closestSideToRect };
