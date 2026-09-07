// src/listbox.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "collection",
  "defaultHighlightedValue",
  "defaultValue",
  "dir",
  "disabled",
  "deselectable",
  "disallowSelectAll",
  "getRootNode",
  "highlightedValue",
  "id",
  "ids",
  "loopFocus",
  "onHighlightChange",
  "onSelect",
  "onValueChange",
  "orientation",
  "scrollToIndexFn",
  "selectionMode",
  "selectOnHighlight",
  "typeahead",
  "value"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["item", "highlightOnHover"]);
var splitItemProps = createSplitProps(itemProps);
var itemGroupProps = createProps()(["id"]);
var splitItemGroupProps = createSplitProps(itemGroupProps);
var itemGroupLabelProps = createProps()(["htmlFor"]);
var splitItemGroupLabelProps = createSplitProps(itemGroupLabelProps);
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
