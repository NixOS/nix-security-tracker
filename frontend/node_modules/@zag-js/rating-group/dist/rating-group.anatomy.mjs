// src/rating-group.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("rating-group").parts("root", "label", "item", "control");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
