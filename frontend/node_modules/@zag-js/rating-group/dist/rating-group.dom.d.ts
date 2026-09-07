import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getHiddenInputId: (ctx: Scope) => any;
declare const getControlId: (ctx: Scope) => any;
declare const getItemId: (ctx: Scope, id: string) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getControlEl: (ctx: Scope) => HTMLElement | null;
declare const getRadioEl: (ctx: Scope, value: number) => HTMLElement | null;
declare const getHiddenInputEl: (ctx: Scope) => HTMLInputElement | null;
declare const dispatchChangeEvent: (ctx: Scope, value: number) => void;

export { dispatchChangeEvent, getControlEl, getControlId, getHiddenInputEl, getHiddenInputId, getItemId, getLabelId, getRadioEl, getRootEl, getRootId };
