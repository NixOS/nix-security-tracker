import * as _zag_js_dom_query_src_types from '@zag-js/dom-query/src/types';
import * as _zag_js_dom_query from '@zag-js/dom-query';
import { Scope } from '@zag-js/core';

declare const dom: {
    getRootNode: (ctx: _zag_js_dom_query.ScopeContext) => Document | ShadowRoot;
    getDoc: (ctx: _zag_js_dom_query.ScopeContext) => Document;
    getWin: (ctx: _zag_js_dom_query.ScopeContext) => Window & typeof globalThis;
    getActiveElement: (ctx: _zag_js_dom_query.ScopeContext) => HTMLElement | null;
    isActiveElement: typeof _zag_js_dom_query.isActiveElement;
    getById: <T extends Element = HTMLElement>(ctx: _zag_js_dom_query.ScopeContext, id: string) => T | null;
    setValue: <T extends _zag_js_dom_query_src_types.HTMLElementWithValue>(elem: T | null, value: string | number | null | undefined) => void;
} & {
    getRootId: (ctx: Scope) => any;
    getLabelId: (ctx: Scope) => any;
    getControlId: (ctx: Scope) => any;
    getTriggerId: (ctx: Scope) => any;
    getIndicatorId: (ctx: Scope) => any;
    getClearTriggerId: (ctx: Scope) => any;
    getPositionerId: (ctx: Scope) => any;
    getContentId: (ctx: Scope) => any;
    getHiddenInputId: (ctx: Scope) => any;
    getListId: (ctx: Scope, value: string) => any;
    getItemId: (ctx: Scope, value: string) => any;
    getRootEl: (ctx: Scope) => HTMLElement | null;
    getLabelEl: (ctx: Scope) => HTMLElement | null;
    getControlEl: (ctx: Scope) => HTMLElement | null;
    getTriggerEl: (ctx: Scope) => HTMLElement | null;
    getIndicatorEl: (ctx: Scope) => HTMLElement | null;
    getClearTriggerEl: (ctx: Scope) => HTMLElement | null;
    getPositionerEl: (ctx: Scope) => HTMLElement | null;
    getContentEl: (ctx: Scope) => HTMLElement | null;
    getHiddenInputEl: (ctx: Scope) => HTMLInputElement | null;
    getListEl: (ctx: Scope, value: string) => HTMLElement | null;
    getListEls: (ctx: Scope) => HTMLElement[];
    getItemEl: (ctx: Scope, value: string) => HTMLElement | null;
    dispatchInputEvent: (ctx: Scope, value: string) => void;
};
type DomScope = typeof dom;

export { type DomScope, dom };
