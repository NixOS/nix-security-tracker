interface Point {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}
interface Rect extends Point, Size {
}
declare function getCenterRect(size: Size): {
    x: number;
    y: number;
    width: number;
    height: number;
};
declare function isEventInRect(rect: Rect, event: PointerEvent): boolean;
declare function offset(r: Rect, i: Point): Rect;

export { type Point, type Rect, type Size, getCenterRect, isEventInRect, offset };
