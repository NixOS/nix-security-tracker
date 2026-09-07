// src/toggle-group.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("toggle-group").parts("root", "item");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
