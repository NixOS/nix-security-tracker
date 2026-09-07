import { Scope } from '@zag-js/core';

declare const dom: {
    getRootId: (ctx: Scope) => any;
    getViewportId: (ctx: Scope) => any;
    getContentId: (ctx: Scope, index: number) => any;
    getRootEl: (ctx: Scope) => HTMLElement | null;
    getViewportEl: (ctx: Scope) => HTMLElement | null;
    getContentEl: (ctx: Scope, index: number) => HTMLElement | null;
};

export { dom };
