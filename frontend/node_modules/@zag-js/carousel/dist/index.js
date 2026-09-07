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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  anatomy: () => import_carousel.anatomy,
  connect: () => import_carousel2.connect,
  machine: () => import_carousel3.machine
});
module.exports = __toCommonJS(index_exports);
var import_carousel = require("./carousel.anatomy.js");
var import_carousel2 = require("./carousel.connect.js");
var import_carousel3 = require("./carousel.machine.js");
__reExport(index_exports, require("./carousel.props.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  anatomy,
  connect,
  machine,
  ...require("./carousel.props.js")
});
