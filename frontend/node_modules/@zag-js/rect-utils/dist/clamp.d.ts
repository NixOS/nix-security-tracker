import { Point, Size, RectInit } from './types.js';

declare const clampPoint: (position: Point, size: Size, boundaryRect: RectInit) => {
    x: number;
    y: number;
};
declare const clampSize: (size: Size, minSize?: Size, maxSize?: Size) => {
    width: number;
    height: number;
};

export { clampPoint, clampSize };
