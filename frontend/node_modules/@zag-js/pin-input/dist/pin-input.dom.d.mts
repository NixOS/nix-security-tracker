import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getInputId: (ctx: Scope, id: string) => any;
declare const getHiddenInputId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getControlId: (ctx: Scope) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getInputEls: (ctx: Scope) => HTMLInputElement[];
declare const getInputEl: (ctx: Scope, id: string) => HTMLInputElement | null;
declare const getInputElAtIndex: (ctx: Scope, index: number) => HTMLInputElement;
declare const getFirstInputEl: (ctx: Scope) => HTMLInputElement;
declare const getHiddenInputEl: (ctx: Scope) => HTMLInputElement | null;
declare const setInputValue: (inputEl: HTMLInputElement, value: string) => void;

export { getControlId, getFirstInputEl, getHiddenInputEl, getHiddenInputId, getInputEl, getInputElAtIndex, getInputEls, getInputId, getLabelId, getRootEl, getRootId, setInputValue };
