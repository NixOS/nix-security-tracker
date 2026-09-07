import { Scope } from '@zag-js/core';
import { Point } from '@zag-js/types';
import { HintValue } from './number-input.types.mjs';
import '@internationalized/number';

declare const getRootId: (ctx: Scope) => any;
declare const getInputId: (ctx: Scope) => any;
declare const getIncrementTriggerId: (ctx: Scope) => any;
declare const getDecrementTriggerId: (ctx: Scope) => any;
declare const getScrubberId: (ctx: Scope) => any;
declare const getCursorId: (ctx: Scope) => string;
declare const getLabelId: (ctx: Scope) => any;
declare const getInputEl: (ctx: Scope) => HTMLInputElement | null;
declare const getIncrementTriggerEl: (ctx: Scope) => HTMLButtonElement | null;
declare const getDecrementTriggerEl: (ctx: Scope) => HTMLButtonElement | null;
declare const getScrubberEl: (ctx: Scope) => HTMLElement | null;
declare const getCursorEl: (ctx: Scope) => HTMLElement | null;
declare const getPressedTriggerEl: (ctx: Scope, hint: HintValue | null) => HTMLButtonElement | null;
declare const setupVirtualCursor: (ctx: Scope, point: Point | null) => (() => void) | undefined;
declare const preventTextSelection: (ctx: Scope) => () => void;
declare const getMousemoveValue: (ctx: Scope, opts: {
    point: Point | null;
    isRtl: boolean;
    event: MouseEvent;
}) => {
    hint: string | null;
    point: {
        x: number;
        y: number;
    };
};
declare const createVirtualCursor: (ctx: Scope, point: Point | null) => void;

export { createVirtualCursor, getCursorEl, getCursorId, getDecrementTriggerEl, getDecrementTriggerId, getIncrementTriggerEl, getIncrementTriggerId, getInputEl, getInputId, getLabelId, getMousemoveValue, getPressedTriggerEl, getRootId, getScrubberEl, getScrubberId, preventTextSelection, setupVirtualCursor };
