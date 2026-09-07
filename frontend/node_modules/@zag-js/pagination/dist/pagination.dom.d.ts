import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getFirstTriggerId: (ctx: Scope) => any;
declare const getPrevTriggerId: (ctx: Scope) => any;
declare const getNextTriggerId: (ctx: Scope) => any;
declare const getLastTriggerId: (ctx: Scope) => any;
declare const getEllipsisId: (ctx: Scope, index: number) => any;
declare const getItemId: (ctx: Scope, page: number) => any;

export { getEllipsisId, getFirstTriggerId, getItemId, getLastTriggerId, getNextTriggerId, getPrevTriggerId, getRootId };
