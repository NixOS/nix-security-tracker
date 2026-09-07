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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  preventBodyScroll: () => preventBodyScroll
});
module.exports = __toCommonJS(index_exports);
var import_dom_query = require("@zag-js/dom-query");
var LOCK_CLASSNAME = "data-scroll-lock";
var lockMap = /* @__PURE__ */ new WeakMap();
function getPaddingProperty(documentElement) {
  const documentLeft = documentElement.getBoundingClientRect().left;
  const scrollbarX = Math.round(documentLeft) + documentElement.scrollLeft;
  return scrollbarX ? "paddingLeft" : "paddingRight";
}
function hasStableScrollbarGutter(element) {
  const styles = (0, import_dom_query.getComputedStyle)(element);
  const scrollbarGutter = styles?.scrollbarGutter;
  return scrollbarGutter === "stable" || scrollbarGutter?.startsWith("stable ") === true;
}
function getScrollContainer(doc) {
  const { documentElement, body } = doc;
  return (0, import_dom_query.isOverflowElement)(documentElement) ? documentElement : body;
}
function applyLock(doc) {
  const win = doc.defaultView ?? window;
  const { documentElement, body } = doc;
  const scroller = getScrollContainer(doc);
  const hasStableGutter = hasStableScrollbarGutter(documentElement) || hasStableScrollbarGutter(body);
  const scrollbarWidth = win.innerWidth - documentElement.clientWidth;
  body.setAttribute(LOCK_CLASSNAME, "");
  const setScrollbarWidthProperty = () => (0, import_dom_query.setStyleProperty)(documentElement, "--scrollbar-width", `${scrollbarWidth}px`);
  const paddingProperty = getPaddingProperty(documentElement);
  const setScrollerStyle = () => {
    const styles = {
      overflow: "hidden"
    };
    if (!hasStableGutter && scrollbarWidth > 0) {
      styles[paddingProperty] = `${scrollbarWidth}px`;
    }
    return (0, import_dom_query.setStyle)(scroller, styles);
  };
  const setBodyStyleIOS = () => {
    const { scrollX, scrollY, visualViewport } = win;
    const offsetLeft = visualViewport?.offsetLeft ?? 0;
    const offsetTop = visualViewport?.offsetTop ?? 0;
    const styles = {
      position: "fixed",
      overflow: "hidden",
      top: `${-(scrollY - Math.floor(offsetTop))}px`,
      left: `${-(scrollX - Math.floor(offsetLeft))}px`,
      right: "0"
    };
    if (!hasStableGutter && scrollbarWidth > 0) {
      styles[paddingProperty] = `${scrollbarWidth}px`;
    }
    const restoreStyle = (0, import_dom_query.setStyle)(body, styles);
    return () => {
      restoreStyle?.();
      win.scrollTo({ left: scrollX, top: scrollY, behavior: "instant" });
    };
  };
  const cleanups = [setScrollbarWidthProperty(), (0, import_dom_query.isIos)() ? setBodyStyleIOS() : setScrollerStyle()];
  return () => {
    cleanups.forEach((fn) => fn?.());
    body.removeAttribute(LOCK_CLASSNAME);
  };
}
function preventBodyScroll(_document) {
  const doc = _document ?? document;
  let state = lockMap.get(doc);
  if (!state) {
    state = { count: 0, cleanup: applyLock(doc) };
    lockMap.set(doc, state);
  }
  state.count++;
  const lockState = state;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockState.count--;
    if (lockState.count === 0) {
      lockState.cleanup();
      lockMap.delete(doc);
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  preventBodyScroll
});
