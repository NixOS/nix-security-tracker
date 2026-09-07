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

// src/date-picker.props.ts
var date_picker_props_exports = {};
__export(date_picker_props_exports, {
  inputProps: () => inputProps,
  presetTriggerProps: () => presetTriggerProps,
  props: () => props,
  splitInputProps: () => splitInputProps,
  splitPresetTriggerProps: () => splitPresetTriggerProps,
  splitProps: () => splitProps,
  splitTableCellProps: () => splitTableCellProps,
  splitTableProps: () => splitTableProps,
  splitViewProps: () => splitViewProps,
  tableCellProps: () => tableCellProps,
  tableProps: () => tableProps,
  viewProps: () => viewProps
});
module.exports = __toCommonJS(date_picker_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
  "closeOnSelect",
  "createCalendar",
  "dir",
  "disabled",
  "fixedWeeks",
  "focusedValue",
  "format",
  "parse",
  "placeholder",
  "getRootNode",
  "id",
  "ids",
  "inline",
  "invalid",
  "isDateUnavailable",
  "locale",
  "max",
  "maxSelectedDates",
  "min",
  "name",
  "numOfMonths",
  "onFocusChange",
  "onOpenChange",
  "onValueChange",
  "onViewChange",
  "onVisibleRangeChange",
  "open",
  "openOnClick",
  "defaultOpen",
  "positioning",
  "readOnly",
  "required",
  "selectionMode",
  "showWeekNumbers",
  "startOfWeek",
  "timeZone",
  "translations",
  "value",
  "defaultView",
  "defaultValue",
  "view",
  "defaultFocusedValue",
  "outsideDaySelectable",
  "minView",
  "maxView"
]);
var splitProps = (0, import_utils.createSplitProps)(props);
var inputProps = (0, import_types.createProps)()(["index", "fixOnBlur"]);
var splitInputProps = (0, import_utils.createSplitProps)(inputProps);
var presetTriggerProps = (0, import_types.createProps)()(["value"]);
var splitPresetTriggerProps = (0, import_utils.createSplitProps)(presetTriggerProps);
var tableProps = (0, import_types.createProps)()(["columns", "id", "view"]);
var splitTableProps = (0, import_utils.createSplitProps)(tableProps);
var tableCellProps = (0, import_types.createProps)()(["disabled", "value", "columns"]);
var splitTableCellProps = (0, import_utils.createSplitProps)(tableCellProps);
var viewProps = (0, import_types.createProps)()(["view"]);
var splitViewProps = (0, import_utils.createSplitProps)(viewProps);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  inputProps,
  presetTriggerProps,
  props,
  splitInputProps,
  splitPresetTriggerProps,
  splitProps,
  splitTableCellProps,
  splitTableProps,
  splitViewProps,
  tableCellProps,
  tableProps,
  viewProps
});
