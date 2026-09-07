// src/tabs.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "activationMode",
  "composite",
  "deselectable",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loopFocus",
  "navigate",
  "onFocusChange",
  "onValueChange",
  "orientation",
  "translations",
  "value",
  "defaultValue"
]);
var splitProps = createSplitProps(props);
var triggerProps = createProps()(["disabled", "value"]);
var splitTriggerProps = createSplitProps(triggerProps);
var contentProps = createProps()(["value"]);
var splitContentProps = createSplitProps(contentProps);
export {
  contentProps,
  props,
  splitContentProps,
  splitProps,
  splitTriggerProps,
  triggerProps
};
