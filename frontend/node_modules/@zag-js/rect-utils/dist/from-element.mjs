import "./chunk-QZ7TP4HQ.mjs";

// src/from-element.ts
import { createRect } from "./rect.mjs";
var styleCache = /* @__PURE__ */ new WeakMap();
function getCacheComputedStyle(el) {
  if (!styleCache.has(el)) {
    const win = el.ownerDocument.defaultView || window;
    styleCache.set(el, win.getComputedStyle(el));
  }
  return styleCache.get(el);
}
function getElementRect(el, opts = {}) {
  return createRect(getClientRect(el, opts));
}
function getClientRect(el, opts = {}) {
  const { excludeScrollbar = false, excludeBorders = false } = opts;
  const { x, y, width, height } = el.getBoundingClientRect();
  const r = { x, y, width, height };
  const style = getCacheComputedStyle(el);
  const { borderLeftWidth, borderTopWidth, borderRightWidth, borderBottomWidth } = style;
  const borderXWidth = sum(borderLeftWidth, borderRightWidth);
  const borderYWidth = sum(borderTopWidth, borderBottomWidth);
  if (excludeBorders) {
    r.width -= borderXWidth;
    r.height -= borderYWidth;
    r.x += px(borderLeftWidth);
    r.y += px(borderTopWidth);
  }
  if (excludeScrollbar) {
    const scrollbarWidth = el.offsetWidth - el.clientWidth - borderXWidth;
    const scrollbarHeight = el.offsetHeight - el.clientHeight - borderYWidth;
    r.width -= scrollbarWidth;
    r.height -= scrollbarHeight;
  }
  return r;
}
var px = (v) => parseFloat(v.replace("px", ""));
var sum = (...vals) => vals.reduce((sum2, v) => sum2 + (v ? px(v) : 0), 0);
export {
  getElementRect
};
