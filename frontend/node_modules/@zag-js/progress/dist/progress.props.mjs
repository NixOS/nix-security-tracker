// src/progress.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "max",
  "min",
  "orientation",
  "translations",
  "value",
  "onValueChange",
  "defaultValue",
  "formatOptions",
  "locale"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
