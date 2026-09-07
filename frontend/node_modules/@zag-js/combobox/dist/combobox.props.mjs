// src/combobox.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "allowCustomValue",
  "autoFocus",
  "closeOnSelect",
  "collection",
  "composite",
  "defaultHighlightedValue",
  "defaultInputValue",
  "defaultOpen",
  "defaultValue",
  "dir",
  "disabled",
  "disableLayer",
  "form",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "inputBehavior",
  "inputValue",
  "invalid",
  "loopFocus",
  "multiple",
  "name",
  "navigate",
  "onFocusOutside",
  "onHighlightChange",
  "onInputValueChange",
  "onInteractOutside",
  "onOpenChange",
  "onOpenChange",
  "onPointerDownOutside",
  "onSelect",
  "onValueChange",
  "open",
  "openOnChange",
  "openOnClick",
  "openOnKeyPress",
  "placeholder",
  "positioning",
  "readOnly",
  "required",
  "scrollToIndexFn",
  "selectionBehavior",
  "translations",
  "value",
  "alwaysSubmitOnEnter"
]);
var splitProps = createSplitProps(props);
var itemGroupLabelProps = createProps()(["htmlFor"]);
var splitItemGroupLabelProps = createSplitProps(itemGroupLabelProps);
var itemGroupProps = createProps()(["id"]);
var splitItemGroupProps = createSplitProps(itemGroupProps);
var itemProps = createProps()(["item", "persistFocus"]);
var splitItemProps = createSplitProps(itemProps);
export {
  itemGroupLabelProps,
  itemGroupProps,
  itemProps,
  props,
  splitItemGroupLabelProps,
  splitItemGroupProps,
  splitItemProps,
  splitProps
};
