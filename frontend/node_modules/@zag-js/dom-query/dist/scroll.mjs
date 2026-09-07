import "./chunk-QZ7TP4HQ.mjs";

// src/scroll.ts
import { getWindow, isHTMLElement } from "./node.mjs";
import { isOverflowElement } from "./overflow.mjs";
function isScrollable(el) {
  return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
}
function scrollIntoView(el, options) {
  const { rootEl, ...scrollOptions } = options || {};
  if (!el || !rootEl) return;
  if (!isOverflowElement(rootEl) || !isScrollable(rootEl)) return;
  el.scrollIntoView(scrollOptions);
}
function scrollToElement(el, options) {
  const { rootEl, behavior } = options || {};
  if (!el || !rootEl) return false;
  if (!rootEl.contains(el)) return false;
  const win = getWindow(rootEl);
  const rootRect = rootEl.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const rootStyle = win.getComputedStyle(rootEl);
  const elStyle = win.getComputedStyle(el);
  const scrollPaddingTop = getNumericStyle(rootStyle.scrollPaddingBlockStart || rootStyle.scrollPaddingTop);
  const scrollMarginTop = getNumericStyle(elStyle.scrollMarginBlockStart || elStyle.scrollMarginTop);
  const top = elRect.top - rootRect.top + rootEl.scrollTop - scrollPaddingTop - scrollMarginTop;
  rootEl.scrollTo({ top, ...behavior && { behavior } });
  return true;
}
var getNumericStyle = (value) => {
  const numericValue = Number.parseFloat(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};
function getScrollPosition(element) {
  if (isHTMLElement(element)) {
    return { scrollLeft: element.scrollLeft, scrollTop: element.scrollTop };
  }
  return { scrollLeft: element.scrollX, scrollTop: element.scrollY };
}
export {
  getScrollPosition,
  scrollIntoView,
  scrollToElement
};
