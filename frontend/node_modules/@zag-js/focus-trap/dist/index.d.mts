export { FocusTrap } from './focus-trap.mjs';
import { FocusTrapOptions } from './types.mjs';

type ElementOrGetter = HTMLElement | null | (() => HTMLElement | null);
type ElementsOrGetter = ElementOrGetter | ElementOrGetter[];
interface TrapFocusOptions extends Omit<FocusTrapOptions, "document"> {
}
declare function trapFocus(el: ElementsOrGetter, options?: TrapFocusOptions): () => void;

export { FocusTrapOptions, type TrapFocusOptions, trapFocus };
