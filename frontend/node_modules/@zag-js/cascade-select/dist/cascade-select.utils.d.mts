import { Point } from '@zag-js/rect-utils';

interface GraceAreaOptions {
    padding?: number;
}
declare function createGraceArea(exitPoint: Point, triggerRect: DOMRect, targetRect: DOMRect, options?: GraceAreaOptions): Point[];
declare function isPointerInGraceArea(point: Point, graceArea: Point[]): boolean;

export { type GraceAreaOptions, createGraceArea, isPointerInGraceArea };
