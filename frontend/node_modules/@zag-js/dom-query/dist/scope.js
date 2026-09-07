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

// src/scope.ts
var scope_exports = {};
__export(scope_exports, {
  createScope: () => createScope
});
module.exports = __toCommonJS(scope_exports);
var import_form = require("./form.js");
var import_node = require("./node.js");
function createScope(methods) {
  const dom = {
    getRootNode: (ctx) => ctx.getRootNode?.() ?? document,
    getDoc: (ctx) => (0, import_node.getDocument)(dom.getRootNode(ctx)),
    getWin: (ctx) => dom.getDoc(ctx).defaultView ?? window,
    getActiveElement: (ctx) => (0, import_node.getActiveElement)(dom.getRootNode(ctx)),
    isActiveElement: import_node.isActiveElement,
    getById: (ctx, id) => dom.getRootNode(ctx).getElementById(id),
    setValue: (elem, value) => {
      if (elem == null || value == null) return;
      (0, import_form.setElementValue)(elem, value.toString());
    }
  };
  return { ...dom, ...methods };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createScope
});
