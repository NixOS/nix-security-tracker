import "./chunk-QZ7TP4HQ.mjs";

// src/overflow.ts
import { getDocument, getParentNode, getWindow } from "./node.mjs";
import { isHTMLElement, isRootElement, isVisualViewport } from "./node.mjs";
function getNearestOverflowAncestor(el) {
  const parentNode = getParentNode(el);
  if (isRootElement(parentNode)) return getDocument(parentNode).body;
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) return parentNode;
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(el, list = []) {
  const scrollableAncestor = getNearestOverflowAncestor(el);
  const isBody = scrollableAncestor === el.ownerDocument.body;
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, []));
}
var getElementRect = (el) => {
  if (isHTMLElement(el)) return el.getBoundingClientRect();
  if (isVisualViewport(el)) return { top: 0, left: 0, bottom: el.height, right: el.width };
  return { top: 0, left: 0, bottom: el.innerHeight, right: el.innerWidth };
};
function isInView(el, ancestor) {
  if (!isHTMLElement(el)) return true;
  const ancestorRect = getElementRect(ancestor);
  const elRect = el.getBoundingClientRect();
  return elRect.top >= ancestorRect.top && elRect.left >= ancestorRect.left && elRect.bottom <= ancestorRect.bottom && elRect.right <= ancestorRect.right;
}
var OVERFLOW_RE = /auto|scroll|overlay|hidden|clip/;
var nonOverflowValues = /* @__PURE__ */ new Set(["inline", "contents"]);
function isOverflowElement(el) {
  const win = getWindow(el);
  const { overflow, overflowX, overflowY, display } = win.getComputedStyle(el);
  return OVERFLOW_RE.test(overflow + overflowY + overflowX) && !nonOverflowValues.has(display);
}
export {
  getNearestOverflowAncestor,
  getOverflowAncestors,
  isInView,
  isOverflowElement
};
