import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getTriggerId: (ctx: Scope, value: string) => any;
declare const getTriggerProxyId: (ctx: Scope, value: string) => any;
declare const getContentId: (ctx: Scope, value: string) => any;
declare const getViewportId: (ctx: Scope) => any;
declare const getListId: (ctx: Scope) => any;
declare const getItemId: (ctx: Scope, value: string) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getViewportEl: (ctx: Scope) => HTMLElement | null;
declare const getTriggerEl: (ctx: Scope, value: string | null) => HTMLElement | null;
declare const getTriggerProxyEl: (ctx: Scope, value: string | null) => HTMLElement | null;
declare const getListEl: (ctx: Scope) => HTMLElement | null;
declare const getContentEl: (ctx: Scope, value: string | null) => HTMLElement | null;
declare const getContentEls: (ctx: Scope) => HTMLElement[];
declare const getTabbableEls: (ctx: Scope, value: string) => HTMLElement[];
declare const getTriggerEls: (ctx: Scope) => HTMLElement[];
declare const getLinkEls: (ctx: Scope, value: string) => HTMLElement[];
declare const getElements: (ctx: Scope) => HTMLElement[];
declare function trackResizeObserver(element: Array<HTMLElement | null>, onResize: () => void): (() => void) | undefined;
declare function setMotionAttr(scope: Scope, value: string | null, previousValue: string | null): void;
declare function focusFirst(scope: Scope, candidates: HTMLElement[]): boolean;
declare function removeFromTabOrder(candidates: HTMLElement[]): () => void;

export { focusFirst, getContentEl, getContentEls, getContentId, getElements, getItemId, getLinkEls, getListEl, getListId, getRootEl, getRootId, getTabbableEls, getTriggerEl, getTriggerEls, getTriggerId, getTriggerProxyEl, getTriggerProxyId, getViewportEl, getViewportId, removeFromTabOrder, setMotionAttr, trackResizeObserver };
