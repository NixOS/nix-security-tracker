// src/pagination.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("pagination").parts(
  "root",
  "item",
  "ellipsis",
  "firstTrigger",
  "prevTrigger",
  "nextTrigger",
  "lastTrigger"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
