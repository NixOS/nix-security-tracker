// src/node-conversion.ts
import { jsonToTree } from "./json-to-tree.mjs";
import { defu, hash } from "./shared.mjs";
var ROOT_KEY = "$";
var PATH_SEP = ".";
function isRootKeyPath(keyPath) {
  return keyPath.length === 1 && keyPath[0] === ROOT_KEY;
}
function keyPathToId(keyPath) {
  return keyPath.join(PATH_SEP);
}
function keyPathToKey(keyPath, opts) {
  if (keyPath.length === 0) return "";
  if (opts?.excludeRoot && isRootKeyPath(keyPath)) return "";
  return String(keyPath[keyPath.length - 1]);
}
function nodeToValue(node) {
  return hash(keyPathToId(node.keyPath));
}
function jsonPathToValue(path) {
  return hash(path);
}
function nodeToString(node) {
  return keyPathToKey(node.keyPath) || "root";
}
function getRootNode(data, opts) {
  return {
    value: "",
    type: "object",
    keyPath: [],
    children: [
      jsonToTree(data, {
        visited: /* @__PURE__ */ new WeakSet(),
        keyPath: [ROOT_KEY],
        options: getPreviewOptions(opts)
      })
    ]
  };
}
var DEFAULT_PREVIEW_OPTIONS = {
  maxPreviewItems: 3,
  collapseStringsAfterLength: 30,
  groupArraysAfterLength: 100,
  showNonenumerable: true
};
var getPreviewOptions = (opts) => {
  if (!opts) return DEFAULT_PREVIEW_OPTIONS;
  return defu(DEFAULT_PREVIEW_OPTIONS, opts);
};
export {
  DEFAULT_PREVIEW_OPTIONS,
  PATH_SEP,
  ROOT_KEY,
  getPreviewOptions,
  getRootNode,
  isRootKeyPath,
  jsonPathToValue,
  keyPathToId,
  keyPathToKey,
  nodeToString,
  nodeToValue
};
