import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getThumbId: (ctx: Scope) => any;
declare const getHiddenInputId: (ctx: Scope) => any;
declare const getControlId: (ctx: Scope) => any;
declare const getValueTextId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getHiddenInputEl: (ctx: Scope) => HTMLInputElement | null;
declare const getControlEl: (ctx: Scope) => HTMLElement | null;
declare const getThumbEl: (ctx: Scope) => HTMLElement | null;

export { getControlEl, getControlId, getHiddenInputEl, getHiddenInputId, getLabelId, getRootId, getThumbEl, getThumbId, getValueTextId };
