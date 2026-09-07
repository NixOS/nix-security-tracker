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
  anatomy: () => import_marquee.anatomy,
  connect: () => import_marquee2.connect,
  machine: () => import_marquee3.machine
});
module.exports = __toCommonJS(index_exports);
var import_marquee = require("./marquee.anatomy.js");
var import_marquee2 = require("./marquee.connect.js");
var import_marquee3 = require("./marquee.machine.js");
__reExport(index_exports, require("./marquee.props.js"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  anatomy,
  connect,
  machine,
  ...require("./marquee.props.js")
});
