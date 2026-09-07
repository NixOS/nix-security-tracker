import { Scope } from '@zag-js/core';

declare const getPositionerId: (ctx: Scope) => any;
declare const getContentId: (ctx: Scope) => any;
declare const getTitleId: (ctx: Scope) => any;
declare const getDescriptionId: (ctx: Scope) => any;
declare const getArrowId: (ctx: Scope) => any;
declare const getBackdropId: (ctx: Scope) => any;
declare const getContentEl: (ctx: Scope) => HTMLElement | null;
declare const getPositionerEl: (ctx: Scope) => HTMLElement | null;
declare const getBackdropEl: (ctx: Scope) => HTMLElement | null;
declare function syncZIndex(scope: Scope): () => void;

export { getArrowId, getBackdropEl, getBackdropId, getContentEl, getContentId, getDescriptionId, getPositionerEl, getPositionerId, getTitleId, syncZIndex };
