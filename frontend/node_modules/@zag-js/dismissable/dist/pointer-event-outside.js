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

// src/pointer-event-outside.ts
var pointer_event_outside_exports = {};
__export(pointer_event_outside_exports, {
  assignPointerEventToLayers: () => assignPointerEventToLayers,
  clearPointerEvent: () => clearPointerEvent,
  disablePointerEventsOutside: () => disablePointerEventsOutside
});
module.exports = __toCommonJS(pointer_event_outside_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_layer_stack = require("./layer-stack.js");
var originalBodyPointerEvents = /* @__PURE__ */ new WeakMap();
var layerObservers = /* @__PURE__ */ new WeakMap();
function getDesiredPointerEvents(node) {
  return import_layer_stack.layerStack.isBelowPointerBlockingLayer(node) ? "none" : "auto";
}
function applyPointerEvents(node) {
  const desired = getDesiredPointerEvents(node);
  if (node.style.pointerEvents !== desired) {
    node.style.pointerEvents = desired;
  }
}
function ensurePointerEventsObserver(node) {
  if (layerObservers.has(node)) return;
  const win = (0, import_dom_query.getWindow)(node);
  if (typeof win.MutationObserver === "undefined") return;
  const observer = new win.MutationObserver(() => {
    if (!layerObservers.has(node)) return;
    applyPointerEvents(node);
  });
  observer.observe(node, { attributes: true, attributeFilter: ["style"] });
  layerObservers.set(node, observer);
}
function assignPointerEventToLayers() {
  import_layer_stack.layerStack.layers.forEach(({ node }) => {
    applyPointerEvents(node);
    ensurePointerEventsObserver(node);
  });
}
function clearPointerEvent(node) {
  const observer = layerObservers.get(node);
  if (observer) {
    observer.disconnect();
    layerObservers.delete(node);
  }
  node.style.pointerEvents = "";
}
function disablePointerEventsOutside(node, persistentElements) {
  const doc = (0, import_dom_query.getDocument)(node);
  const cleanups = [];
  if (import_layer_stack.layerStack.hasPointerBlockingLayer() && !doc.body.hasAttribute("data-inert")) {
    originalBodyPointerEvents.set(doc.body, doc.body.style.pointerEvents);
    queueMicrotask(() => {
      const body = doc.body;
      if (!body) return;
      body.style.pointerEvents = "none";
      body.setAttribute("data-inert", "");
    });
  }
  persistentElements?.forEach((el) => {
    const [promise, abort] = (0, import_dom_query.waitForElement)(
      () => {
        const node2 = el();
        return (0, import_dom_query.isHTMLElement)(node2) ? node2 : null;
      },
      { timeout: 1e3 }
    );
    promise.then((el2) => cleanups.push((0, import_dom_query.setStyle)(el2, { pointerEvents: "auto" })));
    cleanups.push(abort);
  });
  return () => {
    if (import_layer_stack.layerStack.hasPointerBlockingLayer()) return;
    queueMicrotask(() => {
      const body = doc.body;
      if (!body) return;
      const original = originalBodyPointerEvents.get(body);
      if (original !== void 0) {
        body.style.pointerEvents = original;
        originalBodyPointerEvents.delete(body);
      }
      body.removeAttribute("data-inert");
      if (body.style.length === 0) body.removeAttribute("style");
    });
    cleanups.forEach((fn) => fn());
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assignPointerEventToLayers,
  clearPointerEvent,
  disablePointerEventsOutside
});
