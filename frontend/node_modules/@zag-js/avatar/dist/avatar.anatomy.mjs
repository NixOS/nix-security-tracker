// src/avatar.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("avatar").parts("root", "image", "fallback");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
