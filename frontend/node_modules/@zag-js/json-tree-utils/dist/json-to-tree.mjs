// src/json-to-tree.ts
import { dataTypes, PrimitiveType } from "./data-type.mjs";
import { getPreviewOptions, ROOT_KEY } from "./node-conversion.mjs";
var MAX_DEPTH = 20;
var jsonToTree = (data, props = {}) => {
  const { visited = /* @__PURE__ */ new WeakSet(), keyPath = [ROOT_KEY], depth = 0 } = props;
  const options = getPreviewOptions(props.options);
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
  const dataType = dataTypes.find((dataType2) => dataType2.check(data)) || PrimitiveType;
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
export {
  jsonToTree
};
