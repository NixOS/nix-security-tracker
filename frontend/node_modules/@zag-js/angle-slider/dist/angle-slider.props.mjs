// src/angle-slider.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "aria-label",
  "aria-labelledby",
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "name",
  "onValueChange",
  "onValueChangeEnd",
  "readOnly",
  "step",
  "value",
  "defaultValue"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
