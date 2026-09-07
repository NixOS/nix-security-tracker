// src/file-upload.anatomy.ts
import { createAnatomy } from "@zag-js/anatomy";
var anatomy = createAnatomy("file-upload").parts(
  "root",
  "dropzone",
  "item",
  "itemDeleteTrigger",
  "itemGroup",
  "itemName",
  "itemPreview",
  "itemPreviewImage",
  "itemSizeText",
  "label",
  "trigger",
  "clearTrigger"
);
var parts = anatomy.build();
export {
  anatomy,
  parts
};
