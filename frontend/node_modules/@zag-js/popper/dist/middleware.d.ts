import { Middleware } from '@floating-ui/dom';

declare const cssVars: {
    arrowSize: {
        variable: string;
        reference: string;
    };
    arrowSizeHalf: {
        variable: string;
        reference: string;
    };
    arrowBg: {
        variable: string;
        reference: string;
    };
    transformOrigin: {
        variable: string;
        reference: string;
    };
    arrowOffset: {
        variable: string;
        reference: string;
    };
};
declare function createTransformOriginMiddleware(opts: {
    gutter?: number | undefined;
    offset?: {
        mainAxis?: number | undefined;
    } | undefined;
    overlap?: boolean | undefined;
}, arrowEl: HTMLElement | null): Middleware;
declare const rectMiddleware: Middleware;
declare const shiftArrowMiddleware: (arrowEl: HTMLElement | null) => Middleware | undefined;

export { createTransformOriginMiddleware, cssVars, rectMiddleware, shiftArrowMiddleware };
