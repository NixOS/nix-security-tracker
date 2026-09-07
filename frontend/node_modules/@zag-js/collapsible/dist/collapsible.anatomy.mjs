// src/collapsible.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("collapsible").parts("root", "trigger", "content", "indicator");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
