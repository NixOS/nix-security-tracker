// src/checkbox.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("checkbox").parts("root", "label", "control", "indicator");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
