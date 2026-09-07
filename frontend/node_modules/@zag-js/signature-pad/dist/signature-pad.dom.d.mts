import { DataUrlOptions } from './signature-pad.types.mjs';
import { Scope } from '@zag-js/core';
import '@zag-js/types';
import 'perfect-freehand';

declare const getRootId: (ctx: Scope) => any;
declare const getControlId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getHiddenInputId: (ctx: Scope) => any;
declare const getControlEl: (ctx: Scope) => HTMLElement | null;
declare const getSegmentEl: (ctx: Scope) => SVGSVGElement | null;
declare const getHiddenInputEl: (ctx: Scope) => HTMLElement | null;
declare const getDataUrl: (ctx: Scope, options: DataUrlOptions) => Promise<string>;

export { getControlEl, getControlId, getDataUrl, getHiddenInputEl, getHiddenInputId, getLabelId, getRootId, getSegmentEl };
