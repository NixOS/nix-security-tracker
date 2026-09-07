// src/color-picker.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
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
var splitProps = createSplitProps(props);
var areaProps = createProps()(["xChannel", "yChannel"]);
var splitAreaProps = createSplitProps(areaProps);
var channelProps = createProps()(["channel", "orientation"]);
var splitChannelProps = createSplitProps(channelProps);
var swatchTriggerProps = createProps()(["value", "disabled"]);
var splitSwatchTriggerProps = createSplitProps(swatchTriggerProps);
var swatchProps = createProps()(["value", "respectAlpha"]);
var splitSwatchProps = createSplitProps(swatchProps);
var transparencyGridProps = createProps()(["size"]);
var splitTransparencyGridProps = createSplitProps(transparencyGridProps);
export {
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
};
