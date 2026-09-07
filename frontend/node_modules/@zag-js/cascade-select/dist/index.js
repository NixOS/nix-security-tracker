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
  anatomy: () => import_cascade_select.anatomy,
  collection: () => import_cascade_select2.collection,
  connect: () => import_cascade_select3.connect,
  machine: () => import_cascade_select4.machine,
  parts: () => import_cascade_select.parts,
  props: () => import_cascade_select5.props,
  splitProps: () => import_cascade_select5.splitProps
});
module.exports = __toCommonJS(index_exports);
var import_cascade_select = require("./cascade-select.anatomy.js");
var import_cascade_select2 = require("./cascade-select.collection.js");
var import_cascade_select3 = require("./cascade-select.connect.js");
var import_cascade_select4 = require("./cascade-select.machine.js");
var import_cascade_select5 = require("./cascade-select.props.js");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  anatomy,
  collection,
  connect,
  machine,
  parts,
  props,
  splitProps
});
