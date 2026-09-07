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

// src/resize-observer.ts
var resize_observer_exports = {};
__export(resize_observer_exports, {
  resizeObserverBorderBox: () => resizeObserverBorderBox,
  resizeObserverContentBox: () => resizeObserverContentBox,
  resizeObserverDevicePixelContentBox: () => resizeObserverDevicePixelContentBox
});
module.exports = __toCommonJS(resize_observer_exports);
var import_node = require("./node.js");
function createSharedResizeObserver(options) {
  const listeners = /* @__PURE__ */ new WeakMap();
  let observer;
  const entries = /* @__PURE__ */ new WeakMap();
  const getObserver = (win) => {
    if (observer) return observer;
    observer = new win.ResizeObserver((observedEntries) => {
      for (const entry of observedEntries) {
        entries.set(entry.target, entry);
        const elementListeners = listeners.get(entry.target);
        if (elementListeners) {
          for (const listener of elementListeners) {
            listener(entry);
          }
        }
      }
    });
    return observer;
  };
  const observe = (element, listener) => {
    let elementListeners = listeners.get(element) || /* @__PURE__ */ new Set();
    elementListeners.add(listener);
    listeners.set(element, elementListeners);
    const win = (0, import_node.getWindow)(element);
    getObserver(win).observe(element, options);
    return () => {
      const elementListeners2 = listeners.get(element);
      if (!elementListeners2) return;
      elementListeners2.delete(listener);
      if (elementListeners2.size === 0) {
        listeners.delete(element);
        getObserver(win).unobserve(element);
      }
    };
  };
  const unobserve = (element) => {
    listeners.delete(element);
    observer?.unobserve(element);
  };
  return {
    observe,
    unobserve
  };
}
var resizeObserverContentBox = /* @__PURE__ */ createSharedResizeObserver({
  box: "content-box"
});
var resizeObserverBorderBox = /* @__PURE__ */ createSharedResizeObserver({
  box: "border-box"
});
var resizeObserverDevicePixelContentBox = /* @__PURE__ */ createSharedResizeObserver({
  box: "device-pixel-content-box"
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  resizeObserverBorderBox,
  resizeObserverContentBox,
  resizeObserverDevicePixelContentBox
});
