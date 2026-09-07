import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getInputId: (ctx: Scope) => any;
declare const getInputEl: (ctx: Scope) => HTMLInputElement | null;

export { getInputEl, getInputId, getRootId };
