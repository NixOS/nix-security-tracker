// src/progress.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("progress").parts(
  "root",
  "label",
  "track",
  "range",
  "valueText",
  "view",
  "circle",
  "circleTrack",
  "circleRange"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
