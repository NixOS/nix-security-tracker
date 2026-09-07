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

// src/tabs.props.ts
var tabs_props_exports = {};
__export(tabs_props_exports, {
  contentProps: () => contentProps,
  props: () => props,
  splitContentProps: () => splitContentProps,
  splitProps: () => splitProps,
  splitTriggerProps: () => splitTriggerProps,
  triggerProps: () => triggerProps
});
module.exports = __toCommonJS(tabs_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
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
var splitProps = (0, import_utils.createSplitProps)(props);
var triggerProps = (0, import_types.createProps)()(["disabled", "value"]);
var splitTriggerProps = (0, import_utils.createSplitProps)(triggerProps);
var contentProps = (0, import_types.createProps)()(["value"]);
var splitContentProps = (0, import_utils.createSplitProps)(contentProps);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  contentProps,
  props,
  splitContentProps,
  splitProps,
  splitTriggerProps,
  triggerProps
});
