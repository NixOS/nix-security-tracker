// src/radio-group.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "name",
  "onValueChange",
  "orientation",
  "readOnly",
  "required",
  "value",
  "defaultValue"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["value", "disabled", "invalid"]);
var splitItemProps = createSplitProps(itemProps);
export {
  itemProps,
  props,
  splitItemProps,
  splitProps
};
