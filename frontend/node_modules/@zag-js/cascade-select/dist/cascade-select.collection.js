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

// src/cascade-select.collection.ts
var cascade_select_collection_exports = {};
__export(cascade_select_collection_exports, {
  collection: () => collection
});
module.exports = __toCommonJS(cascade_select_collection_exports);
var import_collection = require("@zag-js/collection");
var collection = (options) => {
  return new import_collection.TreeCollection(options);
};
collection.empty = () => {
  return new import_collection.TreeCollection({
    rootNode: { value: "ROOT", children: [] }
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  collection
});
