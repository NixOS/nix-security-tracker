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

// src/listbox.collection.ts
var listbox_collection_exports = {};
__export(listbox_collection_exports, {
  collection: () => collection,
  gridCollection: () => gridCollection
});
module.exports = __toCommonJS(listbox_collection_exports);
var import_collection = require("@zag-js/collection");
var collection = (options) => {
  return new import_collection.ListCollection(options);
};
collection.empty = () => {
  return new import_collection.ListCollection({ items: [] });
};
var gridCollection = (options) => {
  return new import_collection.GridCollection(options);
};
gridCollection.empty = () => {
  return new import_collection.GridCollection({ items: [], columnCount: 0 });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  collection,
  gridCollection
});
