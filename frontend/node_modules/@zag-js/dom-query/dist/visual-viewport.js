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

// src/visual-viewport.ts
var visual_viewport_exports = {};
__export(visual_viewport_exports, {
  trackVisualViewport: () => trackVisualViewport
});
module.exports = __toCommonJS(visual_viewport_exports);
var import_event = require("./event.js");
function trackVisualViewport(doc, fn) {
  const win = doc?.defaultView || window;
  const onResize = () => {
    fn?.(getViewportSize(win));
  };
  onResize();
  return (0, import_event.addDomEvent)(win.visualViewport ?? win, "resize", onResize);
}
function getViewportSize(win) {
  return {
    width: win.visualViewport?.width || win.innerWidth,
    height: win.visualViewport?.height || win.innerHeight
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  trackVisualViewport
});
