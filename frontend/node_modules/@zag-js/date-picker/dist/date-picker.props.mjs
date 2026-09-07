// src/date-picker.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
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
var splitProps = createSplitProps(props);
var inputProps = createProps()(["index", "fixOnBlur"]);
var splitInputProps = createSplitProps(inputProps);
var presetTriggerProps = createProps()(["value"]);
var splitPresetTriggerProps = createSplitProps(presetTriggerProps);
var tableProps = createProps()(["columns", "id", "view"]);
var splitTableProps = createSplitProps(tableProps);
var tableCellProps = createProps()(["disabled", "value", "columns"]);
var splitTableCellProps = createSplitProps(tableCellProps);
var viewProps = createProps()(["view"]);
var splitViewProps = createSplitProps(viewProps);
export {
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
};
