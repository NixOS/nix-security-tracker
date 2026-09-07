// src/escape-keydown.ts
import { addDomEvent, getDocument } from "@zag-js/dom-query";
function trackEscapeKeydown(node, fn) {
  const handleKeyDown = (event) => {
    if (event.key !== "Escape") return;
    if (event.isComposing) return;
    fn?.(event);
  };
  return addDomEvent(getDocument(node), "keydown", handleKeyDown, { capture: true });
}
export {
  trackEscapeKeydown
};
