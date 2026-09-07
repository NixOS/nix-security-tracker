import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getContentId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getItemId: (ctx: Scope, id: string | number) => any;
declare const getItemGroupId: (ctx: Scope, id: string | number) => any;
declare const getItemGroupLabelId: (ctx: Scope, id: string | number) => any;
declare const getContentEl: (ctx: Scope) => HTMLElement | null;
declare const getItemEl: (ctx: Scope, id: string | number) => HTMLElement | null;

export { getContentEl, getContentId, getItemEl, getItemGroupId, getItemGroupLabelId, getItemId, getLabelId, getRootId };
