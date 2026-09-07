// src/password-input.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("password-input").parts(
  "root",
  "input",
  "label",
  "control",
  "indicator",
  "visibilityTrigger"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
