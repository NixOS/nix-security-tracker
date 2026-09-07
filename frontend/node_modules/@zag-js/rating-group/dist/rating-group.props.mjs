// src/rating-group.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "allowHalf",
  "autoFocus",
  "count",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "name",
  "onHoverChange",
  "onValueChange",
  "required",
  "readOnly",
  "translations",
  "value",
  "defaultValue"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["index"]);
var splitItemProps = createSplitProps(itemProps);
export {
  itemProps,
  props,
  splitItemProps,
  splitProps
};
