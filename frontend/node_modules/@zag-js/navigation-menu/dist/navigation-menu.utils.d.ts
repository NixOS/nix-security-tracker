import { BindableRefs, BindableContext, PropFn } from '@zag-js/core';
import { NavigationMenuSchema } from './navigation-menu.types.js';
import '@zag-js/types';

declare function setCloseTimeout(refs: BindableRefs<NavigationMenuSchema>, context: BindableContext<NavigationMenuSchema>, prop: PropFn<NavigationMenuSchema>): void;
declare function clearCloseTimeout(refs: BindableRefs<NavigationMenuSchema>): void;
declare function setOpenTimeout(refs: BindableRefs<NavigationMenuSchema>, value: string, timeoutId: number): void;
declare function clearOpenTimeout(refs: BindableRefs<NavigationMenuSchema>, value: string): void;
declare function clearAllOpenTimeouts(refs: BindableRefs<NavigationMenuSchema>): void;

export { clearAllOpenTimeouts, clearCloseTimeout, clearOpenTimeout, setCloseTimeout, setOpenTimeout };
