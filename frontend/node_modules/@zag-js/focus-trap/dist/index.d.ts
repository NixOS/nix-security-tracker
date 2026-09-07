export { FocusTrap } from './focus-trap.js';
import { FocusTrapOptions } from './types.js';

type ElementOrGetter = HTMLElement | null | (() => HTMLElement | null);
type ElementsOrGetter = ElementOrGetter | ElementOrGetter[];
interface TrapFocusOptions extends Omit<FocusTrapOptions, "document"> {
}
declare function trapFocus(el: ElementsOrGetter, options?: TrapFocusOptions): () => void;

export { FocusTrapOptions, type TrapFocusOptions, trapFocus };
