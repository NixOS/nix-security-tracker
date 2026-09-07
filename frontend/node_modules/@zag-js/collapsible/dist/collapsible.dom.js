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

// src/collapsible.dom.ts
var collapsible_dom_exports = {};
__export(collapsible_dom_exports, {
  getContentEl: () => getContentEl,
  getContentId: () => getContentId,
  getRootEl: () => getRootEl,
  getRootId: () => getRootId,
  getTriggerEl: () => getTriggerEl,
  getTriggerId: () => getTriggerId
});
module.exports = __toCommonJS(collapsible_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `collapsible:${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `collapsible:${ctx.id}:content`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `collapsible:${ctx.id}:trigger`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getContentEl,
  getContentId,
  getRootEl,
  getRootId,
  getTriggerEl,
  getTriggerId
});
