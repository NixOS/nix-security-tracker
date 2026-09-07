// src/floating-panel.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("floating-panel").parts(
  "trigger",
  "positioner",
  "content",
  "header",
  "body",
  "title",
  "resizeTrigger",
  "dragTrigger",
  "stageTrigger",
  "closeTrigger",
  "control"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
