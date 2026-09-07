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

// src/signature-pad.dom.ts
var signature_pad_dom_exports = {};
__export(signature_pad_dom_exports, {
  getControlEl: () => getControlEl,
  getControlId: () => getControlId,
  getDataUrl: () => getDataUrl,
  getHiddenInputEl: () => getHiddenInputEl,
  getHiddenInputId: () => getHiddenInputId,
  getLabelId: () => getLabelId,
  getRootId: () => getRootId,
  getSegmentEl: () => getSegmentEl
});
module.exports = __toCommonJS(signature_pad_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var getRootId = (ctx) => ctx.ids?.root ?? `signature-${ctx.id}`;
var getControlId = (ctx) => ctx.ids?.control ?? `signature-control-${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `signature-label-${ctx.id}`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `signature-input-${ctx.id}`;
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getSegmentEl = (ctx) => (0, import_dom_query.query)(getControlEl(ctx), "[data-part=segment]");
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getDataUrl = (ctx, options) => {
  return (0, import_dom_query.getDataUrl)(getSegmentEl(ctx), options);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getControlEl,
  getControlId,
  getDataUrl,
  getHiddenInputEl,
  getHiddenInputId,
  getLabelId,
  getRootId,
  getSegmentEl
});
