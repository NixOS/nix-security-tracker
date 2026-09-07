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

// src/marquee.dom.ts
var marquee_dom_exports = {};
__export(marquee_dom_exports, {
  dom: () => dom
});
module.exports = __toCommonJS(marquee_dom_exports);
var dom = {
  getRootId: (ctx) => ctx.ids?.root ?? `marquee:${ctx.id}`,
  getViewportId: (ctx) => ctx.ids?.viewport ?? `marquee:${ctx.id}:viewport`,
  getContentId: (ctx, index) => ctx.ids?.content?.(index) ?? `marquee:${ctx.id}:content:${index}`,
  getRootEl: (ctx) => ctx.getById(dom.getRootId(ctx)),
  getViewportEl: (ctx) => ctx.getById(dom.getViewportId(ctx)),
  getContentEl: (ctx, index) => ctx.getById(dom.getContentId(ctx, index))
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dom
});
