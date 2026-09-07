"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/menu.props.ts
var menu_props_exports = {};
__export(menu_props_exports, {
  itemGroupLabelProps: () => itemGroupLabelProps,
  itemGroupProps: () => itemGroupProps,
  itemProps: () => itemProps,
  optionItemProps: () => optionItemProps,
  props: () => props,
  splitItemGroupLabelProps: () => splitItemGroupLabelProps,
  splitItemGroupProps: () => splitItemGroupProps,
  splitItemProps: () => splitItemProps,
  splitOptionItemProps: () => splitOptionItemProps,
  splitProps: () => splitProps
});
module.exports = __toCommonJS(menu_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
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
var splitProps = (0, import_utils.createSplitProps)(props);
var itemProps = (0, import_types.createProps)()(["closeOnSelect", "disabled", "value", "valueText"]);
var splitItemProps = (0, import_utils.createSplitProps)(itemProps);
var itemGroupLabelProps = (0, import_types.createProps)()(["htmlFor"]);
var splitItemGroupLabelProps = (0, import_utils.createSplitProps)(itemGroupLabelProps);
var itemGroupProps = (0, import_types.createProps)()(["id"]);
var splitItemGroupProps = (0, import_utils.createSplitProps)(itemGroupProps);
var optionItemProps = (0, import_types.createProps)()([
  "checked",
  "closeOnSelect",
  "disabled",
  "onCheckedChange",
  "type",
  "value",
  "valueText"
]);
var splitOptionItemProps = (0, import_utils.createSplitProps)(optionItemProps);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
