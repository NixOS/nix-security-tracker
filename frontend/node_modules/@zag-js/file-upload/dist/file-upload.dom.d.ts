import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getDropzoneId: (ctx: Scope) => any;
declare const getHiddenInputId: (ctx: Scope) => any;
declare const getTriggerId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getItemId: (ctx: Scope, id: string) => any;
declare const getItemNameId: (ctx: Scope, id: string) => any;
declare const getItemSizeTextId: (ctx: Scope, id: string) => any;
declare const getItemPreviewId: (ctx: Scope, id: string) => any;
declare const getItemDeleteTriggerId: (ctx: Scope, id: string) => any;
declare const getFileId: (file: File) => string;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getHiddenInputEl: (ctx: Scope) => HTMLInputElement | null;
declare const getDropzoneEl: (ctx: Scope) => HTMLElement | null;

export { getDropzoneEl, getDropzoneId, getFileId, getHiddenInputEl, getHiddenInputId, getItemDeleteTriggerId, getItemId, getItemNameId, getItemPreviewId, getItemSizeTextId, getLabelId, getRootEl, getRootId, getTriggerId };
