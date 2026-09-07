import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getItemId: (ctx: Scope, value: string) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getElements: (ctx: Scope) => HTMLElement[];
declare const getFirstEl: (ctx: Scope) => HTMLElement | undefined;
declare const getLastEl: (ctx: Scope) => HTMLElement | undefined;
declare const getNextEl: (ctx: Scope, id: string, loopFocus: boolean) => HTMLElement;
declare const getPrevEl: (ctx: Scope, id: string, loopFocus: boolean) => HTMLElement | null;

export { getElements, getFirstEl, getItemId, getLastEl, getNextEl, getPrevEl, getRootEl, getRootId };
