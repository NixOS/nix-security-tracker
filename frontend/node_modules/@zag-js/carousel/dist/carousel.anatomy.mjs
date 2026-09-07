// src/carousel.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("carousel").parts(
  "root",
  "itemGroup",
  "item",
  "control",
  "nextTrigger",
  "prevTrigger",
  "indicatorGroup",
  "indicator",
  "autoplayTrigger",
  "progressText"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
