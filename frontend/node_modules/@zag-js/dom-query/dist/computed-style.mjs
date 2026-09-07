import "./chunk-QZ7TP4HQ.mjs";

// src/computed-style.ts
import { getWindow } from "./node.mjs";
var styleCache = /* @__PURE__ */ new WeakMap();
function getComputedStyle(el) {
  if (!styleCache.has(el)) {
    styleCache.set(el, getWindow(el).getComputedStyle(el));
  }
  return styleCache.get(el);
}
export {
  getComputedStyle
};
