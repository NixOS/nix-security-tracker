import { Params } from '@zag-js/core';
import { Style } from '@zag-js/types';
import { SliderSchema } from './slider.types.js';

type Ctx = Params<SliderSchema>;
declare function getRangeOffsets(params: Pick<Ctx, "prop" | "computed">): {
    start: string;
    end: string;
};
declare function getRangeStyle(params: Pick<Ctx, "computed">): Style;
declare function getThumbOffset(params: Pick<Ctx, "computed" | "context" | "prop">, value: number): string;
declare function getVisibility(params: Pick<Ctx, "computed" | "prop">): "hidden" | "visible";
declare function getThumbStyle(params: Pick<Ctx, "computed" | "context" | "prop">, index: number): Style;
declare function getControlStyle(): Style;
declare function getRootStyle(params: Pick<Ctx, "context" | "computed" | "prop">): Style;
declare function getMarkerStyle(params: Pick<Ctx, "computed" | "context" | "prop">, value: number): Style;
declare function getMarkerGroupStyle(): Style;

export { getControlStyle, getMarkerGroupStyle, getMarkerStyle, getRangeOffsets, getRangeStyle, getRootStyle, getThumbOffset, getThumbStyle, getVisibility };
