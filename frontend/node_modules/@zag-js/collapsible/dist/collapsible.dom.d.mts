import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getContentId: (ctx: Scope) => any;
declare const getTriggerId: (ctx: Scope) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getContentEl: (ctx: Scope) => HTMLElement | null;
declare const getTriggerEl: (ctx: Scope) => HTMLElement | null;

export { getContentEl, getContentId, getRootEl, getRootId, getTriggerEl, getTriggerId };
