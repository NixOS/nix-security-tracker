// src/clipboard.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("clipboard").parts("root", "control", "trigger", "indicator", "input", "label");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
