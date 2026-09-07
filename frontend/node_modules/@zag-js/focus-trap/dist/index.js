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
  FocusTrap: () => import_focus_trap.FocusTrap,
  trapFocus: () => trapFocus
});
module.exports = __toCommonJS(index_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_focus_trap = require("./focus-trap.js");
function trapFocus(el, options = {}) {
  let trap;
  const cleanup = (0, import_dom_query.raf)(() => {
    const elements = Array.isArray(el) ? el : [el];
    const resolvedElements = elements.map((e) => typeof e === "function" ? e() : e).filter((e) => e != null);
    if (resolvedElements.length === 0) return;
    const primaryEl = resolvedElements[0];
    trap = new import_focus_trap.FocusTrap(resolvedElements, {
      escapeDeactivates: false,
      allowOutsideClick: true,
      preventScroll: true,
      returnFocusOnDeactivate: true,
      delayInitialFocus: false,
      fallbackFocus: primaryEl,
      ...options,
      document: (0, import_dom_query.getDocument)(primaryEl)
    });
    try {
      trap.activate();
    } catch {
    }
  });
  return function destroy() {
    trap?.deactivate();
    cleanup();
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FocusTrap,
  trapFocus
});
