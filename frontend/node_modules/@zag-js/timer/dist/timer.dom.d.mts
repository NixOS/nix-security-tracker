import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getAreaId: (ctx: Scope) => any;
declare const getAreaEl: (ctx: Scope) => HTMLElement | null;

export { getAreaEl, getAreaId, getRootId };
