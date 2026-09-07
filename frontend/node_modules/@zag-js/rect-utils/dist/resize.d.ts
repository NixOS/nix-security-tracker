import { CompassDirection } from './compass.js';
import { Rect, Point, ScalingOptions, RectInit } from './types.js';

declare function resizeRect(rect: Rect, offset: Point, direction: CompassDirection, opts: ScalingOptions): RectInit;

export { resizeRect };
