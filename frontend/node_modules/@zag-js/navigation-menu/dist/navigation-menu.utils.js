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

// src/navigation-menu.utils.ts
var navigation_menu_utils_exports = {};
__export(navigation_menu_utils_exports, {
  clearAllOpenTimeouts: () => clearAllOpenTimeouts,
  clearCloseTimeout: () => clearCloseTimeout,
  clearOpenTimeout: () => clearOpenTimeout,
  setCloseTimeout: () => setCloseTimeout,
  setOpenTimeout: () => setOpenTimeout
});
module.exports = __toCommonJS(navigation_menu_utils_exports);
function setCloseTimeout(refs, context, prop) {
  clearCloseTimeout(refs);
  const closeTimeoutId = window.setTimeout(() => {
    context.set("value", "");
  }, prop("closeDelay"));
  refs.set("closeTimeoutId", closeTimeoutId);
}
function clearCloseTimeout(refs) {
  const closeTimeoutId = refs.get("closeTimeoutId");
  if (closeTimeoutId) {
    clearTimeout(closeTimeoutId);
    refs.set("closeTimeoutId", null);
  }
}
function setOpenTimeout(refs, value, timeoutId) {
  const openTimeoutIds = refs.get("openTimeoutIds");
  refs.set("openTimeoutIds", {
    ...openTimeoutIds,
    [value]: timeoutId
  });
}
function clearOpenTimeout(refs, value) {
  const openTimeoutIds = refs.get("openTimeoutIds");
  const timeoutId = openTimeoutIds[value];
  if (timeoutId) {
    clearTimeout(timeoutId);
    const { [value]: _, ...rest } = openTimeoutIds;
    refs.set("openTimeoutIds", rest);
  }
}
function clearAllOpenTimeouts(refs) {
  const openTimeoutIds = refs.get("openTimeoutIds");
  Object.values(openTimeoutIds).forEach((timeoutId) => {
    if (timeoutId) clearTimeout(timeoutId);
  });
  refs.set("openTimeoutIds", {});
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clearAllOpenTimeouts,
  clearCloseTimeout,
  clearOpenTimeout,
  setCloseTimeout,
  setOpenTimeout
});
