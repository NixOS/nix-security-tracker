// src/checkbox.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "defaultChecked",
  "checked",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "invalid",
  "name",
  "onCheckedChange",
  "readOnly",
  "required",
  "value"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
