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

// src/steps.dom.ts
var steps_dom_exports = {};
__export(steps_dom_exports, {
  getContentId: () => getContentId,
  getListId: () => getListId,
  getRootId: () => getRootId,
  getTriggerId: () => getTriggerId
});
module.exports = __toCommonJS(steps_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `steps:${ctx.id}`;
var getListId = (ctx) => ctx.ids?.list ?? `steps:${ctx.id}:list`;
var getTriggerId = (ctx, index) => ctx.ids?.triggerId?.(index) ?? `steps:${ctx.id}:trigger:${index}`;
var getContentId = (ctx, index) => ctx.ids?.contentId?.(index) ?? `steps:${ctx.id}:content:${index}`;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getContentId,
  getListId,
  getRootId,
  getTriggerId
});
