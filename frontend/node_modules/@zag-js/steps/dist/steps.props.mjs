// src/steps.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "count",
  "defaultStep",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "isStepSkippable",
  "isStepValid",
  "linear",
  "onStepChange",
  "onStepComplete",
  "onStepInvalid",
  "orientation",
  "step"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
