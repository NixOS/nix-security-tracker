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

// src/listbox.dom.ts
var listbox_dom_exports = {};
__export(listbox_dom_exports, {
  getContentEl: () => getContentEl,
  getContentId: () => getContentId,
  getItemEl: () => getItemEl,
  getItemGroupId: () => getItemGroupId,
  getItemGroupLabelId: () => getItemGroupLabelId,
  getItemId: () => getItemId,
  getLabelId: () => getLabelId,
  getRootId: () => getRootId
});
module.exports = __toCommonJS(listbox_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `listbox:${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `listbox:${ctx.id}:content`;
var getLabelId = (ctx) => ctx.ids?.label ?? `listbox:${ctx.id}:label`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `listbox:${ctx.id}:item:${id}`;
var getItemGroupId = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `listbox:${ctx.id}:item-group:${id}`;
var getItemGroupLabelId = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `listbox:${ctx.id}:item-group-label:${id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getItemEl = (ctx, id) => ctx.getById(getItemId(ctx, id));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getContentEl,
  getContentId,
  getItemEl,
  getItemGroupId,
  getItemGroupLabelId,
  getItemId,
  getLabelId,
  getRootId
});
