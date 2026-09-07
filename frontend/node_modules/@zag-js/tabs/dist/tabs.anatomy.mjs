// src/tabs.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("tabs").parts("root", "list", "trigger", "content", "indicator");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
