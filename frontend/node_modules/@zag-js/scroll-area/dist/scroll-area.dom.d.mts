import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getViewportId: (ctx: Scope) => any;
declare const getContentId: (ctx: Scope) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getViewportEl: (ctx: Scope) => HTMLElement | null;
declare const getContentEl: (ctx: Scope) => HTMLElement | null;
declare const getScrollbarXEl: (ctx: Scope) => HTMLElement | null;
declare const getScrollbarYEl: (ctx: Scope) => HTMLElement | null;
declare const getThumbXEl: (ctx: Scope) => HTMLElement | null;
declare const getThumbYEl: (ctx: Scope) => HTMLElement | null;
declare const getCornerEl: (ctx: Scope) => HTMLElement | null;

export { getContentEl, getContentId, getCornerEl, getRootEl, getRootId, getScrollbarXEl, getScrollbarYEl, getThumbXEl, getThumbYEl, getViewportEl, getViewportId };
