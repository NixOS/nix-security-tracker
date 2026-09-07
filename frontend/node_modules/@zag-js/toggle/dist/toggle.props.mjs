// src/toggle.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()(["defaultPressed", "pressed", "onPressedChange", "disabled"]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
