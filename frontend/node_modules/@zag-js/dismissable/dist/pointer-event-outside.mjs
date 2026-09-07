// src/pointer-event-outside.ts
import { getDocument, getWindow, isHTMLElement, setStyle, waitForElement } from "@zag-js/dom-query";
import { layerStack } from "./layer-stack.mjs";
var originalBodyPointerEvents = /* @__PURE__ */ new WeakMap();
var layerObservers = /* @__PURE__ */ new WeakMap();
function getDesiredPointerEvents(node) {
  return layerStack.isBelowPointerBlockingLayer(node) ? "none" : "auto";
}
function applyPointerEvents(node) {
  const desired = getDesiredPointerEvents(node);
  if (node.style.pointerEvents !== desired) {
    node.style.pointerEvents = desired;
  }
}
function ensurePointerEventsObserver(node) {
  if (layerObservers.has(node)) return;
  const win = getWindow(node);
  if (typeof win.MutationObserver === "undefined") return;
  const observer = new win.MutationObserver(() => {
    if (!layerObservers.has(node)) return;
    applyPointerEvents(node);
  });
  observer.observe(node, { attributes: true, attributeFilter: ["style"] });
  layerObservers.set(node, observer);
}
function assignPointerEventToLayers() {
  layerStack.layers.forEach(({ node }) => {
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
  const doc = getDocument(node);
  const cleanups = [];
  if (layerStack.hasPointerBlockingLayer() && !doc.body.hasAttribute("data-inert")) {
    originalBodyPointerEvents.set(doc.body, doc.body.style.pointerEvents);
    queueMicrotask(() => {
      const body = doc.body;
      if (!body) return;
      body.style.pointerEvents = "none";
      body.setAttribute("data-inert", "");
    });
  }
  persistentElements?.forEach((el) => {
    const [promise, abort] = waitForElement(
      () => {
        const node2 = el();
        return isHTMLElement(node2) ? node2 : null;
      },
      { timeout: 1e3 }
    );
    promise.then((el2) => cleanups.push(setStyle(el2, { pointerEvents: "auto" })));
    cleanups.push(abort);
  });
  return () => {
    if (layerStack.hasPointerBlockingLayer()) return;
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
export {
  assignPointerEventToLayers,
  clearPointerEvent,
  disablePointerEventsOutside
};
