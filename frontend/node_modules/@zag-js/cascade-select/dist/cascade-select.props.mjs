// src/cascade-select.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "allowParentSelection",
  "closeOnSelect",
  "collection",
  "defaultOpen",
  "defaultValue",
  "defaultHighlightedValue",
  "dir",
  "disabled",
  "formatValue",
  "form",
  "getRootNode",
  "highlightedValue",
  "highlightTrigger",
  "id",
  "ids",
  "invalid",
  "loopFocus",
  "multiple",
  "name",
  "onFocusOutside",
  "onHighlightChange",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onValueChange",
  "open",
  "positioning",
  "readOnly",
  "required",
  "scrollToIndexFn",
  "value"
]);
var splitProps = createSplitProps(props);
export {
  props,
  splitProps
};
