import { Rect, RectSide } from './types.mjs';

/**
 * Checks if a Rect intersects another Rect
 */
declare function intersects(a: Rect, b: Rect): boolean;
/**
 * Returns a new Rect that represents the intersection between two Rects
 */
declare function intersection(a: Rect, b: Rect): Rect;
/**
 * Returns whether two rects collide along each edge
 */
declare function collisions(a: Rect, b: Rect): Record<RectSide, boolean>;

export { collisions, intersection, intersects };
