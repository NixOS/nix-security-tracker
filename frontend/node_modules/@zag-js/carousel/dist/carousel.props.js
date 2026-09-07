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

// src/carousel.props.ts
var carousel_props_exports = {};
__export(carousel_props_exports, {
  indicatorProps: () => indicatorProps,
  itemProps: () => itemProps,
  props: () => props,
  splitIndicatorProps: () => splitIndicatorProps,
  splitItemProps: () => splitItemProps,
  splitProps: () => splitProps
});
module.exports = __toCommonJS(carousel_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
  "dir",
  "getRootNode",
  "id",
  "ids",
  "loop",
  "page",
  "defaultPage",
  "onPageChange",
  "orientation",
  "slideCount",
  "slidesPerPage",
  "slidesPerMove",
  "spacing",
  "padding",
  "autoplay",
  "allowMouseDrag",
  "inViewThreshold",
  "translations",
  "snapType",
  "autoSize",
  "onDragStatusChange",
  "onAutoplayStatusChange"
]);
var splitProps = (0, import_utils.createSplitProps)(props);
var indicatorProps = (0, import_types.createProps)()(["index", "readOnly"]);
var splitIndicatorProps = (0, import_utils.createSplitProps)(indicatorProps);
var itemProps = (0, import_types.createProps)()(["index", "snapAlign"]);
var splitItemProps = (0, import_utils.createSplitProps)(itemProps);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  indicatorProps,
  itemProps,
  props,
  splitIndicatorProps,
  splitItemProps,
  splitProps
});
