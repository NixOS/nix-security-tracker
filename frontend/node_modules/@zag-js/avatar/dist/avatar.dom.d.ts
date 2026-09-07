import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getImageId: (ctx: Scope) => any;
declare const getFallbackId: (ctx: Scope) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getImageEl: (ctx: Scope) => HTMLImageElement | null;

export { getFallbackId, getImageEl, getImageId, getRootEl, getRootId };
