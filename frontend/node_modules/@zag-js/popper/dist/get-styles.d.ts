import { Placement } from '@floating-ui/dom';
import { cssVars } from './middleware.js';
import { PositioningOptions } from './types.js';

interface GetPlacementStylesOptions {
    placement?: Placement | undefined;
}
declare function getPlacementStyles(options?: Pick<PositioningOptions, "placement" | "sameWidth" | "fitViewport" | "strategy">): {
    arrow: {
        readonly [cssVars.arrowSizeHalf.variable]: `calc(${string} / 2)`;
        readonly [cssVars.arrowOffset.variable]: `calc(${string} * -1)`;
        readonly position: "absolute";
        readonly width: string;
        readonly height: string;
    };
    arrowTip: {
        readonly transform: any;
        readonly background: string;
        readonly top: "0";
        readonly left: "0";
        readonly width: "100%";
        readonly height: "100%";
        readonly position: "absolute";
        readonly zIndex: "inherit";
    };
    floating: {
        readonly position: "absolute" | "fixed";
        readonly isolation: "isolate";
        readonly minWidth: "max-content" | undefined;
        readonly width: "var(--reference-width)" | undefined;
        readonly maxWidth: "var(--available-width)" | undefined;
        readonly maxHeight: "var(--available-height)" | undefined;
        readonly pointerEvents: "none" | undefined;
        readonly top: "0px";
        readonly left: "0px";
        readonly transform: "translate3d(var(--x), var(--y), 0)" | "translate3d(0, -100vh, 0)";
        readonly zIndex: "var(--z-index)";
    };
};

export { type GetPlacementStylesOptions, getPlacementStyles };
