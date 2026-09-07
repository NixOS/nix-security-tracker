import { Rect, Point } from './types.js';

declare function toRad(d: number): number;
declare function rotate(a: Point, d: number, c: Point): Point;
declare function getRotationRect(r: Rect, deg: number): Rect;

export { getRotationRect, rotate, toRad };
