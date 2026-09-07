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

// src/toast.dom.ts
var toast_dom_exports = {};
__export(toast_dom_exports, {
  getCloseTriggerId: () => getCloseTriggerId,
  getDescriptionId: () => getDescriptionId,
  getRegionEl: () => getRegionEl,
  getRegionId: () => getRegionId,
  getRootEl: () => getRootEl,
  getRootId: () => getRootId,
  getTitleId: () => getTitleId
});
module.exports = __toCommonJS(toast_dom_exports);
var getRegionId = (placement) => `toast-group:${placement}`;
var getRegionEl = (ctx, placement) => ctx.getById(`toast-group:${placement}`);
var getRootId = (ctx) => `toast:${ctx.id}`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getTitleId = (ctx) => `toast:${ctx.id}:title`;
var getDescriptionId = (ctx) => `toast:${ctx.id}:description`;
var getCloseTriggerId = (ctx) => `toast${ctx.id}:close`;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getCloseTriggerId,
  getDescriptionId,
  getRegionEl,
  getRegionId,
  getRootEl,
  getRootId,
  getTitleId
});
