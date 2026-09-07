// src/popover.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("popover").parts(
  "arrow",
  "arrowTip",
  "anchor",
  "trigger",
  "indicator",
  "positioner",
  "content",
  "title",
  "description",
  "closeTrigger"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
