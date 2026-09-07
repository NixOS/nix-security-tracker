import "./chunk-QZ7TP4HQ.mjs";

// src/index.ts
import { getDocument, raf } from "@zag-js/dom-query";
import { FocusTrap } from "./focus-trap.mjs";
function trapFocus(el, options = {}) {
  let trap;
  const cleanup = raf(() => {
    const elements = Array.isArray(el) ? el : [el];
    const resolvedElements = elements.map((e) => typeof e === "function" ? e() : e).filter((e) => e != null);
    if (resolvedElements.length === 0) return;
    const primaryEl = resolvedElements[0];
    trap = new FocusTrap(resolvedElements, {
      escapeDeactivates: false,
      allowOutsideClick: true,
      preventScroll: true,
      returnFocusOnDeactivate: true,
      delayInitialFocus: false,
      fallbackFocus: primaryEl,
      ...options,
      document: getDocument(primaryEl)
    });
    try {
      trap.activate();
    } catch {
    }
  });
  return function destroy() {
    trap?.deactivate();
    cleanup();
  };
}
export {
  FocusTrap,
  trapFocus
};
