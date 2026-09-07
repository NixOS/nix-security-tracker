// src/pin-input.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("pinInput").parts("root", "label", "input", "control");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
