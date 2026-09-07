// src/dialog.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("dialog").parts(
  "trigger",
  "backdrop",
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
