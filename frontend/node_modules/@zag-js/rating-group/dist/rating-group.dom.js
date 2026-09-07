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

// src/rating-group.dom.ts
var rating_group_dom_exports = {};
__export(rating_group_dom_exports, {
  dispatchChangeEvent: () => dispatchChangeEvent,
  getControlEl: () => getControlEl,
  getControlId: () => getControlId,
  getHiddenInputEl: () => getHiddenInputEl,
  getHiddenInputId: () => getHiddenInputId,
  getItemId: () => getItemId,
  getLabelId: () => getLabelId,
  getRadioEl: () => getRadioEl,
  getRootEl: () => getRootEl,
  getRootId: () => getRootId
});
module.exports = __toCommonJS(rating_group_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var getRootId = (ctx) => ctx.ids?.root ?? `rating:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `rating:${ctx.id}:label`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `rating:${ctx.id}:input`;
var getControlId = (ctx) => ctx.ids?.control ?? `rating:${ctx.id}:control`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `rating:${ctx.id}:item:${id}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getRadioEl = (ctx, value) => {
  const selector = `[role=radio][aria-posinset='${Math.ceil(value)}']`;
  return (0, import_dom_query.query)(getControlEl(ctx), selector);
};
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var dispatchChangeEvent = (ctx, value) => {
  const inputEl = getHiddenInputEl(ctx);
  if (!inputEl) return;
  (0, import_dom_query.dispatchInputValueEvent)(inputEl, { value });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dispatchChangeEvent,
  getControlEl,
  getControlId,
  getHiddenInputEl,
  getHiddenInputId,
  getItemId,
  getLabelId,
  getRadioEl,
  getRootEl,
  getRootId
});
