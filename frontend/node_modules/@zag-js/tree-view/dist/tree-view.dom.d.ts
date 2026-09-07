import { Scope } from '@zag-js/core';

declare const getRootId: (ctx: Scope) => any;
declare const getLabelId: (ctx: Scope) => any;
declare const getNodeId: (ctx: Scope, value: string) => any;
declare const getTreeId: (ctx: Scope) => any;
declare const getTreeEl: (ctx: Scope) => HTMLElement | null;
declare const focusNode: (ctx: Scope, value: string | null | undefined) => void;
declare const getRenameInputId: (ctx: Scope, value: string) => string;
declare const getRenameInputEl: (ctx: Scope, value: string) => HTMLInputElement | null;

export { focusNode, getLabelId, getNodeId, getRenameInputEl, getRenameInputId, getRootId, getTreeEl, getTreeId };
