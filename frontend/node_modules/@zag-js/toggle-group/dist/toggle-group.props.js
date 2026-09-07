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

// src/toggle-group.props.ts
var toggle_group_props_exports = {};
__export(toggle_group_props_exports, {
  itemProps: () => itemProps,
  props: () => props,
  splitItemProps: () => splitItemProps,
  splitProps: () => splitProps
});
module.exports = __toCommonJS(toggle_group_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
  "dir",
  "disabled",
  "getRootNode",
  "id",
  "ids",
  "loopFocus",
  "multiple",
  "onValueChange",
  "orientation",
  "rovingFocus",
  "value",
  "defaultValue",
  "deselectable"
]);
var splitProps = (0, import_utils.createSplitProps)(props);
var itemProps = (0, import_types.createProps)()(["value", "disabled"]);
var splitItemProps = (0, import_utils.createSplitProps)(itemProps);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  itemProps,
  props,
  splitItemProps,
  splitProps
});
