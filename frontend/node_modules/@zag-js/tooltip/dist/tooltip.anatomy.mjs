// src/tooltip.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
