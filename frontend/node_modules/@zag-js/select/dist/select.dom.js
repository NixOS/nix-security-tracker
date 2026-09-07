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

// src/select.dom.ts
var select_dom_exports = {};
__export(select_dom_exports, {
  getClearTriggerEl: () => getClearTriggerEl,
  getClearTriggerId: () => getClearTriggerId,
  getContentEl: () => getContentEl,
  getContentId: () => getContentId,
  getControlEl: () => getControlEl,
  getControlId: () => getControlId,
  getHiddenSelectEl: () => getHiddenSelectEl,
  getHiddenSelectId: () => getHiddenSelectId,
  getItemEl: () => getItemEl,
  getItemGroupId: () => getItemGroupId,
  getItemGroupLabelId: () => getItemGroupLabelId,
  getItemId: () => getItemId,
  getLabelId: () => getLabelId,
  getPositionerEl: () => getPositionerEl,
  getPositionerId: () => getPositionerId,
  getRootId: () => getRootId,
  getTriggerEl: () => getTriggerEl,
  getTriggerId: () => getTriggerId
});
module.exports = __toCommonJS(select_dom_exports);
var getRootId = (ctx) => ctx.ids?.root ?? `select:${ctx.id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `select:${ctx.id}:content`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `select:${ctx.id}:trigger`;
var getClearTriggerId = (ctx) => ctx.ids?.clearTrigger ?? `select:${ctx.id}:clear-trigger`;
var getLabelId = (ctx) => ctx.ids?.label ?? `select:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `select:${ctx.id}:control`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `select:${ctx.id}:option:${id}`;
var getHiddenSelectId = (ctx) => ctx.ids?.hiddenSelect ?? `select:${ctx.id}:select`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `select:${ctx.id}:positioner`;
var getItemGroupId = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `select:${ctx.id}:optgroup:${id}`;
var getItemGroupLabelId = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `select:${ctx.id}:optgroup-label:${id}`;
var getHiddenSelectEl = (ctx) => ctx.getById(getHiddenSelectId(ctx));
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getClearTriggerEl = (ctx) => ctx.getById(getClearTriggerId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getItemEl = (ctx, id) => {
  if (id == null) return null;
  return ctx.getById(getItemId(ctx, id));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getClearTriggerEl,
  getClearTriggerId,
  getContentEl,
  getContentId,
  getControlEl,
  getControlId,
  getHiddenSelectEl,
  getHiddenSelectId,
  getItemEl,
  getItemGroupId,
  getItemGroupLabelId,
  getItemId,
  getLabelId,
  getPositionerEl,
  getPositionerId,
  getRootId,
  getTriggerEl,
  getTriggerId
});
