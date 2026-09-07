// src/image-cropper.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("image-cropper").parts("root", "viewport", "image", "selection", "handle", "grid");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
