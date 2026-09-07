import { Point, RectInit, Rect, RectEdge } from './types.js';

declare const createPoint: (x: number, y: number) => {
    x: number;
    y: number;
};
declare const subtractPoints: (a: Point, b: Point | null) => Point;
declare const addPoints: (a: Point, b: Point) => {
    x: number;
    y: number;
};
declare function isPoint(v: any): v is Point;
declare function createRect(r: RectInit): Rect;
declare function isRect(v: any): v is Rect;
declare function getRectCenters(v: Rect): {
    top: {
        x: number;
        y: number;
    };
    right: {
        x: number;
        y: number;
    };
    bottom: {
        x: number;
        y: number;
    };
    left: {
        x: number;
        y: number;
    };
};
declare function getRectCorners(v: Rect): {
    top: {
        x: number;
        y: number;
    };
    right: {
        x: number;
        y: number;
    };
    bottom: {
        x: number;
        y: number;
    };
    left: {
        x: number;
        y: number;
    };
};
declare function getRectEdges(v: Rect): {
    top: RectEdge;
    right: RectEdge;
    bottom: RectEdge;
    left: RectEdge;
};

export { addPoints, createPoint, createRect, getRectCenters, getRectCorners, getRectEdges, isPoint, isRect, subtractPoints };
