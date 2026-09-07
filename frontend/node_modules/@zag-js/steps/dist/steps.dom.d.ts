import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getListId: (ctx: Scope) => any;
declare const getTriggerId: (ctx: Scope, index: number) => any;
declare const getContentId: (ctx: Scope, index: number) => any;

export { getContentId, getListId, getRootId, getTriggerId };
