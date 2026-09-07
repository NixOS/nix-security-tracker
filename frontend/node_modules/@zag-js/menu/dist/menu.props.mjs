// src/menu.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "anchorPoint",
  "aria-label",
  "closeOnSelect",
  "composite",
  "defaultHighlightedValue",
  "defaultOpen",
  "defaultTriggerValue",
  "dir",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "loopFocus",
  "navigate",
  "onEscapeKeyDown",
  "onFocusOutside",
  "onHighlightChange",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onRequestDismiss",
  "onSelect",
  "onTriggerValueChange",
  "open",
  "positioning",
  "triggerValue",
  "typeahead"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["closeOnSelect", "disabled", "value", "valueText"]);
var splitItemProps = createSplitProps(itemProps);
var itemGroupLabelProps = createProps()(["htmlFor"]);
var splitItemGroupLabelProps = createSplitProps(itemGroupLabelProps);
var itemGroupProps = createProps()(["id"]);
var splitItemGroupProps = createSplitProps(itemGroupProps);
var optionItemProps = createProps()([
  "checked",
  "closeOnSelect",
  "disabled",
  "onCheckedChange",
  "type",
  "value",
  "valueText"
]);
var splitOptionItemProps = createSplitProps(optionItemProps);
export {
  itemGroupLabelProps,
  itemGroupProps,
  itemProps,
  optionItemProps,
  props,
  splitItemGroupLabelProps,
  splitItemGroupProps,
  splitItemProps,
  splitOptionItemProps,
  splitProps
};
