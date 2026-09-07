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

// src/combobox.dom.ts
var combobox_dom_exports = {};
__export(combobox_dom_exports, {
  focusInputEl: () => focusInputEl,
  focusTriggerEl: () => focusTriggerEl,
  getClearTriggerEl: () => getClearTriggerEl,
  getClearTriggerId: () => getClearTriggerId,
  getContentEl: () => getContentEl,
  getContentId: () => getContentId,
  getControlEl: () => getControlEl,
  getControlId: () => getControlId,
  getInputEl: () => getInputEl,
  getInputId: () => getInputId,
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
module.exports = __toCommonJS(combobox_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var getRootId = (ctx) => ctx.ids?.root ?? `combobox:${ctx.id}`;
var getLabelId = (ctx) => ctx.ids?.label ?? `combobox:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `combobox:${ctx.id}:control`;
var getInputId = (ctx) => ctx.ids?.input ?? `combobox:${ctx.id}:input`;
var getContentId = (ctx) => ctx.ids?.content ?? `combobox:${ctx.id}:content`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `combobox:${ctx.id}:popper`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `combobox:${ctx.id}:toggle-btn`;
var getClearTriggerId = (ctx) => ctx.ids?.clearTrigger ?? `combobox:${ctx.id}:clear-btn`;
var getItemGroupId = (ctx, id) => ctx.ids?.itemGroup?.(id) ?? `combobox:${ctx.id}:optgroup:${id}`;
var getItemGroupLabelId = (ctx, id) => ctx.ids?.itemGroupLabel?.(id) ?? `combobox:${ctx.id}:optgroup-label:${id}`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `combobox:${ctx.id}:option:${id}`;
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getClearTriggerEl = (ctx) => ctx.getById(getClearTriggerId(ctx));
var getItemEl = (ctx, value) => {
  if (value == null) return null;
  const selector = `[role=option][data-value="${CSS.escape(value)}"]`;
  return (0, import_dom_query.query)(getContentEl(ctx), selector);
};
var focusInputEl = (ctx) => {
  const inputEl = getInputEl(ctx);
  if (!ctx.isActiveElement(inputEl)) {
    inputEl?.focus({ preventScroll: true });
  }
  (0, import_dom_query.setCaretToEnd)(inputEl);
};
var focusTriggerEl = (ctx) => {
  const triggerEl = getTriggerEl(ctx);
  if (ctx.isActiveElement(triggerEl)) return;
  triggerEl?.focus({ preventScroll: true });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  focusInputEl,
  focusTriggerEl,
  getClearTriggerEl,
  getClearTriggerId,
  getContentEl,
  getContentId,
  getControlEl,
  getControlId,
  getInputEl,
  getInputId,
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
