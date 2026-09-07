// src/qr-code.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "ids",
  "defaultValue",
  "value",
  "id",
  "encoding",
  "dir",
  "getRootNode",
  "onValueChange",
  "pixelSize"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
