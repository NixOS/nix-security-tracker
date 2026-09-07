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

// src/utils/rect.ts
var rect_exports = {};
__export(rect_exports, {
  getCenterRect: () => getCenterRect,
  isEventInRect: () => isEventInRect,
  offset: () => offset
});
module.exports = __toCommonJS(rect_exports);
var import_dom_query = require("@zag-js/dom-query");
function getCenterRect(size) {
  return { x: size.width / 2, y: size.height / 2, width: 0, height: 0 };
}
function getFrameElement(win) {
  return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
}
var normalizeEventPoint = (event) => {
  let clientX = event.clientX;
  let clientY = event.clientY;
  let win = event.view || window;
  let frame = getFrameElement(win);
  while (frame) {
    const iframeRect = frame.getBoundingClientRect();
    const css = getComputedStyle(frame);
    const left = iframeRect.left + (frame.clientLeft + parseFloat(css.paddingLeft));
    const top = iframeRect.top + (frame.clientTop + parseFloat(css.paddingTop));
    clientX += left;
    clientY += top;
    win = (0, import_dom_query.getWindow)(frame);
    frame = getFrameElement(win);
  }
  return { clientX, clientY };
};
function isEventInRect(rect, event) {
  const { clientX, clientY } = normalizeEventPoint(event);
  return rect.y <= clientY && clientY <= rect.y + rect.height && rect.x <= clientX && clientX <= rect.x + rect.width;
}
function offset(r, i) {
  const dx = i.x || 0;
  const dy = i.y || 0;
  return {
    x: r.x - dx,
    y: r.y - dy,
    width: r.width + dx + dx,
    height: r.height + dy + dy
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getCenterRect,
  isEventInRect,
  offset
});
