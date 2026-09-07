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

// src/dialog.dom.ts
var dialog_dom_exports = {};
__export(dialog_dom_exports, {
  getActiveTriggerEl: () => getActiveTriggerEl,
  getBackdropEl: () => getBackdropEl,
  getBackdropId: () => getBackdropId,
  getCloseTriggerEl: () => getCloseTriggerEl,
  getCloseTriggerId: () => getCloseTriggerId,
  getContentEl: () => getContentEl,
  getContentId: () => getContentId,
  getDescriptionEl: () => getDescriptionEl,
  getDescriptionId: () => getDescriptionId,
  getPositionerEl: () => getPositionerEl,
  getPositionerId: () => getPositionerId,
  getTitleEl: () => getTitleEl,
  getTitleId: () => getTitleId,
  getTriggerEl: () => getTriggerEl,
  getTriggerEls: () => getTriggerEls,
  getTriggerId: () => getTriggerId
});
module.exports = __toCommonJS(dialog_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_utils = require("@zag-js/utils");
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `dialog:${ctx.id}:positioner`;
var getBackdropId = (ctx) => ctx.ids?.backdrop ?? `dialog:${ctx.id}:backdrop`;
var getContentId = (ctx) => ctx.ids?.content ?? `dialog:${ctx.id}:content`;
var getTriggerId = (ctx, value) => {
  const customId = ctx.ids?.trigger;
  if (customId != null) return (0, import_utils.isFunction)(customId) ? customId(value) : customId;
  return value ? `dialog:${ctx.id}:trigger:${value}` : `dialog:${ctx.id}:trigger`;
};
var getTitleId = (ctx) => ctx.ids?.title ?? `dialog:${ctx.id}:title`;
var getDescriptionId = (ctx) => ctx.ids?.description ?? `dialog:${ctx.id}:description`;
var getCloseTriggerId = (ctx) => ctx.ids?.closeTrigger ?? `dialog:${ctx.id}:close`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getBackdropEl = (ctx) => ctx.getById(getBackdropId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getTitleEl = (ctx) => ctx.getById(getTitleId(ctx));
var getDescriptionEl = (ctx) => ctx.getById(getDescriptionId(ctx));
var getCloseTriggerEl = (ctx) => ctx.getById(getCloseTriggerId(ctx));
var getTriggerEls = (ctx) => (0, import_dom_query.queryAll)(ctx.getRootNode(), `[data-scope="dialog"][data-part="trigger"]${(0, import_dom_query.getByOwnerId)(ctx.id)}`);
var getActiveTriggerEl = (ctx, value) => {
  if (value == null) {
    return getTriggerEl(ctx) ?? getTriggerEls(ctx)[0];
  }
  return ctx.getById(getTriggerId(ctx, value));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getActiveTriggerEl,
  getBackdropEl,
  getBackdropId,
  getCloseTriggerEl,
  getCloseTriggerId,
  getContentEl,
  getContentId,
  getDescriptionEl,
  getDescriptionId,
  getPositionerEl,
  getPositionerId,
  getTitleEl,
  getTitleId,
  getTriggerEl,
  getTriggerEls,
  getTriggerId
});
