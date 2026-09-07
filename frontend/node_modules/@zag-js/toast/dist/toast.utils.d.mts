import { Service } from '@zag-js/core';
import { Style } from '@zag-js/types';
import { Type, ToastSchema, ToastGroupService, Placement } from './toast.types.mjs';
import '@zag-js/dom-query';

declare const defaultTimeouts: Record<Type, number>;
declare function getToastDuration(duration: number | undefined, type: Type): number;
declare function getGroupPlacementStyle(service: ToastGroupService, placement: Placement): Style;
declare function getPlacementStyle(service: Service<ToastSchema>, visible: boolean): Style;
declare function getGhostBeforeStyle(service: Service<ToastSchema>, visible: boolean): Style;
declare function getGhostAfterStyle(): Style;

export { defaultTimeouts, getGhostAfterStyle, getGhostBeforeStyle, getGroupPlacementStyle, getPlacementStyle, getToastDuration };
