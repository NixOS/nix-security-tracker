import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getControlId: (ctx: Scope) => any;
declare const getHiddenInputId: (ctx: Scope) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getHiddenInputEl: (ctx: Scope) => HTMLInputElement | null;

export { getControlId, getHiddenInputEl, getHiddenInputId, getLabelId, getRootEl, getRootId };
