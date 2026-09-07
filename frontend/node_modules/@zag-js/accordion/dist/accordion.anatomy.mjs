// src/accordion.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("accordion").parts("root", "item", "itemTrigger", "itemContent", "itemIndicator");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
