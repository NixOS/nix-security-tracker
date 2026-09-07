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

// src/proxy-tab-focus.ts
var proxy_tab_focus_exports = {};
__export(proxy_tab_focus_exports, {
  proxyTabFocus: () => proxyTabFocus
});
module.exports = __toCommonJS(proxy_tab_focus_exports);
var import_event = require("./event.js");
var import_node = require("./node.js");
var import_raf = require("./raf.js");
var import_tabbable = require("./tabbable.js");
function resolveElement(value) {
  if (value == null) return null;
  return typeof value === "function" ? value() : value;
}
function getNextTabbableAfterTrigger(container, trigger, getShadowRoot) {
  if (!trigger) return null;
  const tabbables = (0, import_tabbable.getTabbables)(container.ownerDocument.body, { getShadowRoot });
  const triggerIndex = tabbables.indexOf(trigger);
  if (triggerIndex === -1) return null;
  for (let i = triggerIndex + 1; i < tabbables.length; i++) {
    const el = tabbables[i];
    if (!(0, import_node.contains)(container, el)) return el;
  }
  return null;
}
function proxyTabFocusImpl(container, options = {}) {
  const { triggerElement, onFocus, onFocusEnter, getShadowRoot } = options;
  const initial = resolveElement(container) ?? resolveElement(triggerElement);
  const doc = initial?.ownerDocument || document;
  function onKeyDown(event) {
    if (event.key !== "Tab") return;
    const content = resolveElement(container);
    const trigger = resolveElement(triggerElement);
    if (!content) return;
    const [firstTabbable, lastTabbable] = (0, import_tabbable.getTabbableEdges)(content, { includeContainer: true, getShadowRoot });
    const noTabbableElements = !firstTabbable && !lastTabbable;
    let elementToFocus = null;
    if (event.shiftKey && ((0, import_node.isActiveElement)(firstTabbable) || noTabbableElements)) {
      elementToFocus = trigger;
    } else if (!event.shiftKey && (0, import_node.isActiveElement)(trigger)) {
      onFocusEnter?.();
      elementToFocus = firstTabbable;
    } else if (!event.shiftKey && ((0, import_node.isActiveElement)(lastTabbable) || noTabbableElements)) {
      elementToFocus = getNextTabbableAfterTrigger(content, trigger, getShadowRoot);
    } else if (event.shiftKey) {
      const nextTabbableAfterTrigger = getNextTabbableAfterTrigger(content, trigger, getShadowRoot);
      if ((0, import_node.isActiveElement)(nextTabbableAfterTrigger)) {
        onFocusEnter?.();
        elementToFocus = lastTabbable;
      }
    }
    if (!elementToFocus) return;
    event.preventDefault();
    if (typeof onFocus === "function") {
      onFocus(elementToFocus);
    } else {
      elementToFocus.focus();
    }
  }
  return (0, import_event.addDomEvent)(doc, "keydown", onKeyDown, true);
}
function proxyTabFocus(container, options) {
  const { defer, ...restOptions } = options;
  const func = defer ? import_raf.raf : (v) => v();
  const cleanups = [];
  cleanups.push(
    func(() => {
      cleanups.push(proxyTabFocusImpl(container, restOptions));
    })
  );
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  proxyTabFocus
});
