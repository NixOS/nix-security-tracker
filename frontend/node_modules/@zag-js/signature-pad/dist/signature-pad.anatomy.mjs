// src/signature-pad.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("signature-pad").parts(
  "root",
  "control",
  "segment",
  "segmentPath",
  "guide",
  "clearTrigger",
  "label"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
