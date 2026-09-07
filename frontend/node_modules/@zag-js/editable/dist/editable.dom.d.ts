import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getAreaId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getPreviewId: (ctx: Scope) => any;
declare const getInputId: (ctx: Scope) => any;
declare const getControlId: (ctx: Scope) => any;
declare const getSubmitTriggerId: (ctx: Scope) => any;
declare const getCancelTriggerId: (ctx: Scope) => any;
declare const getEditTriggerId: (ctx: Scope) => any;
declare const getInputEl: (ctx: Scope) => HTMLInputElement | null;
declare const getPreviewEl: (ctx: Scope) => HTMLInputElement | null;
declare const getSubmitTriggerEl: (ctx: Scope) => HTMLButtonElement | null;
declare const getCancelTriggerEl: (ctx: Scope) => HTMLButtonElement | null;
declare const getEditTriggerEl: (ctx: Scope) => HTMLButtonElement | null;

export { getAreaId, getCancelTriggerEl, getCancelTriggerId, getControlId, getEditTriggerEl, getEditTriggerId, getInputEl, getInputId, getLabelId, getPreviewEl, getPreviewId, getRootId, getSubmitTriggerEl, getSubmitTriggerId };
