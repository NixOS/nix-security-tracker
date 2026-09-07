// src/dialog.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "triggerValue",
  "aria-label",
  "closeOnEscape",
  "closeOnInteractOutside",
  "defaultTriggerValue",
  "defaultOpen",
  "dir",
  "finalFocusEl",
  "getRootNode",
  "id",
  "ids",
  "initialFocusEl",
  "modal",
  "onTriggerValueChange",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onRequestDismiss",
  "open",
  "persistentElements",
  "preventScroll",
  "restoreFocus",
  "role",
  "trapFocus"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
