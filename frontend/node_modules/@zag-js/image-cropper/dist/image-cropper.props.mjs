// src/image-cropper.props.ts
import { createProps } from "@zag-js/types";
import { createSplitProps } from "@zag-js/utils";
var props = createProps()([
  "id",
  "ids",
  "dir",
  "getRootNode",
  "initialCrop",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "aspectRatio",
  "cropShape",
  "zoom",
  "rotation",
  "flip",
  "defaultZoom",
  "defaultRotation",
  "defaultFlip",
  "zoomStep",
  "zoomSensitivity",
  "minZoom",
  "maxZoom",
  "onZoomChange",
  "onRotationChange",
  "onFlipChange",
  "onCropChange",
  "fixedCropArea",
  "nudgeStep",
  "nudgeStepShift",
  "nudgeStepCtrl",
  "translations"
]);
var splitProps = createSplitProps(props);
var handles = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];
export {
  handles,
  props,
  splitProps
};
