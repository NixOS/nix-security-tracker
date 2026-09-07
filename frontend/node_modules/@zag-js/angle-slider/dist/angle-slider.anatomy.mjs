// src/angle-slider.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("angle-slider").parts(
  "root",
  "label",
  "thumb",
  "valueText",
  "control",
  "track",
  "markerGroup",
  "marker"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
