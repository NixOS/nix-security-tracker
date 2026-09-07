// src/tour.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "closeOnEscape",
  "closeOnInteractOutside",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "keyboardNavigation",
  "onFocusOutside",
  "onInteractOutside",
  "onPointerDownOutside",
  "onStatusChange",
  "onStepChange",
  "onStepsChange",
  "preventInteraction",
  "spotlightOffset",
  "spotlightRadius",
  "stepId",
  "steps",
  "translations"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
