import { Point, RectInit } from './types.js';

declare function getElementPolygon(rectValue: RectInit, placement: string): {
    x: number;
    y: number;
}[] | undefined;
declare function isPointInPolygon(polygon: Point[], point: Point): boolean;
declare function debugPolygon(polygon: Point[]): () => void;

export { debugPolygon, getElementPolygon, isPointInPolygon };
