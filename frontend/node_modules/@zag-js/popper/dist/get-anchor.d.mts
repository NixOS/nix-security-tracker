import { VirtualElement } from '@floating-ui/dom';
import { MaybeRectElement, AnchorRect } from './types.mjs';

declare function createDOMRect(x?: number, y?: number, width?: number, height?: number): DOMRect;
declare function getAnchorElement(anchorElement: MaybeRectElement, getAnchorRect?: (anchor: MaybeRectElement) => AnchorRect | null): VirtualElement;

export { createDOMRect, getAnchorElement };
