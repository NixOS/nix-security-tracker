// src/signature-pad.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "defaultPaths",
  "dir",
  "disabled",
  "drawing",
  "getRootNode",
  "id",
  "ids",
  "name",
  "onDraw",
  "onDrawEnd",
  "paths",
  "readOnly",
  "required",
  "translations"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
