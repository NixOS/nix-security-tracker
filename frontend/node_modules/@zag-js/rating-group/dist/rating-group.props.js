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

// src/rating-group.props.ts
var rating_group_props_exports = {};
__export(rating_group_props_exports, {
  itemProps: () => itemProps,
  props: () => props,
  splitItemProps: () => splitItemProps,
  splitProps: () => splitProps
});
module.exports = __toCommonJS(rating_group_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
  "allowHalf",
  "autoFocus",
  "count",
  "dir",
  "disabled",
  "form",
  "getRootNode",
  "id",
  "ids",
  "name",
  "onHoverChange",
  "onValueChange",
  "required",
  "readOnly",
  "translations",
  "value",
  "defaultValue"
]);
var splitProps = (0, import_utils.createSplitProps)(props);
var itemProps = (0, import_types.createProps)()(["index"]);
var splitItemProps = (0, import_utils.createSplitProps)(itemProps);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  itemProps,
  props,
  splitItemProps,
  splitProps
});
