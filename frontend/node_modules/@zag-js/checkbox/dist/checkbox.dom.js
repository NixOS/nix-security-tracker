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

// src/checkbox.dom.ts
var checkbox_dom_exports = {};
__export(checkbox_dom_exports, {
  getControlId: () => getControlId,
  getHiddenInputEl: () => getHiddenInputEl,
  getHiddenInputId: () => getHiddenInputId,
  getLabelId: () => getLabelId,
  getRootEl: () => getRootEl,
  getRootId: () => getRootId
});
module.exports = __toCommonJS(checkbox_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `checkbox:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `checkbox:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `checkbox:${ctx.id}:control`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `checkbox:${ctx.id}:input`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getControlId,
  getHiddenInputEl,
  getHiddenInputId,
  getLabelId,
  getRootEl,
  getRootId
});
