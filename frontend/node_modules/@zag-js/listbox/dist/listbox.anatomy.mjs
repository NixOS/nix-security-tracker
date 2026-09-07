// src/listbox.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("listbox").parts(
  "label",
  "input",
  "item",
  "itemText",
  "itemIndicator",
  "itemGroup",
  "itemGroupLabel",
  "content",
  "root",
  "valueText"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
