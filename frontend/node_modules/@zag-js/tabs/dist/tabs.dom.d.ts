import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getListId: (ctx: Scope) => any;
declare const getContentId: (ctx: Scope, value: string) => any;
declare const getTriggerId: (ctx: Scope, value: string) => any;
declare const getIndicatorId: (ctx: Scope) => any;
declare const getListEl: (ctx: Scope) => HTMLElement | null;
declare const getContentEl: (ctx: Scope, value: string) => HTMLElement | null;
declare const getTriggerEl: (ctx: Scope, value: string | null) => HTMLElement | null;
declare const getIndicatorEl: (ctx: Scope) => HTMLElement | null;
declare const getElements: (ctx: Scope) => HTMLElement[];
declare const getFirstTriggerEl: (ctx: Scope) => HTMLElement | undefined;
declare const getLastTriggerEl: (ctx: Scope) => HTMLElement | undefined;
declare const getNextTriggerEl: (ctx: Scope, opts: {
    value: string;
    loopFocus?: boolean | undefined;
}) => HTMLElement;
declare const getPrevTriggerEl: (ctx: Scope, opts: {
    value: string;
    loopFocus?: boolean | undefined;
}) => HTMLElement | null;
declare const getOffsetRect: (el: HTMLElement | undefined) => {
    x: number;
    y: number;
    width: number;
    height: number;
};
declare const getRectByValue: (ctx: Scope, value: string) => {
    x: number;
    y: number;
    width: number;
    height: number;
};

export { getContentEl, getContentId, getElements, getFirstTriggerEl, getIndicatorEl, getIndicatorId, getLastTriggerEl, getListEl, getListId, getNextTriggerEl, getOffsetRect, getPrevTriggerEl, getRectByValue, getRootId, getTriggerEl, getTriggerId };
