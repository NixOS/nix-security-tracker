import { Scope } from '@zag-js/core';
import { Placement } from './toast.types.js';
import '@zag-js/types';
import '@zag-js/dom-query';

declare const getRegionId: (placement: Placement) => string;
declare const getRegionEl: (ctx: Scope, placement: Placement) => HTMLElement | null;
declare const getRootId: (ctx: Scope) => string;
declare const getRootEl: (ctx: Scope) => HTMLElement | null;
declare const getTitleId: (ctx: Scope) => string;
declare const getDescriptionId: (ctx: Scope) => string;
declare const getCloseTriggerId: (ctx: Scope) => string;

export { getCloseTriggerId, getDescriptionId, getRegionEl, getRegionId, getRootEl, getRootId, getTitleId };
