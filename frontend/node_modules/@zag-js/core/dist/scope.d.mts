import { isActiveElement } from '@zag-js/dom-query';
import { Scope } from './types.mjs';

declare function createScope(props: Pick<Scope, "id" | "ids" | "getRootNode">): {
    getRootNode: () => Document | ShadowRoot;
    getDoc: () => Document;
    getWin: () => Window & typeof globalThis;
    getActiveElement: () => HTMLElement | null;
    isActiveElement: typeof isActiveElement;
    getById: <T extends Element = HTMLElement>(id: string) => T | null;
    id?: string | undefined | undefined;
    ids?: Record<string, any> | undefined;
};

export { createScope };
