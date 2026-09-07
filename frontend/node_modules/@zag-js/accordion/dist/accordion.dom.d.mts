import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getItemId: (ctx: Scope, value: string) => any;
declare const getItemContentId: (ctx: Scope, value: string) => any;
declare const getItemTriggerId: (ctx: Scope, value: string) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getTriggerEls: (ctx: Scope) => HTMLElement[];
declare const getFirstTriggerEl: (ctx: Scope) => HTMLElement | undefined;
declare const getLastTriggerEl: (ctx: Scope) => HTMLElement | undefined;
declare const getNextTriggerEl: (ctx: Scope, id: string) => HTMLElement;
declare const getPrevTriggerEl: (ctx: Scope, id: string) => HTMLElement | null;

export { getFirstTriggerEl, getItemContentId, getItemId, getItemTriggerId, getLastTriggerEl, getNextTriggerEl, getPrevTriggerEl, getRootEl, getRootId, getTriggerEls };
