// src/date-picker.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("date-picker").parts(
  "clearTrigger",
  "content",
  "control",
  "input",
  "label",
  "monthSelect",
  "nextTrigger",
  "positioner",
  "presetTrigger",
  "prevTrigger",
  "rangeText",
  "root",
  "table",
  "tableBody",
  "tableCell",
  "tableCellTrigger",
  "tableHead",
  "tableHeader",
  "tableRow",
  "trigger",
  "view",
  "viewControl",
  "viewTrigger",
  "yearSelect"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
