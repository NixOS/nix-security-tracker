// src/timer.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("timer").parts(
  "root",
  "area",
  "control",
  "item",
  "itemValue",
  "itemLabel",
  "actionTrigger",
  "separator"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
