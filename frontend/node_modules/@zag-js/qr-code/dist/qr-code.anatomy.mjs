// src/qr-code.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("qr-code").parts("root", "frame", "pattern", "overlay", "downloadTrigger");
var parts = anatomy.build();
export {
  anatomy,
  parts
};
