// src/hover-card.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("hoverCard").parts("arrow", "arrowTip", "trigger", "positioner", "content");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
