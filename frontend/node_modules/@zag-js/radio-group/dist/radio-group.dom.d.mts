import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getItemId: (ctx: Scope, value: string) => any;
declare const getItemHiddenInputId: (ctx: Scope, value: string) => any;
declare const getItemControlId: (ctx: Scope, value: string) => any;
declare const getItemLabelId: (ctx: Scope, value: string) => any;
declare const getIndicatorId: (ctx: Scope) => any;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getItemHiddenInputEl: (ctx: Scope, value: string) => HTMLInputElement | null;
declare const getIndicatorEl: (ctx: Scope) => HTMLElement | null;
declare const getFirstEnabledInputEl: (ctx: Scope) => HTMLInputElement | null | undefined;
declare const getFirstEnabledAndCheckedInputEl: (ctx: Scope) => HTMLInputElement | null | undefined;
declare const getInputEls: (ctx: Scope) => HTMLInputElement[];
declare const getRadioEl: (ctx: Scope, value: string | null) => HTMLElement | null | undefined;
declare const getOffsetRect: (el: HTMLElement | undefined) => {
    x: number;
    y: number;
    width: number;
    height: number;
};
declare const getRectById: (ctx: Scope, id: string) => {
    x: number;
    y: number;
    width: number;
    height: number;
} | undefined;

export { getFirstEnabledAndCheckedInputEl, getFirstEnabledInputEl, getIndicatorEl, getIndicatorId, getInputEls, getItemControlId, getItemHiddenInputEl, getItemHiddenInputId, getItemId, getItemLabelId, getLabelId, getOffsetRect, getRadioEl, getRectById, getRootEl, getRootId };
