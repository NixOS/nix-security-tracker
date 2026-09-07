import { Point } from './types.mjs';

type CompassDirection = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";
declare const compassDirectionMap: Record<CompassDirection, Point>;
declare const oppositeDirectionMap: Record<CompassDirection, CompassDirection>;

export { type CompassDirection, compassDirectionMap, oppositeDirectionMap };
