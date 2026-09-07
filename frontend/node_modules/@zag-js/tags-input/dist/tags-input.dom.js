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

// src/tags-input.dom.ts
var tags_input_dom_exports = {};
__export(tags_input_dom_exports, {
  clearHoverIntent: () => clearHoverIntent,
  dispatchInputEvent: () => dispatchInputEvent,
  getClearTriggerId: () => getClearTriggerId,
  getControlId: () => getControlId,
  getEditInputEl: () => getEditInputEl,
  getEditInputId: () => getEditInputId,
  getFirstEl: () => getFirstEl,
  getHiddenInputEl: () => getHiddenInputEl,
  getHiddenInputId: () => getHiddenInputId,
  getIndexOfId: () => getIndexOfId,
  getInputEl: () => getInputEl,
  getInputId: () => getInputId,
  getItemDeleteTriggerId: () => getItemDeleteTriggerId,
  getItemEls: () => getItemEls,
  getItemId: () => getItemId,
  getItemInputId: () => getItemInputId,
  getLabelId: () => getLabelId,
  getLastEl: () => getLastEl,
  getNextEl: () => getNextEl,
  getPrevEl: () => getPrevEl,
  getRootEl: () => getRootEl,
  getRootId: () => getRootId,
  getTagElAtIndex: () => getTagElAtIndex,
  getTagElements: () => getTagElements,
  getTagInputEl: () => getTagInputEl,
  getTagValue: () => getTagValue,
  isInputFocused: () => isInputFocused,
  setHoverIntent: () => setHoverIntent
});
module.exports = __toCommonJS(tags_input_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var getRootId = (ctx) => ctx.ids?.root ?? `tags-input:${ctx.id}`;
var getInputId = (ctx) => ctx.ids?.input ?? `tags-input:${ctx.id}:input`;
var getClearTriggerId = (ctx) => ctx.ids?.clearBtn ?? `tags-input:${ctx.id}:clear-btn`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `tags-input:${ctx.id}:hidden-input`;
var getLabelId = (ctx) => ctx.ids?.label ?? `tags-input:${ctx.id}:label`;
var getControlId = (ctx) => ctx.ids?.control ?? `tags-input:${ctx.id}:control`;
var getItemId = (ctx, opt) => ctx.ids?.item?.(opt) ?? `tags-input:${ctx.id}:tag:${opt.value}:${opt.index}`;
var getItemDeleteTriggerId = (ctx, opt) => ctx.ids?.itemDeleteTrigger?.(opt) ?? `${getItemId(ctx, opt)}:delete-btn`;
var getItemInputId = (ctx, opt) => ctx.ids?.itemInput?.(opt) ?? `${getItemId(ctx, opt)}:input`;
var getEditInputId = (id) => `${id}:input`;
var getEditInputEl = (ctx, id) => ctx.getById(getEditInputId(id));
var getItemEls = (ctx) => (0, import_dom_query.queryAll)(getRootEl(ctx), `[data-part=item]`);
var getTagInputEl = (ctx, opt) => ctx.getById(getItemInputId(ctx, opt));
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getInputEl = (ctx) => ctx.getById(getInputId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getTagElements = (ctx) => (0, import_dom_query.queryAll)(getRootEl(ctx), `[data-part=item-preview]:not([data-disabled])`);
var getFirstEl = (ctx) => getTagElements(ctx)[0];
var getLastEl = (ctx) => getTagElements(ctx)[getTagElements(ctx).length - 1];
var getPrevEl = (ctx, id) => (0, import_dom_query.prevById)(getTagElements(ctx), id, false);
var getNextEl = (ctx, id) => (0, import_dom_query.nextById)(getTagElements(ctx), id, false);
var getTagElAtIndex = (ctx, index) => getTagElements(ctx)[index];
var getIndexOfId = (ctx, id) => (0, import_dom_query.indexOfId)(getTagElements(ctx), id);
var isInputFocused = (ctx) => ctx.isActiveElement(getInputEl(ctx));
var getTagValue = (ctx, id) => {
  if (!id) return null;
  const tagEl = ctx.getById(id);
  return tagEl?.dataset.value ?? null;
};
var setHoverIntent = (el) => {
  const tagEl = el.closest("[data-part=item-preview]");
  if (!tagEl) return;
  tagEl.dataset.deleteIntent = "";
};
var clearHoverIntent = (el) => {
  const tagEl = el.closest("[data-part=item-preview]");
  if (!tagEl) return;
  delete tagEl.dataset.deleteIntent;
};
var dispatchInputEvent = (ctx, value) => {
  const inputEl = getHiddenInputEl(ctx);
  if (!inputEl) return;
  (0, import_dom_query.dispatchInputValueEvent)(inputEl, { value });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clearHoverIntent,
  dispatchInputEvent,
  getClearTriggerId,
  getControlId,
  getEditInputEl,
  getEditInputId,
  getFirstEl,
  getHiddenInputEl,
  getHiddenInputId,
  getIndexOfId,
  getInputEl,
  getInputId,
  getItemDeleteTriggerId,
  getItemEls,
  getItemId,
  getItemInputId,
  getLabelId,
  getLastEl,
  getNextEl,
  getPrevEl,
  getRootEl,
  getRootId,
  getTagElAtIndex,
  getTagElements,
  getTagInputEl,
  getTagValue,
  isInputFocused,
  setHoverIntent
});
