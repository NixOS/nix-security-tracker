import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getInputId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getInputEl: (ctx: Scope) => HTMLInputElement | null;
declare const writeToClipboard: (ctx: Scope, value: string) => Promise<void>;

export { getInputEl, getInputId, getLabelId, getRootId, writeToClipboard };
