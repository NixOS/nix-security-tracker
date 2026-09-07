import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getContentId: (ctx: Scope) => any;
declare const getTriggerId: (ctx: Scope) => any;
declare const getClearTriggerId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getControlId: (ctx: Scope) => any;
declare const getItemId: (ctx: Scope, id: string | number) => any;
declare const getHiddenSelectId: (ctx: Scope) => any;
declare const getPositionerId: (ctx: Scope) => any;
declare const getItemGroupId: (ctx: Scope, id: string | number) => any;
declare const getItemGroupLabelId: (ctx: Scope, id: string | number) => any;
declare const getHiddenSelectEl: (ctx: Scope) => HTMLSelectElement | null;
declare const getContentEl: (ctx: Scope) => HTMLElement | null;
declare const getControlEl: (ctx: Scope) => HTMLElement | null;
declare const getTriggerEl: (ctx: Scope) => HTMLElement | null;
declare const getClearTriggerEl: (ctx: Scope) => HTMLElement | null;
declare const getPositionerEl: (ctx: Scope) => HTMLElement | null;
declare const getItemEl: (ctx: Scope, id: string | number | null) => HTMLElement | null;

export { getClearTriggerEl, getClearTriggerId, getContentEl, getContentId, getControlEl, getControlId, getHiddenSelectEl, getHiddenSelectId, getItemEl, getItemGroupId, getItemGroupLabelId, getItemId, getLabelId, getPositionerEl, getPositionerId, getRootId, getTriggerEl, getTriggerId };
