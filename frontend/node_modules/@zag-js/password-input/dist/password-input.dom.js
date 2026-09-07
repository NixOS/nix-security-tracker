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

// src/password-input.dom.ts
var password_input_dom_exports = {};
__export(password_input_dom_exports, {
  getInputEl: () => getInputEl,
  getInputId: () => getInputId,
  getRootId: () => getRootId
});
module.exports = __toCommonJS(password_input_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `p-input-${ctx.id}`;
var getInputId = (ctx) => ctx.ids?.input ?? `p-input-${ctx.id}-input`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getInputEl,
  getInputId,
  getRootId
});
