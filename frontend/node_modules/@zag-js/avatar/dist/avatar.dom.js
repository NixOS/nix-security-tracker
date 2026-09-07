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

// src/avatar.dom.ts
var avatar_dom_exports = {};
__export(avatar_dom_exports, {
  getFallbackId: () => getFallbackId,
  getImageEl: () => getImageEl,
  getImageId: () => getImageId,
  getRootEl: () => getRootEl,
  getRootId: () => getRootId
});
module.exports = __toCommonJS(avatar_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `avatar:${ctx.id}`;
var getImageId = (ctx) => ctx.ids?.image ?? `avatar:${ctx.id}:image`;
var getFallbackId = (ctx) => ctx.ids?.fallback ?? `avatar:${ctx.id}:fallback`;
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getImageEl = (ctx) => ctx.getById(getImageId(ctx));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getFallbackId,
  getImageEl,
  getImageId,
  getRootEl,
  getRootId
});
