// src/tooltip.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "aria-label",
  "closeDelay",
  "closeOnClick",
  "closeOnEscape",
  "closeOnPointerDown",
  "closeOnScroll",
  "defaultOpen",
  "defaultTriggerValue",
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "interactive",
  "onOpenChange",
  "onTriggerValueChange",
  "open",
  "openDelay",
  "positioning",
  "triggerValue"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
