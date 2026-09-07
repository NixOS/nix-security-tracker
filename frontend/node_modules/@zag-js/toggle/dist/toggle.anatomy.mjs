// src/toggle.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("toggle", ["root", "indicator"]);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
