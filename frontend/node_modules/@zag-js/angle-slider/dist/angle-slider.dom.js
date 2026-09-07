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

// src/angle-slider.dom.ts
var angle_slider_dom_exports = {};
__export(angle_slider_dom_exports, {
  getControlEl: () => getControlEl,
  getControlId: () => getControlId,
  getHiddenInputEl: () => getHiddenInputEl,
  getHiddenInputId: () => getHiddenInputId,
  getLabelId: () => getLabelId,
  getRootId: () => getRootId,
  getThumbEl: () => getThumbEl,
  getThumbId: () => getThumbId,
  getValueTextId: () => getValueTextId
});
module.exports = __toCommonJS(angle_slider_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `angle-slider:${ctx.id}`;
var getThumbId = (ctx) => ctx.ids?.thumb ?? `angle-slider:${ctx.id}:thumb`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `angle-slider:${ctx.id}:input`;
var getControlId = (ctx) => ctx.ids?.control ?? `angle-slider:${ctx.id}:control`;
var getValueTextId = (ctx) => ctx.ids?.valueText ?? `angle-slider:${ctx.id}:value-text`;
var getLabelId = (ctx) => ctx.ids?.label ?? `angle-slider:${ctx.id}:label`;
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getThumbEl = (ctx) => ctx.getById(getThumbId(ctx));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getControlEl,
  getControlId,
  getHiddenInputEl,
  getHiddenInputId,
  getLabelId,
  getRootId,
  getThumbEl,
  getThumbId,
  getValueTextId
});
