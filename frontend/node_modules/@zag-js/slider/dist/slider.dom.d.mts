import { Scope, Params } from '@zag-js/core';
import { Point } from '@zag-js/types';
import { SliderSchema } from './slider.types.mjs';

declare const getRootId: (ctx: Scope) => any;
declare const getThumbId: (ctx: Scope, index: number) => any;
declare const getHiddenInputId: (ctx: Scope, index: number) => any;
declare const getControlId: (ctx: Scope) => any;
declare const getTrackId: (ctx: Scope) => any;
declare const getRangeId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getValueTextId: (ctx: Scope) => any;
declare const getMarkerId: (ctx: Scope, value: number) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getThumbEl: (ctx: Scope, index: number) => HTMLElement | null;
declare const getThumbEls: (ctx: Scope) => HTMLElement[];
declare const getFirstThumbEl: (ctx: Scope) => HTMLElement;
declare const getHiddenInputEl: (ctx: Scope, index: number) => HTMLInputElement | null;
declare const getControlEl: (ctx: Scope) => HTMLElement | null;
declare const getRangeEl: (ctx: Scope) => HTMLElement | null;
declare const getPointValue: (params: Params<SliderSchema>, point: Point) => number | undefined;
declare const dispatchChangeEvent: (ctx: Scope, value: number[]) => void;
declare const getOffsetRect: (el: HTMLElement | undefined) => {
    left: number;
    top: number;
    width: number;
    height: number;
};

export { dispatchChangeEvent, getControlEl, getControlId, getFirstThumbEl, getHiddenInputEl, getHiddenInputId, getLabelId, getMarkerId, getOffsetRect, getPointValue, getRangeEl, getRangeId, getRootEl, getRootId, getThumbEl, getThumbEls, getThumbId, getTrackId, getValueTextId };
