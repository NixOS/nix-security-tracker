import { Point } from './types.mjs';

declare class AffineTransform {
    m00: number;
    m01: number;
    m02: number;
    m10: number;
    m11: number;
    m12: number;
    constructor([m00, m01, m02, m10, m11, m12]?: Iterable<number>);
    applyTo(point: Point): Point;
    prepend(other: AffineTransform): AffineTransform;
    append(other: AffineTransform): AffineTransform;
    get determinant(): number;
    get isInvertible(): boolean;
    invert(): AffineTransform;
    get array(): number[];
    get float32Array(): Float32Array;
    static get identity(): AffineTransform;
    static rotate(theta: number, origin?: Point): AffineTransform;
    rotate: (typeof AffineTransform)["rotate"];
    static scale(sx: number, sy?: number, origin?: Point): AffineTransform;
    scale: (typeof AffineTransform)["scale"];
    static translate(tx: number, ty: number): AffineTransform;
    translate: (typeof AffineTransform)["translate"];
    static multiply(...[first, ...rest]: AffineTransform[]): AffineTransform;
    get a(): number;
    get b(): number;
    get c(): number;
    get d(): number;
    get tx(): number;
    get ty(): number;
    get scaleComponents(): Point;
    get translationComponents(): Point;
    get skewComponents(): Point;
    toString(): string;
}

export { AffineTransform };
