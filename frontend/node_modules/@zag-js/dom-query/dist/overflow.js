"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/overflow.ts
var overflow_exports = {};
__export(overflow_exports, {
  getNearestOverflowAncestor: () => getNearestOverflowAncestor,
  getOverflowAncestors: () => getOverflowAncestors,
  isInView: () => isInView,
  isOverflowElement: () => isOverflowElement
});
module.exports = __toCommonJS(overflow_exports);
var import_node = require("./node.js");
var import_node2 = require("./node.js");
function getNearestOverflowAncestor(el) {
  const parentNode = (0, import_node.getParentNode)(el);
  if ((0, import_node2.isRootElement)(parentNode)) return (0, import_node.getDocument)(parentNode).body;
  if ((0, import_node2.isHTMLElement)(parentNode) && isOverflowElement(parentNode)) return parentNode;
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(el, list = []) {
  const scrollableAncestor = getNearestOverflowAncestor(el);
  const isBody = scrollableAncestor === el.ownerDocument.body;
  const win = (0, import_node.getWindow)(scrollableAncestor);
  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, []));
}
var getElementRect = (el) => {
  if ((0, import_node2.isHTMLElement)(el)) return el.getBoundingClientRect();
  if ((0, import_node2.isVisualViewport)(el)) return { top: 0, left: 0, bottom: el.height, right: el.width };
  return { top: 0, left: 0, bottom: el.innerHeight, right: el.innerWidth };
};
function isInView(el, ancestor) {
  if (!(0, import_node2.isHTMLElement)(el)) return true;
  const ancestorRect = getElementRect(ancestor);
  const elRect = el.getBoundingClientRect();
  return elRect.top >= ancestorRect.top && elRect.left >= ancestorRect.left && elRect.bottom <= ancestorRect.bottom && elRect.right <= ancestorRect.right;
}
var OVERFLOW_RE = /auto|scroll|overlay|hidden|clip/;
var nonOverflowValues = /* @__PURE__ */ new Set(["inline", "contents"]);
function isOverflowElement(el) {
  const win = (0, import_node.getWindow)(el);
  const { overflow, overflowX, overflowY, display } = win.getComputedStyle(el);
  return OVERFLOW_RE.test(overflow + overflowY + overflowX) && !nonOverflowValues.has(display);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getNearestOverflowAncestor,
  getOverflowAncestors,
  isInView,
  isOverflowElement
});
