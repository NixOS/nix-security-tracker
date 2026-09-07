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

// src/accessibility.ts
var accessibility_exports = {};
__export(accessibility_exports, {
  getAccessibleDescription: () => getAccessibleDescription
});
module.exports = __toCommonJS(accessibility_exports);
var import_data_type = require("./data-type.js");
var import_node_conversion = require("./node-conversion.js");
var import_types = require("./types.js");
var propertyWord = (count) => count === 1 ? "property" : "properties";
var isPrimitive = (node) => {
  return node.type === "string" || node.type === "number" || node.type === "boolean";
};
var getAccessibleDescription = (node, opts) => {
  const typeDescription = (0, import_data_type.getNodeTypeDescription)(node, opts);
  const key = (0, import_node_conversion.keyPathToKey)(node.keyPath, { excludeRoot: true });
  const nonEnumerablePrefix = node.isNonEnumerable ? "non-enumerable " : "";
  const format = (text) => {
    return [key, `${nonEnumerablePrefix}${text}`].filter(Boolean).join(": ");
  };
  if (node.children && node.children.length > 0) {
    const childCount = node.children.length;
    if (key === "[[Entries]]") {
      return format(`${childCount} ${propertyWord(childCount)}`);
    }
    return format(`${typeDescription}, expandable with ${childCount} ${propertyWord(childCount)}`);
  }
  if (isPrimitive(node)) {
    if (key === "stack") {
      return format(node.value.split("\n")[1]?.trim() || "trace");
    }
    if (key === "[[Function]]") {
      return format("function implementation");
    }
    const value = typeof node.value === "string" ? `"${node.value}"` : String(node.value);
    const info2 = node.isNonEnumerable && node.propertyDescriptor ? `, ${getDescriptorInfo(node.propertyDescriptor)}` : "";
    return format(`${value}${info2}`);
  }
  if (node.type === "null") {
    return format("null");
  }
  if (node.type === "undefined") {
    return format("undefined");
  }
  if (node.type === "circular") {
    return format("circular reference");
  }
  const info = node.isNonEnumerable && node.propertyDescriptor ? `, ${getDescriptorInfo(node.propertyDescriptor)}` : "";
  return format(`${nonEnumerablePrefix}${typeDescription}${info}`);
};
var getDescriptorInfo = (descriptor) => {
  const parts = [];
  if (!descriptor.writable) parts.push("read-only");
  if (!descriptor.configurable) parts.push("non-configurable");
  return parts.length > 0 ? parts.join(", ") : "non-enumerable";
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getAccessibleDescription
});
