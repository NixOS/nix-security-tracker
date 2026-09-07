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

// src/color-picker.props.ts
var color_picker_props_exports = {};
__export(color_picker_props_exports, {
  areaProps: () => areaProps,
  channelProps: () => channelProps,
  props: () => props,
  splitAreaProps: () => splitAreaProps,
  splitChannelProps: () => splitChannelProps,
  splitProps: () => splitProps,
  splitSwatchProps: () => splitSwatchProps,
  splitSwatchTriggerProps: () => splitSwatchTriggerProps,
  splitTransparencyGridProps: () => splitTransparencyGridProps,
  swatchProps: () => swatchProps,
  swatchTriggerProps: () => swatchTriggerProps,
  transparencyGridProps: () => transparencyGridProps
});
module.exports = __toCommonJS(color_picker_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
  "closeOnSelect",
  "dir",
  "disabled",
  "format",
  "defaultFormat",
  "getRootNode",
  "id",
  "ids",
  "initialFocusEl",
  "inline",
  "name",
  "positioning",
  "onFocusOutside",
  "onFormatChange",
  "onInteractOutside",
  "onOpenChange",
  "onPointerDownOutside",
  "onValueChange",
  "onValueChangeEnd",
  "defaultOpen",
  "open",
  "positioning",
  "required",
  "readOnly",
  "value",
  "defaultValue",
  "invalid",
  "openAutoFocus"
]);
var splitProps = (0, import_utils.createSplitProps)(props);
var areaProps = (0, import_types.createProps)()(["xChannel", "yChannel"]);
var splitAreaProps = (0, import_utils.createSplitProps)(areaProps);
var channelProps = (0, import_types.createProps)()(["channel", "orientation"]);
var splitChannelProps = (0, import_utils.createSplitProps)(channelProps);
var swatchTriggerProps = (0, import_types.createProps)()(["value", "disabled"]);
var splitSwatchTriggerProps = (0, import_utils.createSplitProps)(swatchTriggerProps);
var swatchProps = (0, import_types.createProps)()(["value", "respectAlpha"]);
var splitSwatchProps = (0, import_utils.createSplitProps)(swatchProps);
var transparencyGridProps = (0, import_types.createProps)()(["size"]);
var splitTransparencyGridProps = (0, import_utils.createSplitProps)(transparencyGridProps);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  areaProps,
  channelProps,
  props,
  splitAreaProps,
  splitChannelProps,
  splitProps,
  splitSwatchProps,
  splitSwatchTriggerProps,
  splitTransparencyGridProps,
  swatchProps,
  swatchTriggerProps,
  transparencyGridProps
});
