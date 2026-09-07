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

// src/editable.dom.ts
var editable_dom_exports = {};
__export(editable_dom_exports, {
  getAreaId: () => getAreaId,
  getCancelTriggerEl: () => getCancelTriggerEl,
  getCancelTriggerId: () => getCancelTriggerId,
  getControlId: () => getControlId,
  getEditTriggerEl: () => getEditTriggerEl,
  getEditTriggerId: () => getEditTriggerId,
  getInputEl: () => getInputEl,
  getInputId: () => getInputId,
  getLabelId: () => getLabelId,
  getPreviewEl: () => getPreviewEl,
  getPreviewId: () => getPreviewId,
  getRootId: () => getRootId,
  getSubmitTriggerEl: () => getSubmitTriggerEl,
  getSubmitTriggerId: () => getSubmitTriggerId
});
module.exports = __toCommonJS(editable_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `editable:${ctx.id}`;
var getAreaId = (ctx) => ctx.ids?.area ?? `editable:${ctx.id}:area`;
var getLabelId = (ctx) => ctx.ids?.label ?? `editable:${ctx.id}:label`;
var getPreviewId = (ctx) => ctx.ids?.preview ?? `editable:${ctx.id}:preview`;
var getInputId = (ctx) => ctx.ids?.input ?? `editable:${ctx.id}:input`;
var getControlId = (ctx) => ctx.ids?.control ?? `editable:${ctx.id}:control`;
var getSubmitTriggerId = (ctx) => ctx.ids?.submitTrigger ?? `editable:${ctx.id}:submit`;
var getCancelTriggerId = (ctx) => ctx.ids?.cancelTrigger ?? `editable:${ctx.id}:cancel`;
var getEditTriggerId = (ctx) => ctx.ids?.editTrigger ?? `editable:${ctx.id}:edit`;
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getPreviewEl = (ctx) => ctx.getById(getPreviewId(ctx));
var getSubmitTriggerEl = (ctx) => ctx.getById(getSubmitTriggerId(ctx));
var getCancelTriggerEl = (ctx) => ctx.getById(getCancelTriggerId(ctx));
var getEditTriggerEl = (ctx) => ctx.getById(getEditTriggerId(ctx));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAreaId,
  getCancelTriggerEl,
  getCancelTriggerId,
  getControlId,
  getEditTriggerEl,
  getEditTriggerId,
  getInputEl,
  getInputId,
  getLabelId,
  getPreviewEl,
  getPreviewId,
  getRootId,
  getSubmitTriggerEl,
  getSubmitTriggerId
});
