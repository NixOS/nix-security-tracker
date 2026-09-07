interface Point {
    x: number;
    y: number;
}
interface Size {
    width: number;
    height: number;
}
interface Bounds {
    minX: number;
    midX: number;
    maxX: number;
    minY: number;
    midY: number;
    maxY: number;
}
interface CenterPoint {
    center: Point;
}
interface RectInit extends Point, Size {
}
interface Rect extends Point, Size, Bounds, CenterPoint {
}
type RectSide = "top" | "right" | "bottom" | "left";
type RectPoint = "top-left" | "top-center" | "top-right" | "right-center" | "left-center" | "bottom-left" | "bottom-right" | "bottom-center" | "center";
type RectEdge = [Point, Point];
type RectPoints = [Point, Point, Point, Point];
type RectEdges = Record<RectSide, RectEdge> & {
    value: RectEdge[];
};
type RectCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
type RectCorners = Record<RectCorner, Point> & {
    value: RectPoints;
};
type RectCenter = "topCenter" | "rightCenter" | "leftCenter" | "bottomCenter";
type RectCenters = Record<RectCenter, Point> & {
    value: RectPoints;
};
type RectInset = Partial<Record<RectSide, number>>;
interface SymmetricRectInset {
    dx?: number | undefined;
    dy?: number | undefined;
}
interface ScalingOptions {
    scalingOriginMode: "center" | "extent";
    lockAspectRatio: boolean;
}
interface AlignOptions {
    h: HAlign;
    v: VAlign;
}
type HAlign = "left-inside" | "left-outside" | "center" | "right-inside" | "right-outside";
type VAlign = "top-inside" | "top-outside" | "center" | "bottom-inside" | "bottom-outside";

export type { AlignOptions, Bounds, CenterPoint, HAlign, Point, Rect, RectCenter, RectCenters, RectCorner, RectCorners, RectEdge, RectEdges, RectInit, RectInset, RectPoint, RectPoints, RectSide, ScalingOptions, Size, SymmetricRectInset, VAlign };
