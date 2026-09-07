// src/cascade-select.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("cascade-select").parts(
  "root",
  "label",
  "control",
  "trigger",
  "indicator",
  "valueText",
  "clearTrigger",
  "positioner",
  "content",
  "list",
  "item",
  "itemText",
  "itemIndicator"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
