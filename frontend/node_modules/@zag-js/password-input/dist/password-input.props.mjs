// src/password-input.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "defaultVisible",
  "dir",
  "id",
  "onVisibilityChange",
  "visible",
  "ids",
  "getRootNode",
  "disabled",
  "invalid",
  "required",
  "readOnly",
  "translations",
  "ignorePasswordManagers",
  "autoComplete",
  "name"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
