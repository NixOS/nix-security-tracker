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

// src/pagination.dom.ts
var pagination_dom_exports = {};
__export(pagination_dom_exports, {
  getEllipsisId: () => getEllipsisId,
  getFirstTriggerId: () => getFirstTriggerId,
  getItemId: () => getItemId,
  getLastTriggerId: () => getLastTriggerId,
  getNextTriggerId: () => getNextTriggerId,
  getPrevTriggerId: () => getPrevTriggerId,
  getRootId: () => getRootId
});
module.exports = __toCommonJS(pagination_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `pagination:${ctx.id}`;
var getFirstTriggerId = (ctx) => ctx.ids?.firstTrigger ?? `pagination:${ctx.id}:first`;
var getPrevTriggerId = (ctx) => ctx.ids?.prevTrigger ?? `pagination:${ctx.id}:prev`;
var getNextTriggerId = (ctx) => ctx.ids?.nextTrigger ?? `pagination:${ctx.id}:next`;
var getLastTriggerId = (ctx) => ctx.ids?.lastTrigger ?? `pagination:${ctx.id}:last`;
var getEllipsisId = (ctx, index) => ctx.ids?.ellipsis?.(index) ?? `pagination:${ctx.id}:ellipsis:${index}`;
var getItemId = (ctx, page) => ctx.ids?.item?.(page) ?? `pagination:${ctx.id}:item:${page}`;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getEllipsisId,
  getFirstTriggerId,
  getItemId,
  getLastTriggerId,
  getNextTriggerId,
  getPrevTriggerId,
  getRootId
});
