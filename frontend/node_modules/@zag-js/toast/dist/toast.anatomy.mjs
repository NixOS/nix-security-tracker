// src/toast.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("toast").parts(
  "group",
  "root",
  "title",
  "description",
  "actionTrigger",
  "closeTrigger"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
