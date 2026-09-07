import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getItemId: (ctx: Scope, index: number) => any;
declare const getItemGroupId: (ctx: Scope) => any;
declare const getNextTriggerId: (ctx: Scope) => any;
declare const getPrevTriggerId: (ctx: Scope) => any;
declare const getIndicatorGroupId: (ctx: Scope) => any;
declare const getIndicatorId: (ctx: Scope, index: number) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getItemGroupEl: (ctx: Scope) => HTMLElement | null;
declare const getItemEl: (ctx: Scope, index: number) => HTMLElement | null;
declare const getItemEls: (ctx: Scope) => HTMLElement[];
declare const getIndicatorEl: (ctx: Scope, page: number) => HTMLElement | null;
declare const syncTabIndex: (ctx: Scope) => void;

export { getIndicatorEl, getIndicatorGroupId, getIndicatorId, getItemEl, getItemEls, getItemGroupEl, getItemGroupId, getItemId, getNextTriggerId, getPrevTriggerId, getRootEl, getRootId, syncTabIndex };
