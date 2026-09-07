// src/navigation-menu.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("navigation-menu").parts(
  "root",
  "viewportPositioner",
  "viewport",
  "trigger",
  "content",
  "list",
  "item",
  "link",
  "indicator",
  "itemIndicator",
  "arrow"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
