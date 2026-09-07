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

// src/carousel.dom.ts
var carousel_dom_exports = {};
__export(carousel_dom_exports, {
  getIndicatorEl: () => getIndicatorEl,
  getIndicatorGroupId: () => getIndicatorGroupId,
  getIndicatorId: () => getIndicatorId,
  getItemEl: () => getItemEl,
  getItemEls: () => getItemEls,
  getItemGroupEl: () => getItemGroupEl,
  getItemGroupId: () => getItemGroupId,
  getItemId: () => getItemId,
  getNextTriggerId: () => getNextTriggerId,
  getPrevTriggerId: () => getPrevTriggerId,
  getRootEl: () => getRootEl,
  getRootId: () => getRootId,
  syncTabIndex: () => syncTabIndex
});
module.exports = __toCommonJS(carousel_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var getRootId = (ctx) => ctx.ids?.root ?? `carousel:${ctx.id}`;
var getItemId = (ctx, index) => ctx.ids?.item?.(index) ?? `carousel:${ctx.id}:item:${index}`;
var getItemGroupId = (ctx) => ctx.ids?.itemGroup ?? `carousel:${ctx.id}:item-group`;
var getNextTriggerId = (ctx) => ctx.ids?.nextTrigger ?? `carousel:${ctx.id}:next-trigger`;
var getPrevTriggerId = (ctx) => ctx.ids?.prevTrigger ?? `carousel:${ctx.id}:prev-trigger`;
var getIndicatorGroupId = (ctx) => ctx.ids?.indicatorGroup ?? `carousel:${ctx.id}:indicator-group`;
var getIndicatorId = (ctx, index) => ctx.ids?.indicator?.(index) ?? `carousel:${ctx.id}:indicator:${index}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getItemGroupEl = (ctx) => ctx.getById(getItemGroupId(ctx));
var getItemEl = (ctx, index) => ctx.getById(getItemId(ctx, index));
var getItemEls = (ctx) => (0, import_dom_query.queryAll)(getItemGroupEl(ctx), `[data-part=item]`);
var getIndicatorEl = (ctx, page) => ctx.getById(getIndicatorId(ctx, page));
var syncTabIndex = (ctx) => {
  const el = getItemGroupEl(ctx);
  if (!el) return;
  const tabbables = (0, import_dom_query.getTabbables)(el);
  el.setAttribute("tabindex", tabbables.length > 0 ? "-1" : "0");
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getIndicatorEl,
  getIndicatorGroupId,
  getIndicatorId,
  getItemEl,
  getItemEls,
  getItemGroupEl,
  getItemGroupId,
  getItemId,
  getNextTriggerId,
  getPrevTriggerId,
  getRootEl,
  getRootId,
  syncTabIndex
});
