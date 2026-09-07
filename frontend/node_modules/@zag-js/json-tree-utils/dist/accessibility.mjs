// src/accessibility.ts
import { getNodeTypeDescription } from "./data-type.mjs";
import { keyPathToKey } from "./node-conversion.mjs";
import "./types.mjs";
var propertyWord = (count) => count === 1 ? "property" : "properties";
var isPrimitive = (node) => {
  return node.type === "string" || node.type === "number" || node.type === "boolean";
};
var getAccessibleDescription = (node, opts) => {
  const typeDescription = getNodeTypeDescription(node, opts);
  const key = keyPathToKey(node.keyPath, { excludeRoot: true });
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
export {
  getAccessibleDescription
};
