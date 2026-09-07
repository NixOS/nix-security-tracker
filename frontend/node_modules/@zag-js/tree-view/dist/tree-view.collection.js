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

// src/tree-view.collection.ts
var tree_view_collection_exports = {};
__export(tree_view_collection_exports, {
  collection: () => collection,
  filePathCollection: () => filePathCollection
});
module.exports = __toCommonJS(tree_view_collection_exports);
var import_collection = require("@zag-js/collection");
var collection = (options) => {
  return new import_collection.TreeCollection(options);
};
collection.empty = () => {
  return new import_collection.TreeCollection({ rootNode: { children: [] } });
};
function filePathCollection(paths) {
  return (0, import_collection.filePathToTree)(paths);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  collection,
  filePathCollection
});
