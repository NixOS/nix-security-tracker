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

// src/node-conversion.ts
var node_conversion_exports = {};
__export(node_conversion_exports, {
  DEFAULT_PREVIEW_OPTIONS: () => DEFAULT_PREVIEW_OPTIONS,
  PATH_SEP: () => PATH_SEP,
  ROOT_KEY: () => ROOT_KEY,
  getPreviewOptions: () => getPreviewOptions,
  getRootNode: () => getRootNode,
  isRootKeyPath: () => isRootKeyPath,
  jsonPathToValue: () => jsonPathToValue,
  keyPathToId: () => keyPathToId,
  keyPathToKey: () => keyPathToKey,
  nodeToString: () => nodeToString,
  nodeToValue: () => nodeToValue
});
module.exports = __toCommonJS(node_conversion_exports);
var import_json_to_tree = require("./json-to-tree.js");
var import_shared = require("./shared.js");
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
  return (0, import_shared.hash)(keyPathToId(node.keyPath));
}
function jsonPathToValue(path) {
  return (0, import_shared.hash)(path);
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
      (0, import_json_to_tree.jsonToTree)(data, {
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
  return (0, import_shared.defu)(DEFAULT_PREVIEW_OPTIONS, opts);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});
