// src/avatar.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()(["dir", "id", "ids", "onStatusChange", "getRootNode"]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
