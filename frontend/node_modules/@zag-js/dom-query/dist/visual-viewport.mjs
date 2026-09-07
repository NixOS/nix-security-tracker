import "./chunk-QZ7TP4HQ.mjs";

// src/visual-viewport.ts
import { addDomEvent } from "./event.mjs";
function trackVisualViewport(doc, fn) {
  const win = doc?.defaultView || window;
  const onResize = () => {
    fn?.(getViewportSize(win));
  };
  onResize();
  return addDomEvent(win.visualViewport ?? win, "resize", onResize);
}
function getViewportSize(win) {
  return {
    width: win.visualViewport?.width || win.innerWidth,
    height: win.visualViewport?.height || win.innerHeight
  };
}
export {
  trackVisualViewport
};
