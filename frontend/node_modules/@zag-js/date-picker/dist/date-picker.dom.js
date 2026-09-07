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

// src/date-picker.dom.ts
var date_picker_dom_exports = {};
__export(date_picker_dom_exports, {
  getCellTriggerId: () => getCellTriggerId,
  getClearTriggerEl: () => getClearTriggerEl,
  getClearTriggerId: () => getClearTriggerId,
  getContentEl: () => getContentEl,
  getContentId: () => getContentId,
  getControlEl: () => getControlEl,
  getControlId: () => getControlId,
  getFocusedCell: () => getFocusedCell,
  getInputEls: () => getInputEls,
  getInputId: () => getInputId,
  getLabelId: () => getLabelId,
  getMonthSelectEl: () => getMonthSelectEl,
  getMonthSelectId: () => getMonthSelectId,
  getNextTriggerId: () => getNextTriggerId,
  getPositionerEl: () => getPositionerEl,
  getPositionerId: () => getPositionerId,
  getPrevTriggerId: () => getPrevTriggerId,
  getRootId: () => getRootId,
  getTableBodyId: () => getTableBodyId,
  getTableHeaderId: () => getTableHeaderId,
  getTableId: () => getTableId,
  getTableRowId: () => getTableRowId,
  getTriggerEl: () => getTriggerEl,
  getTriggerId: () => getTriggerId,
  getViewTriggerId: () => getViewTriggerId,
  getYearSelectEl: () => getYearSelectEl,
  getYearSelectId: () => getYearSelectId
});
module.exports = __toCommonJS(date_picker_dom_exports);
var import_dom_query = require("@zag-js/dom-query");
var getLabelId = (ctx, index) => ctx.ids?.label?.(index) ?? `datepicker:${ctx.id}:label:${index}`;
var getRootId = (ctx) => ctx.ids?.root ?? `datepicker:${ctx.id}`;
var getTableId = (ctx, id) => ctx.ids?.table?.(id) ?? `datepicker:${ctx.id}:table:${id}`;
var getTableHeaderId = (ctx, id) => ctx.ids?.tableHeader?.(id) ?? `datepicker:${ctx.id}:thead`;
var getTableBodyId = (ctx, id) => ctx.ids?.tableBody?.(id) ?? `datepicker:${ctx.id}:tbody`;
var getTableRowId = (ctx, id) => ctx.ids?.tableRow?.(id) ?? `datepicker:${ctx.id}:tr:${id}`;
var getContentId = (ctx) => ctx.ids?.content ?? `datepicker:${ctx.id}:content`;
var getCellTriggerId = (ctx, id) => ctx.ids?.cellTrigger?.(id) ?? `datepicker:${ctx.id}:cell-trigger:${id}`;
var getPrevTriggerId = (ctx, view) => ctx.ids?.prevTrigger?.(view) ?? `datepicker:${ctx.id}:prev:${view}`;
var getNextTriggerId = (ctx, view) => ctx.ids?.nextTrigger?.(view) ?? `datepicker:${ctx.id}:next:${view}`;
var getViewTriggerId = (ctx, view) => ctx.ids?.viewTrigger?.(view) ?? `datepicker:${ctx.id}:view:${view}`;
var getClearTriggerId = (ctx) => ctx.ids?.clearTrigger ?? `datepicker:${ctx.id}:clear`;
var getControlId = (ctx) => ctx.ids?.control ?? `datepicker:${ctx.id}:control`;
var getInputId = (ctx, index) => ctx.ids?.input?.(index) ?? `datepicker:${ctx.id}:input:${index}`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `datepicker:${ctx.id}:trigger`;
var getPositionerId = (ctx) => ctx.ids?.positioner ?? `datepicker:${ctx.id}:positioner`;
var getMonthSelectId = (ctx) => ctx.ids?.monthSelect ?? `datepicker:${ctx.id}:month-select`;
var getYearSelectId = (ctx) => ctx.ids?.yearSelect ?? `datepicker:${ctx.id}:year-select`;
var getFocusedCell = (ctx, view) => (0, import_dom_query.query)(getContentEl(ctx), `[data-part=table-cell-trigger][data-view=${view}][data-focus]:not([data-outside-range])`);
var getTriggerEl = (ctx) => ctx.getById(getTriggerId(ctx));
var getContentEl = (ctx) => ctx.getById(getContentId(ctx));
var getInputEls = (ctx) => (0, import_dom_query.queryAll)(getControlEl(ctx), `[data-part=input]`);
var getYearSelectEl = (ctx) => ctx.getById(getYearSelectId(ctx));
var getMonthSelectEl = (ctx) => ctx.getById(getMonthSelectId(ctx));
var getClearTriggerEl = (ctx) => ctx.getById(getClearTriggerId(ctx));
var getPositionerEl = (ctx) => ctx.getById(getPositionerId(ctx));
var getControlEl = (ctx) => ctx.getById(getControlId(ctx));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getCellTriggerId,
  getClearTriggerEl,
  getClearTriggerId,
  getContentEl,
  getContentId,
  getControlEl,
  getControlId,
  getFocusedCell,
  getInputEls,
  getInputId,
  getLabelId,
  getMonthSelectEl,
  getMonthSelectId,
  getNextTriggerId,
  getPositionerEl,
  getPositionerId,
  getPrevTriggerId,
  getRootId,
  getTableBodyId,
  getTableHeaderId,
  getTableId,
  getTableRowId,
  getTriggerEl,
  getTriggerId,
  getViewTriggerId,
  getYearSelectEl,
  getYearSelectId
});
