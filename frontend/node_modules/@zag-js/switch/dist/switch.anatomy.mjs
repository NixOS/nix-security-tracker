// src/switch.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("switch").parts("root", "label", "control", "thumb");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
