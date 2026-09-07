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

// src/progress.dom.ts
var progress_dom_exports = {};
__export(progress_dom_exports, {
  getCircleId: () => getCircleId,
  getLabelId: () => getLabelId,
  getRootId: () => getRootId,
  getTrackId: () => getTrackId
});
module.exports = __toCommonJS(progress_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `progress-${ctx.id}`;
var getTrackId = (ctx) => ctx.ids?.track ?? `progress-${ctx.id}-track`;
var getLabelId = (ctx) => ctx.ids?.label ?? `progress-${ctx.id}-label`;
var getCircleId = (ctx) => ctx.ids?.circle ?? `progress-${ctx.id}-circle`;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getCircleId,
  getLabelId,
  getRootId,
  getTrackId
});
