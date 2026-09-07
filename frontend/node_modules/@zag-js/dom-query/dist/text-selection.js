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

// src/text-selection.ts
var text_selection_exports = {};
__export(text_selection_exports, {
  disableTextSelection: () => disableTextSelection,
  restoreTextSelection: () => restoreTextSelection
});
module.exports = __toCommonJS(text_selection_exports);
var import_platform = require("./platform.js");
var import_raf = require("./raf.js");
var state = "default";
var userSelect = "";
var elementMap = /* @__PURE__ */ new WeakMap();
function disableTextSelectionImpl(options = {}) {
  const { target, doc } = options;
  const docNode = doc ?? document;
  const rootEl = docNode.documentElement;
  if ((0, import_platform.isIos)()) {
    if (state === "default") {
      userSelect = rootEl.style.webkitUserSelect;
      rootEl.style.webkitUserSelect = "none";
    }
    state = "disabled";
  } else if (target) {
    elementMap.set(target, target.style.userSelect);
    target.style.userSelect = "none";
  }
  return () => restoreTextSelection({ target, doc: docNode });
}
function restoreTextSelection(options = {}) {
  const { target, doc } = options;
  const docNode = doc ?? document;
  const rootEl = docNode.documentElement;
  if ((0, import_platform.isIos)()) {
    if (state !== "disabled") return;
    state = "restoring";
    setTimeout(() => {
      (0, import_raf.nextTick)(() => {
        if (state === "restoring") {
          if (rootEl.style.webkitUserSelect === "none") {
            rootEl.style.webkitUserSelect = userSelect || "";
          }
          userSelect = "";
          state = "default";
        }
      });
    }, 300);
  } else {
    if (target && elementMap.has(target)) {
      const prevUserSelect = elementMap.get(target);
      if (target.style.userSelect === "none") {
        target.style.userSelect = prevUserSelect ?? "";
      }
      if (target.getAttribute("style") === "") {
        target.removeAttribute("style");
      }
      elementMap.delete(target);
    }
  }
}
function disableTextSelection(options = {}) {
  const { defer, target, ...restOptions } = options;
  const func = defer ? import_raf.raf : (v) => v();
  const cleanups = [];
  cleanups.push(
    func(() => {
      const node = typeof target === "function" ? target() : target;
      cleanups.push(disableTextSelectionImpl({ ...restOptions, target: node }));
    })
  );
  return () => {
    cleanups.forEach((fn) => fn?.());
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  disableTextSelection,
  restoreTextSelection
});
