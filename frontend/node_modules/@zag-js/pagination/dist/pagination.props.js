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

// src/pagination.props.ts
var pagination_props_exports = {};
__export(pagination_props_exports, {
  ellipsisProps: () => ellipsisProps,
  itemProps: () => itemProps,
  props: () => props,
  splitEllipsisProps: () => splitEllipsisProps,
  splitItemProps: () => splitItemProps,
  splitProps: () => splitProps
});
module.exports = __toCommonJS(pagination_props_exports);
var import_types = require("@zag-js/types");
var import_utils = require("@zag-js/utils");
var props = (0, import_types.createProps)()([
  "boundaryCount",
  "count",
  "dir",
  "getRootNode",
  "id",
  "ids",
  "onPageChange",
  "onPageSizeChange",
  "page",
  "defaultPage",
  "pageSize",
  "defaultPageSize",
  "siblingCount",
  "translations",
  "type",
  "getPageUrl"
]);
var splitProps = (0, import_utils.createSplitProps)(props);
var itemProps = (0, import_types.createProps)()(["value", "type"]);
var splitItemProps = (0, import_utils.createSplitProps)(itemProps);
var ellipsisProps = (0, import_types.createProps)()(["index"]);
var splitEllipsisProps = (0, import_utils.createSplitProps)(ellipsisProps);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ellipsisProps,
  itemProps,
  props,
  splitEllipsisProps,
  splitItemProps,
  splitProps
});
