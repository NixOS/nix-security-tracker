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

// src/json-to-tree.ts
var json_to_tree_exports = {};
__export(json_to_tree_exports, {
  jsonToTree: () => jsonToTree
});
module.exports = __toCommonJS(json_to_tree_exports);
var import_data_type = require("./data-type.js");
var import_node_conversion = require("./node-conversion.js");
var MAX_DEPTH = 20;
var jsonToTree = (data, props = {}) => {
  const { visited = /* @__PURE__ */ new WeakSet(), keyPath = [import_node_conversion.ROOT_KEY], depth = 0 } = props;
  const options = (0, import_node_conversion.getPreviewOptions)(props.options);
  if (depth > MAX_DEPTH) {
    return {
      value: "[Max Depth Reached]",
      type: "string",
      keyPath
    };
  }
  if (data && typeof data === "object") {
    if (visited.has(data)) {
      return {
        value: "[Circular Reference]",
        type: "circular",
        keyPath
      };
    }
    visited.add(data);
  }
  const dataType = import_data_type.dataTypes.find((dataType2) => dataType2.check(data)) || import_data_type.PrimitiveType;
  return dataType.node({
    value: data,
    createNode: (nestedKeyPath, value) => jsonToTree(value, {
      visited,
      keyPath: [...keyPath, ...nestedKeyPath],
      options,
      depth: depth + 1
    }),
    keyPath,
    options
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  jsonToTree
});
