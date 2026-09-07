// src/marquee.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("marquee").parts("root", "viewport", "content", "edge", "item");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
