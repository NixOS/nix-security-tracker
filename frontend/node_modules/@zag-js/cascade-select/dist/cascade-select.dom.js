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

// src/cascade-select.dom.ts
var cascade_select_dom_exports = {};
__export(cascade_select_dom_exports, {
  dom: () => dom
});
module.exports = __toCommonJS(cascade_select_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var dom = (0, import_dom_query.createScope)({
  getRootId: (ctx) => ctx.ids?.root ?? `cascade-select:${ctx.id}`,
  getLabelId: (ctx) => ctx.ids?.label ?? `cascade-select:${ctx.id}:label`,
  getControlId: (ctx) => ctx.ids?.control ?? `cascade-select:${ctx.id}:control`,
  getTriggerId: (ctx) => ctx.ids?.trigger ?? `cascade-select:${ctx.id}:trigger`,
  getIndicatorId: (ctx) => ctx.ids?.indicator ?? `cascade-select:${ctx.id}:indicator`,
  getClearTriggerId: (ctx) => ctx.ids?.clearTrigger ?? `cascade-select:${ctx.id}:clear-trigger`,
  getPositionerId: (ctx) => ctx.ids?.positioner ?? `cascade-select:${ctx.id}:positioner`,
  getContentId: (ctx) => ctx.ids?.content ?? `cascade-select:${ctx.id}:content`,
  getHiddenInputId: (ctx) => ctx.ids?.hiddenInput ?? `cascade-select:${ctx.id}:hidden-input`,
  getListId: (ctx, value) => ctx.ids?.list?.(value) ?? `cascade-select:${ctx.id}:list:${value}`,
  getItemId: (ctx, value) => ctx.ids?.item?.(value) ?? `cascade-select:${ctx.id}:item:${value}`,
  getRootEl: (ctx) => dom.getById(ctx, dom.getRootId(ctx)),
  getLabelEl: (ctx) => dom.getById(ctx, dom.getLabelId(ctx)),
  getControlEl: (ctx) => dom.getById(ctx, dom.getControlId(ctx)),
  getTriggerEl: (ctx) => dom.getById(ctx, dom.getTriggerId(ctx)),
  getIndicatorEl: (ctx) => dom.getById(ctx, dom.getIndicatorId(ctx)),
  getClearTriggerEl: (ctx) => dom.getById(ctx, dom.getClearTriggerId(ctx)),
  getPositionerEl: (ctx) => dom.getById(ctx, dom.getPositionerId(ctx)),
  getContentEl: (ctx) => dom.getById(ctx, dom.getContentId(ctx)),
  getHiddenInputEl: (ctx) => dom.getById(ctx, dom.getHiddenInputId(ctx)),
  getListEl: (ctx, value) => dom.getById(ctx, dom.getListId(ctx, value)),
  getListEls: (ctx) => (0, import_dom_query.queryAll)(dom.getContentEl(ctx), `[data-part="list"]`),
  getItemEl: (ctx, value) => dom.getById(ctx, dom.getItemId(ctx, value)),
  dispatchInputEvent: (ctx, value) => {
    const inputEl = dom.getHiddenInputEl(ctx);
    if (!inputEl) return;
    (0, import_dom_query.dispatchInputValueEvent)(inputEl, { value });
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dom
});
