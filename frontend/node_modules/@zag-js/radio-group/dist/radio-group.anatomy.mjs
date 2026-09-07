// src/radio-group.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("radio-group").parts(
  "root",
  "label",
  "item",
  "itemText",
  "itemControl",
  "indicator"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
