// src/slider.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("slider").parts(
  "root",
  "label",
  "thumb",
  "valueText",
  "track",
  "range",
  "control",
  "markerGroup",
  "marker",
  "draggingIndicator"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
