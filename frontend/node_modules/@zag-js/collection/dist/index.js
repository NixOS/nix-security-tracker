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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  GridCollection: () => import_grid_collection.GridCollection,
  ListCollection: () => import_list_collection.ListCollection,
  Selection: () => import_selection.Selection,
  TreeCollection: () => import_tree_collection.TreeCollection,
  createSelectedItemMap: () => import_selection_map.createSelectedItemMap,
  deriveSelectionState: () => import_selection_map.deriveSelectionState,
  filePathToTree: () => import_tree_collection.filePathToTree,
  flattenedToTree: () => import_tree_collection.flattenedToTree,
  isGridCollection: () => import_grid_collection.isGridCollection,
  isListCollection: () => import_list_collection.isListCollection,
  resolveSelectedItems: () => import_selection_map.resolveSelectedItems,
  updateSelectedItemMap: () => import_selection_map.updateSelectedItemMap
});
module.exports = __toCommonJS(index_exports);
var import_grid_collection = require("./grid-collection.js");
var import_list_collection = require("./list-collection.js");
var import_selection_map = require("./selection-map.js");
var import_selection = require("./selection.js");
var import_tree_collection = require("./tree-collection.js");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GridCollection,
  ListCollection,
  Selection,
  TreeCollection,
  createSelectedItemMap,
  deriveSelectionState,
  filePathToTree,
  flattenedToTree,
  isGridCollection,
  isListCollection,
  resolveSelectedItems,
  updateSelectedItemMap
});
