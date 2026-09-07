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

// src/initial-focus.ts
var initial_focus_exports = {};
__export(initial_focus_exports, {
  getInitialFocus: () => getInitialFocus,
  isValidTabEvent: () => isValidTabEvent
});
module.exports = __toCommonJS(initial_focus_exports);
var import_node = require("./node.js");
var import_tabbable = require("./tabbable.js");
function getInitialFocus(options) {
  const { root, getInitialEl, filter, enabled = true } = options;
  if (!enabled) return;
  let node = typeof getInitialEl === "function" ? getInitialEl() : getInitialEl;
  node || (node = root?.querySelector("[data-autofocus],[autofocus]"));
  if (!node) {
    const tabbables = (0, import_tabbable.getTabbables)(root).filter((el) => filter ? filter(el) : true);
    node = tabbables.find((el) => !el.hasAttribute("data-no-autofocus"));
  }
  return node || root || void 0;
}
function isValidTabEvent(event) {
  const container = event.currentTarget;
  if (!container) return false;
  const [firstTabbable, lastTabbable] = (0, import_tabbable.getTabbableEdges)(container);
  if ((0, import_node.isActiveElement)(firstTabbable) && event.shiftKey) return false;
  if ((0, import_node.isActiveElement)(lastTabbable) && !event.shiftKey) return false;
  if (!firstTabbable && !lastTabbable) return false;
  return true;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getInitialFocus,
  isValidTabEvent
});
