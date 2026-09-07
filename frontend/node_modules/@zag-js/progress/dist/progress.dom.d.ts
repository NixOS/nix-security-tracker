import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getTrackId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getCircleId: (ctx: Scope) => any;

export { getCircleId, getLabelId, getRootId, getTrackId };
